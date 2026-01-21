/**
 * ReportesListPage - Página de lista de reportes disponibles
 */

import { useMemo, useCallback } from 'react';
import {
  Container,
  Grid,
  Card,
  CardContent,
  CardActions,
  Typography,
  Button,
  Box,
  Chip,
  Alert,
} from '@mui/material';
import {
  Visibility,
  Block,
  Assessment,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useReportesDisponibles } from '../hooks/useReportes';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';

// Tipo flexible para manejar ambos formatos de respuesta del backend
interface ReporteItem {
  codigo: string;
  nombre: string;
  descripcion?: string | null;
  // El backend puede retornar cualquiera de estos campos
  tiene_acceso?: boolean;
  puede_ver?: boolean;
  puede_exportar?: boolean;
}

// Funciones helper memoizadas fuera del componente
const tieneAcceso = (reporte: ReporteItem): boolean => {
  // Priorizar puede_ver (formato nuevo), luego tiene_acceso (formato legacy)
  if (reporte.puede_ver !== undefined) return reporte.puede_ver;
  if (reporte.tiene_acceso !== undefined) return reporte.tiene_acceso;
  return true; // Por defecto permitir si no viene el campo
};

const puedeExportar = (reporte: ReporteItem): boolean => {
  return reporte.puede_exportar ?? false;
};

export const ReportesListPage = () => {
  const navigate = useNavigate();
  const { data, isLoading, error } = useReportesDisponibles();

  // Memoizar la lista de reportes procesada
  const reportes = useMemo<ReporteItem[]>(() => {
    return data?.reportes || [];
  }, [data?.reportes]);

  // Memoizar el handler de navegación
  const handleNavigateToReporte = useCallback(
    (codigo: string) => {
      navigate(`/reportes/${codigo}`);
    },
    [navigate]
  );

  if (isLoading) {
    return <LoadingSpinner message="Cargando reportes..." fullScreen />;
  }

  if (error) {
    return (
      <Container maxWidth="lg">
        <Alert severity="error">
          Error al cargar reportes. Por favor, intenta de nuevo.
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          <Assessment sx={{ mr: 1, verticalAlign: 'middle' }} />
          Reportes Disponibles
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Selecciona un reporte para ver su información detallada
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {reportes.map((reporte) => {
          const acceso = tieneAcceso(reporte);
          const exportar = puedeExportar(reporte);

          return (
            <Grid size={{ xs: 12, sm: 6, md: 4 }} key={reporte.codigo}>
              <Card
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  opacity: acceso ? 1 : 0.6,
                  '&:hover': acceso
                    ? {
                        boxShadow: 6,
                        transform: 'translateY(-4px)',
                        transition: 'all 0.3s',
                      }
                    : {},
                }}
              >
                <CardContent sx={{ flexGrow: 1 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="h6" component="h2" gutterBottom>
                      {reporte.nombre}
                    </Typography>
                    {!acceso && <Block color="error" />}
                  </Box>

                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {reporte.descripcion || 'Sin descripción'}
                  </Typography>

                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    {acceso && (
                      <Chip size="small" label="Acceso" color="success" variant="outlined" />
                    )}
                    {exportar && acceso && (
                      <Chip size="small" label="Exportación" color="primary" variant="outlined" />
                    )}
                  </Box>
                </CardContent>

                <CardActions sx={{ p: 2, pt: 0 }}>
                  <Button
                    fullWidth
                    variant="contained"
                    startIcon={<Visibility />}
                    disabled={!acceso}
                    onClick={() => handleNavigateToReporte(reporte.codigo)}
                  >
                    Ver Reporte
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          );
        })}
      </Grid>

      {reportes.length === 0 && (
        <Box sx={{ textAlign: 'center', mt: 8 }}>
          <Typography variant="h6" color="text.secondary">
            No hay reportes disponibles
          </Typography>
        </Box>
      )}
    </Container>
  );
};
