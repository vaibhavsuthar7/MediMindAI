import os
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    groq_api_key: str = ""
    groq_model: str = "llama-3.1-8b-instant"

    # Optional provider overrides (e.g. OpenRouter, DashScope Qwen, Ollama, OpenAI)
    llm_api_key: str = ""
    llm_model: str = ""
    llm_base_url: str = ""
    llm_fallback_model: str = "mistralai/mistral-large-2-instruct"

    jwt_secret: str = "dev-secret-change-me"
    jwt_algorithm: str = "HS256"
    access_token_expire_minutes: int = 1440

    database_url: str = "sqlite:///./medimind.db"

    upload_dir: str = "./uploads"
    chroma_dir: str = "./chroma_store"

    class Config:
        env_file = ".env"
        extra = "ignore"



settings = Settings()
os.makedirs(settings.upload_dir, exist_ok=True)
os.makedirs(settings.chroma_dir, exist_ok=True)
