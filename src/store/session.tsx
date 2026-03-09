import {
  createContext,
  PropsWithChildren,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import {
  bootstrapTenants,
  createTenant as createTenantRequest,
  getAuthenticatedUser,
  getCurrentUserProfile,
  login,
} from '../services/api/newsflash';
import {
  clearStoredSession,
  loadStoredSession,
  persistTenantId,
  persistToken,
} from '../services/sessionStorage';
import type {
  AuthUser,
  SessionCapabilities,
  TenantCreateInput,
  TenantOption,
  UserProfile,
} from '../types/api';

type SessionPhase = 'booting' | 'ready';

interface SessionContextValue {
  capabilities: SessionCapabilities;
  createTenant: (input: TenantCreateInput) => Promise<void>;
  isBusy: boolean;
  phase: SessionPhase;
  profile: UserProfile | null;
  refresh: () => Promise<void>;
  selectTenant: (tenantId: string) => Promise<void>;
  selectedTenant: TenantOption | null;
  selectedTenantId: string | null;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  tenants: TenantOption[];
  token: string | null;
  user: AuthUser | null;
}

const SessionContext = createContext<SessionContextValue | null>(null);

export function SessionProvider({ children }: PropsWithChildren) {
  const [phase, setPhase] = useState<SessionPhase>('booting');
  const [token, setToken] = useState<string | null>(null);
  const [selectedTenantId, setSelectedTenantId] = useState<string | null>(null);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [tenants, setTenants] = useState<TenantOption[]>([]);
  const [isBusy, setIsBusy] = useState(false);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    void hydrate();

    return () => {
      mountedRef.current = false;
    };
  }, []);

  const selectedTenant = useMemo(
    () => tenants.find((tenant) => tenant.id === selectedTenantId) ?? null,
    [selectedTenantId, tenants],
  );

  const capabilities = useMemo<SessionCapabilities>(() => {
    const accessRole = user?.is_global_superuser
      ? 'global_superuser'
      : selectedTenant?.role ?? null;

    return {
      accessRole,
      canCreateTenant: user?.is_global_superuser ?? false,
      canManageTenantUsers:
        accessRole === 'global_superuser' || accessRole === 'tenant_superuser',
    };
  }, [selectedTenant?.role, user?.is_global_superuser]);

  async function hydrate() {
    setPhase('booting');

    try {
      const stored = await loadStoredSession();

      if (!stored.token) {
        resetSession();
        return;
      }

      const snapshot = await bootstrap(stored.token, stored.tenantId);

      safeCommit(() => {
        setToken(stored.token);
        setUser(snapshot.user);
        setProfile(snapshot.profile);
        setTenants(snapshot.tenants);
        setSelectedTenantId(snapshot.selectedTenantId);
        setPhase('ready');
      });
    } catch {
      await clearStoredSession();
      resetSession();
    }
  }

  async function bootstrap(nextToken: string, preferredTenantId: string | null) {
    const nextUser = await getAuthenticatedUser(nextToken);
    const nextTenants = await bootstrapTenants(nextToken, nextUser);
    const hasPreferredTenant = nextTenants.some((tenant) => tenant.id === preferredTenantId);
    const nextSelectedTenantId = hasPreferredTenant ? preferredTenantId : null;
    const nextProfile = nextSelectedTenantId
      ? await getCurrentUserProfile(nextToken, nextSelectedTenantId)
      : null;

    return {
      profile: nextProfile,
      selectedTenantId: nextSelectedTenantId,
      tenants: nextTenants,
      user: nextUser,
    };
  }

  async function signIn(email: string, password: string) {
    setIsBusy(true);

    try {
      const tokenResponse = await login(email, password);
      await clearStoredSession();
      await persistToken(tokenResponse.access_token);

      const snapshot = await bootstrap(tokenResponse.access_token, null);

      safeCommit(() => {
        setToken(tokenResponse.access_token);
        setUser(snapshot.user);
        setProfile(snapshot.profile);
        setTenants(snapshot.tenants);
        setSelectedTenantId(snapshot.selectedTenantId);
        setPhase('ready');
      });
    } finally {
      safeCommit(() => {
        setIsBusy(false);
      });
    }
  }

  async function selectTenant(tenantId: string) {
    if (!token) {
      return;
    }

    const nextProfile = await getCurrentUserProfile(token, tenantId);
    await persistTenantId(tenantId);

    safeCommit(() => {
      setSelectedTenantId(tenantId);
      setProfile(nextProfile);
    });
  }

  async function createTenant(input: TenantCreateInput) {
    if (!token) {
      return;
    }

    if (!user?.is_global_superuser) {
      throw new Error('Only global superusers can create tenants.');
    }

    setIsBusy(true);

    try {
      const created = await createTenantRequest(token, input);
      const nextTenants = [
        ...tenants,
        {
          id: created.id,
          name: created.name,
          slug: created.slug,
          role: 'global_superuser' as const,
        },
      ];

      const nextProfile = await getCurrentUserProfile(token, created.id);

      await persistTenantId(created.id);
      safeCommit(() => {
        setTenants(nextTenants);
        setSelectedTenantId(created.id);
        setProfile(nextProfile);
      });
    } finally {
      safeCommit(() => {
        setIsBusy(false);
      });
    }
  }

  async function refresh() {
    if (!token) {
      return;
    }

    setIsBusy(true);

    try {
      const snapshot = await bootstrap(token, selectedTenantId);
      safeCommit(() => {
        setUser(snapshot.user);
        setProfile(snapshot.profile);
        setTenants(snapshot.tenants);
        setSelectedTenantId(snapshot.selectedTenantId);
      });
    } finally {
      safeCommit(() => {
        setIsBusy(false);
      });
    }
  }

  async function signOut() {
    setIsBusy(true);

    try {
      await clearStoredSession();
      resetSession();
    } finally {
      safeCommit(() => {
        setIsBusy(false);
      });
    }
  }

  function resetSession() {
    safeCommit(() => {
      setPhase('ready');
      setToken(null);
      setSelectedTenantId(null);
      setTenants([]);
      setUser(null);
      setProfile(null);
    });
  }

  function safeCommit(commit: () => void) {
    if (!mountedRef.current) {
      return;
    }

    commit();
  }

  const value = useMemo<SessionContextValue>(
    () => ({
      capabilities,
      createTenant,
      isBusy,
      phase,
      profile,
      refresh,
      selectTenant,
      selectedTenant,
      selectedTenantId,
      signIn,
      signOut,
      tenants,
      token,
      user,
    }),
    [capabilities, isBusy, phase, profile, selectedTenant, selectedTenantId, tenants, token, user],
  );

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession() {
  const context = useContext(SessionContext);

  if (!context) {
    throw new Error('useSession must be used within SessionProvider');
  }

  return context;
}
