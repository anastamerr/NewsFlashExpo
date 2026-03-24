import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';

const TOKEN_KEY = 'newsflash_token';
const TENANT_KEY = 'newsflash_tenant_id';
const TOKEN_FALLBACK_KEY = 'newsflash_token_fallback';

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
      return await SecureStore.getItemAsync(TOKEN_KEY);
    }

    return await AsyncStorage.getItem(TOKEN_FALLBACK_KEY);
  } catch {
    return null;
  }
}

export async function setToken(token: string): Promise<void> {
  if (await canUseSecureStore()) {
    await SecureStore.setItemAsync(TOKEN_KEY, token);
    await AsyncStorage.removeItem(TOKEN_FALLBACK_KEY);
    return;
  }

  await AsyncStorage.setItem(TOKEN_FALLBACK_KEY, token);
}

export async function removeToken(): Promise<void> {
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
  await Promise.all([removeToken(), removeTenantId()]);
}
