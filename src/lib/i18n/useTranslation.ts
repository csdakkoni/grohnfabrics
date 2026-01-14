'use client';

import { useMarket } from '@/lib/market/context';
import { translations, TranslationKey, Locale } from './translations';

export function useTranslation() {
  const { locale } = useMarket();
  
  const t = (key: TranslationKey): string => {
    const currentLocale = (locale || 'tr') as Locale;
    return translations[currentLocale]?.[key] || translations.tr[key] || key;
  };
  
  return { t, locale };
}
