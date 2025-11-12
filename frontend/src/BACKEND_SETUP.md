# Backend Setup Guide - FastAPI + PostgreSQL

Этот фронтэнд-приложение готово к подключению к вашему FastAPI бэкэнду с PostgreSQL базой данных.

## 📋 Оглавление

- [Конфигурация фронтэнда](#конфигурация-фронтэнда)
- [Требования к FastAPI бэкэнду](#требования-к-fastapi-бэкэнду)
- [Структура API эндпоинтов](#структура-api-эндпоинтов)
- [Модели данных PostgreSQL](#модели-данных-postgresql)
- [Пример FastAPI кода](#пример-fastapi-кода)
- [CORS настройка](#cors-настройка)
- [Запуск и тестирование](#запуск-и-тестирование)

---

## Конфигурация фронтэнда

### Настройка URL бэкэнда

Откройте файл `/lib/api.config.ts` и измените URL:

```typescript
export const API_BASE_URL = 'http://localhost:8000/api';
```

Или установите переменную окружения:
```bash
REACT_APP_API_URL=http://your-backend-url.com/api
```

### Файлы API

- `/lib/api.config.ts` - Конфигурация URL и эндпоинтов
- `/lib/types.ts` - TypeScript типы для всех моделей данных
- `/lib/api.ts` - API клиент со всеми методами

---

## Требования к FastAPI бэкэнду

### Установка зависимостей

```bash
pip install fastapi uvicorn sqlalchemy psycopg2-binary python-jose passlib python-multipart
```

### Структура базы данных PostgreSQL

Создайте базу данных:

```sql
CREATE DATABASE emergency_nearby;
```

---

## Структура API эндпоинтов

### Аутентификация

| Метод | Эндпоинт | Описание | Auth Required |
|-------|----------|----------|---------------|
| POST | `/api/auth/login` | Вход в систему | ❌ |
| POST | `/api/auth/logout` | Выход из системы | ✅ |
| GET | `/api/auth/verify` | Проверка токена | ✅ |

### Инциденты (Incidents)

| Метод | Эндпоинт | Описание | Auth Required |
|-------|----------|----------|---------------|
| GET | `/api/incidents` | Получить все инциденты | ✅ |
| GET | `/api/incidents/public` | Публичная информация | ❌ |
| GET | `/api/incidents/{id}` | Получить инцидент по ID | ✅ |
| POST | `/api/incidents` | Создать инцидент | ✅ |
| PUT | `/api/incidents/{id}` | Обновить инцидент | ✅ |
| DELETE | `/api/incidents/{id}` | Удалить инцидент | ✅ |
| GET | `/api/incidents/by-person/{person_id}` | Инциденты по персоне | ✅ |

### Персоны (Persons)

| Метод | Эндпоинт | Описание | Auth Required |
|-------|----------|----------|---------------|
| GET | `/api/persons` | Получить всех персон | ✅ |
| GET | `/api/persons/{id}` | Получить персону по ID | ✅ |
| POST | `/api/persons` | Создать персону | ✅ |
| PUT | `/api/persons/{id}` | Обновить персону | ✅ |
| DELETE | `/api/persons/{id}` | Удалить персону | ✅ |

### Статистика (Statistics)

| Метод | Эндпоинт | Описание | Auth Required |
|-------|----------|----------|---------------|
| GET | `/api/statistics` | Общая статистика | ✅ |
| GET | `/api/statistics?start_date=...&end_date=...` | Статистика за период | ✅ |

---

## Модели данных PostgreSQL

### Таблица: `persons`

```sql
CREATE TABLE persons (
    id VARCHAR(255) PRIMARY KEY,
    registration_number VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    address TEXT NOT NULL,
    role VARCHAR(20) CHECK (role IN ('suspect', 'witness', 'victim')) NOT NULL,
    phone VARCHAR(50) NOT NULL,
    email VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Таблица: `incidents`

```sql
CREATE TABLE incidents (
    id VARCHAR(255) PRIMARY KEY,
    registration_number VARCHAR(50) UNIQUE NOT NULL,
    type VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    location TEXT NOT NULL,
    date TIMESTAMP NOT NULL,
    severity VARCHAR(20) CHECK (severity IN ('low', 'medium', 'high')) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Таблица: `incident_persons` (связь many-to-many)

```sql
CREATE TABLE incident_persons (
    incident_id VARCHAR(255) REFERENCES incidents(id) ON DELETE CASCADE,
    person_id VARCHAR(255) REFERENCES persons(id) ON DELETE CASCADE,
    PRIMARY KEY (incident_id, person_id)
);
```

### Таблица: `users` (для аутентификации)

```sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(100) UNIQUE NOT NULL,
    hashed_password VARCHAR(255) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## Пример FastAPI кода

### 1. Структура проекта

```
backend/
├── main.py
├── database.py
├── models.py
├── schemas.py
├── auth.py
└── routers/
    ├── auth_router.py
    ├── incidents_router.py
    ├── persons_router.py
    └── statistics_router.py
```

### 2. database.py

```python
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

DATABASE_URL = "postgresql://username:password@localhost/emergency_nearby"

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
```

### 3. models.py

```python
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
```

### 4. schemas.py

```python
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
```

### 5. main.py

```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import Base, engine
from routers import auth_router, incidents_router, persons_router, statistics_router

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Emergency Nearby API")

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173"],  # Add your frontend URLs
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth_router.router, prefix="/api/auth", tags=["auth"])
app.include_router(incidents_router.router, prefix="/api/incidents", tags=["incidents"])
app.include_router(persons_router.router, prefix="/api/persons", tags=["persons"])
app.include_router(statistics_router.router, prefix="/api/statistics", tags=["statistics"])

@app.get("/")
def read_root():
    return {"message": "Emergency Nearby API"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
```

### 6. routers/incidents_router.py (пример)

```python
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from database import get_db
from models import Incident, Person
from schemas import IncidentCreate, IncidentResponse, PublicIncidentResponse
from auth import get_current_user
import uuid

router = APIRouter()

@router.get("/public", response_model=List[PublicIncidentResponse])
def get_public_incidents(db: Session = Depends(get_db)):
    """Public endpoint - no authentication required"""
    incidents = db.query(Incident).all()
    return [{"registration_number": inc.registration_number, "location": inc.location} 
            for inc in incidents]

@router.get("/", response_model=List[IncidentResponse])
def get_all_incidents(
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get all incidents - requires authentication"""
    incidents = db.query(Incident).all()
    
    # Convert to response format with involvedPersons as list of IDs
    result = []
    for inc in incidents:
        incident_dict = {
            "id": inc.id,
            "registration_number": inc.registration_number,
            "type": inc.type,
            "description": inc.description,
            "location": inc.location,
            "date": inc.date,
            "severity": inc.severity.value,
            "involvedPersons": [p.id for p in inc.involved_persons]
        }
        result.append(incident_dict)
    
    return result

@router.post("/", response_model=IncidentResponse)
def create_incident(
    incident: IncidentCreate,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create new incident - requires authentication"""
    new_incident = Incident(
        id=f"inc-{uuid.uuid4()}",
        registration_number=f"RN{uuid.uuid4().hex[:6].upper()}",
        type=incident.type,
        description=incident.description,
        location=incident.location,
        severity=incident.severity,
        date=datetime.utcnow()
    )
    
    # Add involved persons
    for person_id in incident.involvedPersons:
        person = db.query(Person).filter(Person.id == person_id).first()
        if person:
            new_incident.involved_persons.append(person)
    
    db.add(new_incident)
    db.commit()
    db.refresh(new_incident)
    
    return {
        "id": new_incident.id,
        "registration_number": new_incident.registration_number,
        "type": new_incident.type,
        "description": new_incident.description,
        "location": new_incident.location,
        "date": new_incident.date,
        "severity": new_incident.severity.value,
        "involvedPersons": [p.id for p in new_incident.involved_persons]
    }

@router.get("/by-person/{person_id}", response_model=List[IncidentResponse])
def get_incidents_by_person(
    person_id: str,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get all incidents involving a specific person"""
    person = db.query(Person).filter(Person.id == person_id).first()
    if not person:
        raise HTTPException(status_code=404, detail="Person not found")
    
    result = []
    for inc in person.incidents:
        incident_dict = {
            "id": inc.id,
            "registration_number": inc.registration_number,
            "type": inc.type,
            "description": inc.description,
            "location": inc.location,
            "date": inc.date,
            "severity": inc.severity.value,
            "involvedPersons": [p.id for p in inc.involved_persons]
        }
        result.append(incident_dict)
    
    return result
```

### 7. auth.py (JWT Authentication)

```python
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import JWTError, jwt
from passlib.context import CryptContext
from datetime import datetime, timedelta

SECRET_KEY = "your-secret-key-here-change-in-production"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
security = HTTPBearer()

def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    return pwd_context.hash(password)

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    token = credentials.credentials
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
        return username
    except JWTError:
        raise credentials_exception
```

---

## CORS настройка

В `main.py` обязательно добавьте URL вашего фронтэнда:

```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",  # React dev server
        "http://localhost:5173",  # Vite dev server
        "https://your-production-domain.com"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

---

## Запуск и тестирование

### 1. Запуск FastAPI бэкэнда

```bash
cd backend
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### 2. Создание тестового пользователя

```python
from auth import get_password_hash
from database import SessionLocal
from models import User
import uuid

db = SessionLocal()

test_user = User(
    id=f"user-{uuid.uuid4()}",
    username="officer",
    hashed_password=get_password_hash("password123"),
    is_active=True
)

db.add(test_user)
db.commit()
```

### 3. Запуск фронтэнда

```bash
npm run dev
```

### 4. Тестирование

1. Откройте браузер: `http://localhost:3000` или `http://localhost:5173`
2. Попробуйте войти как `officer` / `password123`
3. Создайте инцидент или персону
4. Проверьте, что данные сохраняются в PostgreSQL

### 5. Проверка API через Swagger

Откройте: `http://localhost:8000/docs`

---

## Полезные SQL запросы

### Проверить все инциденты
```sql
SELECT * FROM incidents;
```

### Проверить все персоны
```sql
SELECT * FROM persons;
```

### Проверить связи инциденты-персоны
```sql
SELECT 
    i.registration_number, 
    i.type, 
    p.name, 
    p.role
FROM incidents i
JOIN incident_persons ip ON i.id = ip.incident_id
JOIN persons p ON ip.person_id = p.id;
```

---

## Troubleshooting

### Ошибка CORS
- Проверьте, что URL фронтэнда добавлен в `allow_origins`
- Убедитесь, что `allow_credentials=True`

### Ошибка подключения к БД
- Проверьте `DATABASE_URL` в `database.py`
- Убедитесь, что PostgreSQL запущен: `sudo service postgresql status`

### 401 Unauthorized
- Проверьте, что токен сохраняется в localStorage
- Проверьте заголовок Authorization в запросах

### Offline mode
- Если бэкэнд недоступен, фронтэнд автоматически использует mock данные
- Это полезно для разработки

---

## Готово! 🎉

Теперь ваш фронтэнд полностью интегрирован с FastAPI бэкэндом. 

Все операции (создание, чтение, обновление инцидентов и персон) автоматически отправляются на бэкэнд, с fallback на локальные данные если бэкэнд недоступен.
