from pydantic import BaseSettings
from functools import lru_cache

class Settings(BaseSettings):
    DATABASE_URL: str
    LLM_API_KEY: str
    SECRET_KEY: str
    ALGORITHM: str
    ACCESS_TOKEN_EXPIRE_MINUTES: int

    class Config:
        env_file = ".env"

@lru_cache()
def get_settings():
    return Settings()