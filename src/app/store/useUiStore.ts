import { create } from "zustand";

interface UiState {
  isSidebarOpen: boolean;
  isSidebarCollapsed: boolean;
  toggleSidebar: () => void;
  closeSidebar: () => void;
  openSidebar: () => void;
  toggleSidebarCollapse: () => void;
}

export const useUiStore = create<UiState>((set) => ({
  isSidebarOpen: false,
  isSidebarCollapsed: false,
  toggleSidebar: () => set((s) => ({ isSidebarOpen: !s.isSidebarOpen })),
  closeSidebar: () => set({ isSidebarOpen: false }),
  openSidebar: () => set({ isSidebarOpen: true }),
  toggleSidebarCollapse: () => set((s) => ({ isSidebarCollapsed: !s.isSidebarCollapsed })),
}));
