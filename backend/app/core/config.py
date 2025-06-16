from typing import List
from dotenv import load_dotenv
from supabase import create_client, Client
from pydantic_settings import BaseSettings, SettingsConfigDict

load_dotenv()

class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra='ignore')

    # 'dev' or 'prod'
    ENVIRONMENT: str = "dev"

    # Core Supabase settings
    SUPABASE_URL: str
    SUPABASE_SERVICE_ROLE_KEY: str

    # Production frontend URL
    FRONTEND_PROD_URL: str

    @property
    def cors_origins(self) -> List[str]:
        # Base origins for local development
        origins = [
            "http://localhost:5173",
            "http://127.0.0.1:5173",
        ]
        if self.ENVIRONMENT == "prod":
            # In production, only allow the deployed frontend
            return [self.FRONTEND_PROD_URL]

        # In development, allow local frontend
        return origins

# Create a single, validated instance of the settings
settings = Settings()

# Create a single, reusable instance of the Supabase client
supabase: Client = create_client(
    settings.SUPABASE_URL, settings.SUPABASE_SERVICE_ROLE_KEY
)



