/**
 * ReporteDetallePage - Página de detalle de un reporte con filtros y exportación
 */

import React, { useState, useCallback, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Button,
  Breadcrumbs,
  Link,
  Alert,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from '@mui/material';
import {
  ArrowBack,
  Refresh,
  Schedule,
  Warning,
  DateRange,
} from '@mui/icons-material';
import { format, subDays } from 'date-fns';
import { useReporte, useReporteMetadata, useExportarReporte } from '../hooks/useReportes';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { FiltrosReporteComponent } from '../components/FiltrosReporte';
import { TablaReporte } from '../components/TablaReporte';
import { ExportacionButtons } from '../components/ExportacionButtons';
import type { FiltrosReporte, CodigoReporte, FormatoExportacion, OrdenDireccion, ColumnaReporte, TipoDato, Alineacion } from '@/types/reportes.types';
import { formatDate } from '@/utils/formatters';
import { isForbiddenError } from '@/utils/errorHandler';

// Días por defecto para filtro inicial
const DIAS_POR_DEFECTO = 30;

/**
 * Obtiene las fechas por defecto (últimos N días)
 */
const getFiltrosFechaDefecto = (): { fecha_inicio: string; fecha_fin: string } => {
  const hoy = new Date();
  const fechaInicio = subDays(hoy, DIAS_POR_DEFECTO);
  return {
    fecha_inicio: format(fechaInicio, 'yyyy-MM-dd'),
    fecha_fin: format(hoy, 'yyyy-MM-dd'),
  };
};

export const ReporteDetallePage: React.FC = () => {
  const { codigoReporte } = useParams<{ codigoReporte: string }>();
  const navigate = useNavigate();

  // Filtros por defecto con últimos 30 días
  const filtrosDefecto = useMemo(() => getFiltrosFechaDefecto(), []);

  // Estado de filtros y paginación (inicializado con fechas por defecto)
  const [filtros, setFiltros] = useState<FiltrosReporte>(filtrosDefecto);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(50);
  const [loadingFormato, setLoadingFormato] = useState<FormatoExportacion | null>(null);
  const [showWarningDialog, setShowWarningDialog] = useState(false);

  // Determinar si los filtros de fecha están activos
  const tieneFiltroFecha = Boolean(filtros.fecha_inicio || filtros.fecha_fin);
  const usandoFiltrosDefecto = filtros.fecha_inicio === filtrosDefecto.fecha_inicio &&
                                filtros.fecha_fin === filtrosDefecto.fecha_fin;

  // Queries
  const {
    data: reporte,
    isLoading,
    isFetching,
    refetch,
    error,
  } = useReporte(
    codigoReporte as CodigoReporte,
    filtros,
    page + 1,
    rowsPerPage
  );

  const { data: metadata } = useReporteMetadata(codigoReporte as CodigoReporte);

  const exportarMutation = useExportarReporte();

  // Handlers
  const handleFiltrosChange = useCallback((nuevosFiltros: FiltrosReporte) => {
    setFiltros(nuevosFiltros);
    setPage(0); // Reset a primera página al cambiar filtros
  }, []);

  // Handler para limpiar filtros adicionales (mantiene fechas)
  const handleLimpiarFiltrosAdicionales = useCallback(() => {
    // Solo mantener los filtros de fecha, limpiar todo lo demás
    setFiltros((prev) => ({
      fecha_inicio: prev.fecha_inicio,
      fecha_fin: prev.fecha_fin,
    }));
    setPage(0);
  }, []);

  // Handler para confirmar limpiar filtros (quita fechas)
  const handleConfirmarLimpiarFiltros = useCallback(() => {
    setFiltros({});
    setPage(0);
    setShowWarningDialog(false);
  }, []);

  // Handler para restaurar filtros por defecto
  const handleRestaurarFiltrosDefecto = useCallback(() => {
    setFiltros(filtrosDefecto);
    setPage(0);
    setShowWarningDialog(false);
  }, [filtrosDefecto]);

  const handleOrdenChange = useCallback((campo: string) => {
    setFiltros((prev) => {
      const nuevaDireccion: OrdenDireccion =
        prev.orden_campo === campo && prev.orden_direccion === 'asc' ? 'desc' : 'asc';
      return {
        ...prev,
        orden_campo: campo,
        orden_direccion: nuevaDireccion,
      };
    });
  }, []);

  const handlePageChange = useCallback((newPage: number) => {
    setPage(newPage);
  }, []);

  const handleRowsPerPageChange = useCallback((newRowsPerPage: number) => {
    setRowsPerPage(newRowsPerPage);
    setPage(0);
  }, []);

  const handleExport = useCallback(async (formato: FormatoExportacion) => {
    if (!codigoReporte) return;

    setLoadingFormato(formato);
    try {
      await exportarMutation.mutateAsync({
        codigoReporte: codigoReporte as CodigoReporte,
        formato,
        filtros,
      });
    } finally {
      setLoadingFormato(null);
    }
  }, [codigoReporte, filtros, exportarMutation]);

  // Renderizado condicional para estados de carga y error
  if (isLoading) {
    return <LoadingSpinner message="Cargando reporte..." fullScreen />;
  }

  if (error) {
    const sinPermisos = isForbiddenError(error);
    return (
      <Container maxWidth="xl">
        <Alert severity={sinPermisos ? 'warning' : 'error'} sx={{ mt: 2 }}>
          {sinPermisos
            ? 'No tienes permisos para ver este reporte. Contacta al administrador si necesitas acceso.'
            : 'Error al cargar el reporte. Por favor, intenta de nuevo.'}
        </Alert>
        <Button
          startIcon={<ArrowBack />}
          onClick={() => navigate('/reportes')}
          sx={{ mt: 2 }}
        >
          Volver a Reportes
        </Button>
      </Container>
    );
  }

  if (!reporte) {
    return (
      <Container maxWidth="xl">
        <Alert severity="warning" sx={{ mt: 2 }}>
          No se encontró el reporte solicitado.
        </Alert>
        <Button
          startIcon={<ArrowBack />}
          onClick={() => navigate('/reportes')}
          sx={{ mt: 2 }}
        >
          Volver a Reportes
        </Button>
      </Container>
    );
  }

  // Campos que deben mostrarse como enteros (sin decimales)
  // Se incluyen variantes con/sin tilde y el nombre interno del campo
  const CAMPOS_ENTEROS = new Set([
    // Nombres mostrados (con y sin tilde, en minúsculas)
    'id transaccion',
    'id transacción',
    'id almacen',
    'id almacén',
    'bascula',
    'báscula',
    'consecutivo',
    // Nombres internos comunes
    'id_transaccion',
    'id_almacen',
    'idtransaccion',
    'idalmacen',
  ]);

  // Determinar si un campo debe mostrarse como entero
  const esEntero = (campo: string, nombreMostrar: string): boolean => {
    const campoLower = campo?.toLowerCase() || '';
    const nombreLower = nombreMostrar?.toLowerCase() || '';
    
    return CAMPOS_ENTEROS.has(campoLower) || CAMPOS_ENTEROS.has(nombreLower);
  };

  // Determinar el tipo de dato correcto para una columna
  const getTipoDato = (col: any): string => {
    const campo = col.campo || '';
    const nombreMostrar = (col as any).nombre_mostrar || (col as any).nombre || '';
    
    // Si el campo o nombre_mostrar está en la lista de enteros, forzar tipo 'integer'
    if (esEntero(campo, nombreMostrar)) {
      return 'integer';
    }
    return (col as any).tipo_dato || (col as any).tipo || 'string';
  };

  // Preparar columnas para la tabla (compatibilidad con diferentes formatos)
  const columnas = (reporte.columnas?.map((col) => ({
    campo: col.campo,
    nombre_mostrar: (col as any).nombre_mostrar || (col as any).nombre || col.campo,
    tipo_dato: getTipoDato(col) as TipoDato,
    orden: (col as any).orden || 0,
    visible: (col as any).visible !== false,
    ordenable: (col as any).ordenable !== false,
    filtrable: (col as any).filtrable || false,
    es_totalizable: (col as any).es_totalizable || false,
    tipo_totalizacion: (col as any).tipo_totalizacion || null,
    alineacion: ((col as any).alineacion || 'left') as Alineacion,
    formato: (col as any).formato || null,
    prefijo: (col as any).prefijo || null,
    sufijo: (col as any).sufijo || null,
    decimales: (col as any).decimales ?? 2,
    ancho_minimo: (col as any).ancho_minimo || (col as any).ancho || 100,
  })) || []) as ColumnaReporte[];

  // Si no hay columnas definidas, generarlas desde los datos
  const columnasFinales: ColumnaReporte[] = columnas.length > 0
    ? columnas
    : reporte.datos.length > 0
      ? Object.keys(reporte.datos[0]).map((key, index) => ({
          campo: key,
          nombre_mostrar: key,
          tipo_dato: (esEntero(key, key) ? 'integer' : 'string') as TipoDato,
          orden: index,
          visible: true,
          ordenable: true,
          filtrable: false,
          es_totalizable: false,
          tipo_totalizacion: null,
          alineacion: (esEntero(key, key) ? 'right' : 'left') as Alineacion,
          formato: null,
          prefijo: null,
          sufijo: null,
          decimales: esEntero(key, key) ? 0 : 2,
          ancho_minimo: 100,
        }))
      : [];

  // Preparar paginación (compatibilidad con diferentes formatos)
  const paginacion = {
    pagina_actual: (reporte.paginacion as any).pagina_actual || (reporte.paginacion as any).pagina || page + 1,
    paginas_totales: (reporte.paginacion as any).paginas_totales || Math.ceil(reporte.paginacion.total_registros / rowsPerPage),
    registros_por_pagina: (reporte.paginacion as any).registros_por_pagina || (reporte.paginacion as any).page_size || rowsPerPage,
    total_registros: reporte.paginacion.total_registros,
  };

  return (
    <Container maxWidth="xl">
      {/* Breadcrumbs */}
      <Breadcrumbs sx={{ mb: 2 }}>
        <Link
          component="button"
          variant="body1"
          onClick={() => navigate('/reportes')}
          sx={{ cursor: 'pointer', textDecoration: 'none' }}
        >
          Reportes
        </Link>
        <Typography color="text.primary">{reporte.reporte.nombre}</Typography>
      </Breadcrumbs>

      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={3} flexWrap="wrap" gap={2}>
        <Box display="flex" alignItems="center" gap={2}>
          <Button
            startIcon={<ArrowBack />}
            onClick={() => navigate('/reportes')}
            size="small"
          >
            Volver
          </Button>
          <Box>
            <Typography variant="h4" component="h1">
              {reporte.reporte.nombre}
            </Typography>
            {(reporte.reporte as { fecha_generacion?: string }).fecha_generacion && (
              <Box display="flex" alignItems="center" gap={0.5} mt={0.5}>
                <Schedule fontSize="small" color="action" />
                <Typography variant="body2" color="text.secondary">
                  Generado: {formatDate((reporte.reporte as { fecha_generacion?: string }).fecha_generacion!, 'datetime')}
                </Typography>
              </Box>
            )}
          </Box>
        </Box>

        <Box display="flex" gap={2} alignItems="center" flexWrap="wrap">
          <Button
            variant="outlined"
            startIcon={<Refresh />}
            onClick={() => refetch()}
            disabled={isFetching}
            size="small"
          >
            {isFetching ? 'Actualizando...' : 'Actualizar'}
          </Button>

          <ExportacionButtons
            reporte={reporte.reporte as any}
            onExport={handleExport}
            isLoading={exportarMutation.isPending}
            loadingFormato={loadingFormato}
            disabled={isFetching}
          />
        </Box>
      </Box>

      {/* Banner informativo de rango de fechas */}
      <Alert
        severity={tieneFiltroFecha ? 'info' : 'warning'}
        icon={tieneFiltroFecha ? <DateRange /> : <Warning />}
        sx={{ mb: 2 }}
        action={
          !tieneFiltroFecha ? (
            <Button
              color="inherit"
              size="small"
              onClick={handleRestaurarFiltrosDefecto}
            >
              Restaurar últimos {DIAS_POR_DEFECTO} días
            </Button>
          ) : usandoFiltrosDefecto ? null : (
            <Button
              color="inherit"
              size="small"
              onClick={handleRestaurarFiltrosDefecto}
            >
              Restaurar por defecto
            </Button>
          )
        }
      >
        {tieneFiltroFecha ? (
          <>
            Mostrando datos desde <strong>{filtros.fecha_inicio?.split('T')[0]}</strong> hasta <strong>{filtros.fecha_fin?.split('T')[0]}</strong>
            {usandoFiltrosDefecto && ` (últimos ${DIAS_POR_DEFECTO} días)`}
          </>
        ) : (
          <>
            <strong>Sin filtro de fecha.</strong> Esto puede cargar muchos datos y tardar varios minutos.
          </>
        )}
      </Alert>

      {/* Información de registros */}
      <Box mb={2} display="flex" gap={1} alignItems="center" flexWrap="wrap">
        <Chip
          label={`${paginacion.total_registros.toLocaleString()} registro(s)`}
          size="small"
          color="primary"
          variant="outlined"
        />
        {paginacion.total_registros > 10000 && (
          <Chip
            label="Gran volumen de datos"
            size="small"
            color="warning"
            variant="outlined"
            icon={<Warning />}
          />
        )}
      </Box>

      {/* Filtros */}
      <FiltrosReporteComponent
        codigoReporte={codigoReporte || ''}
        filtrosActuales={filtros}
        onFiltrosChange={handleFiltrosChange}
        onLimpiar={handleLimpiarFiltrosAdicionales}
        metadata={metadata as any}
        isLoading={isFetching}
      />

      {/* Tabla de datos */}
      <TablaReporte
        columnas={columnasFinales}
        datos={reporte.datos}
        totales={reporte.totales}
        paginacion={paginacion}
        ordenCampo={filtros.orden_campo}
        ordenDireccion={filtros.orden_direccion}
        onOrdenChange={handleOrdenChange}
        onPageChange={handlePageChange}
        onRowsPerPageChange={handleRowsPerPageChange}
        isLoading={isFetching}
      />

      {/* Diálogo de advertencia al limpiar filtros */}
      <Dialog
        open={showWarningDialog}
        onClose={() => setShowWarningDialog(false)}
      >
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Warning color="warning" />
          Quitar filtros de fecha
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            Algunos reportes tienen <strong>cientos de miles de registros</strong> y pueden tardar varios minutos en cargar sin filtro de fecha.
            <br /><br />
            ¿Qué deseas hacer?
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2, gap: 1, flexWrap: 'wrap' }}>
          <Button
            onClick={() => setShowWarningDialog(false)}
            color="inherit"
          >
            Cancelar
          </Button>
          <Button
            onClick={handleRestaurarFiltrosDefecto}
            variant="outlined"
          >
            Restaurar últimos {DIAS_POR_DEFECTO} días
          </Button>
          <Button
            onClick={handleConfirmarLimpiarFiltros}
            variant="contained"
            color="warning"
          >
            Quitar todos los filtros
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default ReporteDetallePage;
