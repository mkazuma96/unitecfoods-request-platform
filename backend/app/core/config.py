import os
from typing import List

class Settings:
    PROJECT_NAME: str = "Unitec Foods Request Platform"
    API_V1_STR: str = "/api/v1"
    
    # SECURITY WARNING: keep the secret key used in production secret!
    # In production, use os.getenv("SECRET_KEY")
    SECRET_KEY: str = os.getenv("SECRET_KEY", "YOUR_SUPER_SECRET_KEY_FOR_DEV_ONLY")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 8 # 8 days

    # CORS
    BACKEND_CORS_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://localhost:8000",
    ]

settings = Settings()

