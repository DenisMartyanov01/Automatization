from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase
from sqlalchemy.orm import sessionmaker
from sqlalchemy import  Column, Integer, String, DateTime, Boolean
 
SQLALCHEMY_DATABASE_URL = "postgresql://postgres:123@postgres:5432/MainBD"

engine = create_engine(SQLALCHEMY_DATABASE_URL)
 
 
class Base(DeclarativeBase): pass
class User(Base):
    __tablename__ = "User"
 
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    password = Column(String)
    email = Column(String)

class Event(Base):
    __tablename__ = "Event"
 
    id = Column(Integer, primary_key=True, index=True)
    author_id = Column(Integer)
    date = Column(DateTime)
    title = Column(String)
    text = Column(String)
    is_approved = Column(Boolean)

class Comment(Base):
    __tablename__ = "Comment"
 
    id = Column(Integer, primary_key=True, index=True)
    event_id = Column(Integer)
    author_id = Column(Integer)
    date = Column(DateTime)
    text = Column(String)

class Admin(Base):
    __tablename__ = "Admin"
 
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    password = Column(String)
    email = Column(String)
 

SessionLocal = sessionmaker(autoflush=False, bind=engine)
db = SessionLocal()
 

SessionLocal = sessionmaker(autoflush=False, bind=engine)
