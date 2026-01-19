/**
 * Cliente API para reportes
 */

import axiosInstance, { axiosExportInstance } from './axios-config';
import type {
  ReportesDisponiblesResponse,
  CodigoReporte,
  FiltrosReporte,
  ReporteDetalleResponse,
  ReporteMetadata,
  FormatoExportacion,
} from '@/types/reportes.types';

export const reportesApi = {
  /**
   * Lista todos los reportes disponibles con información de permisos
   */
  listarReportesDisponibles: async (soloConAcceso: boolean = false): Promise<ReportesDisponiblesResponse> => {
    const response = await axiosInstance.get<ReportesDisponiblesResponse>('/reportes', {
      params: { solo_con_acceso: soloConAcceso },
    });
    return response.data;
  },

  /**
   * Consulta datos de un reporte específico con filtros y paginación
   * Usa timeout extendido porque algunos reportes tienen muchos registros
   */
  consultarReporte: async (
    codigoReporte: CodigoReporte,
    filtros: FiltrosReporte = {},
    pagina: number = 1,
    pageSize: number = 50
  ): Promise<ReporteDetalleResponse> => {
    const params: Record<string, any> = {
      page: pagina,
      page_size: pageSize,
    };

    // Campos fijos conocidos (no se envían como filtros dinámicos)
    const camposFijos = new Set([
      'material_id',
      'fecha_inicio',
      'fecha_fin',
      'orden_campo',
      'orden_direccion',
    ]);

    // Agregar filtros fijos
    if (filtros.material_id) {
      params.material_id = filtros.material_id;
    }
    if (filtros.fecha_inicio) {
      params.fecha_inicio = filtros.fecha_inicio;
    }
    if (filtros.fecha_fin) {
      params.fecha_fin = filtros.fecha_fin;
    }
    if (filtros.orden_campo) {
      params.orden_campo = filtros.orden_campo;
    }
    if (filtros.orden_direccion) {
      params.orden_direccion = filtros.orden_direccion;
    }

    // Agregar filtros dinámicos de columna
    Object.entries(filtros).forEach(([key, value]) => {
      if (!camposFijos.has(key) && value !== undefined && value !== '') {
        params[key] = value;
      }
    });

    // Usar instancia con timeout extendido para reportes grandes (538k+ registros)
    const response = await axiosExportInstance.get<ReporteDetalleResponse>(`/reportes/${codigoReporte}`, {
      params,
    });
    return response.data;
  },

  /**
   * Obtiene metadatos de configuración del reporte
   */
  obtenerMetadata: async (codigoReporte: CodigoReporte): Promise<ReporteMetadata> => {
    const response = await axiosInstance.get<ReporteMetadata>(`/reportes/${codigoReporte}/metadata`);
    return response.data;
  },

  /**
   * Exporta reporte en formato especificado (GET con parámetros)
   */
  exportarReporte: async (
    codigoReporte: CodigoReporte,
    formato: FormatoExportacion,
    filtros: FiltrosReporte = {}
  ): Promise<Blob> => {
    const params = new URLSearchParams();
    params.append('formato', formato);

    // Campos fijos conocidos
    const camposFijos = new Set([
      'material_id',
      'fecha_inicio',
      'fecha_fin',
      'orden_campo',
      'orden_direccion',
    ]);

    // Agregar filtros fijos
    if (filtros.material_id) {
      params.append('material_id', String(filtros.material_id));
    }
    if (filtros.fecha_inicio) {
      params.append('fecha_inicio', filtros.fecha_inicio);
    }
    if (filtros.fecha_fin) {
      params.append('fecha_fin', filtros.fecha_fin);
    }

    // Agregar filtros dinámicos de columna
    Object.entries(filtros).forEach(([key, value]) => {
      if (!camposFijos.has(key) && value !== undefined && value !== '') {
        params.append(key, String(value));
      }
    });

    // Usar instancia con timeout extendido para exportaciones grandes
    const response = await axiosExportInstance.get(
      `/reportes/${codigoReporte}/exportar?${params.toString()}`,
      { responseType: 'blob' }
    );
    return response.data as Blob;
  },
};

export default reportesApi;
