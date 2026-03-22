import { apiClient, handleResponse } from './api';
import { ENDPOINTS } from '@/constants/api';
import type { TokenResponse, AuthUser, UserProfile, TenantOption } from '@/types/api';

export async function login(email: string, password: string): Promise<TokenResponse> {
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
  return handleResponse(apiClient.get(ENDPOINTS.AUTH.ME));
}

export async function getProfile(tenantId: string): Promise<UserProfile> {
  return handleResponse(
    apiClient.get(ENDPOINTS.AUTH.PROFILE, {
      headers: { 'x-tenant-id': tenantId },
    }),
  );
}

export async function listTenants(): Promise<TenantOption[]> {
  return handleResponse(apiClient.get(ENDPOINTS.TENANTS.MEMBERSHIPS));
}
