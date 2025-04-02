"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface PropertyImageSliderProps {
  images: string[];
  title: string;
  className?: string;
}

export function PropertyImageSlider({ images, title, className }: PropertyImageSliderProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  const handlePrev = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentImageIndex(prev => (prev - 1 + images.length) % images.length);
  }, [images.length]);

  const handleNext = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentImageIndex(prev => (prev + 1) % images.length);
  }, [images.length]);

  // Prevent any clicks within the slider from bubbling up
  const handleSliderClick = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleMouseEnter = useCallback(() => {
    setIsHovered(true);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setIsHovered(false);
  }, []);

  return (
    <div
      className={cn("relative w-full h-full aspect-[4/3] overflow-hidden group", className)}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={handleSliderClick}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={currentImageIndex}
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.3 }}
          className="absolute inset-0"
        >
          <Image
            src={images[currentImageIndex]}
            alt={`${title} - Image ${currentImageIndex + 1}`}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            priority={currentImageIndex === 0}
            loading={currentImageIndex === 0 ? "eager" : "lazy"}
          />
        </motion.div>
      </AnimatePresence>
      
      {/* Navigation arrows with larger click targets */}
      {images.length > 1 && isHovered && (
        <>
          <button
            onClick={handlePrev}
            className="absolute left-0 top-0 bottom-0 w-1/4 max-w-20 flex items-center justify-start pl-2 z-20"
            aria-label="Previous image"
          >
            <div className="bg-black/50 hover:bg-black/70 text-white p-3 rounded-full transition-all">
              <ChevronLeft className="h-6 w-6" />
            </div>
          </button>
          <button
            onClick={handleNext}
            className="absolute right-0 top-0 bottom-0 w-1/4 max-w-20 flex items-center justify-end pr-2 z-20"
            aria-label="Next image"
          >
            <div className="bg-black/50 hover:bg-black/70 text-white p-3 rounded-full transition-all">
              <ChevronRight className="h-6 w-6" />
            </div>
          </button>
        </>
      )}
      
      {/* Enhanced image counter */}
      {images.length > 1 && (
        <div className="absolute bottom-2 right-2 bg-black/70 hover:bg-black/80 rounded-full px-3 py-1 text-sm text-white flex items-center gap-1 transition-all">
          <span className="font-medium">{currentImageIndex + 1}</span>
          <span className="text-muted-foreground">/</span>
          <span>{images.length}</span>
        </div>
      )}
    </div>
  );
}