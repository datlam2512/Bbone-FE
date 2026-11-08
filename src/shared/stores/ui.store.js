import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useUiStore = create(
  persist(
    (set) => ({
      mobileMenuOpen: false,
      sidebarCollapsed: false,
      setMobileMenuOpen: (open) => set({ mobileMenuOpen: open }),
      toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
    }),
    {
      name: 'bbone-ui-v1',
      partialize: ({ sidebarCollapsed }) => ({ sidebarCollapsed }),
      merge: (persisted, current) => ({
        ...current,
        sidebarCollapsed: persisted?.sidebarCollapsed === true,
      }),
    },
  ),
)
