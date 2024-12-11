"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import Image from "next/image";

export function HeroSection() {
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
        <div className="absolute inset-0 bg-caribbean-900/40" /> {/* Caribbean overlay */}
      </div>

      {/* Content */}
      <div className="container mx-auto relative z-10 px-4">
        <div className="max-w-3xl text-white space-y-6">
          <h1 className="text-5xl md:text-6xl font-bold leading-tight">
            Find Your Dream Home in Paradise
          </h1>
          <p className="text-xl md:text-2xl text-sand-100">
            Discover exceptional properties that match your lifestyle in the Caribbean's most sought-after locations.
          </p>

          {/* Search Bar */}
          <div className="flex flex-col md:flex-row gap-4 max-w-2xl bg-white/10 backdrop-blur-md p-4 rounded-lg border border-white/20">
            <div className="flex-1">
              <Input 
                placeholder="Enter location or property type..."
                className="w-full h-12 bg-white/90 text-caribbean-900 placeholder:text-caribbean-500/70"
              />
            </div>
            <Button 
              className="h-12 px-8 bg-caribbean-600 hover:bg-caribbean-700 text-white transition-colors" 
              size="lg"
            >
              <Search className="mr-2 h-5 w-5" />
              Search
            </Button>
          </div>

          {/* Stats */}
          <div className="flex gap-8 pt-8 flex-wrap">
            <div className="bg-white/10 backdrop-blur-md p-4 rounded-lg border border-white/20">
              <p className="text-4xl font-bold text-sand-200">1000+</p>
              <p className="text-sand-100">Properties</p>
            </div>
            <div className="bg-white/10 backdrop-blur-md p-4 rounded-lg border border-white/20">
              <p className="text-4xl font-bold text-sand-200">500+</p>
              <p className="text-sand-100">Happy Clients</p>
            </div>
            <div className="bg-white/10 backdrop-blur-md p-4 rounded-lg border border-white/20">
              <p className="text-4xl font-bold text-sand-200">50+</p>
              <p className="text-sand-100">Locations</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
