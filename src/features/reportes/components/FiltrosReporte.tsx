/**
 * FiltrosReporte - Panel de filtros para reportes
 * Soporta filtros de fecha, material y filtros dinámicos basados en metadata
 */

import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Paper,
  Typography,
  Collapse,
  IconButton,
  Grid,
  TextField,
  Button,
  Autocomplete,
  Tooltip,
  Divider,
} from '@mui/material';
import {
  FilterList,
  ExpandMore,
  ExpandLess,
  Clear,
  Search,
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { es } from 'date-fns/locale';
import type {
  FiltrosReporte,
  ReporteMetadataResponse,
  ReporteMetadata,
  Material,
  FiltroColumna,
  OpcionFiltro,
} from '@/types/reportes.types';

interface FiltrosReporteProps {
  codigoReporte: string;
  filtrosActuales: FiltrosReporte;
  onFiltrosChange: (filtros: FiltrosReporte) => void;
  onLimpiar: () => void;
  metadata?: ReporteMetadataResponse | ReporteMetadata;
  isLoading?: boolean;
}

// Campos fijos que no se consideran filtros dinámicos
const CAMPOS_FIJOS = new Set([
  'material_id',
  'fecha_inicio',
  'fecha_fin',
  'orden_campo',
  'orden_direccion',
]);

export const FiltrosReporteComponent: React.FC<FiltrosReporteProps> = ({
  filtrosActuales,
  onFiltrosChange,
  onLimpiar,
  metadata,
  isLoading,
}) => {
  const [expanded, setExpanded] = useState(true);
  const [filtrosTemp, setFiltrosTemp] = useState<FiltrosReporte>(filtrosActuales);

  // Sincronizar filtros temporales cuando cambian los actuales
  useEffect(() => {
    setFiltrosTemp(filtrosActuales);
  }, [filtrosActuales]);

  const handleAplicar = () => {
    onFiltrosChange(filtrosTemp);
  };

  const handleLimpiar = () => {
    // Mantener solo las fechas por defecto si existen
    const filtrosLimpios: FiltrosReporte = {};
    if (filtrosActuales.fecha_inicio) {
      filtrosLimpios.fecha_inicio = filtrosActuales.fecha_inicio;
    }
    if (filtrosActuales.fecha_fin) {
      filtrosLimpios.fecha_fin = filtrosActuales.fecha_fin;
    }
    setFiltrosTemp(filtrosLimpios);
    onLimpiar();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAplicar();
    }
  };

  // Datos del metadata
  const materiales = metadata?.filtros_disponibles?.materiales || [];
  const permiteFiltrarMaterial = materiales.length > 0;
  const requiereFechas = metadata?.filtros_disponibles?.rango_fechas != null;
  const filtrosColumnas = metadata?.filtros_columnas || [];

  // Contar filtros activos (excluyendo fechas que siempre están)
  const cantidadFiltrosActivos = useMemo(() => {
    let count = 0;
    if (filtrosActuales.material_id) count++;

    // Contar filtros dinámicos
    Object.entries(filtrosActuales).forEach(([key, value]) => {
      if (!CAMPOS_FIJOS.has(key) && value !== undefined && value !== '') {
        count++;
      }
    });

    return count;
  }, [filtrosActuales]);

  const hayFiltrosActivos = cantidadFiltrosActivos > 0;

  // Handler para cambio en filtro tipo select
  const handleSelectChange = (campo: string, valor: string | null) => {
    setFiltrosTemp((prev) => ({
      ...prev,
      [campo]: valor || undefined,
    }));
  };

  // Handler para cambio en filtro tipo search
  const handleSearchChange = (campo: string, valor: string) => {
    setFiltrosTemp((prev) => ({
      ...prev,
      [campo]: valor || undefined,
    }));
  };

  // Si no hay filtros disponibles, no mostrar el panel
  if (!permiteFiltrarMaterial && !requiereFechas && filtrosColumnas.length === 0) {
    return null;
  }

  // Calcular fechas límite para los DatePickers
  const fechaMinimaDisponible = metadata?.filtros_disponibles?.rango_fechas?.fecha_minima
    ? new Date(metadata.filtros_disponibles.rango_fechas.fecha_minima)
    : undefined;
  const fechaMaximaDisponible = metadata?.filtros_disponibles?.rango_fechas?.fecha_maxima
    ? new Date(metadata.filtros_disponibles.rango_fechas.fecha_maxima)
    : undefined;

  const maxFechaInicio = filtrosTemp.fecha_fin
    ? new Date(filtrosTemp.fecha_fin)
    : fechaMaximaDisponible;

  const minFechaFin = filtrosTemp.fecha_inicio
    ? new Date(filtrosTemp.fecha_inicio)
    : fechaMinimaDisponible;

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={es}>
      <Paper sx={{ mb: 3 }}>
        <Box
          sx={{
            p: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            cursor: 'pointer',
            '&:hover': {
              bgcolor: 'action.hover',
            },
          }}
          onClick={() => setExpanded(!expanded)}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <FilterList color={hayFiltrosActivos ? 'primary' : 'inherit'} />
            <Typography variant="h6">
              Filtros
              {hayFiltrosActivos && (
                <Typography
                  component="span"
                  variant="body2"
                  color="primary"
                  sx={{ ml: 1 }}
                >
                  ({cantidadFiltrosActivos} activo{cantidadFiltrosActivos !== 1 ? 's' : ''})
                </Typography>
              )}
            </Typography>
          </Box>
          <IconButton size="small" onClick={(e) => { e.stopPropagation(); setExpanded(!expanded); }}>
            {expanded ? <ExpandLess /> : <ExpandMore />}
          </IconButton>
        </Box>

        <Collapse in={expanded}>
          <Box sx={{ p: 2, pt: 0 }} onKeyDown={handleKeyDown}>
            {/* Filtros de fecha y material (existentes) */}
            <Grid container spacing={2} alignItems="center">
              {/* Fecha Inicio */}
              {requiereFechas && (
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                  <DatePicker
                    label="Fecha Inicio"
                    value={filtrosTemp.fecha_inicio ? new Date(filtrosTemp.fecha_inicio) : null}
                    onChange={(date) => {
                      setFiltrosTemp((prev) => ({
                        ...prev,
                        fecha_inicio: date?.toISOString(),
                      }));
                    }}
                    slotProps={{
                      textField: {
                        size: 'small',
                        fullWidth: true,
                      },
                    }}
                    disabled={isLoading}
                    minDate={fechaMinimaDisponible}
                    maxDate={maxFechaInicio}
                  />
                </Grid>
              )}

              {/* Fecha Fin */}
              {requiereFechas && (
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                  <DatePicker
                    label="Fecha Fin"
                    value={filtrosTemp.fecha_fin ? new Date(filtrosTemp.fecha_fin) : null}
                    onChange={(date) => {
                      setFiltrosTemp((prev) => ({
                        ...prev,
                        fecha_fin: date?.toISOString(),
                      }));
                    }}
                    slotProps={{
                      textField: {
                        size: 'small',
                        fullWidth: true,
                      },
                    }}
                    disabled={isLoading}
                    minDate={minFechaFin}
                    maxDate={fechaMaximaDisponible}
                  />
                </Grid>
              )}

              {/* Selector de Material (si está habilitado) */}
              {permiteFiltrarMaterial && (
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                  <Autocomplete
                    options={materiales}
                    getOptionLabel={(option: Material) => `${option.codigo} - ${option.nombre}`}
                    value={materiales.find((m) => m.id === filtrosTemp.material_id) || null}
                    onChange={(_, newValue) => {
                      setFiltrosTemp((prev) => ({
                        ...prev,
                        material_id: newValue?.id || undefined,
                      }));
                    }}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Material"
                        size="small"
                        placeholder="Seleccionar material..."
                      />
                    )}
                    disabled={isLoading}
                    isOptionEqualToValue={(option, value) => option.id === value.id}
                    noOptionsText="Sin materiales disponibles"
                    clearText="Limpiar"
                  />
                </Grid>
              )}
            </Grid>

            {/* Divider si hay filtros dinámicos */}
            {filtrosColumnas.length > 0 && (requiereFechas || permiteFiltrarMaterial) && (
              <Divider sx={{ my: 2 }}>
                <Typography variant="caption" color="text.secondary">
                  Filtros adicionales
                </Typography>
              </Divider>
            )}

            {/* Filtros dinámicos basados en metadata */}
            {filtrosColumnas.length > 0 && (
              <Grid container spacing={2} alignItems="center">
                {filtrosColumnas.map((filtro: FiltroColumna) => (
                  <Grid size={{ xs: 12, sm: 6, md: 3 }} key={filtro.campo}>
                    {filtro.tipo_filtro === 'select' ? (
                      <Autocomplete
                        options={filtro.opciones || []}
                        getOptionLabel={(option: OpcionFiltro) => option.etiqueta}
                        value={
                          filtro.opciones?.find(
                            (opt) => opt.valor === filtrosTemp[filtro.campo]
                          ) || null
                        }
                        onChange={(_, newValue) => {
                          handleSelectChange(filtro.campo, newValue?.valor || null);
                        }}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            label={filtro.nombre_mostrar}
                            size="small"
                            placeholder={`Seleccionar ${filtro.nombre_mostrar.toLowerCase()}...`}
                          />
                        )}
                        disabled={isLoading}
                        isOptionEqualToValue={(option, value) => option.valor === value.valor}
                        noOptionsText="Sin opciones disponibles"
                        clearText="Limpiar"
                      />
                    ) : (
                      <TextField
                        label={filtro.nombre_mostrar}
                        size="small"
                        fullWidth
                        placeholder={filtro.placeholder || `Buscar ${filtro.nombre_mostrar.toLowerCase()}...`}
                        value={filtrosTemp[filtro.campo] || ''}
                        onChange={(e) => handleSearchChange(filtro.campo, e.target.value)}
                        disabled={isLoading}
                        InputProps={{
                          endAdornment: filtrosTemp[filtro.campo] ? (
                            <IconButton
                              size="small"
                              onClick={() => handleSearchChange(filtro.campo, '')}
                              sx={{ p: 0.5 }}
                            >
                              <Clear fontSize="small" />
                            </IconButton>
                          ) : null,
                        }}
                      />
                    )}
                  </Grid>
                ))}
              </Grid>
            )}

            {/* Botones de acción */}
            <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
              <Tooltip title="Aplicar filtros (Enter)">
                <Button
                  variant="contained"
                  startIcon={<Search />}
                  onClick={handleAplicar}
                  disabled={isLoading}
                >
                  Aplicar Filtros
                </Button>
              </Tooltip>
              <Tooltip title="Limpiar todos los filtros excepto fechas">
                <Button
                  variant="outlined"
                  startIcon={<Clear />}
                  onClick={handleLimpiar}
                  disabled={isLoading || !hayFiltrosActivos}
                >
                  Limpiar
                </Button>
              </Tooltip>
            </Box>
          </Box>
        </Collapse>
      </Paper>
    </LocalizationProvider>
  );
};

export default FiltrosReporteComponent;
