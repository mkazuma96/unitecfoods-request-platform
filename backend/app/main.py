from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from app.db.init_db import init_db
from app.api.v1.api import api_router
from app.core.config import settings
import os
import logging

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title=settings.PROJECT_NAME, version="1.0")

# CORS Configuration - Temporarily allow all origins for urgent fix
# TODO: Revert this after presentation
cors_origins = [
    "https://unitech-request-platform-frontend.azurewebsites.net",
    "http://localhost:3000",
    "http://localhost:8000",
    "http://127.0.0.1:3000",
]
logger.info(f"CORS Origins configured: {cors_origins}")
app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
logger.info(f"CORS middleware added successfully")

# Mount uploads directory to /static
if not os.path.exists("uploads"):
    os.makedirs("uploads")
app.mount("/static", StaticFiles(directory="uploads"), name="static")

@app.on_event("startup")
def on_startup():
    logger.info("Starting up... Calling init_db()")
    init_db()
    logger.info("init_db() called.")

app.include_router(api_router, prefix=settings.API_V1_STR)

@app.get("/")
def read_root():
    return {"message": "Hello World from FastAPI"}

@app.get("/health")
def health_check():
    return {"status": "ok"}
