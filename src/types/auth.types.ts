/**
 * Types para autenticación y usuarios
 */

export interface LoginCredentials {
  nick_name: string;
  clave: string;
}

export interface Usuario {
  uid: number;
  username: string;
  email: string;
  fullname: string;
  role: string;
  rol_id: number;
  is_active: boolean;
}

export interface AuthTokens {
  access_token: string;
  refresh_token: string;
  token_type: string;
}

export interface LoginResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  usuario: Usuario;
}

export interface AuthState {
  token: string | null;
  refreshToken: string | null;
  usuario: Usuario | null;
  isAuthenticated: boolean;
  setToken: (token: string) => void;
  setRefreshToken: (refreshToken: string) => void;
  setUsuario: (usuario: Usuario) => void;
  login: (token: string, refreshToken: string, usuario: Usuario) => void;
  logout: () => void;
  /**
   * Verifica si el token actual ha expirado
   * @returns true si el token ha expirado o no existe
   */
  isTokenExpired: () => boolean;
  /**
   * Verifica y actualiza el estado de autenticación basado en la expiración del token
   * Si el token ha expirado, ejecuta logout automáticamente
   */
  checkAndRefreshAuth: () => void;
}
