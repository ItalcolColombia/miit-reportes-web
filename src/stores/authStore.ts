/**
 * Store de autenticación con Zustand
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { AuthState, Usuario } from '@/types/auth.types';
import { isTokenExpired as checkTokenExpired } from '@/utils/jwt';

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      token: null,
      refreshToken: null,
      usuario: null,
      isAuthenticated: false,

      setToken: (token: string) => set({ token }),

      setRefreshToken: (refreshToken: string) => set({ refreshToken }),

      setUsuario: (usuario: Usuario) => set({ usuario }),

      login: (token: string, refreshToken: string, usuario: Usuario) =>
        set({
          token,
          refreshToken,
          usuario,
          isAuthenticated: true,
        }),

      logout: () =>
        set({
          token: null,
          refreshToken: null,
          usuario: null,
          isAuthenticated: false,
        }),

      isTokenExpired: () => {
        const { token } = get();
        return checkTokenExpired(token);
      },

      checkAndRefreshAuth: () => {
        const { token, isAuthenticated, logout } = get();
        // Si está autenticado pero el token expiró, hacer logout
        if (isAuthenticated && checkTokenExpired(token)) {
          console.warn('Token expirado, cerrando sesión automáticamente');
          logout();
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        token: state.token,
        refreshToken: state.refreshToken,
        usuario: state.usuario,
        isAuthenticated: state.isAuthenticated,
      }),
      onRehydrateStorage: () => (state) => {
        // Validar token al rehidratar desde localStorage
        if (state && state.isAuthenticated && checkTokenExpired(state.token)) {
          console.warn('Token expirado al cargar, cerrando sesión');
          // Limpiar estado si el token está expirado
          state.token = null;
          state.refreshToken = null;
          state.usuario = null;
          state.isAuthenticated = false;
        }
      },
    }
  )
);

// Configurar el getter para axios-config
import { setAuthStoreGetter } from '@/api/axios-config';
setAuthStoreGetter(() => useAuthStore.getState());
