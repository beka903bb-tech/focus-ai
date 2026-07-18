import { create } from 'zustand';

// Ephemeral (non-persisted) global toast — a <ToastHost/> mounted once at the root
// layout renders whatever is here, on top of the current screen. showToast() can be
// called from anywhere, including headless code with no component tree of its own
// (e.g. the background timer watcher), by reaching in via useToastStore.getState().
interface ToastState {
  message: string | null;
  key: number;
  showToast: (message: string) => void;
  hideToast: () => void;
}

export const useToastStore = create<ToastState>((set) => ({
  message: null,
  key: 0,
  showToast: (message) => set((state) => ({ message, key: state.key + 1 })),
  hideToast: () => set({ message: null }),
}));
