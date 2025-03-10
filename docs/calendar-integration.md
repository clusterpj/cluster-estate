# Calendar Component Integration Guide

This document explains how to use and integrate the new calendar components in the application.

## Components Overview

The calendar system consists of several key components:

1. **AvailabilityCalendar** - Main calendar component for displaying availability
2. **PropertyCalendar** - Specific calendar for property booking dates
3. **Calendar Management** - Admin interface for managing calendar settings

## Key Files

- `components/properties/AvailabilityCalendar/index.tsx`
- `components/properties/PropertyBooking/PropertyCalendar.tsx`
- `app/[locale]/admin/components/calendar-management.tsx`
- `app/api/properties/[id]/availability/route.ts`
- `app/api/properties/availability/route.ts`

## Integration Steps

### 1. Using AvailabilityCalendar with Booking System

The `AvailabilityCalendar` component integrates directly with the booking system to ensure date consistency:

- Automatically checks property availability
- Validates date ranges against existing bookings
- Shows real-time availability status
- Prevents selection of unavailable dates
- Highlights pending and confirmed bookings

Example integration with booking form:

```tsx
function BookingForm({ property }) {
  const [selectedDates, setSelectedDates] = useState({
    start: null,
    end: null
  })

  return (
    <div>
      <AvailabilityCalendar 
        propertyId={property.id}
        onDateSelect={(date) => {
          // Handle date selection and validation
          if (isDateAvailable(date)) {
            setSelectedDates(prev => ({
              ...prev,
              start: date
            }))
          }
        }}
      />
      
      {/* Booking form fields */}
    </div>
  )
}
```

```tsx
import { AvailabilityCalendar } from '@/components/properties/AvailabilityCalendar'

function MyComponent() {
  return (
    <AvailabilityCalendar 
      propertyId="your-property-id" // Optional for single property view
    />
  )
}
```

### 2. Using PropertyCalendar

The `PropertyCalendar` component is designed for booking flows:

```tsx
import { PropertyCalendar } from '@/components/properties/PropertyBooking/PropertyCalendar'

function BookingForm({ property }) {
  const [selectedDates, setSelectedDates] = useState({
    start: null,
    end: null
  })

  return (
    <PropertyCalendar
      property={property}
      selectedDates={selectedDates}
      onDateSelect={(date) => {
        // Handle date selection
      }}
    />
  )
}
```

### 3. Admin Calendar Management

The calendar management interface is available in the admin section:

```tsx
import { CalendarManagement } from '@/components/admin/CalendarManagement'

function AdminPage() {
  return (
    <div>
      <CalendarManagement />
    </div>
  )
}
```

## API Endpoints

### Get Availability for Single Property
`GET /api/properties/[id]/availability`

Returns availability data for a specific property.

### Get Aggregate Availability
`GET /api/properties/availability`

Returns availability data across all properties.

## Styling and Customization

The calendar components support customization through props:

- `className` - Add custom CSS classes
- `style` - Inline styles
- `locale` - Localization settings
- `disabledDates` - Custom disabled dates
- `dateFormat` - Custom date formatting

## Localization

The calendar supports localization through the `next-intl` library. Add translations to your locale files:

```json
{
  "auth": {
    "adminSection": {
      "calendar": {
        "title": "Calendar Management",
        "description": "Manage calendar sync and availability",
        "legend": {
          "available": "Available",
          "booked": "Booked",
          "pending": "Pending",
          "maintenance": "Maintenance",
          "partial": "Partial Availability"
        },
        "loading": "Loading calendar...",
        "selectProperty": "Select Property",
        "pickDate": "Pick a date",
        "allProperties": "All Properties",
        "error": {
          "title": "Error",
          "message": "Failed to load calendar data"
        }
      }
    }
  }
}
```

## Best Practices

1. Always wrap calendar components in error boundaries
2. Use the provided API endpoints for data fetching
3. Implement proper loading states
4. Use the same date formatting throughout your application
5. Validate dates before submitting forms

## Troubleshooting

### Calendar not loading
- Check API endpoint responses
- Verify property IDs
- Ensure proper authentication

### Date selection issues
- Verify date formats
- Check disabled dates logic
- Validate against property availability

### Styling problems
- Check for CSS conflicts
- Verify Tailwind classes
- Ensure proper theme setup
