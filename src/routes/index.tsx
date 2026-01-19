/**
 * Configuración de rutas de la aplicación
 */

import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import { AuthLayout } from '@/components/layout/AuthLayout';
import { PrivateRoute } from '@/components/common/PrivateRoute';

// Auth pages
import { LoginPage } from '@/features/auth/pages/LoginPage';
import { UnauthorizedPage } from '@/features/auth/pages/UnauthorizedPage';

// Reportes pages
import { ReportesListPage } from '@/features/reportes/pages/ReportesListPage';
import { ReporteDetallePage } from '@/features/reportes/pages/ReporteDetallePage';

// Admin pages
import { GestionRolesPage } from '@/features/admin/pages/GestionRolesPage';
import { GestionPermisosPage } from '@/features/admin/pages/GestionPermisosPage';

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Rutas públicas (Auth) */}
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<LoginPage />} />
      </Route>
      
      {/* Rutas privadas (Main) */}
      <Route
        element={
          <PrivateRoute>
            <MainLayout />
          </PrivateRoute>
        }
      >
        {/* Redirect raíz a /reportes */}
        <Route path="/" element={<Navigate to="/reportes" replace />} />
        
        {/* Reportes */}
        <Route path="/reportes" element={<ReportesListPage />} />
        <Route path="/reportes/:codigoReporte" element={<ReporteDetallePage />} />
        
        {/* Admin (solo administradores) */}
        <Route
          path="/admin/roles"
          element={
            <PrivateRoute requireAdmin>
              <GestionRolesPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/admin/permisos/:rolId"
          element={
            <PrivateRoute requireAdmin>
              <GestionPermisosPage />
            </PrivateRoute>
          }
        />
        
        {/* Unauthorized */}
        <Route path="/unauthorized" element={<UnauthorizedPage />} />
      </Route>
      
      {/* 404 - Redirect a login o reportes según autenticación */}
      <Route path="*" element={<Navigate to="/reportes" replace />} />
    </Routes>
  );
};
