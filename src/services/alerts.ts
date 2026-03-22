import { apiClient, handleResponse } from './api';
import { ENDPOINTS } from '@/constants/api';
import type { AlertPublic, AlertCreateInput, AlertUpdateInput } from '@/types/api';

export async function listAlerts(): Promise<AlertPublic[]> {
  return handleResponse(apiClient.get(ENDPOINTS.ALERTS.LIST));
}

export async function createAlert(input: AlertCreateInput): Promise<AlertPublic> {
  return handleResponse(apiClient.post(ENDPOINTS.ALERTS.CREATE, input));
}

export async function updateAlert(id: string, input: AlertUpdateInput): Promise<AlertPublic> {
  return handleResponse(apiClient.patch(ENDPOINTS.ALERTS.UPDATE(id), input));
}

export async function deleteAlert(id: string): Promise<void> {
  return handleResponse(apiClient.delete(ENDPOINTS.ALERTS.DELETE(id)));
}
