import i18n from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import { initReactI18next } from 'react-i18next';

import commonEN from './en/common.json';
import commonET from './et/common.json';

void i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    debug: import.meta.env.DEV,
    fallbackLng: 'et',
    supportedLngs: ['et', 'en'],
    resources: {
      en: {
        common: commonEN,
      },
      et: {
        common: commonET,
      },
    },
    defaultNS: 'common',
  });

// changeLanguage('en')

export default i18n;
