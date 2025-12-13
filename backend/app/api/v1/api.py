from fastapi import APIRouter
from app.api.v1.endpoints import auth, issues, messages, upload, users, companies

api_router = APIRouter()
api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(issues.router, prefix="/issues", tags=["issues"])
api_router.include_router(messages.router, prefix="/issues", tags=["messages"]) # Nested under /issues
api_router.include_router(upload.router, prefix="/upload", tags=["upload"])
api_router.include_router(users.router, prefix="/users", tags=["users"])
api_router.include_router(companies.router, prefix="/companies", tags=["companies"])
