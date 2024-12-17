import { notFound } from 'next/navigation';
import { NextIntlClientProvider } from 'next-intl';
import { locales, type Locale } from '../../config/i18n';
import { ThemeProvider } from '../../components/theme-provider';
import { AuthProvider } from '../../components/providers/auth-provider';
import { Footer } from '../../components/footer';
import { Header } from '../../components/header';
import { Toaster } from '@/components/ui/toaster';

async function getMessages(locale: Locale) {
  try {
    return (await import(`../../messages/${locale}.json`)).default;
  } catch {
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
  // Validate locale
  if (!locales.includes(locale)) {
    notFound();
  }

  const messages = await getMessages(locale);

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
      >
        <AuthProvider>
          <div className="min-h-screen flex flex-col antialiased">
            <Header />
            <main className="flex-1 w-full">
              {children}
            </main>
            <Footer />
            <Toaster />
          </div>
        </AuthProvider>
      </ThemeProvider>
    </NextIntlClientProvider>
  );
}

// Prevent static rendering to ensure proper locale handling
export const dynamic = 'force-dynamic';
