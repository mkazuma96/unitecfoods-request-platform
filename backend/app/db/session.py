from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os
from dotenv import load_dotenv

load_dotenv()

# For local development, we'll use SQLite if DATABASE_URL is not set
SQLALCHEMY_DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./sql_app.db")

# MySQL用の追加設定
connect_args = {}
engine_kwargs = {}

if "sqlite" in SQLALCHEMY_DATABASE_URL:
    # SQLite用の設定
    connect_args = {"check_same_thread": False}
else:
    # MySQL用の設定
    connect_args = {
        "ssl_mode": "REQUIRED",  # SSL接続を必須にする
        "ssl": {
            "check_hostname": False,  # ホスト名検証を無効化（Azureの証明書の問題を回避）
        }
    }
    engine_kwargs = {
        "pool_pre_ping": True,  # 接続を使用する前にpingして確認
        "pool_recycle": 3600,   # 1時間ごとに接続を再作成
        "pool_size": 10,        # コネクションプールのサイズ
        "max_overflow": 20,     # プールが満杯時の追加接続数
    }

engine = create_engine(
    SQLALCHEMY_DATABASE_URL, 
    connect_args=connect_args,
    **engine_kwargs
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

