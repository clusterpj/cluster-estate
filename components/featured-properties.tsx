"use client";

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Bath, Bed, MapPin, Maximize } from "lucide-react";
import Image from "next/image";
import { motion } from "framer-motion";
import { FadeInView } from "./animations/fade-in-view";
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';
import { useAuth } from './providers/auth-provider';

import type { Database } from '@/types/supabase';
type Property = Database['public']['Tables']['properties']['Row'];

function formatPrice(price: number) {
  return new Intl.NumberFormat('en-US', {
    notation: 'compact',
    maximumFractionDigits: 1
  }).format(price);
}

function PriceDisplay({ property }: { property: Property }) {
  const t = useTranslations('FeaturedProperties');

  
  const renderRentalPrice = () => {
    if (!property.rental_price) return null;
    const frequency = property.rental_frequency ? t(`rentalFrequency.${property.rental_frequency}`) : '';
    return (
      <div>
        <span className="text-sm text-muted-foreground">{t('forRent')}: </span>
        <span>${formatPrice(property.rental_price)}</span>
        {frequency && <span className="text-sm text-muted-foreground">/{frequency}</span>}
      </div>
    );
  };

  const renderSalePrice = () => {
    if (property.listing_type === 'rent' || !property.sale_price) return null;
    return (
      <div>
        <span className="text-sm text-muted-foreground">{t('forSale')}: </span>
        <span>${formatPrice(property.sale_price)}</span>
      </div>
    );
  };

  return (
    <div className="flex flex-wrap gap-4 text-2xl font-bold text-caribbean-700 dark:text-caribbean-200">
      {renderSalePrice()}
      {renderRentalPrice()}
    </div>
  );
}

const dummyProperties = [
  {
    id: 1,
    image: "/property1.jpg",
    beds: 4,
    baths: 3,
    sqft: 3200,
    type: "Villa",
    price: "$2,500,000"
  },
  {
    id: 2,
    image: "/property2.jpg",
    beds: 3,
    baths: 2,
    sqft: 1800,
    type: "Condo",
    price: "$1,200,000"
  },
  {
    id: 3,
    image: "/property3.jpg",
    beds: 5,
    baths: 4,
    sqft: 4100,
    type: "Penthouse",
    price: "$3,100,000"
  }
];

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
    },
  },
};

export function FeaturedProperties() {
  const t = useTranslations('FeaturedProperties');

  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);

  const { supabase } = useAuth();
  
  useEffect(() => {
    async function fetchFeaturedProperties() {
      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .eq('featured', true)
        .order('created_at', { ascending: false })
        .order('sale_price', { ascending: true })
        .order('rental_price', { ascending: true });

      if (error) {
        console.error('Error fetching featured properties:', error);
        return;
      }

      setProperties(data || []);
      setLoading(false);
    }

    fetchFeaturedProperties();
  }, []);
  return (
    <section className="relative py-16 bg-background" style={{ position: 'relative' }}>
      <div className="container mx-auto px-4">
        <FadeInView>
          <h2 className="text-3xl md:text-4xl font-bold text-caribbean-900 dark:text-caribbean-100 mb-4 text-center">
            {t('title')}
          </h2>
        </FadeInView>

        
        <FadeInView delay={0.2}>
          <p className="text-lg text-muted-foreground text-center mb-12 max-w-2xl mx-auto">
            {t('description')}
          </p>
        </FadeInView>

        <motion.div 
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {properties.map((property, index) => (
            <motion.div
              key={property.id}
              whileHover={{ 
                scale: 1.02,
                transition: { type: "spring", stiffness: 300 }
              }}
            >
              <Card className="group hover:shadow-lg transition-shadow duration-300 dark:bg-caribbean-900/40 dark:border-caribbean-700/50 overflow-hidden">
                <CardHeader className="p-0 relative aspect-[4/3] overflow-hidden">
                  <Image
                    src={property.images[0] || '/placeholder-property.jpg'}
                    alt={property.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-4 right-4 flex gap-2">
                    <Badge className="bg-caribbean-600 hover:bg-caribbean-700">
                      {property.listing_type}
                    </Badge>
                    {property.status !== 'available' && (
                      <Badge variant="secondary">
                        {property.status}
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  <CardTitle className="text-xl mb-2 text-caribbean-900 dark:text-caribbean-100">
                    {property.title}
                  </CardTitle>
                  <CardDescription className="flex items-center text-muted-foreground mb-4 dark:text-caribbean-300">
                    <MapPin className="h-4 w-4 mr-1" />
                    {property.location}
                  </CardDescription>
                  <div className="flex justify-between items-center text-sm text-muted-foreground dark:text-caribbean-300 mb-4">
                    <div className="flex items-center">
                      <Bed className="h-4 w-4 mr-1" />
                      <span>{property.bedrooms} {t('propertyDetails.beds')}</span>
                    </div>
                    <div className="flex items-center">
                      <Bath className="h-4 w-4 mr-1" />
                      <span>{property.bathrooms} {t('propertyDetails.baths')}</span>
                    </div>
                    <div className="flex items-center">
                      <Maximize className="h-4 w-4 mr-1" />
                      <span>{property.square_feet} {t('propertyDetails.sqft')}</span>
                    </div>
                  </div>
                  <PriceDisplay property={property} />
                </CardContent>
                <CardFooter className="p-6 pt-0">
                  <Button className="w-full bg-sand-400 hover:bg-sand-500 text-caribbean-900 dark:bg-caribbean-600 dark:hover:bg-caribbean-700 dark:text-white">
                    {t('viewDetails')}
                  </Button>
                </CardFooter>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        <div className="text-center mt-12">
          <Button 
            variant="outline" 
            className="border-caribbean-600 text-caribbean-600 hover:bg-caribbean-50 dark:border-caribbean-400 dark:text-caribbean-200 dark:hover:bg-caribbean-900/50"
          >
            {t('viewAllProperties')}
          </Button>
        </div>
      </div>
    </section>
  );
}
