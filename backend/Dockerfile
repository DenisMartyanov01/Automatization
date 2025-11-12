FROM python:3.11-slim

WORKDIR /app

# Копируем зависимости и устанавливаем их
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Копируем весь код (при сборке)
COPY . .

# Создаем пользователя для безопасности
RUN useradd -m -u 1000 backend
USER backend

EXPOSE 8000

# Команда по умолчанию (переопределяется в docker-compose)
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
