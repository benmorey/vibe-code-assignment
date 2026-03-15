import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { AppSettings } from '@commander-stats/shared';

const SETTINGS_KEY = '@commander_stats/settings';

interface SettingsState extends AppSettings {
  isLoaded: boolean;
  loadSettings: () => Promise<void>;
  saveSettings: (settings: Partial<AppSettings>) => Promise<void>;
  setArchidektUsername: (username: string) => Promise<void>;
  setClaudeApiKey: (key: string) => Promise<void>;
}

const defaultSettings: AppSettings = {
  archidekt_username: '',
  claude_api_key: '',
  dark_mode: true,
};

export const useSettingsStore = create<SettingsState>((set, get) => ({
  ...defaultSettings,
  isLoaded: false,

  loadSettings: async () => {
    try {
      const stored = await AsyncStorage.getItem(SETTINGS_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as Partial<AppSettings>;
        set({ ...defaultSettings, ...parsed, isLoaded: true });
      } else {
        set({ isLoaded: true });
      }
    } catch (error) {
      console.error('Failed to load settings:', error);
      set({ isLoaded: true });
    }
  },

  saveSettings: async (newSettings: Partial<AppSettings>) => {
    const current = get();
    const updated: AppSettings = {
      archidekt_username: current.archidekt_username,
      claude_api_key: current.claude_api_key,
      dark_mode: current.dark_mode,
      ...newSettings,
    };
    set(updated);
    await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(updated));
  },

  setArchidektUsername: async (username: string) => {
    await get().saveSettings({ archidekt_username: username });
  },

  setClaudeApiKey: async (key: string) => {
    await get().saveSettings({ claude_api_key: key });
  },
}));
