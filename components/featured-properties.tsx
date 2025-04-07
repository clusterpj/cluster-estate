"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin } from "lucide-react";
import { motion } from "framer-motion";
import { FadeInView } from "./animations/fade-in-view";
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';
import { useAuth } from './providers/auth-provider';
import Link from "next/link";
import { PropertyMetrics } from "./properties/PropertyMetrics";
import { PropertyImageSlider } from "@/components/ui/PropertyImageSlider";

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
  pets_allowed: boolean | null;
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

export function FeaturedProperties() {
  const t = useTranslations('FeaturedProperties');
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { supabase } = useAuth();
  
  useEffect(() => {
    if (!supabase) {
      setError('Supabase client not initialized');
      setLoading(false);
      return;
    }

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
            featured,
            pets_allowed
          `)
          .eq('featured', true)
          .eq('status', 'available')
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Error fetching featured properties:', error);
          setError(error.message);
          return;
        }

        if (data) {
          const validProperties = data.filter((p: unknown): p is Property => {
            const property = p as Partial<Property>;
            return (
              property.featured === true &&
              property.status === 'available' &&
              Array.isArray(property.images) &&
              property.images.length > 0 &&
              typeof property.id === 'string' &&
              typeof property.title === 'string' &&
              typeof property.location === 'string'
            );
          });

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
      <section className="relative py-16 bg-white">
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
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-6 text-center bg-gradient-to-br from-sky-500 to-sky-700 bg-clip-text text-transparent">
            {t('title')}
          </h2>
        </FadeInView>

        <FadeInView delay={0.2}>
          <p className="text-lg leading-8 font-normal text-gray-700 text-center mb-12 max-w-2xl mx-auto">
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
              <Link href={`/properties/${property.id}`} className="block h-full">
                <Card className="group overflow-hidden h-full flex flex-col border-caribbean-100 dark:border-caribbean-800 hover:shadow-lg hover:shadow-caribbean-100/10 dark:hover:shadow-caribbean-700/20 transition-all duration-300">
                  <CardHeader className="p-0 relative aspect-[4/3]">
                    <PropertyImageSlider
                      images={property.images}
                      title={property.title}
                      className="relative z-10"
                    />
                    {property.status !== 'available' && (
                      <Badge variant="secondary" className="absolute top-3 left-3 z-10">
                        {property.status}
                      </Badge>
                    )}
                  </CardHeader>
                  <CardContent className="p-6 flex-grow flex flex-col">
                    <PriceDisplay property={property} />
                    <CardTitle className="text-xl font-semibold tracking-tight text-sky-900 line-clamp-1">
                      {property.title}
                    </CardTitle>
                    <CardDescription className="flex items-center text-sky-700 font-normal mb-2">
                      <MapPin className="h-4 w-4 mr-1 flex-shrink-0" />
                      <span className="line-clamp-1">{property.location}</span>
                    </CardDescription>
                    <PropertyMetrics property={property} />
                  </CardContent>
                </Card>
              </Link>
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