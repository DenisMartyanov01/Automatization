from pydantic import BaseModel, EmailStr
from typing import List, Optional
from datetime import datetime
from enum import Enum

class RoleEnum(str, Enum):
    suspect = "suspect"
    witness = "witness"
    victim = "victim"

class SeverityEnum(str, Enum):
    low = "low"
    medium = "medium"
    high = "high"

# Person schemas
class PersonBase(BaseModel):
    name: str
    address: str
    role: RoleEnum
    phone: str
    email: EmailStr

class PersonCreate(PersonBase):
    pass

class PersonUpdate(PersonBase):
    pass

class PersonResponse(PersonBase):
    id: str
    registration_number: str
    
    class Config:
        from_attributes = True

# Incident schemas
class IncidentBase(BaseModel):
    type: str
    description: str
    location: str
    severity: SeverityEnum
    involvedPersons: List[str] = []

class IncidentCreate(IncidentBase):
    pass

class IncidentUpdate(IncidentBase):
    pass

class IncidentResponse(IncidentBase):
    id: str
    registration_number: str
    date: datetime
    
    class Config:
        from_attributes = True

# Auth schemas
class LoginRequest(BaseModel):
    username: str
    password: str

class LoginResponse(BaseModel):
    success: bool
    token: Optional[str] = None
    message: Optional[str] = None

# Public incident schema
class PublicIncidentResponse(BaseModel):
    registration_number: str
    location: str