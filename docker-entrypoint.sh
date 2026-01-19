#!/bin/sh
set -e

# Script de entrada para el contenedor Docker
# Procesa templates de nginx con variables de entorno

echo "Starting MIIT Reportes Web..."

# Procesar templates de nginx (sustituir variables de entorno)
if [ -d "/etc/nginx/templates" ]; then
    for template in /etc/nginx/templates/*.template; do
        if [ -f "$template" ]; then
            output="/etc/nginx/conf.d/$(basename "$template" .template)"
            echo "Processing template: $template -> $output"
            envsubst '${API_BACKEND_URL}' < "$template" > "$output"
        fi
    done
fi

# Verificar configuracion de nginx
echo "Validating nginx configuration..."
nginx -t

# Ejecutar comando pasado como argumento
exec "$@"
