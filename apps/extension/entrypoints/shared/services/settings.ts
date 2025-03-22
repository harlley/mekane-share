import browser from 'webextension-polyfill';
import { logger } from './logger';

export interface ExtensionSettings {
  serverBaseUrl: string;
}

// Get the default server URL from environment variables, fallback to localhost for development
const DEFAULT_SERVER_URL =
  import.meta.env.SERVER_URL || 'http://localhost:8787';

const DEFAULT_SETTINGS: ExtensionSettings = {
  serverBaseUrl: DEFAULT_SERVER_URL,
};

/**
 * Gets all settings
 */
export async function getSettings(): Promise<ExtensionSettings> {
  try {
    const result = await browser.storage.sync.get('settings');
    return (result.settings as ExtensionSettings) || DEFAULT_SETTINGS;
  } catch (error) {
    logger.error('Error getting settings:', error);
    return DEFAULT_SETTINGS;
  }
}

/**
 * Gets a specific setting by key
 */
export async function getSetting<K extends keyof ExtensionSettings>(
  key: K
): Promise<ExtensionSettings[K]> {
  const settings = await getSettings();
  return settings[key];
}

/**
 * Updates a specific setting
 */
export async function updateSetting<K extends keyof ExtensionSettings>(
  key: K,
  value: ExtensionSettings[K]
): Promise<void> {
  try {
    const settings = await getSettings();
    const updatedSettings = { ...settings, [key]: value };
    await browser.storage.sync.set({ settings: updatedSettings });
    logger.log(`Setting ${key} updated:`, value);
  } catch (error) {
    logger.error(`Error updating setting ${key}:`, error);
  }
}

/**
 * Resets all settings to default
 */
export async function resetSettings(): Promise<void> {
  try {
    await browser.storage.sync.set({ settings: DEFAULT_SETTINGS });
    logger.log('Settings reset to default');
  } catch (error) {
    logger.error('Error resetting settings:', error);
  }
}

/**
 * Gets the server base URL
 */
export async function getServerBaseUrl(): Promise<string> {
  return getSetting('serverBaseUrl');
}

/**
 * Updates the server base URL
 */
export async function updateServerBaseUrl(url: string): Promise<void> {
  // Normalize the URL - remove trailing slashes
  let normalizedUrl = url.trim();

  // Remove trailing slashes
  while (normalizedUrl.endsWith('/')) {
    normalizedUrl = normalizedUrl.slice(0, -1);
  }

  // Remove /upload if it exists at the end
  if (normalizedUrl.endsWith('/upload')) {
    normalizedUrl = normalizedUrl.slice(0, -7);
  }

  return updateSetting('serverBaseUrl', normalizedUrl);
}

/**
 * Gets the full upload URL (base + /upload)
 */
export async function getUploadUrl(): Promise<string> {
  const baseUrl = await getServerBaseUrl();
  return `${baseUrl}/upload`;
}
