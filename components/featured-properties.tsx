"use client";

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Bath, Bed, MapPin, Maximize } from "lucide-react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { FadeInView } from "./animations/fade-in-view";
import { useTranslations } from 'next-intl';
import { useEffect, useState, useCallback } from 'react';
import { useAuth } from './providers/auth-provider';
import Link from "next/link";

import type { Database } from '@/types/supabase';
type Property = {
  id: string;
  title: string;
  location: string;
  sale_price: number | null;
  rental_price: number | null;
  rental_frequency: string | null;
  bedrooms: number;
  bathrooms: number;
  square_feet: number;
  images: string[];
  listing_type: 'sale' | 'rent' | 'both';
  status: string;
  property_type: 'house' | 'villa' | 'condo' | 'lot';
  featured: boolean;
};

function formatPrice(price: number) {
  return new Intl.NumberFormat('en-US', {
    notation: 'compact',
    maximumFractionDigits: 1
  }).format(price);
}

function PriceDisplay({ property }: { property: Property }) {
  const t = useTranslations('FeaturedProperties');

  const renderPrice = () => {
    if (property.listing_type === 'sale' || property.listing_type === 'both') {
      return (
        <div>
          <span className="text-sm text-muted-foreground">{t('price.forSale')}: </span>
          <span>${formatPrice(property.sale_price || 0)}</span>
        </div>
      );
    }

    if (property.listing_type === 'rent' || property.listing_type === 'both') {
      const frequency = property.rental_frequency ?  
        t(`price.rentalFrequency.${property.rental_frequency}`) : '';
      return (
        <div>
          <span className="text-sm text-muted-foreground">{t('price.forRent')}: </span>
          <span>${formatPrice(property.rental_price || 0)}</span>
          {frequency && <span className="text-sm text-muted-foreground">/{frequency}</span>}
        </div>
      );
    }

    return null;
  };

  return (
    <div className="flex flex-wrap gap-4 text-2xl font-bold text-caribbean-700 dark:text-caribbean-200">
      {renderPrice()}
    </div>
  );
}

function PropertyImage({ images, title }: { images: string[], title: string }) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const handleHover = useCallback(() => {
    setCurrentImageIndex(prevIndex => {
      // Move to next image, or back to first if at end
      return (prevIndex + 1) % images.length;
    });
  }, [images.length]);

  return (
    <div 
      className="relative w-full h-full aspect-[4/3] overflow-hidden"
      onMouseEnter={handleHover}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={currentImageIndex}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="absolute inset-0"
        >
          <Image
            src={images[currentImageIndex]}
            alt={`${title} - Image ${currentImageIndex + 1}`}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            priority={currentImageIndex === 0}
          />
        </motion.div>
      </AnimatePresence>
      <div className="absolute bottom-2 right-2 bg-black/50 rounded-full px-2 py-1 text-xs text-white">
        {currentImageIndex + 1}/{images.length}
      </div>
    </div>
  );
}

export function FeaturedProperties() {
  const t = useTranslations('FeaturedProperties');
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { supabase } = useAuth();
  
  useEffect(() => {
    async function fetchFeaturedProperties() {
      try {
        // First, let's check what properties are actually marked as featured
        const { data: featuredCheck, error: checkError } = await supabase
          .from('properties')
          .select('id, title, featured')
          .eq('featured', true);

        console.log('All featured properties check:', featuredCheck);

        if (checkError) {
          console.error('Error checking featured properties:', checkError);
          return;
        }

        // Now fetch the full property details
        const { data, error } = await supabase
          .from('properties')
          .select(`
            id,
            title,
            location,
            sale_price,
            rental_price,
            rental_frequency,
            bedrooms,
            bathrooms,
            square_feet,
            images,
            listing_type,
            status,
            property_type,
            featured
          `)
          .eq('featured', true)
          .eq('status', 'available')  // Only show available properties
          .order('created_at', { ascending: false });

        console.log('Featured properties detailed query result:', {
          dataCount: data?.length,
          properties: data?.map(p => ({
            id: p.id,
            title: p.title,
            featured: p.featured,
            status: p.status
          }))
        });

        if (error) {
          console.error('Error fetching featured properties:', error);
          setError(error.message);
          return;
        }

        if (data) {
          // Additional validation
          const validProperties = data.filter(p => 
            p.featured === true && 
            p.status === 'available' &&
            p.images?.length > 0  // Ensure we have images
          );

          console.log('Filtered valid featured properties:', 
            validProperties.map(p => ({
              id: p.id,
              title: p.title,
              featured: p.featured,
              status: p.status,
              hasImages: p.images?.length > 0
            }))
          );

          setProperties(validProperties);  
        } else {
          setProperties([]);
        }
      } catch (err) {
        console.error('Failed to fetch properties:', err);
        setError('Failed to load properties');
      } finally {
        setLoading(false);
      }
    }

    fetchFeaturedProperties();
  }, [supabase]);

  if (loading) {
    return (
      <section className="relative py-16 bg-background">
        <div className="container mx-auto px-4 text-center">
          <p>{t('loading')}</p>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="relative py-16 bg-background">
        <div className="container mx-auto px-4 text-center text-red-500">
          <p>{error}</p>
        </div>
      </section>
    );
  }

  if (properties.length === 0) {
    return (
      <section className="relative py-16 bg-background">
        <div className="container mx-auto px-4 text-center">
          <p>{t('noProperties')}</p>
        </div>
      </section>
    );
  }

  return (
    <section className="relative py-16 bg-background">
      <div className="container mx-auto px-4">
        <FadeInView>
          <h2 className="text-3xl md:text-4xl font-bold text-caribbean-900 dark:text-caribbean-100 mb-4 text-center">
            {t('title')}
          </h2>
        </FadeInView>

        <FadeInView delay={0.2}>
          <p className="text-lg text-muted-foreground text-center mb-12 max-w-3xl mx-auto">
            {t('description')}
          </p>
        </FadeInView>

        <motion.div 
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-fr max-w-7xl mx-auto"
        >
          {properties.map((property, index) => (
            <motion.div
              key={property.id}
              whileHover={{ 
                scale: 1.02,
                transition: { type: "spring", stiffness: 300 }
              }}
              className="h-full"
            >
              <Card className="group hover:shadow-lg transition-shadow duration-300 dark:bg-caribbean-900/40 dark:border-caribbean-700/50 overflow-hidden h-full flex flex-col">
                <Link href={`/properties/${property.id}`} className="block flex-none">
                  <CardHeader className="p-0 relative aspect-[4/3]">
                    <PropertyImage 
                      images={property.images} 
                      title={property.title} 
                    />
                    <div className="absolute top-4 right-4 flex gap-2 z-10">
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
                </Link>
                <CardContent className="p-6 flex-grow flex flex-col">
                  <CardTitle className="text-xl mb-2 text-caribbean-900 dark:text-caribbean-100">
                    {property.title}
                  </CardTitle>
                  <CardDescription className="flex items-center text-muted-foreground mb-4 dark:text-caribbean-300">
                    <MapPin className="h-4 w-4 mr-1 flex-shrink-0" />
                    <span className="line-clamp-1">{property.location}</span>
                  </CardDescription>
                  <div className="flex justify-between items-center text-sm text-muted-foreground dark:text-caribbean-300 mb-4 mt-auto">
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

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
    },
  },
};
