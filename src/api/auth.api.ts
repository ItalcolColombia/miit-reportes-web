/**
 * Cliente de API de autenticación
 */

import axiosInstance from './axios-config';
import { LoginCredentials, LoginResponse, Usuario } from '@/types/auth.types';
import { useAuthStore } from '@/stores/authStore';
import { decodeJwtPayload, extractUserFromPayload } from '@/utils/jwt';

/**
 * Estructura de respuesta del backend para login
 */
interface LoginApiResponse {
  token?: string;
  access_token?: string;
  refresh_token?: string;
  token_type?: string;
  usuario?: Usuario;
}

export const authApi = {
  /**
   * Iniciar sesión
   */
  login: async (credentials: LoginCredentials): Promise<LoginResponse> => {
    const response = await axiosInstance.post<LoginApiResponse>('/auth', credentials);

    // Si el backend devuelve el token en `token`, adaptamos la respuesta
    const data = response.data;
    const token: string | undefined = data?.token || data?.access_token;

    // Decodificar payload del JWT sin verificar (solo para extraer usuario)
    const payload = token ? decodeJwtPayload(token) : null;

    // Extraer usuario del payload del JWT o usar el que viene en la respuesta
    const usuario: Usuario = payload
      ? extractUserFromPayload(payload)
      : (data?.usuario ?? {
          uid: 0,
          username: '',
          email: '',
          fullname: '',
          role: '',
          rol_id: 0,
          is_active: false,
        });

    const result: LoginResponse = {
      access_token: token ?? data?.access_token ?? '',
      refresh_token: data?.refresh_token ?? '',
      token_type: data?.token_type ?? 'bearer',
      usuario,
    };

    return result;
  },

  /**
   * Refrescar token
   */
  refresh: async (refreshToken: string): Promise<{ access_token: string }> => {
    const response = await axiosInstance.post<{ access_token: string }>('/auth/refresh', {
      refresh_token: refreshToken,
    });
    return response.data;
  },

  /**
   * Cerrar sesión (si el backend tiene este endpoint)
   */
  logout: async (): Promise<void> => {
    // Limpiar estado en cliente aunque el backend no tenga endpoint de logout.
    try {
      useAuthStore.getState().logout();
      // Intentar notificar al backend si existe el endpoint; ignorar errores.
      await axiosInstance.post('/auth/logout');
    } catch (error) {
      // Ignorar errores en logout; ya limpiamos el store local.
      // console.debug('No existe endpoint de logout o falló la petición');
    }
  },
};
