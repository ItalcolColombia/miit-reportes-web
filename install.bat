@echo off
echo ================================================
echo   INSTALACION DE MIIT REPORTES FRONTEND
echo ================================================
echo.

REM Verificar Node.js
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Node.js no esta instalado
    echo Por favor instala Node.js desde https://nodejs.org
    pause
    exit /b 1
)

echo [OK] Node.js instalado
node --version

REM Verificar npm
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] npm no esta instalado
    pause
    exit /b 1
)

echo [OK] npm instalado
npm --version
echo.

echo ------------------------------------------------
echo Instalando dependencias...
echo Esto puede tardar varios minutos...
echo ------------------------------------------------
echo.

npm install

if %errorlevel% neq 0 (
    echo.
    echo [ERROR] Fallo la instalacion de dependencias
    echo Intenta ejecutar: npm install --force
    pause
    exit /b 1
)

echo.
echo ================================================
echo   INSTALACION COMPLETADA EXITOSAMENTE
echo ================================================
echo.
echo Proximos pasos:
echo.
echo 1. Configura las variables de entorno:
echo    - Edita el archivo .env.development
echo    - Asegurate que el backend este corriendo
echo.
echo 2. Inicia el servidor de desarrollo:
echo    npm run dev
echo.
echo 3. Abre tu navegador en:
echo    http://localhost:5173
echo.
echo ================================================
pause
