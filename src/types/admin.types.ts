/**
 * Types para administración de roles y permisos
 */

import { CodigoReporte } from './reportes.types';

export interface Rol {
  id: number;
  nombre: string;
  estado: boolean;
  cantidad_usuarios?: number;
  permisos_reportes?: string[];
}

export interface PermisoReporte {
  id?: number;
  rol_id: number;
  codigo_reporte: CodigoReporte;
  puede_ver: boolean;
  puede_exportar: boolean;
  fecha_hora?: string;
}

export interface AsignarPermisosRequest {
  permisos_reportes: Array<{
    codigo_reporte: CodigoReporte;
    puede_ver: boolean;
    puede_exportar: boolean;
  }>;
}

export interface RolConPermisos extends Rol {
  permisos: PermisoReporte[];
}
