import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';

const TOKEN_KEY = 'newsflash_token';
const TENANT_KEY = 'newsflash_tenant_id';
const TOKEN_FALLBACK_KEY = 'newsflash_token_fallback';
const REMEMBER_SESSION_KEY = 'newsflash_remember_session';
let volatileToken: string | null = null;

async function canUseSecureStore() {
  try {
    return (
      typeof SecureStore.getItemAsync === 'function' &&
      typeof SecureStore.setItemAsync === 'function' &&
      typeof SecureStore.deleteItemAsync === 'function' &&
      await SecureStore.isAvailableAsync()
    );
  } catch {
    return false;
  }
}

export async function getToken(): Promise<string | null> {
  try {
    if (await canUseSecureStore()) {
      return await SecureStore.getItemAsync(TOKEN_KEY) ?? volatileToken;
    }

    return await AsyncStorage.getItem(TOKEN_FALLBACK_KEY) ?? volatileToken;
  } catch {
    return volatileToken;
  }
}

export async function setToken(token: string): Promise<void> {
  volatileToken = token;

  if (await canUseSecureStore()) {
    await SecureStore.setItemAsync(TOKEN_KEY, token);
    await AsyncStorage.removeItem(TOKEN_FALLBACK_KEY);
    return;
  }

  await AsyncStorage.setItem(TOKEN_FALLBACK_KEY, token);
}

export async function removeToken(): Promise<void> {
  volatileToken = null;
  await clearPersistedToken();
}

export async function clearPersistedToken(): Promise<void> {
  if (await canUseSecureStore()) {
    await SecureStore.deleteItemAsync(TOKEN_KEY);
  }

  await AsyncStorage.removeItem(TOKEN_FALLBACK_KEY);
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
  await Promise.all([removeToken(), removeTenantId(), removeRememberSession()]);
}

export function setVolatileToken(token: string | null): void {
  volatileToken = token;
}

export async function getRememberSession(): Promise<boolean> {
  try {
    return (await AsyncStorage.getItem(REMEMBER_SESSION_KEY)) === 'true';
  } catch {
    return false;
  }
}

export async function setRememberSession(value: boolean): Promise<void> {
  await AsyncStorage.setItem(REMEMBER_SESSION_KEY, value ? 'true' : 'false');
}

export async function removeRememberSession(): Promise<void> {
  await AsyncStorage.removeItem(REMEMBER_SESSION_KEY);
}
