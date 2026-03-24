import { apiClient, handleResponse } from './api';
import { ENDPOINTS } from '@/constants/api';
import type {
  TokenResponse,
  AuthUser,
  UserProfile,
  TenantOption,
  MembershipRole,
  TenantCreateInput,
} from '@/types/api';

const USE_MOCK_AUTH = true;
let mockSessionEmail = 'demo@newsflash.ai';
let mockSessionName = 'Demo Analyst';
let mockSessionRole: MembershipRole = 'tenant-superuser';
let mockSessionPersona = 'Asset Manager';
const INITIAL_MOCK_TENANTS: TenantOption[] = [
  {
    tenant_id: 'newsflash-demo',
    tenant_name: 'NewsFlash Demo Workspace',
    role: 'tenant-superuser',
  },
];
let mockTenants: TenantOption[] = [...INITIAL_MOCK_TENANTS];

export async function login(email: string, password: string): Promise<TokenResponse> {
  if (USE_MOCK_AUTH) {
    mockSessionEmail = email || mockSessionEmail;
    return {
      access_token: `mock-token:${encodeURIComponent(mockSessionEmail)}`,
      token_type: 'bearer',
    };
  }

  const formData = new URLSearchParams();
  formData.append('username', email);
  formData.append('password', password);

  return handleResponse(
    apiClient.post(ENDPOINTS.AUTH.LOGIN, formData.toString(), {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    }),
  );
}

export async function getMe(): Promise<AuthUser> {
  if (USE_MOCK_AUTH) {
    return {
      id: 'user-demo',
      email: mockSessionEmail,
    };
  }

  return handleResponse(apiClient.get(ENDPOINTS.AUTH.ME));
}

export async function getProfile(tenantId: string): Promise<UserProfile> {
  if (USE_MOCK_AUTH) {
    const membership = mockTenants.find((tenant) => tenant.tenant_id === tenantId);
    return {
      id: 'user-demo',
      email: mockSessionEmail,
      name: mockSessionName,
      role: membership?.role ?? mockSessionRole,
      persona: mockSessionPersona,
      tenant_id: tenantId,
      tenant_name: membership?.tenant_name ?? 'NewsFlash Demo Workspace',
      capabilities: {
        can_manage_users: true,
        can_manage_sources: true,
        can_create_tenants: (membership?.role ?? mockSessionRole) !== 'member',
      },
    };
  }

  return handleResponse(
    apiClient.get(ENDPOINTS.AUTH.PROFILE, {
      headers: { 'x-tenant-id': tenantId },
    }),
  );
}

export async function listTenants(): Promise<TenantOption[]> {
  if (USE_MOCK_AUTH) {
    return mockTenants;
  }

  return handleResponse(apiClient.get(ENDPOINTS.TENANTS.MEMBERSHIPS));
}

export async function register(input: {
  name: string;
  email: string;
  password: string;
  role: MembershipRole;
  persona: string;
  tenantName?: string;
}): Promise<TokenResponse> {
  if (USE_MOCK_AUTH) {
    mockSessionEmail = input.email || mockSessionEmail;
    mockSessionName = input.name || mockSessionName;
    mockSessionRole = input.role;
    mockSessionPersona = input.persona || mockSessionPersona;

    if (input.tenantName?.trim()) {
      const createdTenant = await createTenant({ name: input.tenantName.trim() });
      mockTenants = mockTenants.map((tenant) => (
        tenant.tenant_id === createdTenant.tenant_id ? { ...tenant, role: input.role } : tenant
      ));
    }

    return {
      access_token: `mock-token:${encodeURIComponent(mockSessionEmail)}`,
      token_type: 'bearer',
    };
  }

  return handleResponse(
    apiClient.post(ENDPOINTS.AUTH.LOGIN, input),
  );
}

export async function requestPasswordReset(email: string): Promise<void> {
  if (USE_MOCK_AUTH) {
    mockSessionEmail = email || mockSessionEmail;
    return;
  }

  await handleResponse(
    apiClient.post(`${ENDPOINTS.AUTH.LOGIN}/reset-password`, { email }),
  );
}

export async function createTenant(input: TenantCreateInput): Promise<TenantOption> {
  if (USE_MOCK_AUTH) {
    const tenantId = input.slug?.trim() || input.name.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-');

    if (mockTenants.some((item) => item.tenant_id === tenantId)) {
      throw new Error('That workspace slug is already in use. Choose a different one.');
    }

    const tenant: TenantOption = {
      tenant_id: tenantId,
      tenant_name: input.name.trim(),
      role: mockSessionRole === 'member' ? 'tenant-superuser' : mockSessionRole,
    };

    mockTenants = [...mockTenants, tenant];
    return tenant;
  }

  return handleResponse(apiClient.post(ENDPOINTS.TENANTS.CREATE, input));
}
