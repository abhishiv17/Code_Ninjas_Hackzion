from sqlalchemy import Column, Integer, String, DateTime
from database import Base
import datetime

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    name = Column(String)
    role = Column(String, default="engineer")

class Ticket(Base):
    __tablename__ = "tickets"
    id = Column(String, primary_key=True, index=True)
    title = Column(String)
    description = Column(String)
    status = Column(String, default="open")
    severity = Column(String, default="medium")
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    toll_id = Column(String)
    assigned_to = Column(String, nullable=True)
    image_base64 = Column(String, nullable=True)
