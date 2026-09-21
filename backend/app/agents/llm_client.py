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
    Handles raw JSON, markdown-fenced ```json ... ```, unescaped string literals, and malformed quotes.
    """
    if not text or not text.strip():
        raise ValueError("Received empty response from LLM.")

    cleaned = text.strip()

    # 1. Check for markdown code blocks (```json ... ``` or ``` ...)
    match = re.search(r"```(?:json)?\s*([\s\S]*?)\s*```", cleaned, re.IGNORECASE)
    if match:
        cleaned = match.group(1).strip()

    # 2. Try standard json.loads with strict=False
    try:
        return json.loads(cleaned, strict=False)
    except json.JSONDecodeError:
        pass

    # 3. Find outer '{' and '}' bounds
    start_idx = cleaned.find("{")
    end_idx = cleaned.rfind("}")
    if start_idx != -1 and end_idx != -1 and end_idx > start_idx:
        json_str = cleaned[start_idx : end_idx + 1]
        try:
            return json.loads(json_str, strict=False)
        except json.JSONDecodeError:
            pass

    # 4. Fallback to json_repair for auto-healing unescaped quotes or cutoffs
    try:
        import json_repair
        repaired = json_repair.loads(cleaned)
        if isinstance(repaired, dict) and repaired:
            return repaired
    except Exception as e:
        logger.debug(f"json_repair parsing attempt: {e}")

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

        # Active model candidates in order of preference
        models_to_try = [
            self.config.model or "gemini-3.6-flash",
            "gemini-3.6-flash",
            "gemini-3.5-flash",
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

            max_retries = 4
            for attempt in range(max_retries):
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
                        if response.status_code in (429, 503) and attempt < max_retries - 1:
                            backoff = (attempt + 1) * 3.0
                            logger.warning(
                                f"[{self.config.name}] Model {model_name} temporary {response.status_code} spike. Retrying in {backoff}s (attempt {attempt + 1}/{max_retries})..."
                            )
                            await asyncio.sleep(backoff)
                            continue
                        
                        logger.warning(f"[{self.config.name}] Model {model_name} returned {last_error_text}, trying fallback model...")
                        break

                except (httpx.TimeoutException, httpx.RequestError) as net_err:
                    last_error_text = f"Network error: {str(net_err)}"
                    logger.warning(f"[{self.config.name}] Network error with {model_name}: {net_err}")
                    if attempt < max_retries - 1:
                        await asyncio.sleep(1.5)
                        continue
                    break

        # If all candidate models failed, raise explicit exception
        raise AgentExecutionException(
            agent_name=self.config.name,
            message=f"LLM API request failed across models {models}: {last_error_text}",
        )

