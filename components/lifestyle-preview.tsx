"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Image from "next/image";

const WavesIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className="h-12 w-12 transition-transform duration-300 group-hover:scale-110 sm:h-14 sm:w-14 md:h-16 md:w-16"
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
    className="h-12 w-12 transition-transform duration-300 group-hover:scale-110 sm:h-14 sm:w-14 md:h-16 md:w-16"
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
    className="h-12 w-12 transition-transform duration-300 group-hover:scale-110 sm:h-14 sm:w-14 md:h-16 md:w-16"
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
    className="h-12 w-12 transition-transform duration-300 group-hover:scale-110 sm:h-14 sm:w-14 md:h-16 md:w-16"
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
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start center", "end center"],
  });

  const y = useTransform(scrollYProgress, [0, 1], ["0%", "15%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.5, 1], [1, 0.8, 0.6]);

  const lifestyleFeatures = [
    {
      icon: <WavesIcon />,
      title: "World-Class Kitesurfing",
      description: "Experience some of the best kitesurfing conditions in the Caribbean with consistent trade winds and warm waters.",
    },
    {
      icon: <SunIcon />,
      title: "Perfect Climate",
      description: "Enjoy year-round tropical weather with average temperatures of 25-30°C (77-86°F) and refreshing ocean breezes.",
    },
    {
      icon: <PalmIcon />,
      title: "Beach Town Charm",
      description: "Immerse yourself in Cabarete's unique blend of Dominican culture, international influences, and laid-back beach lifestyle.",
    },
    {
      icon: <AnchorIcon />,
      title: "Adventure Paradise",
      description: "From surfing and windsurfing to mountain biking and canyoning, Cabarete is the adventure capital of the Caribbean.",
    },
  ];

  return (
    <section
      ref={containerRef}
      className="relative min-h-screen w-full overflow-hidden bg-background/80 backdrop-blur-sm dark:bg-[#001219]/80 selection:bg-[#1E88E5]/30 selection:text-white"
    >
      {/* Background Image with Parallax */}
      <motion.div
        style={{ y, opacity }}
        className="pointer-events-none absolute inset-0 z-0"
      >
        <Image
          src="/lifestyle-hero.jpg"
          alt="Lifestyle background"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[rgba(0,42,78,0.4)] to-[rgba(0,42,78,0.15)]" />
      </motion.div>

      {/* Content Container */}
      <div className="container relative z-10 mx-auto flex min-h-screen flex-col items-center justify-center px-4 py-16">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="mb-6 font-serif text-5xl font-extrabold tracking-tight text-sand-100 drop-shadow-[0_2px_4px_rgba(0,0,0,0.3)] sm:text-6xl md:text-7xl"
            style={{ textShadow: '2px 4px 4px rgba(0,0,0,0.3)' }}
          >
            Experience Cabarete Living
          </h2>
          <p className="text-xl leading-relaxed text-caribbean-100 drop-shadow-md md:text-2xl">
            Discover life in the adventure capital of the Caribbean
          </p>
        </div>

        <div className="mt-20 grid w-full max-w-7xl gap-8 px-4 sm:grid-cols-2 lg:grid-cols-4">
          {lifestyleFeatures.map((feature, index) => (
            <Card
              key={index}
              className="group relative overflow-hidden rounded-xl border border-white/10 bg-white/5 p-8 backdrop-blur-md transition-all duration-500 hover:translate-y-[-4px] hover:bg-white/10 hover:shadow-lg hover:shadow-black/20 focus-within:outline focus-within:outline-2 focus-within:outline-white/20"
              style={{
                borderBottom: '2px solid #1E88E5',
                boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
              }}
            >
              <div className="mb-6 text-[#1E88E5] transition-transform duration-300 group-hover:scale-110 group-hover:drop-shadow-glow">
                {feature.icon}
              </div>
              <h3 className="mb-3 text-[22px] font-semibold leading-tight tracking-wide text-sand-100 drop-shadow-[0_1px_2px_rgba(0,0,0,0.3)]">
                {feature.title}
              </h3>
              <p className="text-base leading-relaxed text-caribbean-100/90 transition-opacity duration-300 group-hover:opacity-100">
                {feature.description}
              </p>
            </Card>
          ))}
        </div>

        <div className="relative mt-32 max-w-4xl">
          {/* Decorative Elements */}
          <div className="absolute left-0 right-0 top-0 h-px bg-gradient-to-r from-transparent via-[#FFC107] to-transparent opacity-50" />
          
          <Card className="group relative overflow-hidden rounded-xl border border-white/10 bg-gradient-to-br from-[rgba(14,36,48,0.95)] to-[rgba(14,36,48,0.85)] p-12 shadow-2xl backdrop-blur-md transition-all md:p-16">
            <div className="relative z-10 mx-auto max-w-3xl text-center">
              <h3
                className="mb-6 bg-gradient-to-r from-[#F9A825] to-[#FFD54F] bg-clip-text text-3xl font-extrabold tracking-tight text-transparent drop-shadow-[0_2px_4px_rgba(0,0,0,0.3)] md:text-5xl"
                style={{ textShadow: '0 2px 20px rgba(249,168,37,0.2)' }}
              >
                Ready to Experience Cabarete?
              </h3>
              <p className="mb-10 text-xl leading-relaxed tracking-wide text-caribbean-100/90 md:text-2xl">
                Let us help you discover your perfect property in this vibrant beach paradise
              </p>
              <Button
                size="lg"
                variant="default"
                className="animate-[pulse_4s_ease-in-out_infinite] bg-gradient-to-r from-[#1E88E5] to-[#039BE5] px-10 py-7 text-lg font-bold uppercase tracking-wider text-white shadow-lg transition-all hover:scale-105 hover:animate-none hover:shadow-xl focus:ring-2 focus:ring-white/20 active:scale-100"
                style={{
                  boxShadow: '0 4px 12px rgba(30,136,229,0.3)',
                  textShadow: '0 1px 2px rgba(0,0,0,0.2)'
                }}
              >
                Find Your Cabarete Property
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </section>
  );
}
