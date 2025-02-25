import { Bed, Bath, PawPrint } from "lucide-react";
import { useTranslations } from 'next-intl';
import { Database } from "@/types/supabase";

// TypeScript interface defining the expected property structure
export interface PropertyMetricsProps {
  property: {
    bedrooms: number;
    bathrooms: number;
    square_feet: number;
    pets_allowed: boolean | null;
  };
}

export function PropertyMetrics({ property }: PropertyMetricsProps) {
  const t = useTranslations('FeaturedProperties');
  
  // Strategic formatting for square footage with intelligent scaling for optimal UX
  const formatSquareFeet = () => {
    if (property.square_feet >= 10000) {
      // For very large numbers, use more aggressive rounding
      return `${Math.floor(property.square_feet/1000)}k`;
    } else if (property.square_feet >= 1000) {
      // For medium-large numbers, round to nearest hundred
      return `${(Math.round(property.square_feet/100)/10).toFixed(1)}k`;
    }
    return property.square_feet.toString();
  };
  
  // Base badge class template with reduced visual prominence while maintaining readability
  // Using caribbean-200 for light mode and caribbean-700 for dark mode maintains color system consistency
  // while reducing visual competition with primary CTAs
  const baseBadgeClass = "absolute -top-2 -right-2 bg-caribbean-200 dark:bg-caribbean-700 text-caribbean-800 dark:text-caribbean-100 text-xs flex items-center justify-center";
  
  // Unified badge utility function that applies sizing logic consistently
  const getBadgeClass = (content: string | number) => {
    const stringContent = content.toString();
    
    // Apply responsive sizing based on content length
    if (stringContent.length <= 2) {
      return `${baseBadgeClass} rounded-md min-w-5 h-5 px-1`;
    } else if (stringContent.length <= 4) {
      return `${baseBadgeClass} rounded-md min-w-6 h-5 px-1.5`;
    } else {
      return `${baseBadgeClass} rounded-md min-w-7 h-5 px-2`;
    }
  };
  
  return (
    <div className="grid grid-cols-3 gap-2 text-sm text-muted-foreground dark:text-caribbean-300 mt-4 mb-4 p-2 bg-muted/50 rounded-md">
      <div className="flex flex-col items-center justify-center p-1.5 relative">
        <div className="relative">
          <Bed className="h-5 w-5 mb-1" />
          <span className={getBadgeClass(property.bedrooms)}>
            {property.bedrooms}
          </span>
        </div>
        <span>{t('propertyDetails.beds')}</span>
      </div>
      <div className="flex flex-col items-center justify-center p-1.5 relative">
        <div className="relative">
          <Bath className="h-5 w-5 mb-1" />
          <span className={getBadgeClass(property.bathrooms)}>
            {property.bathrooms}
          </span>
        </div>
        <span>{t('propertyDetails.baths')}</span>
      </div>
      <div className="flex flex-col items-center justify-center p-1.5 relative">
        <div className="relative">
          <PawPrint className="h-5 w-5 mb-1" />
        </div>
        <span>{property.pets_allowed ? t('pets.allowed') : t('pets.notAllowed')}</span>
      </div>
    </div>
  );
}