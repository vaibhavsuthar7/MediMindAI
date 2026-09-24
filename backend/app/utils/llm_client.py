"""
Thin wrapper around the LLM API (NVIDIA NIM / Groq / OpenAI) so every agent talks to the
LLM the same way with automatic model failover and JSON extraction.
"""
import json
import re
from typing import Optional, Tuple, Any

from app.config import settings

_client: Any = None
_client_config: Optional[Tuple[str, str, str]] = None

DEPRECATED_MODELS = {
    "meta/llama-3.1-8b-instruct",
    "llama-3.1-8b-instruct",
    "llama-3.1-70b-instruct",
    "meta/llama-3.1-70b-instruct",
    "meta/llama-3.3-70b-instruct",
    "mistralai/mistral-large-2-instruct",
}

DEFAULT_WORKING_MODEL = "meta/llama-3.2-11b-vision-instruct"
DEFAULT_FALLBACK_MODEL = "meta/llama-3.2-90b-vision-instruct"


def extract_json_from_text(raw: str) -> dict:
    """Safely extract valid JSON from raw LLM responses (stripping markdown fences, prefix notes, etc.)."""
    if not raw or not isinstance(raw, str):
        return {}

    # 1. Direct parsing
    try:
        parsed = json.loads(raw.strip())
        if isinstance(parsed, dict):
            return parsed
    except Exception:
        pass

    # 2. Markdown fence ```json ... ```
    match = re.search(r"```(?:json)?\s*([\s\S]*?)\s*```", raw)
    if match:
        try:
            parsed = json.loads(match.group(1).strip())
            if isinstance(parsed, dict):
                return parsed
        except Exception:
            pass

    # 3. Outer brace slice
    first_b = raw.find("{")
    last_b = raw.rfind("}")
    if first_b != -1 and last_b != -1 and last_b > first_b:
        try:
            parsed = json.loads(raw[first_b : last_b + 1])
            if isinstance(parsed, dict):
                return parsed
        except Exception:
            pass

    return {}


def _get_client_and_model() -> Tuple[Any, str]:
    """Get initialized OpenAI or Groq client and active model name."""
    global _client, _client_config

    # Prioritize blazing-fast Groq LPU if groq_api_key is set
    if settings.groq_api_key:
        api_key = settings.groq_api_key
        model = settings.groq_model or "qwen/qwen3.8-27b"
        base_url = None
    else:
        api_key = settings.llm_api_key
        model = settings.llm_model or DEFAULT_WORKING_MODEL
        base_url = settings.llm_base_url or None

    # Auto-upgrade deprecated/expired model names
    if not model or model.strip() in DEPRECATED_MODELS:
        model = "qwen/qwen3.8-27b" if settings.groq_api_key else DEFAULT_WORKING_MODEL

    if not api_key and not base_url:
        return None, model

    current_config = (api_key, model, base_url or "")
    if _client is None or _client_config != current_config:
        if base_url:
            from openai import OpenAI
            _client = OpenAI(api_key=api_key or "ollama", base_url=base_url, timeout=18.0)
        else:
            from groq import Groq
            _client = Groq(api_key=api_key, timeout=12.0)
        _client_config = current_config

    return _client, model


def chat_completion(system_prompt: str, user_prompt: str, json_mode: bool = False) -> str:
    """Call the active LLM with automatic model failover and robust output formatting."""
    client, model = _get_client_and_model()

    if client is None:
        return json.dumps({
            "error": "LLM_API_KEY / GROQ_API_KEY not set",
            "note": "Add a key or configure a model in backend/.env to enable live AI responses."
        }) if json_mode else (
            "[Demo mode: no API key configured. Add GROQ_API_KEY or LLM_API_KEY in backend/.env to get real AI answers.]"
        )

    # Prepare model priority list
    models_to_try = [model]
    if DEFAULT_WORKING_MODEL not in models_to_try:
        models_to_try.append(DEFAULT_WORKING_MODEL)
    if DEFAULT_FALLBACK_MODEL not in models_to_try:
        models_to_try.append(DEFAULT_FALLBACK_MODEL)

    enriched_system_prompt = system_prompt
    if json_mode:
        enriched_system_prompt += "\n\nCRITICAL: Respond ONLY with valid, parseable JSON conforming to the requested schema. Do not enclose in markdown fences, do not output explanations outside JSON."

    last_error = None
    for m in models_to_try:
        if m in DEPRECATED_MODELS:
            continue
        try:
            completion = client.chat.completions.create(
                model=m,
                messages=[
                    {"role": "system", "content": enriched_system_prompt},
                    {"role": "user", "content": user_prompt},
                ],
                temperature=0.2,
                max_tokens=1024,
            )
            content = completion.choices[0].message.content
            if content and content.strip():
                if json_mode:
                    parsed = extract_json_from_text(content)
                    if parsed:
                        return json.dumps(parsed)
                return content
        except Exception as e:
            print(f"[LLM Client] Model {m} failed/overloaded: {e}. Trying fallback...")
            last_error = e

    if json_mode:
        return json.dumps({"error": str(last_error)})
    return f"[LLM response error: {last_error}]"
