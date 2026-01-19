/**
 * Hooks personalizados para administración
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '@/api/admin.api';
import toast from 'react-hot-toast';
import type { Rol, AsignarPermisosRequest } from '@/types/admin.types';
import { getApiErrorMessage } from '@/utils/errorHandler';

/**
 * Hook para listar todos los roles
 */
export const useRoles = () => {
  return useQuery({
    queryKey: ['roles'],
    queryFn: adminApi.listarRoles,
  });
};

/**
 * Hook para obtener un rol específico
 */
export const useRol = (rolId: number) => {
  return useQuery({
    queryKey: ['rol', rolId],
    queryFn: () => adminApi.obtenerRol(rolId),
    enabled: !!rolId,
  });
};

/**
 * Hook para obtener un rol con sus permisos
 */
export const useRolConPermisos = (rolId: number) => {
  return useQuery({
    queryKey: ['rol-con-permisos', rolId],
    queryFn: () => adminApi.obtenerRolConPermisos(rolId),
    enabled: !!rolId,
  });
};

/**
 * Hook para crear un rol
 */
export const useCrearRol = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: adminApi.crearRol,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles'] });
      toast.success('Rol creado exitosamente');
    },
    onError: (error: unknown) => {
      toast.error(getApiErrorMessage(error, 'Error al crear rol'));
    },
  });
};

/**
 * Hook para actualizar un rol
 */
export const useActualizarRol = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ rolId, rol }: { rolId: number; rol: Partial<Rol> }) =>
      adminApi.actualizarRol(rolId, rol),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['roles'] });
      queryClient.invalidateQueries({ queryKey: ['rol', variables.rolId] });
      toast.success('Rol actualizado exitosamente');
    },
    onError: (error: unknown) => {
      toast.error(getApiErrorMessage(error, 'Error al actualizar rol'));
    },
  });
};

/**
 * Hook para eliminar un rol
 */
export const useEliminarRol = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: adminApi.eliminarRol,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles'] });
      toast.success('Rol eliminado exitosamente');
    },
    onError: (error: unknown) => {
      toast.error(getApiErrorMessage(error, 'Error al eliminar rol'));
    },
  });
};

/**
 * Hook para asignar permisos a un rol
 */
export const useAsignarPermisos = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ rolId, permisos }: { rolId: number; permisos: AsignarPermisosRequest }) =>
      adminApi.asignarPermisos(rolId, permisos),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['rol-con-permisos', variables.rolId] });
      // Invalidar la lista de roles para actualizar el porcentaje de acceso
      queryClient.invalidateQueries({ queryKey: ['roles'] });
      // Invalidar la lista de reportes disponibles para reflejar los nuevos permisos
      queryClient.invalidateQueries({ queryKey: ['reportes-disponibles'] });
      toast.success('Permisos actualizados exitosamente');
    },
    onError: (error: unknown) => {
      toast.error(getApiErrorMessage(error, 'Error al actualizar permisos'));
    },
  });
};
