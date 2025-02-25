"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin } from "lucide-react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { FadeInView } from "./animations/fade-in-view";
import { useTranslations } from 'next-intl';
import { useEffect, useState, useCallback } from 'react';
import { useAuth } from './providers/auth-provider';
import Link from "next/link";
import { cn } from "@/lib/utils";
import { PropertyMetrics } from "./properties/PropertyMetrics"; // Import the shared component with the new name

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
    // For sale properties
    if (property.listing_type === 'sale' || property.listing_type === 'both') {
      return (
        <div className="flex items-center gap-2">
          <Badge className="bg-caribbean-600">
            {t('price.forSale')}
          </Badge>
          <span className="text-2xl font-bold text-caribbean-700 dark:text-caribbean-200">
            ${formatPrice(property.sale_price || 0)}
          </span>
        </div>
      );
    }

    // For rental properties
    if (property.listing_type === 'rent' || property.listing_type === 'both') {
      const frequency = property.rental_frequency ?  
        t(`price.rentalFrequency.${property.rental_frequency}`) : '';
      return (
        <div className="flex items-center gap-2">
          <Badge className="bg-indigo-600">
            {t('price.forRent')}
          </Badge>
          <span className="text-2xl font-bold text-caribbean-700 dark:text-caribbean-200">
            ${formatPrice(property.rental_price || 0)}
          </span>
          {frequency && 
            <span className="text-sm text-muted-foreground">/{frequency}</span>
          }
        </div>
      );
    }

    return null;
  };

  return (
    <div className="mb-4">
      {renderPrice()}
    </div>
  );
}

function PropertyImage({ images, title }: { images: string[], title: string }) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  
  // Simple automatic image rotation on hover without UI controls
  const handleMouseEnter = useCallback(() => {
    if (images.length > 1) {
      const nextIndex = (currentImageIndex + 1) % images.length;
      setCurrentImageIndex(nextIndex);
    }
  }, [currentImageIndex, images.length]);

  return (
    <div 
      className="relative w-full h-full aspect-[4/3] overflow-hidden"
      onMouseEnter={handleMouseEnter}
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
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            priority={currentImageIndex === 0}
            onLoad={() => setIsImageLoaded(true)}
            loading={currentImageIndex === 0 ? "eager" : "lazy"}
          />
        </motion.div>
      </AnimatePresence>
      
      {/* Simple image counter */}
      {images.length > 1 && (
        <div className="absolute bottom-2 right-2 bg-black/50 rounded-full px-2 py-1 text-xs text-white">
          {currentImageIndex + 1}/{images.length}
        </div>
      )}
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
          {properties.map((property) => (
            <motion.div
              key={property.id}
              variants={item}
              whileHover={{ 
                y: -5,
                transition: { type: "spring", stiffness: 400 }
              }}
              className="h-full"
            >
              <Card className="group overflow-hidden h-full flex flex-col border-caribbean-100 dark:border-caribbean-800 hover:shadow-lg hover:shadow-caribbean-100/10 dark:hover:shadow-caribbean-700/20 transition-all duration-300">
                <Link href={`/properties/${property.id}`} className="block flex-none">
                  <CardHeader className="p-0 relative aspect-[4/3]">
                    <PropertyImage 
                      images={property.images} 
                      title={property.title} 
                    />
                    {/* Status badge if needed */}
                    {property.status !== 'available' && (
                      <Badge variant="secondary" className="absolute top-3 left-3 z-10">
                        {property.status}
                      </Badge>
                    )}
                  </CardHeader>
                </Link>
                
                <CardContent className="p-6 flex-grow flex flex-col">
                  {/* Price displayed at the top */}
                  <PriceDisplay property={property} />
                  
                  <CardTitle className="text-xl mb-2 text-caribbean-900 dark:text-caribbean-100 line-clamp-1">
                    {property.title}
                  </CardTitle>
                  
                  <CardDescription className="flex items-center text-muted-foreground mb-2 dark:text-caribbean-300">
                    <MapPin className="h-4 w-4 mr-1 flex-shrink-0" />
                    <span className="line-clamp-1">{property.location}</span>
                  </CardDescription>
                  
                  {/* Use the shared PropertyMetrics component */}
                  <PropertyMetrics property={property} />
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        <div className="text-center mt-12">
          <Link href="/properties">
            <Button 
              className="bg-caribbean-600 hover:bg-caribbean-700 text-white"
            >
              {t('viewAllProperties')}
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}

// Animation variants
const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const item = {
  hidden: { y: 20, opacity: 0 },
  show: { 
    y: 0, 
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 260,
      damping: 20
    }
  }
};