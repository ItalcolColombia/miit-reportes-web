/**
 * GestionPermisosPage - Página de gestión de permisos de reportes
 */

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Checkbox,
  Button,
  Alert,
  Breadcrumbs,
  Link,
  Chip,
  Tooltip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import {
  ArrowBack,
  Save,
  Lock,
  Visibility,
  FileDownload,
  CheckCircle,
  Cancel,
  ExpandMore,
  Inventory,
  LocalShipping,
  FactCheck,
} from '@mui/icons-material';
import { useRolConPermisos, useAsignarPermisos } from '../hooks/useAdmin';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { CodigoReporte } from '@/types/reportes.types';
import { REPORTES_INFO, getNombreReporte, CATEGORIAS_REPORTES, CategoriaReporte } from '@/utils/constants';

// Mapeo de iconos de categoría
const ICONOS_CATEGORIA: Record<string, React.ReactNode> = {
  Inventory: <Inventory />,
  LocalShipping: <LocalShipping />,
  FactCheck: <FactCheck />,
};

interface PermisoLocal {
  codigo_reporte: CodigoReporte;
  puede_ver: boolean;
  puede_exportar: boolean;
}

export const GestionPermisosPage: React.FC = () => {
  const { rolId } = useParams<{ rolId: string }>();
  const navigate = useNavigate();

  const { data, isLoading, error } = useRolConPermisos(parseInt(rolId || '0'));
  const asignarMutation = useAsignarPermisos();

  const [permisos, setPermisos] = useState<PermisoLocal[]>([]);
  const [hasChanges, setHasChanges] = useState(false);

  // Inicializar permisos cuando se carga el rol
  useEffect(() => {
    if (data) {
      const permisosIniciales: PermisoLocal[] = Object.keys(REPORTES_INFO).map((codigo) => {
        const permisoExistente = data.permisos.find((p) => p.codigo_reporte === codigo);
        return {
          codigo_reporte: codigo as CodigoReporte,
          puede_ver: permisoExistente?.puede_ver || false,
          puede_exportar: permisoExistente?.puede_exportar || false,
        };
      });
      setPermisos(permisosIniciales);
    }
  }, [data]);

  const handleToggleVer = (codigo: CodigoReporte) => {
    setPermisos((prev) =>
      prev.map((p) =>
        p.codigo_reporte === codigo
          ? { ...p, puede_ver: !p.puede_ver, puede_exportar: !p.puede_ver ? p.puede_exportar : false }
          : p
      )
    );
    setHasChanges(true);
  };

  const handleToggleExportar = (codigo: CodigoReporte) => {
    setPermisos((prev) =>
      prev.map((p) =>
        p.codigo_reporte === codigo
          ? { ...p, puede_exportar: !p.puede_exportar }
          : p
      )
    );
    setHasChanges(true);
  };

  const handleSelectAll = (tipo: 'ver' | 'exportar', value: boolean) => {
    setPermisos((prev) =>
      prev.map((p) => {
        if (tipo === 'ver') {
          return { ...p, puede_ver: value, puede_exportar: value ? p.puede_exportar : false };
        } else {
          return { ...p, puede_exportar: p.puede_ver ? value : false };
        }
      })
    );
    setHasChanges(true);
  };

  // Handler para seleccionar/deseleccionar todos los reportes de una categoría
  const handleSelectCategoria = (categoria: CategoriaReporte, tipo: 'ver' | 'exportar', value: boolean) => {
    setPermisos((prev) =>
      prev.map((p) => {
        if (!categoria.reportes.includes(p.codigo_reporte)) return p;
        if (tipo === 'ver') {
          return { ...p, puede_ver: value, puede_exportar: value ? p.puede_exportar : false };
        } else {
          return { ...p, puede_exportar: p.puede_ver ? value : false };
        }
      })
    );
    setHasChanges(true);
  };

  // Calcular estadísticas por categoría
  const getEstadisticasCategoria = (categoria: CategoriaReporte) => {
    const permisosCategoria = permisos.filter((p) => categoria.reportes.includes(p.codigo_reporte));
    const total = permisosCategoria.length;
    const conVer = permisosCategoria.filter((p) => p.puede_ver).length;
    const conExportar = permisosCategoria.filter((p) => p.puede_exportar).length;
    return { total, conVer, conExportar };
  };

  const handleSave = async () => {
    if (!rolId) return;

    await asignarMutation.mutateAsync({
      rolId: parseInt(rolId),
      permisos: { permisos_reportes: permisos },
    });

    setHasChanges(false);
  };

  // Calcular estadísticas
  const totalReportes = permisos.length;
  const reportesConVer = permisos.filter((p) => p.puede_ver).length;
  const reportesConExportar = permisos.filter((p) => p.puede_exportar).length;

  if (isLoading) {
    return <LoadingSpinner message="Cargando permisos..." fullScreen />;
  }

  if (error) {
    return (
      <Container maxWidth="lg">
        <Alert severity="error" sx={{ mt: 2 }}>
          Error al cargar permisos. Por favor, intenta de nuevo.
        </Alert>
        <Button
          startIcon={<ArrowBack />}
          onClick={() => navigate('/admin/roles')}
          sx={{ mt: 2 }}
        >
          Volver a Roles
        </Button>
      </Container>
    );
  }

  if (!data) {
    return (
      <Container maxWidth="lg">
        <Alert severity="warning" sx={{ mt: 2 }}>
          No se encontró el rol especificado.
        </Alert>
        <Button
          startIcon={<ArrowBack />}
          onClick={() => navigate('/admin/roles')}
          sx={{ mt: 2 }}
        >
          Volver a Roles
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      {/* Breadcrumbs */}
      <Breadcrumbs sx={{ mb: 2 }}>
        <Link
          component="button"
          variant="body1"
          onClick={() => navigate('/admin/roles')}
          sx={{ cursor: 'pointer', textDecoration: 'none' }}
        >
          Gestión de Roles
        </Link>
        <Typography color="text.primary">
          Permisos de {data.nombre}
        </Typography>
      </Breadcrumbs>

      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={3} flexWrap="wrap" gap={2}>
        <Box display="flex" alignItems="center" gap={2}>
          <Button
            startIcon={<ArrowBack />}
            onClick={() => navigate('/admin/roles')}
            size="small"
          >
            Volver
          </Button>
          <Box>
            <Typography variant="h4" component="h1">
              <Lock sx={{ mr: 1, verticalAlign: 'middle' }} />
              Permisos de Reportes
            </Typography>
            <Typography variant="h6" color="text.secondary">
              Rol: {data.nombre}
            </Typography>
          </Box>
        </Box>

        <Button
          variant="contained"
          startIcon={<Save />}
          disabled={!hasChanges || asignarMutation.isPending}
          onClick={handleSave}
        >
          {asignarMutation.isPending ? 'Guardando...' : 'Guardar Cambios'}
        </Button>
      </Box>

      {/* Estadísticas */}
      <Box display="flex" gap={2} mb={3} flexWrap="wrap">
        <Chip
          icon={<Visibility />}
          label={`${reportesConVer}/${totalReportes} pueden ver`}
          color={reportesConVer === totalReportes ? 'success' : reportesConVer > 0 ? 'primary' : 'default'}
          variant="outlined"
        />
        <Chip
          icon={<FileDownload />}
          label={`${reportesConExportar}/${totalReportes} pueden exportar`}
          color={reportesConExportar === totalReportes ? 'success' : reportesConExportar > 0 ? 'primary' : 'default'}
          variant="outlined"
        />
        {hasChanges && (
          <Chip
            label="Cambios sin guardar"
            color="warning"
            size="small"
          />
        )}
      </Box>

      {/* Controles globales */}
      <Paper sx={{ p: 2, mb: 2 }}>
        <Box display="flex" alignItems="center" justifyContent="space-between" flexWrap="wrap" gap={2}>
          <Typography variant="subtitle2" color="text.secondary">
            Acciones rápidas:
          </Typography>
          <Box display="flex" gap={2}>
            <Button
              size="small"
              variant="outlined"
              startIcon={<Visibility />}
              onClick={() => handleSelectAll('ver', true)}
            >
              Permitir ver todos
            </Button>
            <Button
              size="small"
              variant="outlined"
              startIcon={<FileDownload />}
              onClick={() => handleSelectAll('exportar', true)}
            >
              Permitir exportar todos
            </Button>
            <Button
              size="small"
              variant="outlined"
              color="error"
              onClick={() => handleSelectAll('ver', false)}
            >
              Quitar todos
            </Button>
          </Box>
        </Box>
      </Paper>

      {/* Permisos agrupados por categoría */}
      {CATEGORIAS_REPORTES.map((categoria) => {
        const stats = getEstadisticasCategoria(categoria);
        const permisosCategoria = permisos.filter((p) => categoria.reportes.includes(p.codigo_reporte));

        return (
          <Accordion key={categoria.id} defaultExpanded sx={{ mb: 1 }}>
            <AccordionSummary
              expandIcon={<ExpandMore />}
              sx={{ bgcolor: 'grey.50' }}
            >
              <Box display="flex" alignItems="center" gap={2} width="100%">
                <Box sx={{ color: 'primary.main' }}>
                  {ICONOS_CATEGORIA[categoria.icono] || <Inventory />}
                </Box>
                <Box flex={1}>
                  <Typography variant="subtitle1" fontWeight="medium">
                    {categoria.nombre}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {categoria.descripcion}
                  </Typography>
                </Box>
                <Box display="flex" gap={1} mr={2}>
                  <Chip
                    size="small"
                    label={`${stats.conVer}/${stats.total} ver`}
                    color={stats.conVer === stats.total ? 'success' : stats.conVer > 0 ? 'primary' : 'default'}
                    variant="outlined"
                  />
                  <Chip
                    size="small"
                    label={`${stats.conExportar}/${stats.total} exp`}
                    color={stats.conExportar === stats.total ? 'success' : stats.conExportar > 0 ? 'primary' : 'default'}
                    variant="outlined"
                  />
                </Box>
              </Box>
            </AccordionSummary>
            <AccordionDetails sx={{ p: 0 }}>
              {/* Controles de categoría */}
              <Box sx={{ px: 2, py: 1, bgcolor: 'grey.100', borderBottom: 1, borderColor: 'divider' }}>
                <Box display="flex" alignItems="center" gap={2}>
                  <Typography variant="caption" color="text.secondary">
                    Toda la categoría:
                  </Typography>
                  <Tooltip title="Permitir ver todos de esta categoría">
                    <Checkbox
                      size="small"
                      checked={stats.conVer === stats.total}
                      indeterminate={stats.conVer > 0 && stats.conVer < stats.total}
                      onChange={(e) => handleSelectCategoria(categoria, 'ver', e.target.checked)}
                    />
                  </Tooltip>
                  <Typography variant="caption">Ver</Typography>
                  <Tooltip title="Permitir exportar todos de esta categoría">
                    <Checkbox
                      size="small"
                      checked={stats.conExportar === stats.total && stats.total > 0}
                      indeterminate={stats.conExportar > 0 && stats.conExportar < stats.total}
                      onChange={(e) => handleSelectCategoria(categoria, 'exportar', e.target.checked)}
                    />
                  </Tooltip>
                  <Typography variant="caption">Exportar</Typography>
                </Box>
              </Box>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 'bold', width: '60%' }}>Reporte</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }} align="center">
                        <Visibility fontSize="small" sx={{ verticalAlign: 'middle', mr: 0.5 }} />
                        Ver
                      </TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }} align="center">
                        <FileDownload fontSize="small" sx={{ verticalAlign: 'middle', mr: 0.5 }} />
                        Exportar
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {permisosCategoria.map((permiso) => (
                      <TableRow
                        key={permiso.codigo_reporte}
                        hover
                        sx={{
                          bgcolor: permiso.puede_ver ? 'action.hover' : 'inherit',
                        }}
                      >
                        <TableCell>
                          <Box>
                            <Typography variant="body2" fontWeight="medium">
                              {getNombreReporte(permiso.codigo_reporte)}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {permiso.codigo_reporte}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell align="center">
                          <Checkbox
                            checked={permiso.puede_ver}
                            onChange={() => handleToggleVer(permiso.codigo_reporte)}
                            icon={<Cancel color="disabled" />}
                            checkedIcon={<CheckCircle color="success" />}
                          />
                        </TableCell>
                        <TableCell align="center">
                          <Tooltip title={!permiso.puede_ver ? 'Debe tener permiso de ver primero' : ''}>
                            <span>
                              <Checkbox
                                checked={permiso.puede_exportar}
                                disabled={!permiso.puede_ver}
                                onChange={() => handleToggleExportar(permiso.codigo_reporte)}
                                icon={<Cancel color="disabled" />}
                                checkedIcon={<CheckCircle color="success" />}
                              />
                            </span>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </AccordionDetails>
          </Accordion>
        );
      })}

      {/* Mensaje de ayuda */}
      <Alert severity="info" sx={{ mt: 3 }}>
        <Typography variant="body2">
          <strong>Nota:</strong> El permiso de "Exportar" requiere que el usuario tenga primero el permiso de "Ver".
          Los cambios no se aplicarán hasta que presione "Guardar Cambios".
        </Typography>
      </Alert>
    </Container>
  );
};

export default GestionPermisosPage;
