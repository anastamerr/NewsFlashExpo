import { create } from 'zustand';
import type { UserProfile, TenantOption, MembershipRole, TenantCreateInput } from '@/types/api';
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

  signIn: (email: string, password: string, rememberSession: boolean) => Promise<{ needsTenantSelect: boolean }>;
  register: (input: {
    name: string;
    email: string;
    password: string;
    role: MembershipRole;
    persona: string;
    tenantName?: string;
    rememberSession: boolean;
  }) => Promise<{ needsTenantSelect: boolean }>;
  createTenant: (input: TenantCreateInput) => Promise<TenantOption>;
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

  signIn: async (email, password, rememberSession) => {
    set({ isLoading: true });
    try {
      const { access_token } = await authService.login(email, password);
      if (rememberSession) {
        await storage.setToken(access_token);
      } else {
        storage.setVolatileToken(access_token);
        await storage.clearPersistedToken();
      }
      await storage.setRememberSession(rememberSession);

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

  register: async ({ name, email, password, role, persona, tenantName, rememberSession }) => {
    set({ isLoading: true });
    try {
      const { access_token } = await authService.register({ name, email, password, role, persona, tenantName });
      if (rememberSession) {
        await storage.setToken(access_token);
      } else {
        storage.setVolatileToken(access_token);
        await storage.clearPersistedToken();
      }
      await storage.setRememberSession(rememberSession);

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

  createTenant: async (input) => {
    set({ isLoading: true });
    try {
      const tenant = await authService.createTenant(input);
      const tenants = await authService.listTenants();
      set({ tenants, isLoading: false });
      return tenant;
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
      const rememberSession = await storage.getRememberSession();
      const token = await storage.getToken();
      const tenantId = await storage.getTenantId();

      if (!rememberSession || !token) {
        if (!rememberSession) {
          await storage.clearAll();
        }
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
