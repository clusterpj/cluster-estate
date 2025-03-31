# Phase 2 Mini-SRS: Cluster Estate

## System Overview

The Cluster Estate platform is built on a modern, component-based architecture using Next.js with the App Router pattern. The system employs a clear separation between client and server components, leveraging React Server Components where appropriate for improved performance. Data management is handled through Supabase (PostgreSQL), with React Query for client-side data fetching, caching, and state management. The UI is constructed with a composable component library based on Radix UI primitives and styled with TailwindCSS.

Key technology decisions for Phase 2 include enhancing the geospatial capabilities for advanced search, implementing robust internationalization with next-intl, and developing a comprehensive reporting system using Recharts for data visualization. These enhancements build upon the solid foundation established in Phase 1, maintaining consistency in architecture while extending functionality.

## Technical Modules for Phase 2

### Technical Module: TM2.1-GeospatialSearch
- Implements features: F2.1-AdvancedSearch
- Technical approach: Implementing a PostGIS-based search system in Supabase with geocoding capabilities. The frontend will utilize a map-based interface with Mapbox integration for visual property location selection. Search functionality will be enhanced with debounced queries and server-side filtering to optimize performance.
- Interfaces/APIs:
  ```typescript
  // Search endpoint
  GET /api/properties/search
  Query parameters: {
    location?: string,
    bounds?: [number, number, number, number], // [minLng, minLat, maxLng, maxLat]
    propertyType?: string[],
    priceRange?: [number, number],
    bedrooms?: number,
    bathrooms?: number,
    amenities?: string[],
    availability?: [Date, Date],
    sort?: string,
    page?: number,
    pageSize?: number
  }
  
  // Saved Search APIs
  POST /api/user/saved-searches
  GET /api/user/saved-searches
  DELETE /api/user/saved-searches/{id}
  ```
- Data structures:
  ```typescript
  // Saved Search schema
  type SavedSearch = {
    id: string;
    user_id: string;
    search_params: SearchParams;
    name: string;
    notify: boolean;
    created_at: Date;
    updated_at: Date;
  };

  // Search Results schema
  type SearchResults = {
    properties: Property[];
    total: number;
    pageCount: number;
    currentPage: number;
  };
  ```
- Challenges:
  - Optimizing geospatial queries for performance at scale
  - Implementing efficient client-side filtering with server-side pagination
  - Handling complex search criteria while maintaining response time
  - Creating an intuitive map-based interface that works well on mobile devices

### Technical Module: TM2.2-CalendarSystem ✅
- Implements features: F2.2-CalendarManagement
- Technical approach: Extended the existing booking system with a comprehensive calendar management module. Built using react-big-calendar for visualization and implemented a custom iCal parser/generator using ical.js. Calendar synchronization is handled through webhooks and periodic jobs to maintain availability data consistency.
- Interfaces/APIs:
  ```typescript
  // Calendar management endpoints
  GET /api/calendar/{propertyId}
  POST /api/calendar/{propertyId}/block
  DELETE /api/calendar/{propertyId}/block/{blockId}
  
  // iCal integration
  GET /api/ical/{propertyId}/export
  POST /api/ical/{propertyId}/import
  GET /api/ical/{propertyId}/feeds
  POST /api/ical/{propertyId}/feeds
  DELETE /api/ical/{propertyId}/feeds/{feedId}
  ```
- Data structures:
  ```typescript
  // Calendar Feed schema
  type CalendarFeed = {
    id: string;
    property_id: string;
    feed_url: string;
    feed_type: 'import' | 'export';
    sync_enabled: boolean;
    sync_frequency: number; // In minutes
    last_sync_at: Date;
  };

  // Availability Block schema
  type AvailabilityBlock = {
    id: string;
    property_id: string;
    start_date: Date;
    end_date: Date;
    is_available: boolean;
    reason: string;
    external_id?: string;
    recurrence_rule?: string;
  };
  ```
- Challenges:
  - Handling timezone differences in calendar data
  - Resolving conflicts when importing from multiple calendar sources
  - Maintaining data consistency during two-way synchronization
  - Ensuring performance with large numbers of calendar events

### Technical Module: TM2.3-I18nFramework ✅
- Implements features: F2.3-Internationalization
- Technical approach: Implemented comprehensive internationalization using next-intl with locale-based routing. Created a translation system that supports server and client components. Developed a database-backed translation management system with a UI for managing translations.
- Interfaces/APIs:
  ```typescript
  // Internationalization utilities
  getTranslations(namespace: string): Promise<Record<string, string>>
  getLocale(): string
  formatDate(date: Date, options?: Intl.DateTimeFormatOptions): string
  formatNumber(number: number, options?: Intl.NumberFormatOptions): string
  formatCurrency(amount: number, currency?: string): string
  
  // Translation management endpoints
  GET /api/admin/translations
  POST /api/admin/translations
  PUT /api/admin/translations/{id}
  ```
- Data structures:
  ```typescript
  // Translation entry schema
  type Translation = {
    id: string;
    key: string;
    namespace: string;
    locale: string;
    value: string;
    is_approved: boolean;
    created_at: Date;
    updated_at: Date;
  };

  // Locale configuration
  type LocaleConfig = {
    code: string;
    name: string;
    nativeName: string;
    direction: 'ltr' | 'rtl';
    dateFormat: string;
    currencyFormat: string;
    isDefault?: boolean;
  };
  ```
- Challenges:
  - Supporting server-side translations in React Server Components
  - Handling right-to-left languages in UI components
  - Optimizing locale data loading to minimize performance impact
  - Managing translation workflow for content updates

### Technical Module: TM2.4-AnalyticsDashboard
- Implements features: F2.4-AnalyticsReporting
- Technical approach: Creating a comprehensive analytics system using Recharts for visualization and React Query for data fetching. Implementing server-side data aggregation to optimize performance and minimize data transfer. Using vercel/kv for caching frequently accessed analytics data.
- Interfaces/APIs:
  ```typescript
  // Analytics endpoints
  GET /api/analytics/bookings
  Query parameters: {
    property_id?: string,
    start_date: Date,
    end_date: Date,
    group_by: 'day' | 'week' | 'month'
  }
  
  GET /api/analytics/properties/performance
  GET /api/analytics/revenue
  GET /api/analytics/occupancy
  ```
- Data structures:
  ```typescript
  // Analytics data structures
  type BookingAnalytics = {
    period: string;
    total_bookings: number;
    completed: number;
    canceled: number;
    conversion_rate: number;
  };

  // Property performance metrics
  type PropertyPerformance = {
    property_id: string;
    property_name: string;
    occupancy_rate: number;
    avg_booking_value: number;
    total_revenue: number;
    bookings_count: number;
    review_score?: number;
  };
  ```
- Challenges:
  - Designing efficient database queries for analytics data
  - Creating responsive and interactive visualization components
  - Implementing caching strategies for performance optimization
  - Supporting data export in multiple formats (CSV, PDF, Excel)

## Integration Points

- **External dependencies**:
  - Mapbox API for geospatial search and mapping
  - PayPal SDK for payment processing (existing)
  - iCal feeds from third-party calendar systems
  - Storage services for property images and documents

- **Internal component dependencies**:
  - Authentication system for user identification and permission checks
  - Notification system for alerts and updates
  - Property management system for core data access
  - Booking system for availability and reservation data

- **Authentication/authorization approach**:
  The system continues to use Supabase Auth for authentication with role-based access control. Phase 2 extends this with more granular permissions and enhanced admin capabilities. We maintain JWT-based session management with server-side validation for protected operations.

## Technical Debt Considerations

- **Known limitations**:
  - Current database schema needs optimization for advanced search queries
  - Frontend bundle size optimization required for performance improvements
  - Calendar system performance may degrade with large numbers of properties
  - Translation management needs more automated workflow capabilities

- **Future scalability concerns**:
  - Geospatial search performance with large property datasets
  - Analytics data aggregation for properties with high booking volumes
  - Translation management workflow for supporting many languages
  - Synchronization performance with multiple external calendar sources
