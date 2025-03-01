// hooks/usePropertySearch.ts
import { useState, useCallback, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { DateRange } from 'react-day-picker';
import { format } from 'date-fns';
import { enUS } from 'date-fns/locale';
import { useToast } from '@/components/ui/use-toast';
import { useTranslations } from 'next-intl';

interface PropertySearchFilters {
  location?: string;
  dateRange?: DateRange;
  propertyType?: string;
  minPrice?: number;
  maxPrice?: number;
  beds?: number;
  baths?: number;
  petsAllowed?: boolean;
}

export function usePropertySearch() {
  const { toast } = useToast();
  const t = useTranslations('HeroSection');
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isSearching, setIsSearching] = useState(false);
  
  // Initialize filters from URL params
  const [filters, setFilters] = useState<PropertySearchFilters>(() => {
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const location = searchParams.get('location') || undefined;
    const propertyType = searchParams.get('type');
    // Convert 'all' to undefined for the type filter
    const normalizedPropertyType = propertyType && propertyType !== 'all' ? propertyType : undefined;
    const minPrice = searchParams.get('minPrice') ? Number(searchParams.get('minPrice')) : undefined;
    const maxPrice = searchParams.get('maxPrice') ? Number(searchParams.get('maxPrice')) : undefined;
    const beds = searchParams.get('beds');
    // Convert 'any' to undefined for beds filter
    const normalizedBeds = beds && beds !== 'any' ? Number(beds) : undefined;
    const baths = searchParams.get('baths');
    // Convert 'any' to undefined for baths filter
    const normalizedBaths = baths && baths !== 'any' ? Number(baths) : undefined;
    const petsAllowed = searchParams.get('petsAllowed') === 'true' ? true : 
                       searchParams.get('petsAllowed') === 'false' ? false : undefined;
    
    const dateRange: DateRange | undefined = 
      startDate && endDate ? {
        from: new Date(startDate),
        to: new Date(endDate)
      } : undefined;
    
    return {
      location,
      dateRange,
      propertyType: normalizedPropertyType,
      minPrice,
      maxPrice,
      beds: normalizedBeds,
      baths: normalizedBaths,
      petsAllowed
    };
  });

  // Update the URL when filters change
  useEffect(() => {
    // We'll only update URL params on the properties page
    const pathname = window.location.pathname;
    if (!pathname.includes('/properties')) {
      return;
    }
    
    const params = buildQueryParams(filters);
    router.push(`${pathname}?${params}`, { scroll: false });
  }, [filters, router]);

  // Helper function to build query parameters
  const buildQueryParams = (filters: PropertySearchFilters): string => {
    const params = new URLSearchParams();
    
    if (filters.location) params.set('location', filters.location);
    if (filters.propertyType) params.set('type', filters.propertyType);
    if (filters.minPrice) params.set('minPrice', filters.minPrice.toString());
    if (filters.maxPrice) params.set('maxPrice', filters.maxPrice.toString());
    if (filters.beds) params.set('beds', filters.beds.toString());
    if (filters.baths) params.set('baths', filters.baths.toString());
    if (filters.petsAllowed !== undefined) params.set('petsAllowed', filters.petsAllowed.toString());
    if (filters.dateRange?.from) {
      params.set('startDate', format(filters.dateRange.from, 'yyyy-MM-dd', { locale: enUS }));
    }
    if (filters.dateRange?.to) {
      params.set('endDate', format(filters.dateRange.to, 'yyyy-MM-dd', { locale: enUS }));
    }

    return params.toString();
  };

  const updateFilters = useCallback((newFilters: Partial<PropertySearchFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  const clearFilters = useCallback(() => {
    setFilters({});
  }, []);

  const handleSearch = useCallback(async () => {
    // Validate date range if present
    if (filters.dateRange?.from && filters.dateRange?.to) {
      if (filters.dateRange.to < filters.dateRange.from) {
        toast({
          title: t('search.validation.invalidDateRange'),
          description: t('search.validation.invalidDateRange'),
          variant: "destructive",
        });
        return;
      }
    }

    setIsSearching(true);

    try {
      // Build query parameters using our helper function
      const queryString = buildQueryParams(filters);
      
      // Get the current locale from the URL path
      const pathname = window.location.pathname;
      const locale = pathname.split('/')[1] || 'en'; // Default to 'en' if no locale found
      
      // Navigate to properties page with search parameters and include the locale
      router.push(`/${locale}/properties?${queryString}`);
      
    } catch (error) {
      console.error('Search error:', error);
      toast({
        title: t('search.error'),
        description: t('search.error'),
        variant: "destructive",
      });
    } finally {
      setIsSearching(false);
    }
  }, [filters, router, t, toast]);

  return {
    filters,
    updateFilters,
    clearFilters,
    handleSearch,
    isSearching
  };
}