/**
 * Constantes de la aplicación
 */

export const APP_NAME = import.meta.env.VITE_APP_NAME || 'MIIT Reportes';
export const APP_VERSION = import.meta.env.VITE_APP_VERSION || '1.0.0';
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1';

/**
 * Roles del sistema
 */
export const ROLES = {
  ADMINISTRADOR: 'Administrador',
  SUPERVISOR: 'Supervisor',
  COLABORADOR: 'Colaborador',
  INTEGRADOR: 'Integrador',
  AUTOMATIZADOR: 'Automatizador',
} as const;

/**
 * Descripciones de roles del sistema
 */
export const ROLES_DESCRIPCION: Record<string, string> = {
  Administrador: 'Acceso completo a todos los reportes, configuración del sistema y gestión de usuarios',
  Supervisor: 'Acceso a reportes operativos y de control, puede exportar datos',
  Colaborador: 'Acceso limitado a reportes básicos de consulta',
  Integrador: 'Acceso a APIs y servicios de integración con sistemas externos',
  Automatizador: 'Acceso para procesos automáticos y tareas programadas',
};

/**
 * Obtener descripción de un rol
 */
export const getDescripcionRol = (nombreRol: string): string => {
  return ROLES_DESCRIPCION[nombreRol] || 'Sin descripción disponible';
};

/**
 * Códigos de reportes con sus nombres
 * IMPORTANTE: Los códigos deben coincidir con los del backend (RPT_*)
 */
export const REPORTES_INFO: Record<string, { codigo: string; nombre: string; icono: string }> = {
  RPT_BASCULA: {
    codigo: 'RPT_BASCULA',
    nombre: 'Comparativo con Báscula Camionera',
    icono: 'CompareArrows',
  },
  RPT_RECIBIDO_DESPACHADO: {
    codigo: 'RPT_RECIBIDO_DESPACHADO',
    nombre: 'Total Recibido vs Despachado',
    icono: 'SwapHoriz',
  },
  RPT_SALDOS: {
    codigo: 'RPT_SALDOS',
    nombre: 'Saldos de Inventario',
    icono: 'Inventory',
  },
  RPT_AJUSTES: {
    codigo: 'RPT_AJUSTES',
    nombre: 'Total Ajustes',
    icono: 'Build',
  },
  RPT_DESPACHO_CAMION: {
    codigo: 'RPT_DESPACHO_CAMION',
    nombre: 'Total Despachado a Camión',
    icono: 'LocalShipping',
  },
  RPT_RECEPCION: {
    codigo: 'RPT_RECEPCION',
    nombre: 'Total Recibido',
    icono: 'Download',
  },
  RPT_TRASLADOS: {
    codigo: 'RPT_TRASLADOS',
    nombre: 'Total Traslados',
    icono: 'MoveDown',
  },
  RPT_PESADAS: {
    codigo: 'RPT_PESADAS',
    nombre: 'Registro de Pesadas',
    icono: 'Scale',
  },
};

/**
 * Códigos de reportes
 */
export const CODIGOS_REPORTE = {
  BASCULA: 'RPT_BASCULA',
  RECIBIDO_DESPACHADO: 'RPT_RECIBIDO_DESPACHADO',
  SALDOS: 'RPT_SALDOS',
  AJUSTES: 'RPT_AJUSTES',
  DESPACHO_CAMION: 'RPT_DESPACHO_CAMION',
  RECEPCION: 'RPT_RECEPCION',
  TRASLADOS: 'RPT_TRASLADOS',
  PESADAS: 'RPT_PESADAS',
} as const;

/**
 * Íconos de Material-UI para cada reporte
 */
export const ICONOS_REPORTE: Record<string, string> = {
  RPT_BASCULA: 'CompareArrows',
  RPT_RECIBIDO_DESPACHADO: 'SwapHoriz',
  RPT_SALDOS: 'Inventory',
  RPT_AJUSTES: 'Build',
  RPT_DESPACHO_CAMION: 'LocalShipping',
  RPT_RECEPCION: 'Download',
  RPT_TRASLADOS: 'MoveDown',
  RPT_PESADAS: 'Scale',
};

/**
 * Obtener nombre de reporte por código
 */
export const getNombreReporte = (codigo: string): string => {
  return REPORTES_INFO[codigo]?.nombre || codigo;
};

/**
 * Colores para estados
 */
export const COLORS = {
  primary: '#1976d2',
  secondary: '#dc004e',
  success: '#4caf50',
  error: '#f44336',
  warning: '#ff9800',
  info: '#2196f3',
};

/**
 * Tamaños de página por defecto
 */
export const PAGE_SIZES = [25, 50, 100, 200];

/**
 * Timeout para notificaciones (ms)
 */
export const TOAST_DURATION = 3000;

/**
 * Categorías de reportes para agrupación
 */
export interface CategoriaReporte {
  id: string;
  nombre: string;
  descripcion: string;
  icono: string;
  reportes: string[];
}

export const CATEGORIAS_REPORTES: CategoriaReporte[] = [
  {
    id: 'inventario',
    nombre: 'Inventario',
    descripcion: 'Reportes de saldos y ajustes de inventario',
    icono: 'Inventory',
    reportes: ['RPT_SALDOS', 'RPT_AJUSTES'],
  },
  {
    id: 'operaciones',
    nombre: 'Operaciones',
    descripcion: 'Reportes de recepción, despacho y traslados',
    icono: 'LocalShipping',
    reportes: ['RPT_RECEPCION', 'RPT_DESPACHO_CAMION', 'RPT_TRASLADOS', 'RPT_RECIBIDO_DESPACHADO'],
  },
  {
    id: 'control',
    nombre: 'Control y Auditoría',
    descripcion: 'Reportes de comparativos y registros detallados',
    icono: 'FactCheck',
    reportes: ['RPT_BASCULA', 'RPT_PESADAS'],
  },
];

/**
 * Obtener categoría de un reporte
 */
export const getCategoriaReporte = (codigoReporte: string): CategoriaReporte | undefined => {
  return CATEGORIAS_REPORTES.find((cat) => cat.reportes.includes(codigoReporte));
};

/**
 * Obtener reportes agrupados por categoría
 */
export const getReportesAgrupados = (): { categoria: CategoriaReporte; reportes: typeof REPORTES_INFO[string][] }[] => {
  return CATEGORIAS_REPORTES.map((categoria) => ({
    categoria,
    reportes: categoria.reportes
      .map((codigo) => REPORTES_INFO[codigo])
      .filter(Boolean),
  }));
};
