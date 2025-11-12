from sqlalchemy import Column, String, Text, DateTime, Enum, Table, ForeignKey
from sqlalchemy.orm import relationship
from database import Base
import enum

class RoleEnum(enum.Enum):
    suspect = "suspect"
    witness = "witness"
    victim = "victim"

class SeverityEnum(enum.Enum):
    low = "low"
    medium = "medium"
    high = "high"

# Association table for many-to-many relationship
incident_persons = Table(
    'incident_persons',
    Base.metadata,
    Column('incident_id', String, ForeignKey('incidents.id', ondelete='CASCADE')),
    Column('person_id', String, ForeignKey('persons.id', ondelete='CASCADE'))
)

class Person(Base):
    __tablename__ = "persons"
    
    id = Column(String, primary_key=True)
    registration_number = Column(String(50), unique=True, nullable=False)
    name = Column(String(255), nullable=False)
    address = Column(Text, nullable=False)
    role = Column(Enum(RoleEnum), nullable=False)
    phone = Column(String(50), nullable=False)
    email = Column(String(255), nullable=False)
    
    incidents = relationship("Incident", secondary=incident_persons, back_populates="involved_persons")

class Incident(Base):
    __tablename__ = "incidents"
    
    id = Column(String, primary_key=True)
    registration_number = Column(String(50), unique=True, nullable=False)
    type = Column(String(100), nullable=False)
    description = Column(Text, nullable=False)
    location = Column(Text, nullable=False)
    date = Column(DateTime, nullable=False)
    severity = Column(Enum(SeverityEnum), nullable=False)
    
    involved_persons = relationship("Person", secondary=incident_persons, back_populates="incidents")

class User(Base):
    __tablename__ = "users"
    
    id = Column(String, primary_key=True)
    username = Column(String(100), unique=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    is_active = Column(String, default=True)