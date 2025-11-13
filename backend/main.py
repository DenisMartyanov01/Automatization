"""
MINIMAL FASTAPI BACKEND EXAMPLE
Минимальный пример FastAPI бэкэнда для Emergency Nearby

Установка:
pip install fastapi uvicorn sqlalchemy psycopg2-binary python-jose[cryptography] passlib[bcrypt]

Запуск:
uvicorn main:app --reload --port 8000
"""
from contextlib import asynccontextmanager
from fastapi import FastAPI, Depends, HTTPException, status, Response
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.responses import JSONResponse
from sqlalchemy import create_engine, Column, String, Text, DateTime, Enum as SQLEnum, Table, ForeignKey
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session, relationship
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime, timedelta
from jose import JWTError, jwt
from passlib.context import CryptContext
import enum
import uuid

# ============================================================================
# DATABASE SETUP
# ============================================================================

# ИЗМЕНИТЕ на ваши данные PostgreSQL
DATABASE_URL = "postgresql://postgres:123@postgres:5432/MainBD"

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# ============================================================================
# MODELS (PostgreSQL Tables)
# ============================================================================

class RoleEnum(enum.Enum):
    suspect = "suspect"
    witness = "witness"
    victim = "victim"

class SeverityEnum(enum.Enum):
    low = "low"
    medium = "medium"
    high = "high"

# Many-to-many relationship table
incident_persons = Table(
    'incident_persons',
    Base.metadata,
    Column('incident_id', String, ForeignKey('incidents.id', ondelete='CASCADE')),
    Column('person_id', String, ForeignKey('persons.id', ondelete='CASCADE'))
)

class User(Base):
    __tablename__ = "users"
    id = Column(String, primary_key=True, default=lambda: f"user-{uuid.uuid4()}")
    username = Column(String(100), unique=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)

class Person(Base):
    __tablename__ = "persons"
    id = Column(String, primary_key=True, default=lambda: f"person-{uuid.uuid4()}")
    registration_number = Column(String(50), unique=True, nullable=False, default=lambda: f"PR{uuid.uuid4().hex[:6].upper()}")
    name = Column(String(255), nullable=False)
    address = Column(Text, nullable=False)
    role = Column(SQLEnum(RoleEnum), nullable=False)
    phone = Column(String(50), nullable=False)
    email = Column(String(255), nullable=False)
    incidents = relationship("Incident", secondary=incident_persons, back_populates="involved_persons")

class Incident(Base):
    __tablename__ = "incidents"
    id = Column(String, primary_key=True, default=lambda: f"inc-{uuid.uuid4()}")
    registration_number = Column(String(50), unique=True, nullable=False, default=lambda: f"RN{uuid.uuid4().hex[:6].upper()}")
    type = Column(String(100), nullable=False)
    description = Column(Text, nullable=False)
    location = Column(Text, nullable=False)
    date = Column(DateTime, nullable=False, default=datetime.utcnow)
    severity = Column(SQLEnum(SeverityEnum), nullable=False)
    involved_persons = relationship("Person", secondary=incident_persons, back_populates="incidents")

# Create all tables
Base.metadata.create_all(bind=engine)

# ============================================================================
# PYDANTIC SCHEMAS (Request/Response Models)
# ============================================================================

class LoginRequest(BaseModel):
    username: str
    password: str

class LoginResponse(BaseModel):
    success: bool
    user: Optional[dict] = None
    message: Optional[str] = None
    token: Optional[str] = None

class PersonCreate(BaseModel):
    name: str
    address: str
    role: str
    phone: str
    email: str

class PersonResponse(BaseModel):
    id: str
    registration_number: str
    name: str
    address: str
    role: str
    phone: str
    email: str

class IncidentCreate(BaseModel):
    type: str
    description: str
    location: str
    severity: str
    involvedPersons: List[str] = []

class IncidentResponse(BaseModel):
    id: str
    registration_number: str
    type: str
    description: str
    location: str
    date: datetime
    severity: str
    involvedPersons: List[str]

class PublicIncidentResponse(BaseModel):
    id: str
    registration_number: str
    type: str
    description: str
    location: str
    date: datetime
    severity: str
    involvedPersons: List[PersonResponse]

# ============================================================================
# AUTHENTICATION
# ============================================================================

SECRET_KEY = "secret-key"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
security = HTTPBearer()

def verify_password(plain_password: str, hashed_password: str) -> bool:
    try:
        return pwd_context.verify(plain_password, hashed_password)
    except Exception as e:
        print(f"Password verification error: {e}")
        # Fallback для разработки
        if plain_password == hashed_password:
            return True
        return False

def get_password_hash(password):
    return pwd_context.hash(password)

def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
):
    try:
        token = credentials.credentials
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise HTTPException(status_code=401, detail="Invalid token")
        
        user = db.query(User).filter(User.username == username).first()
        if not user:
            raise HTTPException(status_code=401, detail="User not found")
        return user
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")

# ============================================================================
# FASTAPI APP
# ============================================================================

@asynccontextmanager
async def lifespan(app: FastAPI):
    yield

app = FastAPI(title="Emergency Nearby API", lifespan=lifespan)

# CORS - ОБЯЗАТЕЛЬНО для работы с фронтэндом
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",  # React dev server
        "http://localhost:5173",  # Vite dev server
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ============================================================================
# AUTH ENDPOINTS
# ============================================================================

@app.post("/api/auth/login", response_model=LoginResponse)
async def login(request: LoginRequest, response: Response, db: Session = Depends(get_db)):
    try:
        user = db.query(User).filter(User.username == request.username).first()
        
        if not user or not verify_password(request.password, user.hashed_password):
            return JSONResponse(
                status_code=400,
                content={"success": False, "message": "Incorrect username or password"}
            )
        
        # Создание токена
        access_token = create_access_token(data={"sub": user.username})
        
        return {
            "success": True, 
            "user": {
                "id": user.id,
                "username": user.username
            },
            "token": access_token  # Добавляем токен в ответ
        }
        
    except Exception as e:
        print(f"Login error: {e}")
        return JSONResponse(
            status_code=500,
            content={"success": False, "message": "Internal server error"}
        )

@app.post("/api/auth/logout")
def logout(response: Response):
    """Выход из системы"""
    response.delete_cookie("access_token")
    return {"success": True, "message": "Logged out successfully"}

@app.get("/api/auth/verify")
def verify_token(current_user: User = Depends(get_current_user)):
    """Проверка валидности токена"""
    return {
        "valid": True, 
        "user": {
            "id": current_user.id,
            "username": current_user.username
        }
    }

# ============================================================================
# PERSONS ENDPOINTS
# ============================================================================

@app.get("/api/persons", response_model=List[PersonResponse])
def get_persons(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Получить всех персон (требует авторизацию)"""
    persons = db.query(Person).all()
    return [PersonResponse(
        id=p.id,
        registration_number=p.registration_number,
        name=p.name,
        address=p.address,
        role=p.role.value,
        phone=p.phone,
        email=p.email
    ) for p in persons]

@app.post("/api/persons", response_model=PersonResponse)
def create_person(
    person: PersonCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Создать новую персону"""
    new_person = Person(
        name=person.name,
        address=person.address,
        role=RoleEnum[person.role],
        phone=person.phone,
        email=person.email
    )
    db.add(new_person)
    db.commit()
    db.refresh(new_person)
    
    return PersonResponse(
        id=new_person.id,
        registration_number=new_person.registration_number,
        name=new_person.name,
        address=new_person.address,
        role=new_person.role.value,
        phone=new_person.phone,
        email=new_person.email
    )

@app.put("/api/persons/{person_id}", response_model=PersonResponse)
def update_person(
    person_id: str,
    person: PersonCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Обновить персону"""
    db_person = db.query(Person).filter(Person.id == person_id).first()
    if not db_person:
        raise HTTPException(status_code=404, detail="Person not found")
    
    db_person.name = person.name
    db_person.address = person.address
    db_person.role = RoleEnum[person.role]
    db_person.phone = person.phone
    db_person.email = person.email
    
    db.commit()
    db.refresh(db_person)
    
    return PersonResponse(
        id=db_person.id,
        registration_number=db_person.registration_number,
        name=db_person.name,
        address=db_person.address,
        role=db_person.role.value,
        phone=db_person.phone,
        email=db_person.email
    )

# ============================================================================
# INCIDENTS ENDPOINTS
# ============================================================================

@app.get("/api/incidents/public", response_model=List[PublicIncidentResponse])
def get_public_incidents(db: Session = Depends(get_db)):
    """Публичная информация об инцидентах (БЕЗ авторизации)"""
    incidents = db.query(Incident).all()
    result = []
    for inc in incidents:
        involved_persons = []
        for person in inc.involved_persons:
            involved_persons.append(PersonResponse(
                id=person.id,
                registration_number=person.registration_number,
                name=person.name,
                address=person.address,
                role=person.role.value,
                phone=person.phone,
                email=person.email
            ))
        
        result.append(PublicIncidentResponse(
            id=inc.id,
            registration_number=inc.registration_number,
            type=inc.type,
            description=inc.description,
            location=inc.location,
            date=inc.date,
            severity=inc.severity.value,
            involvedPersons=involved_persons
        ))
    return result

@app.get("/api/incidents", response_model=List[IncidentResponse])
def get_incidents(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Получить все инциденты (требует авторизацию)"""
    incidents = db.query(Incident).all()
    return [IncidentResponse(
        id=inc.id,
        registration_number=inc.registration_number,
        type=inc.type,
        description=inc.description,
        location=inc.location,
        date=inc.date,
        severity=inc.severity.value,
        involvedPersons=[p.id for p in inc.involved_persons]
    ) for inc in incidents]

@app.post("/api/incidents", response_model=IncidentResponse)
def create_incident(
    incident: IncidentCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Создать новый инцидент"""
    new_incident = Incident(
        type=incident.type,
        description=incident.description,
        location=incident.location,
        severity=SeverityEnum[incident.severity]
    )
    
    for person_id in incident.involvedPersons:
        person = db.query(Person).filter(Person.id == person_id).first()
        if person:
            new_incident.involved_persons.append(person)
    
    db.add(new_incident)
    db.commit()
    db.refresh(new_incident)
    
    return IncidentResponse(
        id=new_incident.id,
        registration_number=new_incident.registration_number,
        type=new_incident.type,
        description=new_incident.description,
        location=new_incident.location,
        date=new_incident.date,
        severity=new_incident.severity.value,
        involvedPersons=[p.id for p in new_incident.involved_persons]
    )

@app.put("/api/incidents/{incident_id}", response_model=IncidentResponse)
def update_incident(
    incident_id: str,
    incident: IncidentCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Обновить инцидент"""
    db_incident = db.query(Incident).filter(Incident.id == incident_id).first()
    if not db_incident:
        raise HTTPException(status_code=404, detail="Incident not found")
    
    db_incident.type = incident.type
    db_incident.description = incident.description
    db_incident.location = incident.location
    db_incident.severity = SeverityEnum[incident.severity]
    
    db_incident.involved_persons.clear()
    for person_id in incident.involvedPersons:
        person = db.query(Person).filter(Person.id == person_id).first()
        if person:
            db_incident.involved_persons.append(person)
    
    db.commit()
    db.refresh(db_incident)
    
    return IncidentResponse(
        id=db_incident.id,
        registration_number=db_incident.registration_number,
        type=db_incident.type,
        description=db_incident.description,
        location=db_incident.location,
        date=db_incident.date,
        severity=db_incident.severity.value,
        involvedPersons=[p.id for p in db_incident.involved_persons]
    )

@app.get("/api/incidents/by-person/{person_id}", response_model=List[IncidentResponse])
def get_incidents_by_person(
    person_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Получить все инциденты для конкретной персоны"""
    person = db.query(Person).filter(Person.id == person_id).first()
    if not person:
        raise HTTPException(status_code=404, detail="Person not found")
    
    return [IncidentResponse(
        id=inc.id,
        registration_number=inc.registration_number,
        type=inc.type,
        description=inc.description,
        location=inc.location,
        date=inc.date,
        severity=inc.severity.value,
        involvedPersons=[p.id for p in inc.involved_persons]
    ) for inc in person.incidents]

# ============================================================================
# STATISTICS ENDPOINTS
# ============================================================================

@app.get("/api/statistics")
def get_statistics(
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Получить статистику (опционально за период)"""
    query = db.query(Incident)
    
    if start_date and end_date:
        start = datetime.fromisoformat(start_date)
        end = datetime.fromisoformat(end_date)
        query = query.filter(Incident.date.between(start, end))
    
    incidents = query.all()
    
    total = len(incidents)
    by_type = {}
    by_severity = {"low": 0, "medium": 0, "high": 0}
    
    for inc in incidents:
        by_type[inc.type] = by_type.get(inc.type, 0) + 1
        by_severity[inc.severity.value] += 1
    
    return {
        "totalIncidents": total,
        "byType": by_type,
        "bySeverity": by_severity,
        "byMonth": []
    }

# ============================================================================
# UTILITY ENDPOINT
# ============================================================================

@app.get("/")
def root():
    return {
        "message": "Emergency Nearby API",
        "version": "1.0",
        "docs": "/docs"
    }

# ============================================================================
# CREATE INITIAL USER
# ============================================================================

def create_initial_user():
    """Создание начального пользователя"""
    db = SessionLocal()
    
    # Проверяем, существует ли пользователь
    if db.query(User).filter(User.username == "officer").first():
        print("User already exists")
        db.close()
        return
    
    # Создаем хеш пароля
    hashed_password = get_password_hash("pass")
    
    # Создаем пользователя
    user = User(
        username="officer",
        hashed_password=hashed_password
    )
    
    db.add(user)
    db.commit()
    db.close()
    print("Initial user created successfully")

create_initial_user()

if __name__ == "__main__":

    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)