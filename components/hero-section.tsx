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
          alt="Luxury Home"
          fill
          className="object-cover"
          priority
        />
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.4 }}
          transition={{ duration: 1 }}
          className="absolute inset-0 bg-caribbean-900"
        />
      </div>

      {/* Content */}
      <div className="container mx-auto relative z-10 px-4">
        <div className="max-w-3xl text-white space-y-6">
          <FadeInView delay={0.2}>
            <h1 className="text-5xl md:text-6xl font-bold leading-tight">
              {t('title')}
            </h1>
          </FadeInView>

          <FadeInView delay={0.4}>
            <p className="text-xl md:text-2xl text-sand-100">
              {t('description')}
            </p>
          </FadeInView>

          {/* Search Bar */}
          <FadeInView delay={0.6}>
            <div className="flex flex-col md:flex-row gap-4 max-w-2xl bg-white/10 backdrop-blur-md p-4 rounded-lg border border-white/20">
              <div className="flex-1">
                <Input 
                  placeholder={t('searchPlaceholder')}
                  className="w-full h-12 bg-white/90 text-caribbean-900 placeholder:text-caribbean-500/70"
                />
              </div>
              <Button 
                className="h-12 px-8 bg-caribbean-600 hover:bg-caribbean-700 text-white transition-colors" 
                size="lg"
              >
                <Search className="mr-2 h-5 w-5" />
                {t('searchButton')}
              </Button>
            </div>
          </FadeInView>

          {/* Stats */}
          <div className="flex gap-8 pt-8 flex-wrap">
            <FadeInView delay={0.8}>
              <motion.div 
                className="bg-white/10 backdrop-blur-md p-4 rounded-lg border border-white/20"
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <p className="text-4xl font-bold text-sand-200">1000+</p>
                <p className="text-sand-100">{t('stats.properties')}</p>
              </motion.div>
            </FadeInView>

            <FadeInView delay={0.9}>
              <motion.div 
                className="bg-white/10 backdrop-blur-md p-4 rounded-lg border border-white/20"
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <p className="text-4xl font-bold text-sand-200">500+</p>
                <p className="text-sand-100">{t('stats.clients')}</p>
              </motion.div>
            </FadeInView>

            <FadeInView delay={1}>
              <motion.div 
                className="bg-white/10 backdrop-blur-md p-4 rounded-lg border border-white/20"
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <p className="text-4xl font-bold text-sand-200">50+</p>
                <p className="text-sand-100">{t('stats.locations')}</p>
              </motion.div>
            </FadeInView>
          </div>
        </div>
      </div>
    </div>
  );
}