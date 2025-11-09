FROM node:18-alpine

WORKDIR /app

COPY package*.json ./

COPY apps/web ./apps/web

RUN npm ci

EXPOSE 3000

CMD ["npm", "run", "dev", "--workspace=apps/web"]

