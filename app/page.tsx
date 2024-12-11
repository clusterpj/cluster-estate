import Image from "next/image";
import { Button } from "@/components/ui/button";
import { HeroSection } from "@/components/hero-section";

export default function Home() {
  return (
    <main className="min-h-screen">
      <HeroSection />
      <div className="container mx-auto p-6">
        {/* Additional content will go here */}
      </div>
    </main>
  );
}
