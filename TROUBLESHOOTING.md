# SOLUCIÓN DE PROBLEMAS - MIIT Reportes Frontend

## 🔴 Errores Comunes y Soluciones

### 1. Error: Cannot find module '@vitejs/plugin-react'

**Problema:** El paquete `@vitejs/plugin-react` no está instalado.

**Solución:**
```bash
npm install @vitejs/plugin-react --save-dev
```

Si persiste el error:
```bash
# Limpiar caché y reinstalar
rm -rf node_modules package-lock.json
npm cache clean --force
npm install
```

---

### 2. Error: Module not found - Can't resolve '@mui/material'

**Problema:** Las dependencias de Material-UI no se instalaron correctamente.

**Solución:**
```bash
npm install @mui/material @emotion/react @emotion/styled @mui/icons-material
```

---

### 3. Error: CORS Policy - El backend bloquea las peticiones

**Problema:** El backend no está configurado para aceptar peticiones desde `http://localhost:5173`

**Solución:**

En tu backend FastAPI, asegúrate de tener configurado CORS:

```python
# main.py o donde configures CORS
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

---

### 4. Error: Failed to fetch - No se puede conectar al backend

**Problema:** El backend no está corriendo o está en un puerto diferente.

**Solución:**
1. Verificar que el backend esté corriendo:
   ```bash
   # En la carpeta del backend
   uvicorn main:app --reload --port 8000
   ```

2. Verificar la URL en `.env.development`:
   ```
   VITE_API_BASE_URL=http://localhost:8000/api/v1
   ```

---

### 5. Error: Invalid token o Token expired

**Problema:** El token JWT ha expirado o es inválido.

**Solución:**
- El sistema maneja automáticamente el refresh token
- Si persiste, hacer logout y login nuevamente
- Verificar que el backend esté generando tokens válidos

---

### 6. Error al instalar dependencias en Windows

**Problema:** Error de permisos o problemas con node-gyp.

**Solución:**
```bash
# Ejecutar como administrador
npm install --force

# O usar npm con configuración específica
npm install --legacy-peer-deps
```

---

### 7. Error: ENOENT - No such file or directory

**Problema:** Faltan archivos o carpetas necesarias.

**Solución:**
```bash
# Crear estructura de carpetas
mkdir -p src/{api,assets,components,features,hooks,routes,stores,styles,types,utils}

# Verificar que todos los archivos existan
npm run type-check
```

---

### 8. Error: Port 5173 is already in use

**Problema:** El puerto está siendo usado por otro proceso.

**Solución:**
```bash
# Windows - Encontrar y matar el proceso
netstat -ano | findstr :5173
taskkill /PID <PID> /F

# Linux/Mac
lsof -i :5173
kill -9 <PID>

# O cambiar el puerto en vite.config.ts
server: {
  port: 3000, // Cambiar a otro puerto
}
```

---

### 9. Error de tipos TypeScript

**Problema:** TypeScript encuentra errores de tipos.

**Solución:**
```bash
# Verificar errores de tipos
npm run type-check

# Si hay errores con @types
npm install --save-dev @types/react @types/react-dom @types/node
```

---

### 10. La aplicación se ve mal o sin estilos

**Problema:** Los estilos no se están cargando correctamente.

**Solución:**
1. Verificar que Material-UI esté instalado
2. Verificar que el tema esté configurado en App.tsx
3. Limpiar caché del navegador (Ctrl+F5)

---

## 🔧 Comandos Útiles para Debugging

### Limpiar y reinstalar todo
```bash
# Windows
rmdir /s /q node_modules
del package-lock.json
npm cache clean --force
npm install

# Linux/Mac
rm -rf node_modules package-lock.json
npm cache clean --force
npm install
```

### Verificar versiones
```bash
node --version  # Debe ser 18+
npm --version   # Debe ser 9+
npm list react  # Verificar React instalado
```

### Actualizar dependencias
```bash
npm update
npm audit fix
```

### Ver logs detallados
```bash
npm install --verbose
npm run dev -- --debug
```

---

## 🆘 Si nada funciona

1. **Crea un proyecto nuevo desde cero:**
   ```bash
   npm create vite@latest test-app -- --template react-ts
   cd test-app
   npm install
   npm run dev
   ```
   Si esto funciona, el problema está en la configuración del proyecto.

2. **Verifica tu entorno:**
   - Node.js 18+ instalado
   - npm 9+ instalado
   - Backend corriendo en puerto 8000
   - Sin proxies o firewalls bloqueando

3. **Revisa la consola del navegador:**
   - F12 → Console
   - Busca errores en rojo
   - Revisa la pestaña Network para ver peticiones fallidas

4. **Contacta soporte:**
   - Proporciona el error exacto
   - Incluye versiones de Node y npm
   - Describe los pasos que seguiste

---

## 📝 Logs y Archivos de Debug

Si necesitas ayuda, proporciona:
- Contenido de `package.json`
- Error exacto de la consola
- Resultado de `npm list`
- Contenido de `.env.development`
- Logs del backend

---

**Última actualización:** Noviembre 2024
