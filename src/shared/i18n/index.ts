export { TRANSLATIONS, zh, ja, ko } from './translations';
export type { Language, T } from './translations';

import { useLanguageStore } from '../store/languageStore';
import { TRANSLATIONS } from './translations';

export function useTranslation() {
  const language = useLanguageStore((s) => s.language);
  return TRANSLATIONS[language];
}
