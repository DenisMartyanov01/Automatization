FROM python:3.11-slim

RUN apt-get update && \
    apt-get install -y \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /backend


RUN pip install --upgrade pip
RUN pip install fastapi uvicorn
RUN pip install "fastapi[standard]"
RUN pip install sqlalchemy
RUN pip install psycopg2-binary

COPY . .

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
