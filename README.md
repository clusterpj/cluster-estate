# Cabarete Villas

A mature real estate management platform built with Next.js, TypeScript, and Supabase, providing comprehensive property management capabilities including booking, payments, and administrative functions.

![Cabarete Villas](https://via.placeholder.com/1200x630/0A7697/FFFFFF?text=Cluster+Estate)

## Overview

Cabarete Villas is a full-featured real estate management platform designed for property owners, agents, and renters. The system enables seamless property browsing, booking with secure payment processing, and comprehensive management interfaces for administrators.

### Core Features

- **Property Browsing**: Advanced filtering, search, and sorting capabilities
- **Booking System**: Complete workflow with PayPal integration
- **Multi-language Support**: Internationalization via next-intl
- **Admin Dashboard**: Comprehensive management interface
- **User Management**: Role-based access controls
- **Calendar Synchronization**: iCal integration for availability management
- **Responsive Design**: Optimized for all device sizes
- **Dark/Light Mode**: Theme support

## Technology Stack

### Frontend
- **Framework**: Next.js 13+ (App Router)
- **Language**: TypeScript
- **Styling**: TailwindCSS with CSS variables
- **UI Components**: shadcn/ui based on Radix UI primitives
- **State Management**: React Query for server state, React hooks for local state
- **Form Handling**: React Hook Form with zod validation
- **Animation**: Framer Motion

### Backend
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Storage**: Supabase Storage
- **API**: Next.js API Routes

### Integrations
- **Payment Processing**: PayPal SDK
- **Calendar Integration**: ical.js
- **Internationalization**: next-intl

## Architecture

The application follows a modern, component-based architecture with clear separation of concerns:

### Directory Structure

```
app/
  [locale]/         # Route group for language-specific paths
    about/          # Static content pages
    activities/     # Location activities
    admin/          # Admin dashboard and management
    auth/           # Authentication pages
    bookings/       # User booking details
    contact/        # Contact form
    dashboard/      # User dashboard
    profile/        # User profile management
    properties/     # Property listing and details
  api/              # API routes
    admin/          # Admin-specific endpoints
    bookings/       # Booking management endpoints
    calendar/       # Calendar synchronization
    ical/           # iCal integration
    properties/     # Property data endpoints
    webhook/        # Webhook handlers (PayPal)
```

### Database Schema

- **properties**: Property listings with details and metadata
- **bookings**: Booking records with payment and status information
- **profiles**: User profile data with role information
- **calendar_feeds**: iCal feed configurations
- **property_availability**: Property availability blocks
- **booking_status_history**: Historical status changes for bookings
- **webhook_events**: External service webhook payloads

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Supabase account
- PayPal Developer account (for payment processing)

### Environment Variables

Create a `.env.local` file with the following:

```
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# PayPal
NEXT_PUBLIC_PAYPAL_CLIENT_ID=your_paypal_client_id
PAYPAL_CLIENT_SECRET=your_paypal_client_secret
PAYPAL_WEBHOOK_ID=your_paypal_webhook_id

# Optional
NEXT_PUBLIC_SITE_URL=your_site_url
```

### Installation

1. Clone the repository
```bash
git clone https://github.com/your-username/cluster-estate.git
cd cluster-estate
```

2. Install dependencies
```bash
npm install
# or
yarn install
```

3. Run the development server
```bash
npm run dev
# or
yarn dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

### Database Setup

1. Create a new Supabase project
2. Run the database migrations (scripts provided in `/supabase/migrations`)
3. Set up the required storage buckets (`property-images` and `avatars`)

## Key Features in Detail

### Property Management

Properties can be created, updated, and managed through the admin interface with comprehensive details:

- Basic information (title, description, location)
- Property type classification
- Price information for sale and/or rental
- Availability calendar
- Image gallery
- Feature lists
- Pet policies

### Booking System

The booking workflow includes:

1. User selects property and dates
2. Payment is authorized via PayPal
3. Booking created with "awaiting_approval" status
4. Admin approves booking
5. Payment is captured
6. Booking status changes to "confirmed"
7. WebHook handlers process PayPal events

### Calendar Management

The calendar system supports:

- iCal feed import from external sources
- Priority-based conflict resolution
- Exporting availability as iCal
- Visual calendar for blocking dates

### User Roles

User management is handled through role-based access:

- **Admin**: Full access to all features and management interfaces
- **Agent**: Property management and booking handling
- **User**: Browsing properties and managing personal bookings

## Internationalization

The application supports multiple languages through:

- Locale-based routing with `[locale]` path parameter
- Translation files for all user-facing strings
- Server-side and client-side translation support
- Language switcher component

## Development Guidelines

### Code Quality

- Follow TypeScript best practices with explicit type definitions
- Maintain consistent error handling patterns
- Use React Query for data fetching and caching
- Follow component modularity principles
- Use proper accessibility attributes

### Component Structure

```typescript
// Example component pattern
interface PropertyCardProps {
  property: Property;
  isHighlighted?: boolean;
  onSelect?: (id: string) => void;
}

export function PropertyCard({ 
  property, 
  isHighlighted = false,
  onSelect 
}: PropertyCardProps) {
  const t = useTranslations('property');
  
  return (
    <div className={cn(
      "rounded-lg p-4 border", 
      isHighlighted && "border-primary bg-primary/5"
    )}>
      <h3>{property.title}</h3>
      <p>{t('price', { value: property.price })}</p>
      <button 
        onClick={() => onSelect?.(property.id)}
        aria-label={t('select_property')}
      >
        {t('view_details')}
      </button>
    </div>
  );
}
```

### API Structure

```typescript
// Example API route pattern
export async function GET(
  request: Request, 
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const { data, error } = await supabase
      .from('properties')
      .select('*')
      .eq('id', params.id)
      .single()

    if (error) throw error
    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch property' },
      { status: 500 }
    )
  }
}
```

## Deployment

The application is designed for deployment on Vercel:

1. Connect your GitHub repository to Vercel
2. Configure the environment variables
3. Deploy the application

For other platforms, ensure the following:

- Node.js 18+ runtime
- Support for Next.js App Router
- Proper environment variable configuration
- Webhook endpoint access for PayPal integration

## Future Development Roadmap

### Near-term Enhancements

- **Enhanced Search**: Implement advanced search with filtering and sorting
- **Payment Method Options**: Add additional payment providers beyond PayPal
- **User Reviews**: Add property review and rating system
- **Notification System**: Implement email and in-app notifications
- **Reporting**: Create analytics dashboards for property owners and admins

### Performance Optimizations

- **Server Components**: Convert more components to React Server Components
- **Image Optimization**: Enhance image handling with proper sizing and formats
- **Bundle Size Reduction**: Analyze and optimize bundle size
- **Static Generation**: Implement static generation for applicable routes
- **API Response Caching**: Add edge caching for frequently accessed data

### Architecture Improvements

- **Microservices Transition**: Gradually migrate to a microservices architecture
- **GraphQL API**: Implement a GraphQL API layer for optimized data fetching
- **Webhooks System**: Expand the webhook system for third-party integrations
- **Feature Flags**: Implement a feature flag system for controlled rollouts

## Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

Please ensure your code adheres to the existing style guidelines and includes appropriate tests.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Contact

For questions or support, please contact us at support@clusterestate.com.

---

Built with ❤️ by the Cabarete Villas Team
