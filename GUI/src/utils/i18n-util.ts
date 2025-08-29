import { t } from 'i18next';

/**
 * Translates object keys using a translation path
 * @param obj - The object whose keys should be translated
 * @param translationPath - The translation path (e.g., 'chat.service-test-error')
 * @returns Object with translated keys
 */
export function translateObjectKeys<T extends Record<string, any>>(
  obj: T,
  translationPath: string,
): Record<string, any> {
  const translation = t(translationPath, { returnObjects: true });

  return Object.fromEntries(
    Object.entries(obj).map(([key, value]) => [translation[key as keyof typeof translation] || key, value]),
  );
}
