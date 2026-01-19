# ============================================
# MIIT Reportes Web - Dockerfile
# Build multi-stage para produccion
# ============================================

# Stage 1: Build
FROM node:20-alpine AS builder

# Establecer directorio de trabajo
WORKDIR /app

# Copiar archivos de dependencias
COPY package.json package-lock.json* ./

# Instalar dependencias
RUN npm ci --legacy-peer-deps

# Copiar codigo fuente
COPY . .

# Variables de entorno para el build (se pueden sobrescribir en build-time)
ARG VITE_API_BASE_URL
ARG VITE_APP_NAME="MIIT Reportes"
ARG VITE_APP_VERSION="1.0.0"
ARG VITE_APP_ENV="production"

# Establecer variables de entorno
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
ENV VITE_APP_NAME=$VITE_APP_NAME
ENV VITE_APP_VERSION=$VITE_APP_VERSION
ENV VITE_APP_ENV=$VITE_APP_ENV

# Build de produccion
RUN npm run build

# ============================================
# Stage 2: Production con Nginx
# ============================================
FROM nginx:alpine AS production

# Instalar envsubst para sustitucion de variables
RUN apk add --no-cache gettext

# Copiar configuracion personalizada de nginx
COPY nginx/nginx.conf /etc/nginx/nginx.conf
COPY nginx/default.conf.template /etc/nginx/templates/default.conf.template

# Copiar archivos compilados desde el stage de build
COPY --from=builder /app/dist /usr/share/nginx/html

# Copiar script de entrada
COPY docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh

# Crear usuario no-root para seguridad
RUN addgroup -g 1001 -S appgroup && \
    adduser -u 1001 -S appuser -G appgroup && \
    chown -R appuser:appgroup /usr/share/nginx/html && \
    chown -R appuser:appgroup /var/cache/nginx && \
    chown -R appuser:appgroup /var/log/nginx && \
    touch /var/run/nginx.pid && \
    chown -R appuser:appgroup /var/run/nginx.pid

# Exponer puerto 80
EXPOSE 80

# Healthcheck
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost/health || exit 1

# Usar script de entrada
ENTRYPOINT ["/docker-entrypoint.sh"]

# Comando por defecto
CMD ["nginx", "-g", "daemon off;"]
