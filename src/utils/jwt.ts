/**
 * Utilidades para manejo de JWT
 */

/**
 * Payload esperado del JWT
 */
export interface JwtPayload {
  uid?: number;
  sub?: string;
  username?: string;
  email?: string;
  fullname?: string;
  role?: string;
  rol_id?: number;
  is_active?: boolean;
  exp?: number; // Timestamp de expiración (segundos desde epoch)
  iat?: number; // Timestamp de emisión
  [key: string]: unknown;
}

/**
 * Decodifica un string Base64 URL-safe a texto
 * Reemplaza la función deprecada escape()
 */
const base64UrlDecode = (base64Url: string): string => {
  // Convertir Base64URL a Base64 estándar
  const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');

  // Agregar padding si es necesario
  const paddedBase64 = base64.padEnd(base64.length + (4 - (base64.length % 4)) % 4, '=');

  // Decodificar Base64 a bytes
  const binaryString = atob(paddedBase64);

  // Convertir bytes a texto UTF-8 usando TextDecoder
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }

  return new TextDecoder('utf-8').decode(bytes);
};

/**
 * Decodifica el payload de un JWT sin verificar la firma
 * Solo para uso en cliente para extraer información del usuario
 * @param token - Token JWT completo
 * @returns El payload decodificado o null si hay error
 */
export const decodeJwtPayload = (token: string): JwtPayload | null => {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) {
      console.warn('JWT inválido: no tiene 3 partes');
      return null;
    }

    const payload = parts[1];
    const jsonString = base64UrlDecode(payload);
    return JSON.parse(jsonString) as JwtPayload;
  } catch (error) {
    console.error('Error decodificando JWT:', error);
    return null;
  }
};

/**
 * Verifica si un token JWT ha expirado
 * @param token - Token JWT completo
 * @param marginSeconds - Margen de seguridad en segundos (default: 60)
 * @returns true si el token ha expirado o está por expirar
 */
export const isTokenExpired = (token: string | null, marginSeconds: number = 60): boolean => {
  if (!token) return true;

  const payload = decodeJwtPayload(token);
  if (!payload || !payload.exp) {
    // Si no hay payload o no tiene exp, considerar como expirado por seguridad
    return true;
  }

  const currentTime = Math.floor(Date.now() / 1000);
  const expirationTime = payload.exp - marginSeconds;

  return currentTime >= expirationTime;
};

/**
 * Obtiene el tiempo restante hasta la expiración del token en segundos
 * @param token - Token JWT completo
 * @returns Segundos restantes, 0 si ya expiró, -1 si no se puede determinar
 */
export const getTokenTimeRemaining = (token: string | null): number => {
  if (!token) return 0;

  const payload = decodeJwtPayload(token);
  if (!payload || !payload.exp) {
    return -1;
  }

  const currentTime = Math.floor(Date.now() / 1000);
  const remaining = payload.exp - currentTime;

  return Math.max(0, remaining);
};

/**
 * Extrae la información del usuario del payload del JWT
 */
export const extractUserFromPayload = (payload: JwtPayload) => {
  return {
    uid: payload.uid ?? 0,
    username: payload.sub ?? payload.username ?? '',
    email: payload.email ?? '',
    fullname: payload.fullname ?? '',
    role: payload.role ?? '',
    rol_id: payload.rol_id ?? 0,
    is_active: payload.is_active ?? false,
  };
};
