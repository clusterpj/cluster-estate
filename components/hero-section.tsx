"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import Image from "next/image";
import { motion } from "framer-motion";
import { FadeInView } from "./animations/fade-in-view";
import { useTranslations } from 'next-intl';

export function HeroSection() {
  const t = useTranslations('Hero');
  
  return (
    <div className="relative min-h-[85vh] flex items-center">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/hero-bg.jpg"
          alt={t('backgroundAlt')}
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-black/40" />
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 z-10">
        <FadeInView>
          <div className="max-w-3xl">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-4xl md:text-6xl font-bold text-white mb-6"
            >
              {t('title')}
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-xl md:text-2xl text-white/90 mb-8"
            >
              {t('subtitle')}
            </motion.p>

            {/* Search Box */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="flex gap-2 max-w-2xl bg-white/10 backdrop-blur-md p-2 rounded-lg"
            >
              <Input
                type="text"
                placeholder={t('searchPlaceholder')}
                className="flex-1 bg-white/80"
              />
              <Button size="lg">
                <Search className="mr-2 h-5 w-5" />
                {t('searchButton')}
              </Button>
            </motion.div>
          </div>
        </FadeInView>
      </div>
    </div>
  );
}
