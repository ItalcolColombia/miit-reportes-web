# MIIT Reportes - Frontend Web

## 📋 Descripción

Aplicación web frontend para el Sistema de Reportes MIIT, desarrollada con React, TypeScript y Vite. Proporciona una interfaz moderna y responsive para visualizar, filtrar y exportar reportes operacionales.

## 🚀 Inicio Rápido

### Prerequisitos

- Node.js 18+ 
- npm 9+ o yarn 1.22+
- Backend API corriendo en `http://localhost:8000`

### Instalación

1. **Clonar o descargar el proyecto**
```bash
cd miit-reportes-web
```

2. **Instalar dependencias**
```bash
npm install
```

3. **Configurar variables de entorno**
```bash
# Copiar archivo de ejemplo
cp .env.example .env.development

# Editar .env.development con tus valores
VITE_API_BASE_URL=http://localhost:8000/api/v1
```

4. **Iniciar servidor de desarrollo**
```bash
npm run dev
```

La aplicación estará disponible en [http://localhost:5173](http://localhost:5173)

## 📁 Estructura del Proyecto

```
miit-reportes-web/
├── src/
│   ├── api/              # Configuración y clientes API
│   ├── assets/           # Imágenes, iconos, etc.
│   ├── components/       # Componentes reutilizables
│   │   ├── common/       # Componentes genéricos
│   │   └── layout/       # Componentes de layout
│   ├── features/         # Módulos por funcionalidad
│   │   ├── auth/         # Autenticación
│   │   ├── reportes/     # Módulo de reportes
│   │   └── admin/        # Administración
│   ├── hooks/            # Custom hooks
│   ├── routes/           # Configuración de rutas
│   ├── stores/           # Estado global (Zustand)
│   ├── styles/           # Estilos globales y tema
│   ├── types/            # TypeScript types
│   └── utils/            # Utilidades
```

## 🛠️ Scripts Disponibles

- `npm run dev` - Inicia servidor de desarrollo
- `npm run build` - Compila para producción
- `npm run preview` - Vista previa de producción
- `npm run lint` - Ejecuta ESLint
- `npm run type-check` - Verifica tipos TypeScript

## 🔧 Tecnologías Principales

- **React 18** - Framework UI
- **TypeScript** - Type safety
- **Vite** - Build tool
- **Material-UI v5** - Componentes UI
- **React Query** - Estado del servidor
- **Zustand** - Estado global
- **React Router v6** - Routing
- **Axios** - Cliente HTTP
- **React Hook Form** - Formularios
- **Recharts** - Gráficos

## 🎨 Características

- ✅ Autenticación JWT con refresh token
- ✅ 8 reportes operacionales
- ✅ Filtros dinámicos por fecha y material (y otros campos dependiendo del reporte)
- ✅ Exportación a PDF y CSV
- ✅ Sistema de roles y permisos
- ✅ Diseño responsive
- ✅ Tema personalizable
- ✅ Manejo de errores global
- ✅ Loading states
- ✅ Notificaciones toast

## 🔐 Roles y Permisos

### Roles disponibles:
1. **Administrador** - Acceso completo
2. **Supervisor** - Acceso a mayoría de reportes
3. **Colaborador** - Acceso limitado
4. **Integrador** - Reportes de integración
5. **Automatizador** - Reportes de automatización

## 🐛 Solución de Problemas

### Error: Cannot find module '@vitejs/plugin-react'
```bash
npm install @vitejs/plugin-react --save-dev
```

### Error de CORS
Verificar que el backend está configurado para permitir `http://localhost:5173`

### Token expirado
El sistema maneja automáticamente el refresh token. Si persiste, hacer logout y login nuevamente.

## 📝 Desarrollo

### Agregar un nuevo reporte

1. Agregar el código del reporte en `types/reportes.types.ts`
2. Crear componente en `features/reportes/components/`
3. Actualizar el servicio API en `api/reportes.api.ts`
4. Agregar la ruta en `routes/index.tsx`

### Crear un componente reutilizable

```tsx
// components/common/MyComponent.tsx
import { FC } from 'react'

interface MyComponentProps {
  title: string
  // ... más props
}

export const MyComponent: FC<MyComponentProps> = ({ title }) => {
  return <div>{title}</div>
}
```

## 🚀 Despliegue

### Build para producción
```bash
npm run build
```

Los archivos compilados estarán en la carpeta `dist/`

### Variables de entorno de producción
```bash
# .env.production
VITE_API_BASE_URL=https://api.miit.com/api/v1
VITE_APP_ENV=production
```

## 📚 Documentación Adicional

- [React Documentation](https://react.dev/)
- [Material-UI Documentation](https://mui.com/)
- [Vite Documentation](https://vitejs.dev/)
- [TypeScript Documentation](https://www.typescriptlang.org/)

## 🤝 Contribución

1. Crear una rama para tu feature: `git checkout -b feature/nueva-funcionalidad`
2. Commit tus cambios: `git commit -m 'feat: agregar nueva funcionalidad'`
3. Push a la rama: `git push origin feature/nueva-funcionalidad`
4. Crear Pull Request

## 📄 Licencia

Proyecto privado - Todos los derechos reservados

---

**Desarrollado por:** Daniel Castillo (Metalteco)
**Versión:** 1.0.0  
**Fecha:** Enero 2026
