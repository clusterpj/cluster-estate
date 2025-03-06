"use client";

import React from 'react';
import { PropertySearchBar } from '@/components/search/PropertySearchBar';
import { useTranslations } from 'next-intl';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface HeroSearchSectionProps {
  className?: string;
}

export function HeroSearchSection({ className }: HeroSearchSectionProps) {
  const t = useTranslations('HeroSection');

  return (
    <section className={cn("py-12 md:py-24 lg:py-32", className)}>
      <div className="container px-4 md:px-6">
        <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 items-center">
          <div className="flex flex-col justify-center space-y-4">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                {t('title')}
              </h1>
              <p className="text-gray-500 dark:text-gray-400 md:text-xl">
                {t('subtitle')}
              </p>
            </div>
            <div className="grid grid-cols-3 gap-4 mt-6">
              <div className="flex flex-col items-center text-center">
                <MapPin className="h-8 w-8 mb-2 text-primary" />
                <h3 className="font-medium">{t('features.location')}</h3>
              </div>
              <div className="flex flex-col items-center text-center">
                <Calendar className="h-8 w-8 mb-2 text-primary" />
                <h3 className="font-medium">{t('features.availability')}</h3>
              </div>
              <div className="flex flex-col items-center text-center">
                <Search className="h-8 w-8 mb-2 text-primary" />
                <h3 className="font-medium">{t('features.search')}</h3>
              </div>
            </div>
            <div className="mt-4">
              <Button variant="link" asChild className="p-0 h-auto">
                <a href="/properties">
                  {t('browseProperties')} <ArrowRight className="ml-2 h-4 w-4" />
                </a>
              </Button>
            </div>
          </div>
          <div className="mx-auto w-full max-w-md space-y-2">
            <PropertySearchBar />
          </div>
        </div>
      </div>
    </section>
  );
}

// Import these at the top of the file
function MapPin(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  );
}

function Search(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.3-4.3" />
    </svg>
  );
}

function Calendar(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
      <line x1="16" x2="16" y1="2" y2="6" />
      <line x1="8" x2="8" y1="2" y2="6" />
      <line x1="3" x2="21" y1="10" y2="10" />
    </svg>
  );
}
