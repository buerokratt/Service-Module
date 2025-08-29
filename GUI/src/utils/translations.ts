import i18n from '../i18n';

/**
 * Translation utility function for use outside React components
 * @param key - Translation key (e.g., 'common:some.key')
 * @param options - Translation options (interpolation, etc.)
 * @returns Translated string
 */
export const t = (key: string, options?: any): string => {
  return i18n.t(key, options);
};

/**
 * Get current language
 * @returns Current language code
 */
export const getCurrentLanguage = (): string => {
  return i18n.language;
};

/**
 * Change language
 * @param language - Language code to change to
 */
export const changeLanguage = (language: string): void => {
  i18n.changeLanguage(language);
};

/**
 * Check if a language is loaded
 * @param language - Language code to check
 * @returns True if language is loaded
 */
export const isLanguageLoaded = (language: string): boolean => {
  return i18n.hasResourceBundle(language, 'common');
};
