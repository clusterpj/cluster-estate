export const SUPPORTED_LOCALES = {
  en: 'English',
  es: 'Español',
  fr: 'Français',
  de: 'Deutsch',
} as const;

export const locales = Object.keys(SUPPORTED_LOCALES) as Locale[];
export const defaultLocale = 'en' as const;

export type Locale = keyof typeof SUPPORTED_LOCALES;

export function isValidLocale(locale: string): locale is Locale {
  return locale in SUPPORTED_LOCALES;
}

export function getLocaleDisplayName(locale: Locale): string {
  return SUPPORTED_LOCALES[locale];
}
