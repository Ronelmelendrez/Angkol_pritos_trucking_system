import { create } from "zustand";

const COLLAPSED_KEY = "sidebar_collapsed";

interface UiState {
  isSidebarOpen: boolean;
  isSidebarCollapsed: boolean;
  toggleSidebar: () => void;
  closeSidebar: () => void;
  openSidebar: () => void;
  toggleCollapse: () => void;
}

export const useUiStore = create<UiState>((set) => ({
  isSidebarOpen: false,
  isSidebarCollapsed: localStorage.getItem(COLLAPSED_KEY) === "true",
  toggleSidebar: () => set((s) => ({ isSidebarOpen: !s.isSidebarOpen })),
  closeSidebar: () => set({ isSidebarOpen: false }),
  openSidebar: () => set({ isSidebarOpen: true }),
  toggleCollapse: () =>
    set((s) => {
      const next = !s.isSidebarCollapsed;
      localStorage.setItem(COLLAPSED_KEY, String(next));
      return { isSidebarCollapsed: next };
    }),
}));