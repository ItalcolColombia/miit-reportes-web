/**
 * Types para módulo de reportes
 */

export type CodigoReporte =
  | 'RPT_BASCULA'
  | 'RPT_RECIBIDO_DESPACHADO'
  | 'RPT_SALDOS'
  | 'RPT_AJUSTES'
  | 'RPT_DESPACHO_CAMION'
  | 'RPT_RECEPCION'
  | 'RPT_TRASLADOS'
  | 'RPT_PESADAS'
  | string;

export type FormatoExportacion = 'pdf' | 'excel' | 'csv';

export type OrdenDireccion = 'asc' | 'desc';

export type TipoDato = 'string' | 'number' | 'date' | 'datetime' | 'boolean' | 'integer';

export type TipoTotalizacion = 'sum' | 'avg' | 'count' | 'min' | 'max' | null;

export type Alineacion = 'left' | 'center' | 'right';

export type TipoFiltro = 'select' | 'search';

/**
 * Opción para filtros tipo select
 */
export interface OpcionFiltro {
  valor: string;
  etiqueta: string;
}

/**
 * Definición de un filtro de columna
 */
export interface FiltroColumna {
  campo: string;
  nombre_mostrar: string;
  tipo_filtro: TipoFiltro;
  /** Solo para tipo_filtro='select' */
  opciones?: OpcionFiltro[];
  /** Solo para tipo_filtro='search' */
  placeholder?: string;
}

/**
 * Información de un reporte con permisos del usuario
 */
export interface ReporteConPermisos {
  id: number;
  codigo: CodigoReporte;
  nombre: string;
  descripcion: string | null;
  vista_nombre: string;
  campo_fecha: string;
  icono: string;
  orden: number;
  color: string;
  categoria: string;
  permite_exportar_pdf: boolean;
  permite_exportar_excel: boolean;
  permite_exportar_csv: boolean;
  requiere_rango_fechas: boolean;
  permite_filtrar_material: boolean;
  activo: boolean;
  puede_ver: boolean;
  puede_exportar: boolean;
}

/**
 * Respuesta de listado de reportes
 */
export interface ListaReportesResponse {
  reportes: ReporteConPermisos[];
  total: number;
}

/**
 * Filtros aplicables a un reporte
 * Incluye filtros fijos (fechas, material) y dinámicos (por columna)
 */
export interface FiltrosReporte {
  material_id?: number;
  fecha_inicio?: string;
  fecha_fin?: string;
  orden_campo?: string;
  orden_direccion?: OrdenDireccion;
  /** Filtros dinámicos por columna: { campo: valor } */
  [key: string]: string | number | OrdenDireccion | undefined;
}

/**
 * Definición de columna de un reporte
 */
export interface ColumnaReporte {
  campo: string;
  nombre_mostrar: string;
  tipo_dato: TipoDato;
  orden: number;
  visible: boolean;
  ordenable: boolean;
  filtrable: boolean;
  es_totalizable: boolean;
  tipo_totalizacion: TipoTotalizacion;
  alineacion: Alineacion;
  formato: string | null;
  prefijo: string | null;
  sufijo: string | null;
  decimales: number;
  ancho_minimo: number;
}

/**
 * Información de paginación
 */
export interface PaginacionReporte {
  pagina_actual: number;
  paginas_totales: number;
  registros_por_pagina: number;
  total_registros: number;
}

/**
 * Información del reporte en respuesta de datos
 */
export interface ReporteInfo {
  codigo: CodigoReporte;
  nombre: string;
  fecha_generacion: string;
  filtros_aplicados: FiltrosReporte;
}

/**
 * Respuesta de datos de un reporte
 */
export interface ReporteDataResponse {
  reporte: ReporteInfo;
  columnas: ColumnaReporte[];
  datos: Record<string, any>[];
  totales: Record<string, number> | null;
  paginacion: PaginacionReporte;
}

/**
 * Material para filtros
 */
export interface Material {
  id: number;
  nombre: string;
  codigo: string;
}

/**
 * Rango de fechas disponible
 */
export interface RangoFechas {
  fecha_minima: string | null;
  fecha_maxima: string | null;
}

/**
 * Filtros disponibles para un reporte
 */
export interface FiltrosDisponibles {
  materiales: Material[];
  rango_fechas: RangoFechas;
}

/**
 * Metadata de un reporte
 */
export interface ReporteMetadataResponse {
  codigo: CodigoReporte;
  nombre: string;
  descripcion: string | null;
  columnas: ColumnaReporte[];
  filtros_disponibles: FiltrosDisponibles;
  totalizables: string[];
  /** Filtros dinámicos por columna */
  filtros_columnas?: FiltroColumna[];
}

// Legacy types para compatibilidad
export interface ReporteDisponible {
  codigo: CodigoReporte;
  nombre: string;
  descripcion?: string;
  tiene_acceso: boolean;
  puede_exportar?: boolean;
}

export interface ReportesDisponiblesResponse {
  reportes: ReporteDisponible[];
}

export interface Paginacion {
  pagina: number;
  page_size: number;
  total_registros: number;
}

export interface ReporteDetalleResponse {
  reporte: ReporteDisponible;
  columnas?: ColumnaReporte[];
  datos: any[];
  paginacion: Paginacion;
  totales?: Record<string, number>;
}

export interface ReporteMetadata {
  codigo: CodigoReporte;
  nombre: string;
  descripcion?: string;
  columnas?: ColumnaReporte[];
  filtros_disponibles?: FiltrosDisponibles;
  totalizables?: string[];
  /** Filtros dinámicos por columna */
  filtros_columnas?: FiltroColumna[];
}
