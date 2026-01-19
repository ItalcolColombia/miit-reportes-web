/**
 * Componente Footer - Pie de página
 */

import React from 'react';
import { Box, Typography, Container } from '@mui/material';
import { APP_NAME, APP_VERSION } from '@/utils/constants';

export const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <Box
      component="footer"
      sx={{
        py: 3,
        px: 2,
        mt: 'auto',
        backgroundColor: (theme) =>
          theme.palette.mode === 'light'
            ? theme.palette.grey[200]
            : theme.palette.grey[800],
      }}
    >
      <Container maxWidth="lg">
        <Typography variant="body2" color="text.secondary" align="center">
          © {currentYear} {APP_NAME} - v{APP_VERSION}
        </Typography>
        <Typography variant="caption" color="text.secondary" align="center" display="block">
          Desarrollado por Metalteco
        </Typography>
      </Container>
    </Box>
  );
};
