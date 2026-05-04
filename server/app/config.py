from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    DATABASE_URL: str = "sqlite:///./recoverycare.db"
    JWT_SECRET: str = "dev-secret-change-me"
    JWT_ALGORITHM: str = "HS256"
    JWT_EXPIRE_MINUTES: int = 60 * 24 * 7
    OLLAMA_URL: str = "http://eva.gbt.tfo.upm.es:11434"
    OLLAMA_MODEL: str = "qwen3:14b"
    ENABLE_LLM_ANALYSIS: bool = True
    CORS_ORIGINS: str = "*"

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")


settings = Settings()
