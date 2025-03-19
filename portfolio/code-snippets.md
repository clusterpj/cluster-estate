# Key Code Snippets

## 1. Property Search Hook (usePropertySearch.ts)

This custom hook demonstrates advanced state management and URL synchronization for property search functionality.

```typescript
// Type-safe filter interface
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

// Hook implementation
export function usePropertySearch() {
  const { toast } = useToast();
  const t = useTranslations('HeroSection');
  const router = useRouter();
  const searchParams = useSearchParams();

  // Initialize filters from URL params with normalization
  const [filters, setFilters] = useState<PropertySearchFilters>(() => {
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    
    // Normalize property type filter
    const propertyType = searchParams.get('type');
    const normalizedPropertyType = propertyType && propertyType !== 'all' 
      ? propertyType 
      : undefined;

    // Normalize beds/baths filters
    const beds = searchParams.get('beds');
    const normalizedBeds = beds && beds !== 'any' 
      ? Number(beds) 
      : undefined;

    // Date range handling
    const dateRange: DateRange | undefined = 
      startDate && endDate ? {
        from: new Date(startDate),
        to: new Date(endDate)
      } : undefined;

    return {
      location: searchParams.get('location') || undefined,
      dateRange,
      propertyType: normalizedPropertyType,
      minPrice: searchParams.get('minPrice') ? Number(searchParams.get('minPrice')) : undefined,
      maxPrice: searchParams.get('maxPrice') ? Number(searchParams.get('maxPrice')) : undefined,
      beds: normalizedBeds,
      baths: searchParams.get('baths') && searchParams.get('baths') !== 'any' 
        ? Number(searchParams.get('baths')) 
        : undefined,
      petsAllowed: searchParams.get('petsAllowed') === 'true' ? true : 
                  searchParams.get('petsAllowed') === 'false' ? false : undefined
    };
  });

  // URL synchronization
  useEffect(() => {
    const pathname = window.location.pathname;
    if (!pathname.includes('/properties')) return;
    
    const params = buildQueryParams(filters);
    router.push(`${pathname}?${params}`, { scroll: false });
  }, [filters, router]);

  // Query parameter builder
  const buildQueryParams = (filters: PropertySearchFilters): string => {
    const params = new URLSearchParams();
    
    if (filters.location) params.set('location', filters.location);
    if (filters.propertyType) params.set('type', filters.propertyType);
    if (filters.minPrice) params.set('minPrice', filters.minPrice.toString());
    if (filters.maxPrice) params.set('maxPrice', filters.maxPrice.toString());
    if (filters.beds) params.set('beds', filters.beds.toString());
    if (filters.baths) params.set('baths', filters.baths.toString());
    if (filters.petsAllowed !== undefined) params.set('petsAllowed', filters.petsAllowed.toString());
    
    // Date formatting with internationalization
    if (filters.dateRange?.from) {
      params.set('startDate', format(filters.dateRange.from, 'yyyy-MM-dd', { locale: enUS }));
    }
    if (filters.dateRange?.to) {
      params.set('endDate', format(filters.dateRange.to, 'yyyy-MM-dd', { locale: enUS }));
    }

    return params.toString();
  };

  // Search handler with validation
  const handleSearch = useCallback(async () => {
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
      const queryString = buildQueryParams(filters);
      router.push(`/properties?${queryString}`);
    } catch (error) {
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
    updateFilters: useCallback((newFilters: Partial<PropertySearchFilters>) => {
      setFilters(prev => ({ ...prev, ...newFilters }));
    }, []),
    clearFilters: useCallback(() => setFilters({}), []),
    handleSearch,
    isSearching
  };
}
```

### Key Features:
- **Type Safety**: Strongly typed filters and parameters
- **URL Synchronization**: Two-way binding between URL and state
- **Validation**: Date range and parameter validation
- **Internationalization**: Support for multiple languages
- **Error Handling**: Toast notifications for user feedback
- **Performance**: Memoized callbacks and efficient state updates

## 2. Calendar Synchronization (ICalendarSync.tsx)

This component demonstrates complex calendar integration with iCal feeds, including:

```typescript
// Zod schema for form validation
const formSchema = z.object({
  feed_url: z.string().url({ message: "Please enter a valid URL" }),
  feed_type: z.enum(["import", "export"]),
  sync_frequency: z.number().min(15, "Minimum sync frequency is 15 minutes"),
  sync_enabled: z.boolean(),
});

// Calendar feed type definition
type CalendarFeed = {
  id: string;
  feed_url: string;
  feed_type: "import" | "export";
  sync_frequency: number;
  sync_enabled: boolean;
  last_sync_at?: string;
  last_sync_status?: 'success' | 'error';
  last_sync_result?: {
    eventsProcessed: number;
    conflicts?: number;
    warnings?: string[];
  };
  priority?: number;
};

// Main component implementation
export function ICalendarSync({ propertyId, onSuccess }: ICalendarSyncProps) {
  const [feeds, setFeeds] = useState<CalendarFeed[]>([]);
  const { toast } = useToast();
  
  // Form initialization with Zod validation
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      feed_url: '',
      feed_type: 'import',
      sync_frequency: 60,
      sync_enabled: true,
    },
  });

  // Load calendar feeds from Supabase
  const loadFeeds = async () => {
    try {
      const feeds = await calendarSyncService.getCalendarFeeds(propertyId);
      setFeeds(feeds);
    } catch (error) {
      toast({
        title: "Error loading calendar feeds",
        description: error instanceof Error ? error.message : "Failed to load calendar feeds",
        variant: "destructive",
      });
    }
  };

  // Handle manual sync operation
  const handleSyncNow = async (feedId: string) => {
    try {
      const result = await calendarSyncService.syncCalendarFeed(feedId, propertyId);
      await loadFeeds();
      toast({
        title: "Sync completed",
        description: `Processed ${result.eventsProcessed} events`,
      });
    } catch (error) {
      toast({
        title: "Sync Failed",
        description: error instanceof Error ? error.message : "Failed to sync calendar",
        variant: "destructive"
      });
    }
  };

  // Handle feed deletion
  const handleDelete = async (feedId: string) => {
    try {
      await calendarSyncService.deleteCalendarFeed(propertyId, feedId);
      await loadFeeds();
      toast({
        title: "Calendar feed deleted",
        description: "The calendar feed has been successfully removed",
      });
    } catch (error) {
      toast({
        title: "Error deleting feed",
        description: error instanceof Error ? error.message : "Failed to delete calendar feed",
        variant: "destructive",
      });
    }
  };

  // Form submission handler
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      await calendarSyncService.createCalendarFeed(propertyId, {
        feed_url: values.feed_url,
        feed_type: values.feed_type,
        sync_frequency: values.sync_frequency,
        sync_enabled: values.sync_enabled,
      });
      await loadFeeds();
      toast({
        title: "Calendar feed added",
        description: "The calendar feed has been successfully added",
      });
    } catch (error) {
      toast({
        title: "Error adding calendar feed",
        description: error instanceof Error ? error.message : "Failed to add calendar feed",
        variant: "destructive",
      });
    }
  };
}
```

### Key Features:
- **Calendar Integration**: Supports both import and export iCal feeds
- **Real-time Sync**: Background synchronization with configurable frequency
- **Conflict Resolution**: Handles calendar conflicts and warnings
- **Priority Management**: Allows setting feed priority for conflict resolution
- **Error Handling**: Comprehensive error handling with user feedback
- **Type Safety**: Strongly typed with Zod validation
- **Supabase Integration**: Stores calendar feeds and sync status in Supabase