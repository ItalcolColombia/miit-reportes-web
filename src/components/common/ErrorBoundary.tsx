/**
 * ErrorBoundary - Componente para capturar errores de React
 */

import { Component, ErrorInfo, ReactNode } from 'react';
import { Box, Typography, Button, Container, Paper } from '@mui/material';
import { Error as ErrorIcon, Refresh } from '@mui/icons-material';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Error capturado por ErrorBoundary:', error, errorInfo);
  }

  private handleReload = () => {
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <Container maxWidth="md">
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              minHeight: '100vh',
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
              <ErrorIcon color="error" sx={{ fontSize: 64, mb: 2 }} />
              
              <Typography variant="h4" gutterBottom>
                Algo salió mal
              </Typography>
              
              <Typography variant="body1" color="text.secondary" paragraph>
                Lo sentimos, ha ocurrido un error inesperado. Por favor, intenta recargar la página.
              </Typography>
              
              {this.state.error && (
                <Typography
                  variant="caption"
                  color="error"
                  sx={{
                    display: 'block',
                    mb: 2,
                    p: 2,
                    backgroundColor: 'error.lighter',
                    borderRadius: 1,
                    fontFamily: 'monospace',
                  }}
                >
                  {this.state.error.message}
                </Typography>
              )}
              
              <Button
                variant="contained"
                startIcon={<Refresh />}
                onClick={this.handleReload}
              >
                Recargar Página
              </Button>
            </Paper>
          </Box>
        </Container>
      );
    }

    return this.props.children;
  }
}
