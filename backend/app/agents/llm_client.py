import asyncio
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
    Asynchronous LLM Client supporting OpenAI-compatible chat completion APIs (Gemini / OpenAI)
    with automatic JSON extraction, model resilience, and timeout retry.
    """

    def __init__(self, config: AgentConfig):
        self.config = config
        self.base_url = config.base_url or "https://generativelanguage.googleapis.com/v1beta/openai"
        self.endpoint = f"{self.base_url.rstrip('/')}/chat/completions"

    async def call_llm(
        self,
        system_prompt: str,
        user_prompt: str,
        mock_response_generator: Optional[Any] = None,
    ) -> Dict[str, Any]:
        """
        Executes an LLM chat completion request against real Gemini / OpenAI endpoints.
        """
        if not self.config.api_key:
            raise AgentExecutionException(
                agent_name=self.config.name,
                message=f"Agent '{self.config.name}' has no API key configured. Please configure an API key in backend/.env.",
            )

        headers = {
            "Authorization": f"Bearer {self.config.api_key}",
            "Content-Type": "application/json",
        }

        # Model candidates to try in order of preference
        models_to_try = [
            self.config.model or "gemini-2.5-flash",
            "gemini-2.5-flash",
            "gemini-3.5-flash",
            "gemini-3.6-flash",
        ]
        # Deduplicate while preserving order
        seen = set()
        models = [m for m in models_to_try if not (m in seen or seen.add(m))]

        last_error_text = ""
        for model_name in models:
            payload = {
                "model": model_name,
                "messages": [
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt},
                ],
                "temperature": self.config.temperature,
                "max_tokens": self.config.max_tokens,
                "response_format": {"type": "json_object"},
            }

            for attempt in range(2):
                try:
                    async with httpx.AsyncClient(timeout=self.config.timeout_seconds) as client:
                        response = await client.post(
                            self.endpoint,
                            headers=headers,
                            json=payload,
                        )

                        if response.status_code == 200:
                            res_json = response.json()
                            choices = res_json.get("choices", [])
                            if not choices:
                                raise ValueError("LLM API returned no choices in response.")
                            content = choices[0].get("message", {}).get("content", "")
                            return extract_json_from_response(content)

                        last_error_text = f"Status {response.status_code}: {response.text[:200]}"
                        if response.status_code in (429, 503) and attempt == 0:
                            await asyncio.sleep(1.5)
                            continue
                        
                        logger.warning(f"[{self.config.name}] Model {model_name} returned {last_error_text}, trying fallback model...")
                        break

                except (httpx.TimeoutException, httpx.RequestError) as net_err:
                    last_error_text = f"Network error: {str(net_err)}"
                    logger.warning(f"[{self.config.name}] Network error with {model_name}: {net_err}")
                    if attempt == 0:
                        await asyncio.sleep(1.0)
                        continue
                    break

        # If all candidate models failed, raise explicit exception
        raise AgentExecutionException(
            agent_name=self.config.name,
            message=f"LLM API request failed across models {models}: {last_error_text}",
        )

