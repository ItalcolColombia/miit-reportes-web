/**
 * PrivateRoute - Componente para proteger rutas privadas
 */

import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { CircularProgress, Box } from '@mui/material';

interface PrivateRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
}

export const PrivateRoute: React.FC<PrivateRouteProps> = ({
  children,
  requireAdmin = false,
}) => {
  const { isAuthenticated, usuario } = useAuthStore();
  
  // Si no está autenticado, redirigir a login
  if (!isAuthenticated || !usuario) {
    return <Navigate to="/login" replace />;
  }
  
  // Si requiere admin y no lo es, redirigir a unauthorized
  if (requireAdmin && usuario.role !== 'Administrador') {
    return <Navigate to="/unauthorized" replace />;
  }
  
  return <>{children}</>;
};

/**
 * LoadingFallback - Componente de carga mientras se verifica autenticación
 */
export const LoadingFallback: React.FC = () => {
  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
      }}
    >
      <CircularProgress />
    </Box>
  );
};
