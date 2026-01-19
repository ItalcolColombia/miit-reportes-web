/**
 * Store de reportes con Zustand
 * Persiste los filtros en localStorage para mantenerlos entre sesiones
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { FiltrosReporte } from '@/types/reportes.types';

interface ReportesState {
  filtrosActuales: FiltrosReporte;
  ultimoReporteVisitado: string | null;
  setFiltros: (filtros: FiltrosReporte) => void;
  resetFiltros: () => void;
  setUltimoReporteVisitado: (codigo: string) => void;
}

const filtrosIniciales: FiltrosReporte = {
  material_id: undefined,
  fecha_inicio: undefined,
  fecha_fin: undefined,
  orden_campo: undefined,
  orden_direccion: 'desc',
};

export const useReportesStore = create<ReportesState>()(
  persist(
    (set) => ({
      filtrosActuales: filtrosIniciales,
      ultimoReporteVisitado: null,

      setFiltros: (filtros: FiltrosReporte) =>
        set({ filtrosActuales: filtros }),

      resetFiltros: () =>
        set({ filtrosActuales: filtrosIniciales }),

      setUltimoReporteVisitado: (codigo: string) =>
        set({ ultimoReporteVisitado: codigo }),
    }),
    {
      name: 'reportes-storage',
      partialize: (state) => ({
        filtrosActuales: state.filtrosActuales,
        ultimoReporteVisitado: state.ultimoReporteVisitado,
      }),
    }
  )
);
