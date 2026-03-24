import AsyncStorage from '@react-native-async-storage/async-storage';
import type { AlertPublic, Source, User } from '@/types/api';

const USERS_STORAGE_KEY = 'newsflash_admin_users';
const SOURCES_STORAGE_KEY = 'newsflash_admin_sources';
const SETTINGS_STORAGE_KEY = 'newsflash_admin_settings';
const ALERTS_STORAGE_KEY = 'newsflash_admin_alerts';

export type DeliveryChannel = 'push' | 'email' | 'in-app';
export type SeverityFilter = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';

export interface AdminSettings {
  profileName: string;
  profileEmail: string;
  persona: string;
  timezone: string;
  language: string;
  pushNotifications: boolean;
  crisisAlerts: boolean;
  dailyDigest: boolean;
  deliveryChannels: DeliveryChannel[];
  severityFilters: SeverityFilter[];
  sessionLock: boolean;
  biometricUnlock: boolean;
}

export interface ManagedAlert extends AlertPublic {
  companyFilters?: string[];
  deliveryChannels?: DeliveryChannel[];
  severityThreshold?: SeverityFilter;
}

async function readJson<T>(key: string, fallback: T): Promise<T> {
  try {
    const raw = await AsyncStorage.getItem(key);

    if (!raw) {
      return fallback;
    }

    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

async function writeJson<T>(key: string, value: T): Promise<void> {
  await AsyncStorage.setItem(key, JSON.stringify(value));
}

export function getStoredUsers(fallback: User[]) {
  return readJson<User[]>(USERS_STORAGE_KEY, fallback);
}

export function saveStoredUsers(users: User[]) {
  return writeJson(USERS_STORAGE_KEY, users);
}

export function getStoredSources(fallback: Source[]) {
  return readJson<Source[]>(SOURCES_STORAGE_KEY, fallback);
}

export function saveStoredSources(sources: Source[]) {
  return writeJson(SOURCES_STORAGE_KEY, sources);
}

export function getStoredAdminSettings(fallback: AdminSettings) {
  return readJson<AdminSettings>(SETTINGS_STORAGE_KEY, fallback);
}

export function saveStoredAdminSettings(settings: AdminSettings) {
  return writeJson(SETTINGS_STORAGE_KEY, settings);
}

export function getStoredAlerts(fallback: ManagedAlert[]) {
  return readJson<ManagedAlert[]>(ALERTS_STORAGE_KEY, fallback);
}

export function saveStoredAlerts(alerts: ManagedAlert[]) {
  return writeJson(ALERTS_STORAGE_KEY, alerts);
}
