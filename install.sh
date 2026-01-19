#!/bin/bash

echo "================================================"
echo "  INSTALACIÓN DE MIIT REPORTES FRONTEND"
echo "================================================"
echo ""

# Colores
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Verificar Node.js
if ! command -v node &> /dev/null; then
    echo -e "${RED}[ERROR]${NC} Node.js no está instalado"
    echo "Por favor instala Node.js desde https://nodejs.org"
    exit 1
fi

echo -e "${GREEN}[OK]${NC} Node.js instalado: $(node --version)"

# Verificar npm
if ! command -v npm &> /dev/null; then
    echo -e "${RED}[ERROR]${NC} npm no está instalado"
    exit 1
fi

echo -e "${GREEN}[OK]${NC} npm instalado: $(npm --version)"
echo ""

echo "------------------------------------------------"
echo "Instalando dependencias..."
echo "Esto puede tardar varios minutos..."
echo "------------------------------------------------"
echo ""

npm install

if [ $? -ne 0 ]; then
    echo ""
    echo -e "${RED}[ERROR]${NC} Falló la instalación de dependencias"
    echo "Intenta ejecutar: npm install --force"
    exit 1
fi

echo ""
echo "================================================"
echo "  INSTALACIÓN COMPLETADA EXITOSAMENTE"
echo "================================================"
echo ""
echo "Próximos pasos:"
echo ""
echo "1. Configura las variables de entorno:"
echo "   - Edita el archivo .env.development"
echo "   - Asegúrate que el backend esté corriendo"
echo ""
echo "2. Inicia el servidor de desarrollo:"
echo "   npm run dev"
echo ""
echo "3. Abre tu navegador en:"
echo "   http://localhost:5173"
echo ""
echo "================================================"
