/**
 * Configuración de Axios con interceptores para JWT
 */

import axios, { AxiosError, AxiosResponse, InternalAxiosRequestConfig } from 'axios';

// En desarrollo usa ruta relativa para que funcione el proxy de Vite
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api/v1';

export const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 60000, // 1 minuto para peticiones normales
  headers: {
    'Content-Type': 'application/json',
  },
});

// Instancia con timeout extendido para exportaciones (5 minutos)
export const axiosExportInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 300000, // 5 minutos para exportaciones grandes
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Interfaz para el store de autenticación (evita dependencia circular)
 */
interface AuthStoreState {
  token: string | null;
  refreshToken: string | null;
  setToken: (token: string) => void;
  logout: () => void;
}

// Variable para almacenar el store dinámicamente (evita importación circular)
let authStoreGetter: (() => AuthStoreState) | null = null;

// Callback para navegación (se configura desde App.tsx con el router)
let onAuthFailure: (() => void) | null = null;

export const setAuthStoreGetter = (getter: () => AuthStoreState) => {
  authStoreGetter = getter;
};

/**
 * Configura el callback que se ejecuta cuando falla la autenticación
 * Se debe llamar desde App.tsx con una función que use navigate('/login')
 */
export const setOnAuthFailure = (callback: () => void) => {
  onAuthFailure = callback;
};

// Función para agregar token a la config
const addAuthToken = (config: InternalAxiosRequestConfig) => {
  if (authStoreGetter) {
    const token = authStoreGetter().token;
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
};

// Interceptor de peticiones - agregar token
axiosInstance.interceptors.request.use(addAuthToken, (error: AxiosError) => Promise.reject(error));

// También agregar token a la instancia de exportación
axiosExportInstance.interceptors.request.use(addAuthToken, (error: AxiosError) => Promise.reject(error));

/**
 * Maneja el fallo de autenticación de forma segura
 */
const handleAuthFailure = () => {
  if (authStoreGetter) {
    authStoreGetter().logout();
  }
  // Usar el callback si está configurado, sino fallback a window.location
  if (onAuthFailure) {
    onAuthFailure();
  } else {
    // Fallback para cuando el callback no está configurado (ej: durante el bootstrap)
    window.location.href = '/login';
  }
};

// Interceptor de respuestas - manejar errores y refresh token
axiosInstance.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError) => {
    if (error.response?.status === 401 && authStoreGetter) {
      const store = authStoreGetter();
      const refreshToken = store.refreshToken;

      const failedUrl = error.config?.url ?? '';

      // No redirigir/forzar logout si la petición fallida es el login o el endpoint de refresh.
      // Dejar que el componente que hizo la petición maneje el error (por ejemplo, mostrar mensaje).
      if (failedUrl.includes('/auth') || failedUrl.includes('/token_refresh')) {
        return Promise.reject(error);
      }

      // Intentar refrescar token usando el endpoint `/token_refresh` que espera el token
      if (refreshToken) {
        try {
          const response = await axios.post(`${API_BASE_URL}/token_refresh`, {
            token: refreshToken,
          });

          const newToken = response.data.access_token ?? response.data.token;
          if (newToken) {
            store.setToken(newToken);

            // Reintentar petición original con nuevo token
            if (error.config) {
              if (!error.config.headers) {
                error.config.headers = new axios.AxiosHeaders();
              }
              error.config.headers.Authorization = `Bearer ${newToken}`;
              return axiosInstance(error.config);
            }
          } else {
            // No se recibió un token válido en la respuesta de refresh
            handleAuthFailure();
          }
        } catch {
          // Refresh falló - limpiar cliente y redirigir a login
          handleAuthFailure();
        }
      } else {
        // No hay refresh token - limpiar cliente y redirigir a login
        handleAuthFailure();
      }
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
