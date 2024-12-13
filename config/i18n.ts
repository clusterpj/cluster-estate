export const locales = ['en', 'es', 'fr', 'de'] as const;
export const defaultLocale = 'en' as const;

export type Locale = (typeof locales)[number];
