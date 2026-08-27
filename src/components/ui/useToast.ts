import { create } from "zustand";
import { toast as sonnerToast } from "sonner";

export interface Toast {
  id: string;
  title: string;
  description?: string;
  variant?: "default" | "success" | "error";
}

interface ToastStore {
  toasts: Toast[];
  push: (toast: Omit<Toast, "id">) => void;
  dismiss: (id: string) => void;
}

export const useToastStore = create<ToastStore>((set) => ({
  toasts: [],
  push: (toast) => {
    const id = Math.random().toString(36).slice(2, 9);
    set((state) => ({ toasts: [...state.toasts, { ...toast, id }] }));
    setTimeout(() => {
      set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) }));
    }, 3500);
  },
  dismiss: (id) => set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) })),
}));

/**
 * Toast helper backed by Sonner, which is mounted in AppProviders.
 * `const { toast } = useToast(); toast({ title, description, variant })`
 */
export function useToast() {
  const toast = (opts: Omit<Toast, "id">) => {
    if (opts.variant === "success") {
      sonnerToast.success(opts.title, { description: opts.description });
    } else if (opts.variant === "error") {
      sonnerToast.error(opts.title, { description: opts.description });
    } else {
      sonnerToast(opts.title, { description: opts.description });
    }
  };

  return { toast };
}
