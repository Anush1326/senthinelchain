import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    OPENAI_API_KEY: str = ""
    MODEL_NAME: str = "gpt-4"
    MAX_FILE_SIZE: int = 10485760 # 10MB
    ALLOWED_EXTENSIONS: list[str] = [".txt", ".pdf", ".jpg", ".jpeg", ".png"]
    SERVICE_PORT: int = 8000
    DEBUG: bool = True

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"

settings = Settings()
