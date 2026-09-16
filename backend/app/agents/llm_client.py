import json
import logging
import re
from typing import Any, Dict, List, Optional
import httpx
from app.core.config import AgentConfig
from app.core.exceptions import AgentExecutionException

logger = logging.getLogger("tracepath.llm")


def extract_json_from_response(text: str) -> Dict[str, Any]:
    """
    Extracts and parses JSON object from an LLM response string.
    Handles raw JSON, markdown-fenced ```json ... ```, and surrounding commentary.
    """
    if not text or not text.strip():
        raise ValueError("Received empty response from LLM.")

    cleaned = text.strip()

    # 1. Check for markdown code blocks (```json ... ``` or ``` ...)
    match = re.search(r"```(?:json)?\s*([\s\S]*?)\s*```", cleaned, re.IGNORECASE)
    if match:
        cleaned = match.group(1).strip()

    # 2. Try parsing directly
    try:
        return json.loads(cleaned)
    except json.JSONDecodeError:
        pass

    # 3. Find first '{' and last '}'
    start_idx = cleaned.find("{")
    end_idx = cleaned.rfind("}")
    if start_idx != -1 and end_idx != -1 and end_idx > start_idx:
        json_str = cleaned[start_idx : end_idx + 1]
        try:
            return json.loads(json_str)
        except json.JSONDecodeError as err:
            raise ValueError(f"Failed to parse extracted JSON substring: {err}")

    raise ValueError(f"Could not find valid JSON in LLM response: {text[:200]}...")


class LLMClient:
    """
    Asynchronous LLM Client supporting OpenAI-compatible chat completion APIs
    with automatic JSON extraction, timeout resilience, and mock simulation mode.
    """

    def __init__(self, config: AgentConfig):
        self.config = config
        self.base_url = config.base_url or "https://api.openai.com/v1"
        self.endpoint = f"{self.base_url.rstrip('/')}/chat/completions"

    async def call_llm(
        self,
        system_prompt: str,
        user_prompt: str,
        mock_response_generator: Optional[Any] = None,
    ) -> Dict[str, Any]:
        """
        Executes an LLM chat completion request or uses mock simulation if mock_mode is active.
        """
        if self.config.mock_mode or not self.config.api_key:
            logger.info(f"[{self.config.name}] Running in simulation/mock mode (model: {self.config.model})")
            if mock_response_generator:
                return mock_response_generator()
            raise AgentExecutionException(
                agent_name=self.config.name,
                message="Agent has no API key configured and no simulation generator was provided.",
            )

        headers = {
            "Authorization": f"Bearer {self.config.api_key}",
            "Content-Type": "application/json",
        }

        payload = {
            "model": self.config.model,
            "messages": [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt},
            ],
            "temperature": self.config.temperature,
            "max_tokens": self.config.max_tokens,
            "response_format": {"type": "json_object"},
        }

        try:
            async with httpx.AsyncClient(timeout=self.config.timeout_seconds) as client:
                response = await client.post(
                    self.endpoint,
                    headers=headers,
                    json=payload,
                )

                if response.status_code != 200:
                    raise AgentExecutionException(
                        agent_name=self.config.name,
                        message=f"LLM API returned status {response.status_code}: {response.text[:300]}",
                    )

                res_json = response.json()
                choices = res_json.get("choices", [])
                if not choices:
                    raise AgentExecutionException(
                        agent_name=self.config.name,
                        message="LLM API returned no choices in response.",
                    )

                content = choices[0].get("message", {}).get("content", "")
                parsed = extract_json_from_response(content)
                return parsed

        except httpx.TimeoutException as err:
            raise AgentExecutionException(
                agent_name=self.config.name,
                message=f"LLM API call timed out after {self.config.timeout_seconds}s: {str(err)}",
            )
        except httpx.RequestError as err:
            raise AgentExecutionException(
                agent_name=self.config.name,
                message=f"LLM network request error: {str(err)}",
            )
        except ValueError as err:
            raise AgentExecutionException(
                agent_name=self.config.name,
                message=f"Failed to parse JSON response: {str(err)}",
            )
