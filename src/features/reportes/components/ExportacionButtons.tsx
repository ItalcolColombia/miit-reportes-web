/**
 * ExportacionButtons - Botones de exportación con validación de permisos
 */

import React from 'react';
import {
  Button,
  ButtonGroup,
  CircularProgress,
  Tooltip,
} from '@mui/material';
import {
  PictureAsPdf,
  Description,
} from '@mui/icons-material';
import type { FormatoExportacion, ReporteConPermisos } from '@/types/reportes.types';

interface ExportacionButtonsProps {
  reporte?: Partial<ReporteConPermisos>;
  onExport: (formato: FormatoExportacion) => void;
  isLoading?: boolean;
  loadingFormato?: FormatoExportacion | null;
  disabled?: boolean;
}

interface FormatoConfig {
  formato: FormatoExportacion;
  label: string;
  icon: React.ReactNode;
  permitido: boolean;
  tooltip: string;
}

export const ExportacionButtons: React.FC<ExportacionButtonsProps> = ({
  reporte,
  onExport,
  isLoading = false,
  loadingFormato = null,
  disabled = false,
}) => {
  // Determinar permisos de exportación
  const puedeExportar = reporte?.puede_exportar !== false;
  const permitePdf = reporte?.permite_exportar_pdf !== false;
  const permiteCsv = reporte?.permite_exportar_csv !== false;

  // Solo PDF y CSV por ahora (Excel deshabilitado temporalmente)
  const formatos: FormatoConfig[] = [
    {
      formato: 'pdf',
      label: 'PDF',
      icon: <PictureAsPdf />,
      permitido: puedeExportar && permitePdf,
      tooltip: !puedeExportar
        ? 'No tiene permisos para exportar'
        : !permitePdf
        ? 'Exportación PDF no disponible para este reporte'
        : 'Exportar como PDF',
    },
    {
      formato: 'csv',
      label: 'CSV',
      icon: <Description />,
      permitido: puedeExportar && permiteCsv,
      tooltip: !puedeExportar
        ? 'No tiene permisos para exportar'
        : !permiteCsv
        ? 'Exportación CSV no disponible para este reporte'
        : 'Exportar como CSV (compatible con Excel)',
    },
  ];

  const handleExport = (formato: FormatoExportacion) => {
    if (!disabled && !isLoading) {
      onExport(formato);
    }
  };

  return (
    <ButtonGroup variant="outlined" size="small">
      {formatos.map(({ formato, label, icon, permitido, tooltip }) => (
        <Tooltip key={formato} title={tooltip}>
          <span>
            <Button
              onClick={() => handleExport(formato)}
              disabled={disabled || isLoading || !permitido}
              startIcon={
                loadingFormato === formato ? (
                  <CircularProgress size={16} color="inherit" />
                ) : (
                  icon
                )
              }
              sx={{
                minWidth: 90,
              }}
            >
              {loadingFormato === formato ? 'Exportando...' : label}
            </Button>
          </span>
        </Tooltip>
      ))}
    </ButtonGroup>
  );
};

export default ExportacionButtons;
