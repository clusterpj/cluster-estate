import { setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { locales, Locale } from '@/config/i18n';
import { HeroSection } from "@/components/hero-section";
import { HeroSearchSection } from "@/components/home/HeroSearchSection";
import { FeaturedProperties } from "@/components/featured-properties";
import { LifestylePreview } from "@/components/lifestyle-preview";
import { Testimonials } from "@/components/testimonials";

type Props = {
  params: { locale: string }
}

export default function Home({ params: { locale } }: Props) {
  // Validate the locale
  if (!locales.includes(locale as Locale)) {
    return notFound();
  }
  
  setRequestLocale(locale);
  
  return (
    <main className="min-h-screen">
      <HeroSection />
      <HeroSearchSection />
      <FeaturedProperties />
      <Testimonials />
      <LifestylePreview />
    </main>
  );
}