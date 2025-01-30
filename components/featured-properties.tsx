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

function PropertyImage({ images, title }: { images: string[], title: string }) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isHovering, setIsHovering] = useState(false);

  // Add debug logs
  useEffect(() => {
    console.log('Images array:', images);
    console.log('Current image index:', currentImageIndex);
    console.log('Is hovering:', isHovering);
  }, [images, currentImageIndex, isHovering]);

  useEffect(() => {
    let intervalId: NodeJS.Timeout;

    if (isHovering && images && images.length > 1) {
      console.log('Starting image rotation');
      intervalId = setInterval(() => {
        setCurrentImageIndex((prev) => {
          const nextIndex = (prev + 1) % images.length;
          console.log('Changing to image index:', nextIndex);
          return nextIndex;
        });
      }, 2000); // Increased to 2 seconds for easier debugging
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
        console.log('Clearing interval');
      }
    };
  }, [isHovering, images]);

  // Ensure we have valid images array
  const validImages = Array.isArray(images) && images.length > 0 ? images : ['/placeholder-property.jpg'];

  return (
    <div 
      className="relative aspect-[4/3] overflow-hidden"
      onMouseEnter={() => {
        console.log('Mouse enter');
        setIsHovering(true);
      }}
      onMouseLeave={() => {
        console.log('Mouse leave');
        setIsHovering(false);
        setCurrentImageIndex(0);
      }}
    >
      {validImages.map((src, index) => (
        <Image
          key={`${src}-${index}`}
          src={src || '/placeholder-property.jpg'}
          alt={`${title} - Image ${index + 1}`}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          priority={index === 0}
          className={`
            absolute top-0 left-0
            object-cover transition-opacity duration-700
            ${currentImageIndex === index ? 'opacity-100 z-10' : 'opacity-0 z-0'}
            group-hover:scale-105
          `}
        />
      ))}
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
        // Simple query to get only featured properties
        const { data, error } = await supabase
          .from('properties')
          .select('*')
          .eq('featured', true)
          .limit(3);

        console.log('Raw query result:', data); // Debug log to see what we're getting

        if (error) {
          console.error('Error fetching featured properties:', error);
          setError(error.message);
          return;
        }

        // If we have no featured properties or less than 3, use dummy data
        if (!data || data.length === 0) {
          console.log('No featured properties found, using dummy data');
          const dummyData = dummyProperties.map(dummy => ({
            id: `dummy-${dummy.id}`,
            title: `Luxury ${dummy.type}`,
            location: "Cabarete, Dominican Republic",
            sale_price: parseInt(dummy.price.replace(/[$,]/g, '')),
            rental_price: null,
            rental_frequency: null,
            bedrooms: dummy.beds,
            bathrooms: dummy.baths,
            square_feet: dummy.sqft,
            images: [dummy.image],
            listing_type: 'sale' as const,
            status: 'available',
            property_type: dummy.type.toLowerCase() as 'villa' | 'condo' | 'house' | 'lot',
            featured: true
          }));
          setProperties(dummyData);
        } else {
          console.log('Property images:', data.map(p => ({
            id: p.id,
            imageCount: p.images?.length,
            images: p.images
          })));
          setProperties(data);
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
                <Link href={`/properties/${property.id}`} className="block">
                  <CardHeader className="p-0 relative">
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
