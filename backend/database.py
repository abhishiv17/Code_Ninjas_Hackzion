import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

# Fallback to localhost if not running in docker for local dev script testing
SQLALCHEMY_DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://admin:admin123@localhost:5432/smarthighway")

engine = create_engine(SQLALCHEMY_DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
