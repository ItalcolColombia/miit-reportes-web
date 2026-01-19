/**
 * Utilidades de formateo
 */

import { format, parseISO, isValid } from 'date-fns';
import { es } from 'date-fns/locale';

/**
 * Formatea un número con separadores de miles
 */
export const formatNumber = (value: number, decimals: number = 2): string => {
  if (value === null || value === undefined || isNaN(value)) return '-';

  return new Intl.NumberFormat('es-ES', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
};

/**
 * Formatea una fecha según el tipo especificado
 * @param value - Fecha como string ISO, Date, null o undefined
 * @param type - Tipo de formato: 'date', 'datetime' o 'time'
 * @returns Fecha formateada o '-' si es inválida
 */
export const formatDate = (
  value: string | Date | null | undefined,
  type: 'date' | 'datetime' | 'time' = 'date'
): string => {
  if (!value) return '-';

  try {
    const date = typeof value === 'string' ? parseISO(value) : value;

    // Validar que la fecha sea válida
    if (!isValid(date)) {
      console.warn('Fecha inválida:', value);
      return '-';
    }

    switch (type) {
      case 'datetime':
        return format(date, "dd/MM/yyyy HH:mm", { locale: es });
      case 'time':
        return format(date, "HH:mm", { locale: es });
      case 'date':
      default:
        return format(date, "dd/MM/yyyy", { locale: es });
    }
  } catch (error) {
    console.error('Error formateando fecha:', value, error);
    return '-';
  }
};

/**
 * Formatea un porcentaje
 */
export const formatPercentage = (value: number, decimals: number = 2): string => {
  if (value === null || value === undefined) return '-';
  
  return `${formatNumber(value, decimals)}%`;
};

/**
 * Formatea un peso (kg)
 */
export const formatWeight = (value: number): string => {
  if (value === null || value === undefined) return '-';
  
  return `${formatNumber(value, 2)} kg`;
};

/**
 * Formatea bytes a tamaño legible
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
};

/**
 * Capitaliza la primera letra de una cadena
 */
export const capitalize = (str: string): string => {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

/**
 * Trunca un texto a una longitud máxima
 */
export const truncate = (str: string, maxLength: number): string => {
  if (!str || str.length <= maxLength) return str;
  return `${str.slice(0, maxLength)}...`;
};
