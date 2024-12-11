"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { motion } from "framer-motion";
import { FadeInView } from "./animations/fade-in-view";
import { useTranslations } from 'next-intl';

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
    <section className="py-16 bg-white dark:bg-caribbean-950">
      <div className="container mx-auto px-4">
        <FadeInView>
          <h2 className="text-4xl font-bold text-caribbean-900 dark:text-sand-100 text-center mb-4">
            {t('title')}
          </h2>
        </FadeInView>
        
        <FadeInView delay={0.2}>
          <p className="text-caribbean-600 dark:text-sand-300 text-center mb-12 max-w-2xl mx-auto">
            {t('description')}
          </p>
        </FadeInView>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {locations.map((location, index) => (
            <FadeInView key={location.id} delay={0.2 * (index + 1)}>
              <motion.div
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <Card className="overflow-hidden group cursor-pointer">
                  <div className="relative h-48">
                    <Image
                      src={location.image}
                      alt={location.name}
                      fill
                      className="object-cover transition-transform duration-300 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <div className="absolute bottom-4 left-4 text-white">
                      <h3 className="text-xl font-semibold mb-1">{location.name}</h3>
                      <p className="text-sm opacity-90">
                        {t('propertyCount', { count: location.properties })}
                      </p>
                    </div>
                  </div>
                  <div className="p-4">
                    <p className="text-caribbean-600 dark:text-sand-300">
                      {t(`locations.${index}.description`)}
                    </p>
                    <Button 
                      variant="link" 
                      className="mt-2 p-0 text-caribbean-700 dark:text-caribbean-300 hover:text-caribbean-800 dark:hover:text-caribbean-200"
                    >
                      {t('exploreLocation')} →
                    </Button>
                  </div>
                </Card>
              </motion.div>
            </FadeInView>
          ))}
        </div>
      </div>
    </section>
  );
}
