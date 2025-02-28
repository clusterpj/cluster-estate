"use client";

import { useState, useRef, useEffect } from "react";
import { motion, useScroll, useTransform, AnimatePresence, Variants } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Search, MapPin, Calendar, ArrowRight } from "lucide-react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { cn } from "@/lib/utils";

// Import Variants type instead of defining our own interface
// Remove the AnimationVariants interface

export function HeroSection() {
  const t = useTranslations('HeroSection');
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);

  // Animation control based on scroll position
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  });

  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const y = useTransform(scrollYProgress, [0, 0.5], [0, 50]);
  const scale = useTransform(scrollYProgress, [0, 0.5], [1, 1.1]);

  // Animation variants
  const titleVariants: Variants = {
    hidden: { 
      opacity: 0,
      y: 20 
    },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        ease: "easeOut",
      }
    }
  };

  const subtitleVariants: Variants = {
    hidden: { 
      opacity: 0,
      y: 20 
    },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        delay: 0.2,
        ease: "easeOut",
      }
    }
  };

  const searchBarVariants: Variants = {
    hidden: { 
      opacity: 0,
      y: 30,
      scale: 0.95 
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.7,
        delay: 0.4,
        ease: "easeOut",
      }
    }
  };

  const featureItemVariants: Variants = {
    hidden: { 
      opacity: 0,
      x: -20 
    },
    visible: (custom: number) => ({
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.6,
        delay: 0.6 + (custom * 0.1),
        ease: "easeOut",
      }
    })
  };

  // Handle video loading
  useEffect(() => {
    const video = videoRef.current;
    if (video) {
      const handleLoaded = () => setIsVideoLoaded(true);
      
      // Check if video is already loaded
      if (video.readyState >= 3) {
        setIsVideoLoaded(true);
      } else {
        video.addEventListener('loadeddata', handleLoaded);
      }
      
      return () => {
        video.removeEventListener('loadeddata', handleLoaded);
      };
    }
  }, []);

  // Feature highlights
  const features = [
    { icon: <MapPin className="h-5 w-5" />, text: t('features.location') },
    { icon: <Calendar className="h-5 w-5" />, text: t('features.availability') },
    { icon: <Search className="h-5 w-5" />, text: t('features.search') },
  ];

  return (
    <div 
      ref={containerRef}
      className="relative min-h-[70vh] md:min-h-[70vh] lg:min-h-[80vh] flex items-center justify-center overflow-hidden"
      aria-label={t('ariaLabel')}
    >
      {/* Background Video with Overlay */}
      <div className="absolute inset-0 z-0">
        {/* Loading state - skeleton gradient */}
        <AnimatePresence>
          {!isVideoLoaded && (
            <motion.div 
              initial={{ opacity: 1 }}
              exit={{ opacity: 0, transition: { duration: 0.5 } }}
              className="absolute inset-0 bg-gradient-to-b from-caribbean-900 to-caribbean-700 animate-pulse"
            />
          )}
        </AnimatePresence>
        
        <motion.div 
          style={{ scale, opacity }}
          className="absolute inset-0"
        >
          <video
            ref={videoRef}
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
            className={cn(
              "absolute inset-0 w-full h-full object-cover transition-opacity duration-700",
              isVideoLoaded ? "opacity-100" : "opacity-0"
            )}
            aria-hidden="true"
          >
            <source src="/hero-video.mp4" type="video/mp4" />
          </video>
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/70" />
        </motion.div>
      </div>

      {/* Content */}
      <motion.div 
        style={{ y }}
        className="z-10 px-6 md:px-8 container relative text-center py-8 md:py-10"
      >
        <motion.h1 
          variants={titleVariants}
          initial="hidden"
          animate="visible"
          className="text-3xl md:text-4xl lg:text-6xl font-bold text-white mb-3 tracking-tight [text-shadow:_0_2px_12px_rgba(0,0,0,0.4)]"
        >
          {t('title')}
        </motion.h1>
        
        <motion.p 
          variants={subtitleVariants}
          initial="hidden"
          animate="visible"
          className="text-lg md:text-xl text-white/90 mb-6 max-w-2xl mx-auto font-light [text-shadow:_0_2px_8px_rgba(0,0,0,0.3)]"
        >
          {t('subtitle')}
        </motion.p>

        {/* Search Bar */}
        <motion.div
          variants={searchBarVariants}
          initial="hidden"
          animate="visible"
          className="bg-white/10 backdrop-blur-md p-2 md:p-3 rounded-xl max-w-3xl mx-auto mb-7 border border-white/20 shadow-xl"
        >
          <div className="flex flex-col md:flex-row gap-2 md:gap-4">
            <div className="relative flex-grow rounded-lg bg-white/90 dark:bg-caribbean-900/90 overflow-hidden">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-caribbean-600 dark:text-caribbean-400" />
              <input 
                type="text"
                placeholder={t('search.locationPlaceholder')}
                className="w-full py-3 pl-10 pr-4 bg-transparent text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-caribbean-500 focus:ring-opacity-50"
                aria-label={t('search.locationAriaLabel')}
              />
            </div>
            <div className="relative flex-grow rounded-lg bg-white/90 dark:bg-caribbean-900/90 overflow-hidden">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-caribbean-600 dark:text-caribbean-400" />
              <input 
                type="text"
                placeholder={t('search.datePlaceholder')}
                className="w-full py-3 pl-10 pr-4 bg-transparent text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-caribbean-500 focus:ring-opacity-50"
                aria-label={t('search.dateAriaLabel')}
              />
            </div>
            <Button 
              className="bg-caribbean-600 hover:bg-caribbean-700 text-white font-medium px-6 shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-2 h-12"
            >
              <Search className="h-4 w-4" />
              <span>{t('search.button')}</span>
            </Button>
          </div>
        </motion.div>

        {/* Feature Highlights */}
        <div className="max-w-3xl mx-auto flex flex-wrap justify-center gap-3 md:gap-5 mb-6">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              custom={index}
              variants={featureItemVariants}
              initial="hidden"
              animate="visible"
              className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full border border-white/10"
            >
              <div className="text-white/80">{feature.icon}</div>
              <span className="text-white/90 text-sm md:text-base">{feature.text}</span>
            </motion.div>
          ))}
        </div>

        {/* Browse Properties CTA Button - only visible on larger screens */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1, duration: 0.6 }}
          className="hidden md:block"
        >
          <Link href="#featured-properties">
            <Button 
              variant="ghost" 
              className="text-white/80 hover:text-white hover:bg-white/10 group"
              aria-label={t('browsePropertiesAriaLabel')}
            >
              {t('browseProperties')}
              <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </motion.div>
      </motion.div>
    </div>
  );
}