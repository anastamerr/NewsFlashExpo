import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';

const TOKEN_KEY = 'newsflash-token';
const TENANT_KEY = 'newsflash-tenant-id';

export async function loadStoredSession() {
  const [token, tenantId] = await Promise.all([
    SecureStore.getItemAsync(TOKEN_KEY),
    AsyncStorage.getItem(TENANT_KEY),
  ]);

  return {
    token,
    tenantId,
  };
}

export async function persistToken(token: string) {
  await SecureStore.setItemAsync(TOKEN_KEY, token);
}

export async function clearToken() {
  await SecureStore.deleteItemAsync(TOKEN_KEY);
}

export async function persistTenantId(tenantId: string) {
  await AsyncStorage.setItem(TENANT_KEY, tenantId);
}

export async function clearTenantId() {
  await AsyncStorage.removeItem(TENANT_KEY);
}

export async function clearStoredSession() {
  await Promise.all([clearToken(), clearTenantId()]);
}
