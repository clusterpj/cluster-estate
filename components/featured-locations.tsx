"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { motion } from "framer-motion";
import { FadeInView } from "./animations/fade-in-view";
import { useTranslations } from 'next-intl';
import Link from 'next/link';

const locations = [
  {
    id: 1,
    name: "Saint Lucia",
    image: "/locations/saint-lucia.jpg",
    properties: 45,
    description: "Discover paradise with stunning beaches and lush mountains"
  },
  {
    id: 2,
    name: "Barbados",
    image: "/locations/barbados.jpg",
    properties: 62,
    description: "Experience luxury living in this tropical haven"
  },
  {
    id: 3,
    name: "Jamaica",
    image: "/locations/jamaica.jpg",
    properties: 38,
    description: "Find your dream home in this vibrant Caribbean culture"
  },
  {
    id: 4,
    name: "Bahamas",
    image: "/locations/bahamas.jpg",
    properties: 53,
    description: "Paradise found in crystal clear waters"
  }
];

export function FeaturedLocations() {
  const t = useTranslations('FeaturedLocations');
  
  return (
    <section className="py-16 dark:bg-caribbean-950">
      <div className="container mx-auto px-4">
        <FadeInView>
          <h2 className="text-4xl font-bold text-center mb-4 dark:text-sand-50">
            {t('title')}
          </h2>
        </FadeInView>

        <FadeInView delay={0.2}>
          <p className="text-center mb-12 max-w-2xl mx-auto dark:text-sand-200">
            {t('description')}
          </p>
        </FadeInView>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {locations.map((location, index) => (
            <FadeInView key={location.name} delay={0.2 * (index + 1)}>
              <Link href={`/properties?location=${location.name.toLowerCase()}`}>
                <Card className="group relative h-full overflow-hidden dark:bg-caribbean-900 dark:border-caribbean-800 shadow-lg">
                  <div className="relative h-48">
                    <Image
                      src={location.image}
                      alt={location.name}
                      fill
                      className="object-cover transition-transform duration-300 group-hover:scale-110"
                    />
                  </div>
                  <div className="p-6">
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="text-xl font-semibold dark:text-sand-50">
                        {location.name}
                      </h3>
                      <span className="text-sm dark:text-sand-200">
                        {location.properties} Properties
                      </span>
                    </div>
                    <p className="dark:text-sand-200 mb-4">
                      {location.description}
                    </p>
                    <div className="flex items-center dark:text-sand-200 hover:dark:text-sand-50 transition-colors">
                      {t('exploreLocation')}
                      <span className="ml-2">→</span>
                    </div>
                  </div>
                </Card>
              </Link>
            </FadeInView>
          ))}
        </div>
      </div>
    </section>
  );
}
