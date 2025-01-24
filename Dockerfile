FROM oven/bun:1.1.12-slim AS base
WORKDIR /app

# Копируем только файлы зависимостей для кэширования слоёв
COPY package.json bun.lockb* ./

# Устанавливаем зависимости
RUN bun install

# Копируем остальной код
COPY . .

# Сборка проекта
RUN bun run build

# Финальный образ
FROM node:20-slim
WORKDIR /app

# Устанавливаем необходимые пакеты
RUN apt-get update \
    && apt-get install -y --no-install-recommends \
       gcc \
       python3-dev \
       libpq-dev \
       libffi-dev \
       libssl-dev \
       nginx \
       supervisor \
       curl \
       certbot \
       python3-certbot-nginx \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/* \
    && npm install -g pm2

# Копируем собранное приложение из предыдущего этапа
COPY --from=base /app /app

# Конфигурируем Nginx
RUN rm /etc/nginx/sites-enabled/default
COPY ./nginx/nginx.conf /etc/nginx/nginx.conf
COPY ./nginx/nuxtapp.conf /etc/nginx/sites-enabled/

EXPOSE 80 3000
CMD ["pm2-runtime", "start", "npm", "--", "start"]