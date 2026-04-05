import { create } from "zustand";

interface BadgeState {
  unreadCount: number;
  setUnreadCount: (count: number) => void;
  decrement: () => void;
}

/**
 * Global store for notification badge count, shared between
 * the tab bar and the notifications screen.
 */
export const useBadgeStore = create<BadgeState>((set) => ({
  unreadCount: 0,
  setUnreadCount: (count) => set({ unreadCount: count }),
  decrement: () =>
    set((state) => ({ unreadCount: Math.max(0, state.unreadCount - 1) })),
}));
