import { apiClient, handleResponse } from './api';
import { ENDPOINTS } from '@/constants/api';
import type { Company } from '@/types/api';

export async function listCompanies(): Promise<Company[]> {
  return handleResponse(apiClient.get(ENDPOINTS.COMPANIES.LIST));
}

export async function getCompany(id: string): Promise<Company> {
  return handleResponse(apiClient.get(ENDPOINTS.COMPANIES.DETAIL(id)));
}
