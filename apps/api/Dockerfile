FROM node:18-slim

RUN apt-get update && \
    apt-get install -y --no-install-recommends \
    openssl \
    postgresql-client \
    ca-certificates && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package*.json ./

COPY apps/api ./apps/api

RUN npm install

WORKDIR /app/apps/api
RUN npx prisma generate

# Copy and set up entrypoint script
COPY apps/api/docker-entrypoint.sh /app/docker-entrypoint.sh
RUN chmod +x /app/docker-entrypoint.sh

EXPOSE 3001

ENTRYPOINT ["/app/docker-entrypoint.sh"]

