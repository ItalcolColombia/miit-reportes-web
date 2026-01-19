/**
 * GestionRolesPage - Página de gestión de roles
 */

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
  IconButton,
  Chip,
  Alert,
  LinearProgress,
  Tooltip,
} from '@mui/material';
import {
  Edit,
  People,
  Security,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useRoles } from '../hooks/useAdmin';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { getDescripcionRol, REPORTES_INFO } from '@/utils/constants';

// Total de reportes disponibles para calcular porcentaje
const TOTAL_REPORTES = Object.keys(REPORTES_INFO).length;

export const GestionRolesPage = () => {
  const navigate = useNavigate();
  const { data, isLoading, error } = useRoles();
  
  if (isLoading) {
    return <LoadingSpinner message="Cargando roles..." fullScreen />;
  }
  
  if (error) {
    return (
      <Container maxWidth="lg">
        <Alert severity="error">
          Error al cargar roles. Por favor, intenta de nuevo.
        </Alert>
      </Container>
    );
  }
  
  const roles = data?.roles || [];
  
  return (
    <Container maxWidth="lg">
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          <People sx={{ mr: 1, verticalAlign: 'middle' }} />
          Gestión de Roles
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Administra los roles del sistema y sus permisos
        </Typography>
      </Box>
      
      <Paper>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 'bold', width: '35%' }}>Rol</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Estado</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Usuarios</TableCell>
                <TableCell sx={{ fontWeight: 'bold', width: '25%' }}>Nivel de Acceso</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }} align="right">Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {roles.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    <Typography color="text.secondary" sx={{ py: 4 }}>
                      No hay roles registrados
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                roles.map((rol) => {
                  // Calcular porcentaje de acceso
                  const cantidadPermisos = rol.permisos_reportes?.length || 0;
                  const porcentajeAcceso = Math.round((cantidadPermisos / TOTAL_REPORTES) * 100);
                  const colorAcceso = porcentajeAcceso === 100
                    ? 'success'
                    : porcentajeAcceso >= 50
                      ? 'primary'
                      : porcentajeAcceso > 0
                        ? 'warning'
                        : 'inherit';

                  return (
                    <TableRow key={rol.id} hover>
                      <TableCell>
                        <Box>
                          <Box display="flex" alignItems="center" gap={1}>
                            <Security color="action" fontSize="small" />
                            <Typography variant="body1" fontWeight="medium">
                              {rol.nombre}
                            </Typography>
                          </Box>
                          <Typography variant="caption" color="text.secondary" sx={{ ml: 3.5 }}>
                            {getDescripcionRol(rol.nombre)}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={rol.estado ? 'Activo' : 'Inactivo'}
                          color={rol.estado ? 'success' : 'default'}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        {rol.cantidad_usuarios !== undefined ? (
                          <Chip
                            label={`${rol.cantidad_usuarios} usuario(s)`}
                            size="small"
                            variant="outlined"
                          />
                        ) : (
                          '-'
                        )}
                      </TableCell>
                      <TableCell>
                        <Tooltip
                          title={`${cantidadPermisos} de ${TOTAL_REPORTES} reportes (${porcentajeAcceso}%)`}
                          arrow
                        >
                          <Box>
                            <Box display="flex" alignItems="center" justifyContent="space-between" mb={0.5}>
                              <Typography variant="caption" color="text.secondary">
                                {cantidadPermisos}/{TOTAL_REPORTES} reportes
                              </Typography>
                              <Typography variant="caption" fontWeight="bold" color={`${colorAcceso}.main`}>
                                {porcentajeAcceso}%
                              </Typography>
                            </Box>
                            <LinearProgress
                              variant="determinate"
                              value={porcentajeAcceso}
                              color={colorAcceso as 'success' | 'primary' | 'warning' | 'inherit'}
                              sx={{
                                height: 6,
                                borderRadius: 1,
                                bgcolor: 'grey.200',
                              }}
                            />
                          </Box>
                        </Tooltip>
                      </TableCell>
                      <TableCell align="right">
                        <Tooltip title="Editar permisos">
                          <IconButton
                            size="small"
                            onClick={() => navigate(`/admin/permisos/${rol.id}`)}
                            color="primary"
                          >
                            <Edit />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Container>
  );
};
