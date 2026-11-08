# Imagen única para Cloud Run: Express sirve la API y el build de React.
# Multi-stage: la primera etapa compila el frontend y se descarta; la imagen
# final solo lleva Node, las dependencias de producción y los archivos estáticos.

# --- Etapa 1: build del frontend ---
FROM node:24-slim AS frontend
WORKDIR /app/frontend
# Primero solo los package*.json: si no cambian, Docker reutiliza la capa del
# npm ci y el build es mucho más rápido.
COPY frontend/package*.json ./
RUN npm ci
COPY frontend/ ./
# vite.config.js escribe el build en ../backend/public (= /app/backend/public).
RUN npm run build

# --- Etapa 2: imagen final ---
FROM node:24-slim
WORKDIR /app
ENV NODE_ENV=production
COPY backend/package*.json ./
RUN npm ci --omit=dev
COPY backend/src ./src
COPY backend/db ./db
COPY --from=frontend /app/backend/public ./public
# Sin root: si alguien explota la app, no tiene privilegios en el contenedor.
USER node
# Cloud Run define PORT (8080); server.js lo lee.
CMD ["node", "src/server.js"]
