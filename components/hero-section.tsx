"use client";

import { useRef } from "react";
import WaveText from "./home/StandaloneWaveText";

export function HeroSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  return (
    <div ref={containerRef} className="relative min-h-screen w-full overflow-hidden">
      <div className="absolute inset-0 z-0">
        <video
          ref={videoRef}
          autoPlay
          loop
          muted
          playsInline
          className="h-full w-full object-cover"
        >
          <source src="/hero-video.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-black/40" />
      </div>

      <div className="relative z-10 flex min-h-screen items-center justify-center px-4">
        <div className="mx-auto max-w-5xl text-center">
          <div className="relative">
            <WaveText text="CABARETE" />
          </div>
        </div>
      </div>
    </div>
  );
}