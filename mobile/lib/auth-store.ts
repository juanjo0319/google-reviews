import { create } from "zustand";
import { api, storeTokens, clearTokens, getStoredTokens, ApiError } from "./api";
import { registerForPushNotifications, registerDeviceToken, unregisterDeviceToken } from "./notifications";
import { clearAllCache } from "./cache";

export interface User {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
  onboardingCompleted: boolean;
  createdAt: string;
}

export interface Organization {
  id: string;
  name: string;
  slug: string;
  planTier: string;
  role: string;
}

interface AuthState {
  user: User | null;
  organizations: Organization[];
  activeOrg: Organization | null;
  isLoading: boolean;
  isAuthenticated: boolean;

  // Actions
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  loadSession: () => Promise<void>;
  switchOrg: (orgId: string) => void;
  refreshProfile: () => Promise<void>;
  setUser: (user: User) => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  organizations: [],
  activeOrg: null,
  isLoading: true,
  isAuthenticated: false,

  login: async (email: string, password: string) => {
    const data = await api<{
      accessToken: string;
      refreshToken: string;
      user: User;
    }>("/api/mobile/auth/login", {
      method: "POST",
      body: { email, password },
      noAuth: true,
    });

    await storeTokens(data.accessToken, data.refreshToken);

    // Fetch full profile with orgs
    const profile = await api<{
      user: User;
      organizations: Organization[];
      activeOrganization: Organization | null;
    }>("/api/mobile/user/profile");

    set({
      user: profile.user,
      organizations: profile.organizations,
      activeOrg: profile.activeOrganization ?? profile.organizations[0] ?? null,
      isAuthenticated: true,
      isLoading: false,
    });

    // Ensure user has an org
    if (profile.organizations.length === 0) {
      const ensureResult = await api<{ orgId: string }>("/api/mobile/orgs/ensure", {
        method: "POST",
      });
      // Re-fetch profile to get the new org
      const updated = await api<{
        user: User;
        organizations: Organization[];
        activeOrganization: Organization | null;
      }>("/api/mobile/user/profile");

      set({
        organizations: updated.organizations,
        activeOrg: updated.activeOrganization ?? updated.organizations[0] ?? null,
      });
    }
  },

  register: async (name: string, email: string, password: string) => {
    await api("/api/mobile/auth/register", {
      method: "POST",
      body: { name, email, password },
      noAuth: true,
    });
  },

  logout: async () => {
    // Unregister push token before clearing auth
    try {
      const token = await registerForPushNotifications();
      if (token) {
        await unregisterDeviceToken(token);
      }
    } catch {
      // Best-effort — don't block logout
    }

    await clearTokens();
    clearAllCache();
    set({
      user: null,
      organizations: [],
      activeOrg: null,
      isAuthenticated: false,
      isLoading: false,
    });
  },

  loadSession: async () => {
    try {
      const { accessToken } = await getStoredTokens();
      if (!accessToken) {
        set({ isLoading: false, isAuthenticated: false });
        return;
      }

      const profile = await api<{
        user: User;
        organizations: Organization[];
        activeOrganization: Organization | null;
      }>("/api/mobile/user/profile");

      set({
        user: profile.user,
        organizations: profile.organizations,
        activeOrg: profile.activeOrganization ?? profile.organizations[0] ?? null,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        await clearTokens();
      }
      set({ isLoading: false, isAuthenticated: false });
    }
  },

  switchOrg: (orgId: string) => {
    const orgs = get().organizations;
    const org = orgs.find((o) => o.id === orgId);
    if (org) {
      set({ activeOrg: org });
    }
  },

  refreshProfile: async () => {
    try {
      const profile = await api<{
        user: User;
        organizations: Organization[];
        activeOrganization: Organization | null;
      }>("/api/mobile/user/profile");

      set({
        user: profile.user,
        organizations: profile.organizations,
        activeOrg: profile.activeOrganization ?? profile.organizations[0] ?? null,
      });
    } catch {
      // Silently fail — not critical
    }
  },

  setUser: (user: User) => set({ user }),
}));
