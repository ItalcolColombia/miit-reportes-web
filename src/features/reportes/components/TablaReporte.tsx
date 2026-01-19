/**
 * TablaReporte - Tabla de datos con ordenamiento y totales
 */

import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  TablePagination,
  Typography,
  Paper,
  Skeleton,
} from '@mui/material';
import type {
  ColumnaReporte,
  PaginacionReporte,
  OrdenDireccion,
} from '@/types/reportes.types';
import { formatDate, formatNumber } from '@/utils/formatters';

interface TablaReporteProps {
  columnas: ColumnaReporte[];
  datos: Record<string, any>[];
  totales?: Record<string, number> | null;
  paginacion: PaginacionReporte;
  ordenCampo?: string;
  ordenDireccion?: OrdenDireccion;
  onOrdenChange?: (campo: string) => void;
  onPageChange: (page: number) => void;
  onRowsPerPageChange: (rowsPerPage: number) => void;
  isLoading?: boolean;
}

export const TablaReporte: React.FC<TablaReporteProps> = ({
  columnas,
  datos,
  totales,
  paginacion,
  ordenCampo,
  ordenDireccion = 'desc',
  onOrdenChange,
  onPageChange,
  onRowsPerPageChange,
  isLoading,
}) => {
  // Formatear valor según tipo de columna
  const formatearValor = (valor: any, columna: ColumnaReporte): string => {
    if (valor === null || valor === undefined) {
      return '-';
    }

    const tipoDato = columna.tipo_dato || 'string';

    switch (tipoDato) {
      case 'number':
      case 'integer':
        const num = typeof valor === 'number' ? valor : parseFloat(valor);
        if (isNaN(num)) return '-';
        const decimales = tipoDato === 'integer' ? 0 : (columna.decimales ?? 2);
        let formatted = formatNumber(num, decimales);
        if (columna.prefijo) formatted = `${columna.prefijo}${formatted}`;
        if (columna.sufijo) formatted = `${formatted}${columna.sufijo}`;
        return formatted;

      case 'date':
        return formatDate(valor, 'date');

      case 'datetime':
        return formatDate(valor, 'datetime');

      case 'boolean':
        return valor ? 'Sí' : 'No';

      default:
        return String(valor);
    }
  };

  // Determinar alineación de celda
  const getAlineacion = (columna: ColumnaReporte): 'left' | 'center' | 'right' => {
    if (columna.alineacion) {
      return columna.alineacion;
    }
    // Alineación por defecto según tipo
    if (columna.tipo_dato === 'number' || columna.tipo_dato === 'integer') {
      return 'right';
    }
    return 'left';
  };

  // Manejar click en ordenamiento
  const handleSort = (campo: string) => {
    if (onOrdenChange) {
      onOrdenChange(campo);
    }
  };

  // Renderizar skeleton para loading
  const renderSkeleton = () => (
    <>
      {[...Array(5)].map((_, rowIndex) => (
        <TableRow key={rowIndex}>
          {columnas.map((_, colIndex) => (
            <TableCell key={colIndex}>
              <Skeleton variant="text" />
            </TableCell>
          ))}
        </TableRow>
      ))}
    </>
  );

  // Filtrar columnas visibles
  const columnasVisibles = columnas.filter((col) => col.visible !== false);

  return (
    <Paper>
      <TableContainer sx={{ maxHeight: 600 }}>
        <Table stickyHeader size="small">
          <TableHead>
            <TableRow>
              {columnasVisibles.map((columna) => (
                <TableCell
                  key={columna.campo}
                  align={getAlineacion(columna)}
                  sx={{
                    fontWeight: 'bold',
                    bgcolor: 'background.paper',
                    minWidth: columna.ancho_minimo || 100,
                    whiteSpace: 'nowrap',
                  }}
                  sortDirection={ordenCampo === columna.campo ? ordenDireccion : false}
                >
                  {columna.ordenable !== false && onOrdenChange ? (
                    <TableSortLabel
                      active={ordenCampo === columna.campo}
                      direction={ordenCampo === columna.campo ? ordenDireccion : 'asc'}
                      onClick={() => handleSort(columna.campo)}
                    >
                      {columna.nombre_mostrar || columna.campo}
                    </TableSortLabel>
                  ) : (
                    columna.nombre_mostrar || columna.campo
                  )}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {isLoading ? (
              renderSkeleton()
            ) : datos.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columnasVisibles.length} align="center">
                  <Typography color="text.secondary" sx={{ py: 4 }}>
                    No se encontraron datos
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              <>
                {datos.map((fila, index) => (
                  <TableRow key={index} hover>
                    {columnasVisibles.map((columna) => (
                      <TableCell
                        key={columna.campo}
                        align={getAlineacion(columna)}
                        sx={{
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          maxWidth: 300,
                        }}
                      >
                        {formatearValor(fila[columna.campo], columna)}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}

                {/* Fila de totales */}
                {totales && Object.keys(totales).length > 0 && (
                  <TableRow
                    sx={{
                      bgcolor: 'action.selected',
                      '& td': { fontWeight: 'bold' },
                    }}
                  >
                    {columnasVisibles.map((columna, index) => (
                      <TableCell
                        key={columna.campo}
                        align={getAlineacion(columna)}
                      >
                        {index === 0 ? (
                          <Typography variant="body2" fontWeight="bold">
                            TOTALES
                          </Typography>
                        ) : totales[columna.campo] !== undefined ? (
                          formatearValor(totales[columna.campo], columna)
                        ) : (
                          ''
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                )}
              </>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <TablePagination
        component="div"
        count={paginacion.total_registros}
        page={paginacion.pagina_actual - 1}
        onPageChange={(_, newPage) => onPageChange(newPage)}
        rowsPerPage={paginacion.registros_por_pagina}
        onRowsPerPageChange={(e) => onRowsPerPageChange(parseInt(e.target.value, 10))}
        rowsPerPageOptions={[25, 50, 100, 200]}
        labelRowsPerPage="Filas por página:"
        labelDisplayedRows={({ from, to, count }) =>
          `${from}-${to} de ${count !== -1 ? count : `más de ${to}`}`
        }
      />
    </Paper>
  );
};

export default TablaReporte;
