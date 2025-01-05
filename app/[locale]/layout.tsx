import { notFound } from 'next/navigation';
import { NextIntlClientProvider } from 'next-intl';
import { locales, type Locale, isValidLocale } from '../../config/i18n';
import { Providers } from '@/components/providers/providers';
import { Footer } from '@/components/footer';
import { Header } from '@/components/header';

async function getMessages(locale: Locale) {
  try {
    // First try to load the requested locale
    let messages;
    try {
      messages = (await import(`../../messages/${locale}.json`)).default;
    } catch (error) {
      // If the locale file doesn't exist, fall back to English
      messages = (await import(`../../messages/en.json`)).default;
    }

    if (!messages) {
      throw new Error(`No messages found for locale: ${locale}`);
    }
    return messages;
  } catch (error) {
    console.error('Failed to load messages:', error);
    notFound();
  }
}

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params: { locale },
}: {
  children: React.ReactNode;
  params: { locale: Locale };
}) {
  if (!isValidLocale(locale)) {
    notFound();
  }

  const messages = await getMessages(locale);

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      <Providers>
        <Header />
        <main className="flex-1 w-full">
          {children}
        </main>
        <Footer />
      </Providers>
    </NextIntlClientProvider>
  );
}

// Prevent static rendering to ensure proper locale handling
export const dynamic = 'force-dynamic';
