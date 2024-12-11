import Image from "next/image";
import { Button } from "@/components/ui/button";
import { HeroSection } from "@/components/hero-section";
import { FeaturedProperties } from "@/components/featured-properties";
import { WhyChooseUs } from "@/components/why-choose-us";
import { FeaturedLocations } from "@/components/featured-locations";
import { LifestylePreview } from "@/components/lifestyle-preview";

export default function Home() {
  return (
    <main className="min-h-screen">
      <HeroSection />
      <FeaturedProperties />
      <WhyChooseUs />
      <LifestylePreview />
      <FeaturedLocations />
    </main>
  );
}
