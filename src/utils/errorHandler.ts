/**
 * Utilidades centralizadas para manejo de errores
 */

import { AxiosError } from 'axios';

/**
 * Estructura de error de API esperada
 */
export interface ApiErrorResponse {
  message?: string;
  detail?: string;
  error?: string;
  errors?: Record<string, string[]>;
}

/**
 * Tipo para errores de Axios con estructura de respuesta conocida
 */
export type ApiError = AxiosError<ApiErrorResponse>;

/**
 * Verifica si un error es un AxiosError
 */
export const isAxiosError = (error: unknown): error is AxiosError => {
  return (error as AxiosError)?.isAxiosError === true;
};

/**
 * Extrae el mensaje de error de cualquier tipo de error
 * @param error - El error capturado
 * @param fallback - Mensaje por defecto si no se puede extraer uno
 * @returns El mensaje de error extraído o el fallback
 */
export const getApiErrorMessage = (
  error: unknown,
  fallback: string = 'Ha ocurrido un error inesperado'
): string => {
  // Si es un AxiosError, intentar extraer el mensaje de la respuesta
  if (isAxiosError(error)) {
    const data = error.response?.data as Record<string, unknown> | undefined;

    if (data) {
      // Prioridad: detail > message > error
      if (typeof data.detail === 'string') return data.detail;
      if (typeof data.message === 'string') return data.message;
      if (typeof data.error === 'string') return data.error;

      // Si hay errores de validación, concatenarlos
      if (data.errors && typeof data.errors === 'object') {
        const errorMessages = Object.values(data.errors as Record<string, unknown[]>).flat();
        if (errorMessages.length > 0) {
          return errorMessages.join('. ');
        }
      }
    }

    // Mensajes basados en código de estado HTTP
    if (error.response?.status) {
      switch (error.response.status) {
        case 400:
          return 'Solicitud inválida. Verifica los datos enviados.';
        case 401:
          return 'Sesión expirada. Por favor, inicia sesión nuevamente.';
        case 403:
          return 'No tienes permisos para realizar esta acción.';
        case 404:
          return 'El recurso solicitado no fue encontrado.';
        case 408:
          return 'La solicitud tardó demasiado. Intenta de nuevo.';
        case 422:
          return 'Los datos enviados no son válidos.';
        case 429:
          return 'Demasiadas solicitudes. Espera un momento e intenta de nuevo.';
        case 500:
          return 'Error interno del servidor. Intenta más tarde.';
        case 502:
        case 503:
        case 504:
          return 'El servidor no está disponible. Intenta más tarde.';
      }
    }

    // Error de red (sin respuesta del servidor)
    if (error.code === 'ECONNABORTED') {
      return 'La solicitud tardó demasiado tiempo. Verifica tu conexión.';
    }
    if (error.code === 'ERR_NETWORK') {
      return 'Error de conexión. Verifica tu conexión a internet.';
    }
  }

  // Si es un Error estándar de JavaScript
  if (error instanceof Error) {
    return error.message || fallback;
  }

  // Si es un string directamente
  if (typeof error === 'string') {
    return error;
  }

  return fallback;
};

/**
 * Obtiene el código de estado HTTP de un error
 */
export const getErrorStatusCode = (error: unknown): number | undefined => {
  if (isAxiosError(error)) {
    return error.response?.status;
  }
  return undefined;
};

/**
 * Verifica si el error es un error de autenticación (401)
 */
export const isAuthError = (error: unknown): boolean => {
  return getErrorStatusCode(error) === 401;
};

/**
 * Verifica si el error es un error de permisos (403)
 */
export const isForbiddenError = (error: unknown): boolean => {
  return getErrorStatusCode(error) === 403;
};

/**
 * Verifica si el error es un error de red
 */
export const isNetworkError = (error: unknown): boolean => {
  if (isAxiosError(error)) {
    return !error.response && (error.code === 'ERR_NETWORK' || error.code === 'ECONNABORTED');
  }
  return false;
};

/**
 * Verifica si el error es un timeout
 */
export const isTimeoutError = (error: unknown): boolean => {
  if (isAxiosError(error)) {
    return error.code === 'ECONNABORTED';
  }
  return false;
};
