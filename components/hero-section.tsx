"use client";

import { motion } from "framer-motion";
import { FadeInView } from "./animations/fade-in-view";

export function HeroSection() {
  const letters = "CABARETE".split("");
  
  const container = {
    hidden: { opacity: 0, scale: 0.8 },
    show: {
      opacity: 1,
      scale: 1,
      transition: {
        staggerChildren: 0.05,
        delayChildren: 0.1,
        ease: "easeInOut",
        duration: 0.8,
      },
    },
  };

  const child = {
    hidden: { opacity: 0.3, scale: 0.8 },
    show: {
      opacity: [0.3, 1, 0.3],
      scale: [1, 1.2, 1],
      y: [0, -10, 0],
      rotate: [-1, 1, -1],
      transition: {
        opacity: {
          repeat: Infinity,
          duration: 6,
          ease: "easeInOut",
          times: [0, 0.5, 1],
        },
        scale: {
          repeat: Infinity,
          duration: 6,
          ease: "easeInOut",
          times: [0, 0.5, 1],
        },
        y: {
          repeat: Infinity,
          duration: 2.5,
          ease: "easeInOut",
          repeatType: "reverse",
        },
        rotate: {
          repeat: Infinity,
          duration: 3.5,
          ease: "easeInOut",
          repeatType: "reverse",
        },
      },
    },
  };

  return (
    <div className="relative min-h-[60vh] sm:min-h-[70vh] md:min-h-[85vh] flex items-center justify-center overflow-hidden">
      {/* Background Video with Overlay */}
      <div className="absolute inset-0 z-0">
        <video
          autoPlay
          muted
          loop
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
        >
          <source src="/hero-video.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-black/40" />
      </div>

      {/* Content */}
      <div className="z-10 px-4 w-full">
        <FadeInView>
          <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="flex justify-center flex-wrap gap-1 sm:gap-1.5 md:gap-2"
          >
            {letters.map((letter, index) => (
              <motion.span
                key={index}
                variants={child}
                className="text-4xl sm:text-6xl md:text-8xl lg:text-[12rem] font-extrabold text-white/40 tracking-wider
                  hover:text-white/60 transition-colors duration-300
                  [text-shadow:_0_4px_24px_rgba(255,255,255,0.2)]
                  relative
                  after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-full after:h-[2px] sm:after:h-1 
                  after:bg-gradient-to-r after:from-transparent after:via-white/40 after:to-transparent
                  after:opacity-0 hover:after:opacity-100 after:transition-opacity after:duration-300"
              >
                {letter}
              </motion.span>
            ))}
          </motion.div>
        </FadeInView>
      </div>

      {/* Animated Wave Overlay */}
      <motion.div
        className="absolute inset-0 z-[5] opacity-30"
        style={{
          background: 'linear-gradient(180deg, transparent 0%, rgba(255,255,255,0.1) 100%)',
        }}
        animate={{
          y: [0, -5, 0],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
    </div>
  );
}
