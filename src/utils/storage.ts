import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';

const TOKEN_KEY = 'newsflash_token';
const TENANT_KEY = 'newsflash_tenant_id';

export async function getToken(): Promise<string | null> {
  try {
    return await SecureStore.getItemAsync(TOKEN_KEY);
  } catch {
    return null;
  }
}

export async function setToken(token: string): Promise<void> {
  await SecureStore.setItemAsync(TOKEN_KEY, token);
}

export async function removeToken(): Promise<void> {
  await SecureStore.deleteItemAsync(TOKEN_KEY);
}

export async function getTenantId(): Promise<string | null> {
  try {
    return await AsyncStorage.getItem(TENANT_KEY);
  } catch {
    return null;
  }
}

export async function setTenantId(id: string): Promise<void> {
  await AsyncStorage.setItem(TENANT_KEY, id);
}

export async function removeTenantId(): Promise<void> {
  await AsyncStorage.removeItem(TENANT_KEY);
}

export async function clearAll(): Promise<void> {
  await Promise.all([removeToken(), removeTenantId()]);
}
