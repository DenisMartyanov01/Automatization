FROM node:18-alpine

WORKDIR /app

# Копируем package.json и устанавливаем зависимости включая vite
COPY package*.json ./
RUN npm install && npm install -g vite

# Копируем весь код
COPY . .

EXPOSE 3000

CMD ["npx", "vite", "--host", "0.0.0.0"]