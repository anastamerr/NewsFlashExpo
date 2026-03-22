import { create } from 'zustand';
import type { UserProfile, TenantOption } from '@/types/api';
import * as authService from '@/services/auth';
import { setUnauthorizedHandler } from '@/services/api';
import * as storage from '@/utils/storage';

interface AuthState {
  token: string | null;
  user: UserProfile | null;
  tenants: TenantOption[];
  tenantId: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isBootstrapping: boolean;

  signIn: (email: string, password: string) => Promise<{ needsTenantSelect: boolean }>;
  selectTenant: (tenantId: string) => Promise<void>;
  signOut: () => Promise<void>;
  bootstrap: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  token: null,
  user: null,
  tenants: [],
  tenantId: null,
  isAuthenticated: false,
  isLoading: false,
  isBootstrapping: true,

  signIn: async (email, password) => {
    set({ isLoading: true });
    try {
      const { access_token } = await authService.login(email, password);
      await storage.setToken(access_token);

      const tenants = await authService.listTenants();
      set({ token: access_token, tenants });

      if (tenants.length === 1) {
        await get().selectTenant(tenants[0].tenant_id);
        return { needsTenantSelect: false };
      }

      set({ isLoading: false });
      return { needsTenantSelect: true };
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  selectTenant: async (tenantId) => {
    set({ isLoading: true });
    try {
      await storage.setTenantId(tenantId);
      const profile = await authService.getProfile(tenantId);
      set({
        tenantId,
        user: profile,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  signOut: async () => {
    await storage.clearAll();
    set({
      token: null,
      user: null,
      tenants: [],
      tenantId: null,
      isAuthenticated: false,
      isLoading: false,
    });
  },

  bootstrap: async () => {
    try {
      const token = await storage.getToken();
      const tenantId = await storage.getTenantId();

      if (!token) {
        set({ isBootstrapping: false });
        return;
      }

      set({ token });

      if (tenantId) {
        const profile = await authService.getProfile(tenantId);
        set({
          tenantId,
          user: profile,
          isAuthenticated: true,
          isBootstrapping: false,
        });
      } else {
        const tenants = await authService.listTenants();
        set({ tenants, isBootstrapping: false });
      }
    } catch {
      await storage.clearAll();
      set({ isBootstrapping: false });
    }
  },
}));

setUnauthorizedHandler(() => useAuthStore.getState().signOut());
