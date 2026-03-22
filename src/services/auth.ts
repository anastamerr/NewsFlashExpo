import { apiClient, handleResponse } from './api';
import { ENDPOINTS } from '@/constants/api';
import type { TokenResponse, AuthUser, UserProfile, TenantOption } from '@/types/api';

const USE_MOCK_AUTH = true;
let mockSessionEmail = 'demo@newsflash.ai';
const MOCK_TENANTS: TenantOption[] = [
  {
    tenant_id: 'newsflash-demo',
    tenant_name: 'NewsFlash Demo Workspace',
    role: 'tenant-superuser',
  },
];

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
    return {
      id: 'user-demo',
      email: mockSessionEmail,
      name: 'Demo Analyst',
      role: 'tenant-superuser',
      persona: 'Asset Manager',
      tenant_id: tenantId,
      tenant_name: MOCK_TENANTS.find((tenant) => tenant.tenant_id === tenantId)?.tenant_name ?? 'NewsFlash Demo Workspace',
      capabilities: {
        can_manage_users: true,
        can_manage_sources: true,
        can_create_tenants: false,
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
    return MOCK_TENANTS;
  }

  return handleResponse(apiClient.get(ENDPOINTS.TENANTS.MEMBERSHIPS));
}
