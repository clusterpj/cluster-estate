"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Image from "next/image";

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

const lifestyleFeatures = [
  {
    icon: <WavesIcon />,
    title: "Beachfront Living",
    description: "Wake up to the sound of waves and stunning ocean views",
  },
  {
    icon: <SunIcon />,
    title: "Perfect Climate",
    description: "Enjoy year-round sunshine and tropical breezes",
  },
  {
    icon: <PalmIcon />,
    title: "Island Culture",
    description: "Immerse yourself in the vibrant Caribbean lifestyle",
  },
  {
    icon: <AnchorIcon />,
    title: "Water Activities",
    description: "Access to world-class sailing, diving, and water sports",
  },
];

export function LifestylePreview() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });

  const y = useTransform(scrollYProgress, [0, 1], [100, -100]);
  const opacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0, 1, 1, 0]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
      },
      { threshold: 0.1 }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <section 
      ref={containerRef}
      className="relative min-h-screen overflow-hidden bg-gradient-to-b from-caribbean-900 to-caribbean-700 dark:from-caribbean-950 dark:to-caribbean-900"
    >
      {/* Parallax Background */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute inset-0 bg-repeat opacity-10" style={{ backgroundImage: 'url("/pattern.svg")' }} />
      </div>

      {/* Content */}
      <div className="relative container mx-auto px-4 py-24">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 50 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Experience Paradise Living
          </h2>
          <p className="text-xl text-caribbean-100 max-w-2xl mx-auto">
            Discover a lifestyle where luxury meets tropical paradise
          </p>
        </motion.div>

        {/* Interactive Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {lifestyleFeatures.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 30 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Card className="relative overflow-hidden group h-full bg-white/10 backdrop-blur-sm border-white/20 hover:bg-white/20 transition-all duration-300">
                <div className="p-6 text-center">
                  <div className="mb-4 text-caribbean-300 group-hover:text-caribbean-200 transition-colors duration-300">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-caribbean-200">
                    {feature.description}
                  </p>
                </div>
                <div className="absolute inset-0 border-2 border-transparent group-hover:border-caribbean-400/30 rounded-lg transition-all duration-300" />
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Parallax Images */}
        <div className="relative h-[600px] rounded-xl overflow-hidden">
          <motion.div
            style={{ y }}
            className="absolute inset-0"
          >
            <Image
              src="/lifestyle-hero.jpg"
              alt="Caribbean Lifestyle"
              fill
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-caribbean-900 to-transparent" />
          </motion.div>

          {/* Floating Content */}
          <motion.div
            style={{ opacity }}
            className="relative h-full flex items-center justify-center"
          >
            <div className="text-center p-8 backdrop-blur-sm bg-black/30 rounded-xl max-w-2xl">
              <h3 className="text-3xl font-bold text-white mb-4">
                Your Dream Home Awaits
              </h3>
              <p className="text-caribbean-100 mb-6">
                Let us help you find your perfect piece of paradise in the Caribbean
              </p>
              <Button 
                size="lg"
                className="bg-caribbean-500 hover:bg-caribbean-600 text-white"
              >
                Start Your Journey
              </Button>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Decorative Wave */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg
          viewBox="0 0 1440 120"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-auto"
        >
          <path
            d="M0 0L48 8C96 16 192 32 288 37.3C384 43 480 37 576 32C672 27 768 21 864 24.7C960 27 1056 37 1152 40.3C1248 43 1344 37 1392 34.7L1440 32V120H1392C1344 120 1248 120 1152 120C1056 120 960 120 864 120C768 120 672 120 576 120C480 120 384 120 288 120C192 120 96 120 48 120H0V0Z"
            fill="currentColor"
            className="text-background"
          />
        </svg>
      </div>
    </section>
  );
}
