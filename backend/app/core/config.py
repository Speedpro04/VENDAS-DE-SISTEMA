from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    SUPABASE_URL: str = ""
    SUPABASE_KEY: str = ""
    SUPABASE_SERVICE_ROLE: str = ""
    REDIS_URL: str = "redis://localhost:6379"
    EVOLUTION_API_URL: str = ""
    EVOLUTION_API_KEY: str = ""
    EVOLUTION_INSTANCE: str = ""
    AI_BASE_URL: str = "https://integrate.api.nvidia.com/v1"
    AI_API_KEY: str = ""
    AI_MODEL: str = "deepseek-ai/deepseek-v4-flash"
    OUTSCRAPER_API_KEY: str = ""
    SMTP_HOST: str = ""
    SMTP_PORT: int = 587
    SMTP_USER: str = ""
    SMTP_PASS: str = ""
    SMTP_FROM: str = ""
    ENVIRONMENT: str = "production"
    HORARIO_INICIO: int = 8
    HORARIO_FIM: int = 20
    INTERVALO_HORAS: int = 24
    MAX_TENTATIVAS: int = 3

    class Config:
        env_file = "../.env"

settings = Settings()
