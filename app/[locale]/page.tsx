import Image from "next/image";
import { setRequestLocale, getTranslations } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { locales, Locale } from '@/config/i18n';
import { Button } from "@/components/ui/button";
import { HeroSection } from "@/components/hero-section";
import { FeaturedProperties } from "@/components/featured-properties";
import { WhyChooseUs } from "@/components/why-choose-us";
import { FeaturedLocations } from "@/components/featured-locations";
import { LifestylePreview } from "@/components/lifestyle-preview";

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
      <FeaturedProperties />
      <WhyChooseUs />
      <LifestylePreview />
      <FeaturedLocations />
    </main>
  );
}
