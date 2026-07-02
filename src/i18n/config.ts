import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// 翻訳リソース
import venueJa from './locales/ja/venue.json';
import venueEn from './locales/en/venue.json';
import checklistJa from './locales/ja/checklist.json';
import checklistEn from './locales/en/checklist.json';
import commonJa from './locales/ja/common.json';
import commonEn from './locales/en/common.json';

// ローカルストレージから言語設定を取得
const getStoredLanguage = (): string => {
  if (typeof window === 'undefined') return 'ja';
  return localStorage.getItem('reol-language') || 'ja';
};

i18n
  .use(initReactI18next)
  .init({
    resources: {
      ja: {
        venue: venueJa,
        checklist: checklistJa,
        common: commonJa,
      },
      en: {
        venue: venueEn,
        checklist: checklistEn,
        common: commonEn,
      },
    },
    lng: getStoredLanguage(),
    fallbackLng: 'ja',
    interpolation: {
      escapeValue: false,
    },
    react: {
      useSuspense: false,
    },
  });

export default i18n;
