from fastapi import FastAPI
from app.db.init_db import init_db

app = FastAPI(title="Unitec Foods Request Platform API", version="1.0")

@app.on_event("startup")
def on_startup():
    init_db()

@app.get("/")
def read_root():
    return {"message": "Hello World from FastAPI"}

@app.get("/health")
def health_check():
    return {"status": "ok"}
