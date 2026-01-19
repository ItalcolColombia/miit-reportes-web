/**
 * Hooks personalizados para reportes
 */

import { useQuery, useMutation, keepPreviousData } from '@tanstack/react-query';
import { reportesApi } from '@/api/reportes.api';
import toast from 'react-hot-toast';
import type { FiltrosReporte, CodigoReporte, FormatoExportacion } from '@/types/reportes.types';
import { downloadBlob, generateExportFilename } from '@/utils/exportHelpers';
import { getApiErrorMessage } from '@/utils/errorHandler';

/**
 * Hook para listar reportes disponibles
 */
export const useReportesDisponibles = () => {
  return useQuery({
    queryKey: ['reportes-disponibles'],
    queryFn: () => reportesApi.listarReportesDisponibles(),
    staleTime: 5 * 60 * 1000, // 5 minutos
  });
};

/**
 * Hook para consultar un reporte específico
 */
export const useReporte = (
  codigoReporte: CodigoReporte,
  filtros: FiltrosReporte,
  page: number = 1,
  pageSize: number = 50
) => {
  return useQuery({
    queryKey: ['reporte', codigoReporte, filtros, page, pageSize],
    queryFn: () => reportesApi.consultarReporte(codigoReporte, filtros, page, pageSize),
    enabled: !!codigoReporte,
    placeholderData: keepPreviousData,
  });
};

/**
 * Hook para obtener metadata de un reporte
 */
export const useReporteMetadata = (codigoReporte: CodigoReporte) => {
  return useQuery({
    queryKey: ['reporte-metadata', codigoReporte],
    queryFn: () => reportesApi.obtenerMetadata(codigoReporte),
    enabled: !!codigoReporte,
    staleTime: 10 * 60 * 1000, // 10 minutos
  });
};

/**
 * Hook para exportar un reporte
 */
export const useExportarReporte = () => {
  return useMutation({
    mutationFn: async ({
      codigoReporte,
      formato,
      filtros,
    }: {
      codigoReporte: CodigoReporte;
      formato: FormatoExportacion;
      filtros: FiltrosReporte;
    }) => {
      const blob = await reportesApi.exportarReporte(codigoReporte, formato, filtros);
      const filename = generateExportFilename(codigoReporte, formato);
      downloadBlob(blob, filename);
      return { filename };
    },
    onSuccess: (data) => {
      toast.success(`Reporte exportado exitosamente: ${data.filename}`);
    },
    onError: (error: unknown) => {
      toast.error(getApiErrorMessage(error, 'Error al exportar reporte'));
    },
  });
};
