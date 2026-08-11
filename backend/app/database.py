import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

from app.config import settings

db_url = settings.database_url

# If DB URL contains placeholder [YOUR-PASSWORD], fall back gracefully to local SQLite
if "[YOUR-PASSWORD]" in db_url:
    print("[Database] PostgreSQL connection string contains [YOUR-PASSWORD] placeholder. Using SQLite database until password is updated.")
    db_url = getattr(settings, "sqlite_fallback_url", "sqlite:///./medimind.db")

if db_url.startswith("postgresql"):
    db_url = db_url.replace("?pgbouncer=true", "").replace("&pgbouncer=true", "")

connect_args = {"check_same_thread": False} if db_url.startswith("sqlite") else {}
engine_kwargs = {"connect_args": connect_args}
if not db_url.startswith("sqlite"):
    engine_kwargs["pool_pre_ping"] = True

try:
    engine = create_engine(db_url, **engine_kwargs)
    # Quick connectivity test
    with engine.connect() as conn:
        pass
except Exception as e:
    print(f"[Database Warning] Failed to connect to {db_url}: {e}. Falling back to SQLite.")
    db_url = "sqlite:///./medimind.db"
    engine = create_engine(db_url, connect_args={"check_same_thread": False})

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
