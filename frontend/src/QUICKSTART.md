# 🚀 Quick Start - Подключение к FastAPI Backend

## Что уже сделано ✅

Ваш фронтэнд **полностью готов** к работе с FastAPI + PostgreSQL бэкэндом!

### Реализованные API запросы:
- ✅ Аутентификация (login, logout, verify token)
- ✅ CRUD операции для инцидентов
- ✅ CRUD операции для персон
- ✅ Статистика по датам и персонам
- ✅ Публичный API (без авторизации)
- ✅ JWT токен в localStorage
- ✅ Обработка ошибок
- ✅ Fallback на mock данные

---

## 🔧 Настройка (3 шага)

### Шаг 1: Измените URL бэкэнда

**Файл:** `/lib/api.config.ts`

```typescript
export const API_BASE_URL = 'http://localhost:8000/api';
//                           👆 Измените на ваш URL
```

### Шаг 2: Создайте FastAPI бэкэнд

**См. подробную инструкцию:** `/BACKEND_SETUP.md`

Минимальные требования:
```python
# Таблицы в PostgreSQL:
- persons (id, name, address, role, phone, email, registration_number)
- incidents (id, type, description, location, date, severity, registration_number)
- incident_persons (incident_id, person_id) # many-to-many
- users (id, username, hashed_password) # для JWT auth
```

### Шаг 3: Запустите приложения

```bash
# Backend (FastAPI)
cd backend
uvicorn main:app --reload --port 8000

# Frontend (React)
npm run dev
```

---

## 📡 API Endpoints (что ожидает фронтэнд)

### Auth
```
POST   /api/auth/login        # { username, password } → { success, token }
POST   /api/auth/logout       # (требует auth)
GET    /api/auth/verify       # (требует auth)
```

### Incidents
```
GET    /api/incidents                     # Все инциденты (auth)
GET    /api/incidents/public              # Публичный список (no auth)
GET    /api/incidents/{id}                # Один инцидент (auth)
POST   /api/incidents                     # Создать (auth)
PUT    /api/incidents/{id}                # Обновить (auth)
DELETE /api/incidents/{id}                # Удалить (auth)
GET    /api/incidents/by-person/{person_id} # По персоне (auth)
```

### Persons
```
GET    /api/persons           # Все персоны (auth)
GET    /api/persons/{id}      # Одна персона (auth)
POST   /api/persons           # Создать (auth)
PUT    /api/persons/{id}      # Обновить (auth)
DELETE /api/persons/{id}      # Удалить (auth)
```

### Statistics
```
GET    /api/statistics?start_date=2025-01-01&end_date=2025-12-31 # (auth)
GET    /api/statistics        # Общая статистика (auth)
```

---

## 💾 Структура данных

### Request: Создать инцидент
```json
{
  "type": "Theft",
  "description": "Stolen vehicle",
  "location": "123 Main Street",
  "severity": "high",
  "involvedPersons": ["person-1", "person-2"]
}
```

### Response: Инцидент
```json
{
  "id": "inc-123",
  "registrationNumber": "RN789456",
  "type": "Theft",
  "description": "Stolen vehicle",
  "location": "123 Main Street",
  "date": "2025-11-11T10:30:00Z",
  "severity": "high",
  "involvedPersons": ["person-1", "person-2"]
}
```

### Request: Создать персону
```json
{
  "name": "John Doe",
  "address": "456 Oak Avenue",
  "role": "suspect",
  "phone": "+1234567890",
  "email": "john@example.com"
}
```

### Response: Персона
```json
{
  "id": "person-123",
  "registrationNumber": "PR001234",
  "name": "John Doe",
  "address": "456 Oak Avenue",
  "role": "suspect",
  "phone": "+1234567890",
  "email": "john@example.com"
}
```

---

## 🔐 Аутентификация

### JWT Token Flow

1. **Login:** `POST /api/auth/login`
```json
Request: { "username": "officer", "password": "secret" }
Response: { "success": true, "token": "eyJhbGc..." }
```

2. **Токен сохраняется** в `localStorage.setItem('auth_token', token)`

3. **Все защищённые запросы** автоматически включают заголовок:
```
Authorization: Bearer eyJhbGc...
```

4. **Logout:** токен удаляется из localStorage

---

## 🧪 Тестирование без бэкэнда

Приложение работает **без бэкэнда** в offline режиме:

1. Запустите фронтэнд: `npm run dev`
2. Войдите с любым username/password
3. Используются **mock данные** из `/lib/mockData.ts`
4. Все изменения сохраняются в React state

**Когда подключите бэкэнд** - всё автоматически переключится на реальный API!

---

## 📂 Файлы для изучения

```
/lib/
├── api.config.ts    ← ИЗМЕНИТЕ ЗДЕСЬ URL
├── api.ts           ← Все API запросы
├── types.ts         ← TypeScript типы
└── mockData.ts      ← Тестовые данные

/components/
├── officer/
│   ├── IncidentsTab.tsx    ← Использует api.incidents
│   ├── PersonsTab.tsx      ← Использует api.persons
│   └── StatisticsTab.tsx   ← Использует api.statistics
└── PublicDashboard.tsx     ← Использует api.incidents.getPublic()

/App.tsx                    ← Использует api.auth
```

---

## ⚡ Примеры использования

### В любом React компоненте:

```typescript
import { api } from '../lib/api';
import { toast } from 'sonner@2.0.3';

// Получить данные
useEffect(() => {
  const fetchData = async () => {
    try {
      const incidents = await api.incidents.getAll();
      setIncidents(incidents);
    } catch (error) {
      toast.error('Failed to load data');
      // Автоматический fallback на mock данные
    }
  };
  fetchData();
}, []);

// Создать инцидент
const handleCreate = async () => {
  try {
    const newIncident = await api.incidents.create({
      type: 'Theft',
      description: 'Details...',
      location: 'Address...',
      severity: 'medium',
      involvedPersons: []
    });
    toast.success('Created successfully!');
  } catch (error) {
    toast.error('Failed to create');
  }
};
```

---

## 🐛 Troubleshooting

### "Failed to connect to server"
✅ **Это нормально!** Приложение использует mock данные.

Чтобы подключить бэкэнд:
1. Проверьте URL в `/lib/api.config.ts`
2. Убедитесь что FastAPI запущен: `curl http://localhost:8000`
3. Проверьте CORS настройки в FastAPI

### "401 Unauthorized"
- Проверьте что токен сохраняется: `localStorage.getItem('auth_token')`
- Проверьте JWT секретный ключ на бэкэнде
- Токен может устареть (перезайдите)

### CORS ошибки
В FastAPI добавьте:
```python
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

---

## 📚 Дополнительная документация

- **`/BACKEND_SETUP.md`** - Полная инструкция по FastAPI + PostgreSQL
- **`/README_RU.md`** - Обзор интеграции на русском
- **`/.env.example`** - Пример конфигурации

---

## ✨ Что дальше?

1. ✅ Измените URL в `/lib/api.config.ts`
2. ✅ Создайте FastAPI бэкэнд (см. `/BACKEND_SETUP.md`)
3. ✅ Запустите оба приложения
4. 🎉 **Всё работает!**

---

**Вопросы?** Всё подробно описано в `/BACKEND_SETUP.md`
