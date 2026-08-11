"""
Thin wrapper around the Groq API (free tier) so every agent talks to the
LLM the same way. Groq is OpenAI-API-compatible and gives fast, free
inference on open models like Llama 3.1 / Mixtral -- no local GPU needed.

If GROQ_API_KEY is not set, calls fall back to a clearly-labeled canned
response so the rest of the app still runs for demos/offline dev.
"""
import json
from typing import Optional, Tuple, Any

from app.config import settings

_client: Any = None
_client_config: Optional[Tuple[str, str, str]] = None


def _get_client_and_model() -> Tuple[Any, str]:
    """Get initialized OpenAI or Groq client and active model name."""
    global _client, _client_config

    api_key = settings.llm_api_key or settings.groq_api_key
    model = settings.llm_model or settings.groq_model
    base_url = settings.llm_base_url or None

    if not api_key and not base_url:
        return None, model

    current_config = (api_key, model, base_url or "")
    if _client is None or _client_config != current_config:
        if base_url:
            from openai import OpenAI
            _client = OpenAI(api_key=api_key or "ollama", base_url=base_url)
        else:
            from groq import Groq
            _client = Groq(api_key=api_key)
        _client_config = current_config

    return _client, model


def chat_completion(system_prompt: str, user_prompt: str, json_mode: bool = False) -> str:
    """Call the LLM (NVIDIA NIM / Groq / Qwen / OpenRouter / Ollama). Returns plain text or JSON string."""
    client, model = _get_client_and_model()

    if client is None:
        return json.dumps({
            "error": "LLM_API_KEY / GROQ_API_KEY not set",
            "note": "Add a key or configure a model in backend/.env to enable live AI responses."
        }) if json_mode else (
            "[Demo mode: no API key configured. Add GROQ_API_KEY or LLM_API_KEY in backend/.env to get real AI answers.]"
        )

    kwargs = {}
    if json_mode:
        kwargs["response_format"] = {"type": "json_object"}

    # Try primary model first, fallback to mistral/alternate model if loaded/errored
    models_to_try = [model]
    fallback_model = settings.llm_fallback_model
    if fallback_model and fallback_model != model:
        models_to_try.append(fallback_model)

    last_error = None
    for m in models_to_try:
        try:
            completion = client.chat.completions.create(
                model=m,
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt},
                ],
                temperature=0.3,
                max_tokens=1024,
                **kwargs,
            )
            return completion.choices[0].message.content
        except Exception as e:
            print(f"[LLM Client] Model {m} failed/overloaded: {e}. Trying fallback...")
            last_error = e

    if json_mode:
        return json.dumps({"error": str(last_error)})
    return f"[LLM response error: {last_error}]"


