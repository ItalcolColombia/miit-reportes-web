/**
 * Utilidades para exportación de archivos
 */

/**
 * Descarga un Blob como archivo
 */
export const downloadBlob = (blob: Blob, filename: string) => {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};

/**
 * Obtiene la extensión correcta según el formato
 */
export const getFileExtension = (formato: 'pdf' | 'excel' | 'csv'): string => {
  switch (formato) {
    case 'pdf':
      return 'pdf';
    case 'excel':
      return 'xlsx';
    case 'csv':
      return 'csv';
    default:
      return 'txt';
  }
};

/**
 * Genera un nombre de archivo para exportación
 */
export const generateExportFilename = (
  codigoReporte: string,
  formato: 'pdf' | 'excel' | 'csv'
): string => {
  const fecha = new Date().toISOString().split('T')[0];
  const extension = getFileExtension(formato);
  return `${codigoReporte}_${fecha}.${extension}`;
};
