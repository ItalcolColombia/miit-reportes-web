/**
 * Cliente de API de administración (roles y permisos)
 */

import axiosInstance from './axios-config';
import { Rol, PermisoReporte, AsignarPermisosRequest, RolConPermisos } from '@/types/admin.types';

export const adminApi = {
  /**
   * Listar todos los roles
   */
  listarRoles: async (): Promise<{ roles: Rol[] }> => {
    const response = await axiosInstance.get<{ roles: Rol[] }>('/admin/roles');
    return response.data;
  },

  /**
   * Obtener un rol específico
   */
  obtenerRol: async (rolId: number): Promise<Rol> => {
    const response = await axiosInstance.get<Rol>(`/admin/roles/${rolId}`);
    return response.data;
  },

  /**
   * Crear un nuevo rol
   */
  crearRol: async (rol: Partial<Rol>): Promise<Rol> => {
    const response = await axiosInstance.post<Rol>('/admin/roles', rol);
    return response.data;
  },

  /**
   * Actualizar un rol
   */
  actualizarRol: async (rolId: number, rol: Partial<Rol>): Promise<Rol> => {
    const response = await axiosInstance.put<Rol>(`/admin/roles/${rolId}`, rol);
    return response.data;
  },

  /**
   * Eliminar un rol
   */
  eliminarRol: async (rolId: number): Promise<void> => {
    await axiosInstance.delete(`/admin/roles/${rolId}`);
  },

  /**
   * Obtener permisos de reportes de un rol
   */
  obtenerPermisosRol: async (rolId: number): Promise<{ permisos: PermisoReporte[] }> => {
    const response = await axiosInstance.get<{ permisos: PermisoReporte[] }>(
      `/admin/roles/${rolId}/permisos-reportes`
    );
    return response.data;
  },

  /**
   * Asignar permisos de reportes a un rol
   */
  asignarPermisos: async (
    rolId: number,
    permisos: AsignarPermisosRequest
  ): Promise<{ message: string }> => {
    const response = await axiosInstance.put<{ message: string }>(
      `/admin/roles/${rolId}/permisos-reportes`,
      permisos
    );
    return response.data;
  },

  /**
   * Obtener rol con sus permisos
   */
  obtenerRolConPermisos: async (rolId: number): Promise<RolConPermisos> => {
    const [rolData, permisosData] = await Promise.all([
      adminApi.obtenerRol(rolId),
      adminApi.obtenerPermisosRol(rolId),
    ]);

    return {
      ...rolData,
      permisos: permisosData.permisos,
    };
  },
};
