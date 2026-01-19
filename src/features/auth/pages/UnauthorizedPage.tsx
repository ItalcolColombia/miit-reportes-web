/**
 * UnauthorizedPage - Página de acceso no autorizado
 */

import React from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Paper,
} from '@mui/material';
import { Lock, Home } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

export const UnauthorizedPage: React.FC = () => {
  const navigate = useNavigate();
  
  return (
    <Container maxWidth="md">
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '80vh',
        }}
      >
        <Paper
          elevation={3}
          sx={{
            p: 4,
            textAlign: 'center',
            maxWidth: 600,
          }}
        >
          <Lock color="error" sx={{ fontSize: 80, mb: 2 }} />
          
          <Typography variant="h3" gutterBottom>
            Acceso No Autorizado
          </Typography>
          
          <Typography variant="h6" color="text.secondary" paragraph>
            403 - Forbidden
          </Typography>
          
          <Typography variant="body1" color="text.secondary" paragraph>
            No tienes permisos para acceder a esta página.
            Por favor, contacta con el administrador si crees que deberías tener acceso.
          </Typography>
          
          <Button
            variant="contained"
            startIcon={<Home />}
            onClick={() => navigate('/reportes')}
            sx={{ mt: 2 }}
          >
            Volver a Inicio
          </Button>
        </Paper>
      </Box>
    </Container>
  );
};
