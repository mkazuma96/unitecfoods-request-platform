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

# CORS Configuration - 緊急対応: 全オリジン許可・クレデンシャルなし
# ブラウザからのリクエストで Access-Control-Allow-Origin: * を返す
# （ローカル/本番の環境差異によるマッチ失敗を回避）
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)
logger.info("CORS middleware added (allow_origins='*', allow_credentials=False)")

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
