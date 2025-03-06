import { useState, useEffect } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { useTranslations } from 'next-intl';
import type { Property } from '@/types/property';

export function useAvailabilityFilter(
  fetchedProperties: Property[] | undefined,
  startDate: string | undefined | null,
  endDate: string | undefined | null
) {
  const [dateFilteredProperties, setDateFilteredProperties] = useState<Property[] | null>(null);
  const [isLoadingDateFilter, setIsLoadingDateFilter] = useState(false);
  const { toast } = useToast();
  const t = useTranslations('FeaturedProperties');

  useEffect(() => {
    async function fetchAvailableProperties() {
      // If we don't have date parameters or properties, skip filtering
      if (!startDate || !endDate || !fetchedProperties) {
        setDateFilteredProperties(null);
        return;
      }
      
      setIsLoadingDateFilter(true);
      
      try {
        const response = await fetch('/api/properties/availability', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            startDate,
            endDate,
          }),
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch available properties');
        }
        
        const availableProperties = await response.json();
        
        // Create a Set of available property IDs for efficient lookup
        const availablePropertyIds = new Set(availableProperties.map((p: Property) => p.id));
        
        // Filter the fetched properties to only include available ones
        const filteredProperties = fetchedProperties.filter(p => availablePropertyIds.has(p.id));
        
        setDateFilteredProperties(filteredProperties);
      } catch (error) {
        console.error('Error fetching available properties:', error);
        toast({
          title: t('error'),
          description: t('dateFilterError'),
          variant: "destructive",
        });
        // On error, fall back to the original property list
        setDateFilteredProperties(fetchedProperties);
      } finally {
        setIsLoadingDateFilter(false);
      }
    }
    
    fetchAvailableProperties();
  }, [fetchedProperties, startDate, endDate, toast, t]);

  return {
    dateFilteredProperties,
    isLoadingDateFilter
  };
}