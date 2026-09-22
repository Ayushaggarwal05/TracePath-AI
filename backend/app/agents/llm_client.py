import asyncio
from datetime import datetime
from enum import Enum
import json
import logging
import time
from typing import Any, Dict, List, Optional
import httpx
from app.core.config import AgentConfig
from app.core.exceptions import AgentExecutionException

logger = logging.getLogger("tracepath.llm")


class LLMErrorCategory(str, Enum):
    QUOTA_EXHAUSTED = "QUOTA_EXHAUSTED"       # 429: Instant failover, no useless retries
    TRANSIENT_SPIKE = "TRANSIENT_SPIKE"       # 503: 1 quick retry then failover
    BAD_REQUEST = "BAD_REQUEST"               # 400, 413: Fatal, fail-fast
    AUTH_ERROR = "AUTH_ERROR"                 # 401, 403: Fatal, fail-fast
    NETWORK_TIMEOUT = "NETWORK_TIMEOUT"       # Timeout / connection error: 1 retry then failover
    UNKNOWN = "UNKNOWN"


def classify_llm_error(status_code: int, response_text: str) -> LLMErrorCategory:
    """Deterministically categorizes LLM API errors to drive intelligent recovery."""
    if status_code == 429:
        return LLMErrorCategory.QUOTA_EXHAUSTED
    if status_code in (502, 503, 504):
        return LLMErrorCategory.TRANSIENT_SPIKE
    if status_code in (401, 403):
        return LLMErrorCategory.AUTH_ERROR
    if status_code in (400, 413):
        return LLMErrorCategory.BAD_REQUEST
    return LLMErrorCategory.UNKNOWN


def extract_json_from_response(text: str) -> Dict[str, Any]:
    """
    Extracts and parses JSON object from an LLM response string.
    Safely handles nested markdown codeblocks (e.g. ```bash, ```json), raw JSON, unescaped newlines, and auto-repair.
    """
    if not text or not text.strip():
        raise ValueError("Received empty response from LLM.")

    cleaned = text.strip()

    # 1. Safely strip outermost markdown wrapper (```json ... ``` or ``` ... ```) without chopping nested codeblocks
    if cleaned.startswith("```"):
        first_newline = cleaned.find("\n")
        last_fence = cleaned.rfind("```")
        if first_newline != -1 and last_fence > first_newline:
            cleaned = cleaned[first_newline + 1:last_fence].strip()

    # 2. Try standard json.loads with strict=False
    try:
        return json.loads(cleaned, strict=False)
    except Exception:
        pass

    # 3. Find outer '{' and '}' bounds
    start_idx = cleaned.find("{")
    end_idx = cleaned.rfind("}")
    if start_idx != -1 and end_idx != -1 and end_idx > start_idx:
        json_str = cleaned[start_idx : end_idx + 1]
        try:
            return json.loads(json_str, strict=False)
        except Exception:
            pass
        try:
            import json_repair
            repaired = json_repair.loads(json_str)
            if isinstance(repaired, dict) and repaired:
                return repaired
        except Exception:
            pass

    # 4. Fallback to json_repair on full text
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
    with deterministic error classification, multi-tier fallback cascade, and real-time telemetry capture.
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
        telemetry_collector: Optional[List[Dict[str, Any]]] = None,
    ) -> Dict[str, Any]:
        """
        Executes an LLM chat completion request with intelligent error handling,
        instant failover on quota limits, fast retry on server spikes, and telemetry.
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

        # Multi-tier active Gemini 3.x candidate models ordered by stability & speed
        models_to_try = [
            self.config.model or "gemini-3.5-flash-lite",
            "gemini-3.5-flash-lite",
            "gemini-3.5-flash",
            "gemini-3.6-flash",
            "gemini-3.7-flash",
            "gemini-3.8-flash",
            "gemini-3-flash-preview",
            "gemini-flash-latest",
            "gemini-flash-lite-latest",
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

            max_retries = 2
            for attempt in range(max_retries):
                t0 = time.perf_counter()
                try:
                    async with httpx.AsyncClient(timeout=max(self.config.timeout_seconds, 45.0)) as client:
                        response = await client.post(
                            self.endpoint,
                            headers=headers,
                            json=payload,
                        )
                        latency_ms = (time.perf_counter() - t0) * 1000

                        if response.status_code == 200:
                            res_json = response.json()
                            choices = res_json.get("choices", [])
                            if not choices:
                                raise ValueError("LLM API returned no choices in response.")
                            content = choices[0].get("message", {}).get("content", "")
                            
                            parsed = extract_json_from_response(content)
                            
                            # Record success telemetry
                            if telemetry_collector is not None:
                                telemetry_collector.append({
                                    "timestamp": datetime.utcnow().isoformat() + "Z",
                                    "stage": self.config.name,
                                    "level": "INFO",
                                    "message": f"Successfully completed via {model_name} in {latency_ms:.0f}ms",
                                    "model": model_name,
                                    "latency_ms": round(latency_ms, 1),
                                    "status": "SUCCESS",
                                })
                            
                            return parsed

                        # Classify the HTTP error
                        category = classify_llm_error(response.status_code, response.text)
                        last_error_text = f"Status {response.status_code} ({category.value}): {response.text[:200]}"

                        if category == LLMErrorCategory.AUTH_ERROR:
                            raise AgentExecutionException(
                                agent_name=self.config.name,
                                message=f"Authentication failed (HTTP {response.status_code}). Check your API key.",
                            )

                        if category == LLMErrorCategory.BAD_REQUEST:
                            raise AgentExecutionException(
                                agent_name=self.config.name,
                                message=f"Invalid request payload (HTTP {response.status_code}): {response.text[:200]}",
                            )

                        if category == LLMErrorCategory.QUOTA_EXHAUSTED:
                            logger.warning(f"[{self.config.name}] Quota exhausted on {model_name}. Immediate failover...")
                            if telemetry_collector is not None:
                                telemetry_collector.append({
                                    "timestamp": datetime.utcnow().isoformat() + "Z",
                                    "stage": self.config.name,
                                    "level": "WARN",
                                    "message": f"Quota limit reached on {model_name}. Failing over to alternative model...",
                                    "model": model_name,
                                    "status": "FAILOVER",
                                })
                            break  # Do not retry quota exhausted model, immediately advance to next model

                        if category == LLMErrorCategory.TRANSIENT_SPIKE and attempt < max_retries - 1:
                            logger.warning(f"[{self.config.name}] Model {model_name} 503 spike. Fast retry in 1.5s...")
                            if telemetry_collector is not None:
                                telemetry_collector.append({
                                    "timestamp": datetime.utcnow().isoformat() + "Z",
                                    "stage": self.config.name,
                                    "level": "WARN",
                                    "message": f"Server 503 high demand on {model_name}. Retrying in 1.5s...",
                                    "model": model_name,
                                    "status": "RETRY",
                                })
                            await asyncio.sleep(1.5)
                            continue

                        # Other status codes: advance to next fallback model
                        logger.warning(f"[{self.config.name}] Model {model_name} returned {last_error_text}. Trying next fallback...")
                        break

                except (httpx.TimeoutException, httpx.RequestError) as net_err:
                    latency_ms = (time.perf_counter() - t0) * 1000
                    last_error_text = f"Network timeout/error ({type(net_err).__name__}): {str(net_err)}"
                    logger.warning(f"[{self.config.name}] Network issue with {model_name}: {net_err}")
                    if attempt < max_retries - 1:
                        if telemetry_collector is not None:
                            telemetry_collector.append({
                                "timestamp": datetime.utcnow().isoformat() + "Z",
                                "stage": self.config.name,
                                "level": "WARN",
                                "message": f"Network delay on {model_name}. Retrying in 1.5s...",
                                "model": model_name,
                                "status": "RETRY",
                            })
                        await asyncio.sleep(1.5)
                        continue
                    break

        # If all candidate models failed, record error in telemetry and raise
        if telemetry_collector is not None:
            telemetry_collector.append({
                "timestamp": datetime.utcnow().isoformat() + "Z",
                "stage": self.config.name,
                "level": "ERROR",
                "message": f"All candidate models exhausted. Last error: {last_error_text}",
                "status": "FAILED",
            })

        raise AgentExecutionException(
            agent_name=self.config.name,
            message=f"LLM API request failed across all candidate models {models}: {last_error_text}",
        )
