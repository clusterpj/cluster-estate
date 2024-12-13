"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Image from "next/image";
import { useTranslations } from "next-intl";

const WavesIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className="h-8 w-8"
  >
    <path
      d="M2 12C2 12 5.5 7 12 7C18.5 7 22 12 22 12"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />
    <path
      d="M2 17C2 17 5.5 12 12 12C18.5 12 22 17 22 17"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />
  </svg>
);

const SunIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className="h-8 w-8"
  >
    <circle cx="12" cy="12" r="5" stroke="currentColor" strokeWidth="2" />
    <path
      d="M12 2V4M12 20V22M2 12H4M20 12H22M4.93 4.93L6.34 6.34M17.66 17.66L19.07 19.07M4.93 19.07L6.34 17.66M17.66 6.34L19.07 4.93"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />
  </svg>
);

const PalmIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className="h-8 w-8"
  >
    <path
      d="M12 2C12 2 8 6 8 12M12 2C12 2 16 6 16 12M12 2V22M8 12C8 12 12 14 16 12"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />
  </svg>
);

const AnchorIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className="h-8 w-8"
  >
    <circle
      cx="12"
      cy="6"
      r="2"
      stroke="currentColor"
      strokeWidth="2"
    />
    <path
      d="M12 8V22M12 22L6 16M12 22L18 16M4 12H20"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />
  </svg>
);

export function LifestylePreview() {
  const t = useTranslations('ParadiseLiving');
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });

  const y = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.5, 1], [1, 0.8, 0]);

  const lifestyleFeatures = [
    {
      icon: <WavesIcon />,
      title: t('features.beachfront.title'),
      description: t('features.beachfront.description'),
    },
    {
      icon: <SunIcon />,
      title: t('features.climate.title'),
      description: t('features.climate.description'),
    },
    {
      icon: <PalmIcon />,
      title: t('features.culture.title'),
      description: t('features.culture.description'),
    },
    {
      icon: <AnchorIcon />,
      title: t('features.activities.title'),
      description: t('features.activities.description'),
    },
  ];

  return (
    <section
      ref={containerRef}
      className="relative min-h-screen w-full overflow-hidden bg-background py-24 dark:bg-[#001219]"
    >
      <div className="container relative z-10 mx-auto px-4">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="mb-4 text-4xl font-bold tracking-tight sm:text-5xl">
            {t('title')}
          </h2>
          <p className="text-muted-foreground">
            {t('subtitle')}
          </p>
        </div>

        <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {lifestyleFeatures.map((feature, index) => (
            <Card
              key={index}
              className="relative overflow-hidden bg-card/50 p-6 backdrop-blur-sm"
            >
              <div className="mb-4 text-primary">{feature.icon}</div>
              <h3 className="mb-2 text-xl font-semibold">{feature.title}</h3>
              <p className="text-sm text-muted-foreground">
                {feature.description}
              </p>
            </Card>
          ))}
        </div>

        <div className="relative mt-24 overflow-hidden rounded-lg bg-[url('/images/beach-path.jpg')] bg-cover bg-center bg-no-repeat p-8 text-white shadow-lg md:p-16">
          <div className="relative z-10 mx-auto max-w-3xl text-center">
            <h3 className="mb-4 text-3xl font-bold md:text-4xl">
              {t('cta.title')}
            </h3>
            <p className="mb-8 text-lg text-white/90">
              {t('cta.description')}
            </p>
            <Button size="lg" variant="default">
              {t('cta.button')}
            </Button>
          </div>
          <div className="absolute inset-0 bg-black/40" />
        </div>
      </div>

      <motion.div
        style={{ y, opacity }}
        className="pointer-events-none absolute inset-0 z-0"
      >
        <Image
          src="/images/lifestyle-bg.jpg"
          alt="Lifestyle background"
          fill
          className="object-cover"
          priority
        />
      </motion.div>
    </section>
  );
}
