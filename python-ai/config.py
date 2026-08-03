import os
from pydantic_settings import BaseSettings
from dotenv import load_dotenv

# Load parent project .env if present
load_dotenv(os.path.join(os.path.dirname(__file__), "..", ".env"))
load_dotenv()

class Settings(BaseSettings):
    OPENAI_API_KEY: str = os.getenv("OPENAI_API_KEY", "")
    MODEL_NAME: str = os.getenv("MODEL_NAME", "gpt-4o-mini")
    MAX_FILE_SIZE: int = 10485760 # 10MB
    ALLOWED_EXTENSIONS: list[str] = [".txt", ".pdf", ".jpg", ".jpeg", ".png"]
    SERVICE_PORT: int = 8000
    DEBUG: bool = True

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        extra = "ignore"

settings = Settings()

