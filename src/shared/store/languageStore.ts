import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Language } from '../i18n/translations';

const LANG_KEY = 'app_language';

interface LanguageState {
  language: Language;
  setLanguage: (lang: Language) => void;
  loadLanguage: () => Promise<void>;
}

export const useLanguageStore = create<LanguageState>((set) => ({
  language: 'zh',
  setLanguage: (lang) => {
    set({ language: lang });
    AsyncStorage.setItem(LANG_KEY, lang).catch(() => {});
  },
  loadLanguage: async () => {
    try {
      const stored = await AsyncStorage.getItem(LANG_KEY);
      if (stored === 'zh' || stored === 'ja' || stored === 'ko') {
        set({ language: stored });
      }
    } catch {}
  },
}));
