"use client";

import { useState, useRef, useEffect } from "react";
import { motion, useScroll, useTransform, AnimatePresence, Variants } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Search, MapPin, Calendar, ArrowRight, Filter } from "lucide-react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import { usePropertySearch } from "@/hooks/usePropertySearch";
import WaveText from "./home/StandaloneWaveText";
import { PropertySearchBar } from "@/components/search/PropertySearchBar";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

export function HeroSection() {
  const t = useTranslations('HeroSection');
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);
  const [isAdvancedSearchOpen, setIsAdvancedSearchOpen] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [isRippling, setIsRippling] = useState(false);
  
  // Use our custom search hook
  const { 
    filters, 
    updateFilters, 
    handleSearch, 
    isSearching 
  } = usePropertySearch();

  // Animation control based on scroll position
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  });

  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const y = useTransform(scrollYProgress, [0, 0.5], [0, 50]);
  const scale = useTransform(scrollYProgress, [0, 0.5], [1, 1.1]);

  const handleWaveTextClick = () => {
    setIsRippling(true);
    setTimeout(() => {
      setIsRippling(false);
      setShowSearch(true);
    }, 1200); // Extended to allow for the enhanced ripple effect
  };

  // Automatically trigger ripple effect and show search form after 6 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!showSearch) {
        setIsRippling(true);
        setTimeout(() => {
          setIsRippling(false);
          setShowSearch(true);
        }, 1200); // Extended to match handleWaveTextClick
      }
    }, 6000); // 6 seconds

    return () => clearTimeout(timer);
  }, [showSearch]);

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

  // Enhanced ripple variants with staggered multiple ripples
  const ripple1Variants: Variants = {
    initial: {
      scale: 0,
      opacity: 0
    },
    animate: {
      scale: [0, 2.5],
      opacity: [0.7, 0],
      transition: {
        duration: 1.2,
        ease: [0.25, 0.1, 0.25, 1], // cubic-bezier for a more natural feel
      }
    }
  };

  const ripple2Variants: Variants = {
    initial: {
      scale: 0,
      opacity: 0
    },
    animate: {
      scale: [0, 2],
      opacity: [0.6, 0],
      transition: {
        delay: 0.15,
        duration: 1,
        ease: [0.25, 0.1, 0.25, 1],
      }
    }
  };

  const ripple3Variants: Variants = {
    initial: {
      scale: 0,
      opacity: 0
    },
    animate: {
      scale: [0, 1.5],
      opacity: [0.5, 0],
      transition: {
        delay: 0.3,
        duration: 0.8,
        ease: [0.25, 0.1, 0.25, 1],
      }
    }
  };

  const textGlowVariants: Variants = {
    initial: {
      textShadow: "0 0 0px rgba(255,255,255,0)",
    },
    animate: {
      textShadow: [
        "0 0 0px rgba(255,255,255,0)", 
        "0 0 15px rgba(255,255,255,0.8)",
        "0 0 0px rgba(255,255,255,0)"
      ],
      transition: {
        duration: 1.2,
        ease: "easeInOut",
      }
    }
  };

  return (
    <div ref={containerRef} className="relative min-h-screen w-full overflow-hidden">
      <motion.div
        style={{ opacity, y, scale }}
        className="absolute inset-0 z-0"
      >
        <video
          ref={videoRef}
          autoPlay
          loop
          muted
          playsInline
          onLoadedData={() => setIsVideoLoaded(true)}
          className="h-full w-full object-cover"
        >
          <source src="/hero-video.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-black/40" />
      </motion.div>

      <div className="relative z-10 flex min-h-screen items-center justify-center px-4">
        <div className="mx-auto max-w-5xl text-center">
          {!showSearch ? (
            <div 
              className="relative cursor-pointer" 
              onClick={handleWaveTextClick}
            >
              <motion.div
                variants={textGlowVariants}
                initial="initial"
                animate={isRippling ? "animate" : "initial"}
              >
                <WaveText text="CABARETE" />
              </motion.div>
              
              {isRippling && (
                <>
                  <motion.div
                    variants={ripple1Variants}
                    initial="initial"
                    animate="animate"
                    className="absolute inset-0 rounded-full bg-white/70 blur-sm"
                  />
                  <motion.div
                    variants={ripple2Variants}
                    initial="initial"
                    animate="animate"
                    className="absolute inset-0 rounded-full bg-blue-200/60 blur-[2px]"
                  />
                  <motion.div
                    variants={ripple3Variants}
                    initial="initial"
                    animate="animate"
                    className="absolute inset-0 rounded-full bg-white/50 blur-[1px]"
                  />
                </>
              )}
            </div>
          ) : (
            <AnimatePresence>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <motion.h1
                  variants={titleVariants}
                  initial="hidden"
                  animate="visible"
                  className="mb-6 text-4xl font-bold text-white md:text-5xl lg:text-6xl"
                >
                  {t('title')}
                </motion.h1>
                <div className="max-w-2xl mx-auto">
                  <PropertySearchBar />
                </div>
              </motion.div>
            </AnimatePresence>
          )}
        </div>
      </div>
    </div>
  );
}