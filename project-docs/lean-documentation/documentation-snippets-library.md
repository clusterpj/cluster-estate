# Documentation Snippets Library: Cluster Estate

## Common Validation Patterns

### Form Validation with Zod
```typescript
import { z } from 'zod';

// Property form validation schema
export const propertyFormSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters').max(100),
  description: z.string().min(20, 'Description must be at least 20 characters'),
  propertyType: z.enum(['house', 'apartment', 'villa', 'land']),
  listingType: z.enum(['sale', 'rent', 'both']),
  price: z.number().positive('Price must be positive'),
  bedrooms: z.number().int().min(0).optional(),
  bathrooms: z.number().min(0).optional(),
  address: z.string().min(5, 'Address is required'),
  city: z.string().min(2, 'City is required'),
  country: z.string().min(2, 'Country is required'),
});

// Usage with React Hook Form
const form = useForm<z.infer<typeof propertyFormSchema>>({
  resolver: zodResolver(propertyFormSchema),
  defaultValues: {
    title: '',
    description: '',
    propertyType: 'house',
    listingType: 'rent',
    price: 0,
    bedrooms: 0,
    bathrooms: 0,
    address: '',
    city: '',
    country: '',
  },
});
```

### API Request Validation
```typescript
import { z } from 'zod';
import { NextRequest, NextResponse } from 'next/server';

// Booking creation request schema
const bookingRequestSchema = z.object({
  propertyId: z.string().uuid(),
  checkIn: z.string().refine(val => !isNaN(Date.parse(val)), {
    message: 'Invalid check-in date',
  }),
  checkOut: z.string().refine(val => !isNaN(Date.parse(val)), {
    message: 'Invalid check-out date',
  }),
  guests: z.number().int().positive(),
  specialRequests: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const result = bookingRequestSchema.safeParse(body);
    
    if (!result.success) {
      return NextResponse.json(
        { error: 'Validation error', details: result.error.format() },
        { status: 400 }
      );
    }
    
    // Process validated booking request
    const validatedData = result.data;
    // ...
    
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to process booking request' },
      { status: 500 }
    );
  }
}
```

## Error Handling Approaches

### Client-Side Error Handling
```typescript
import { useState } from 'react';
import { toast } from '@/components/ui/use-toast';

export function useErrorHandler() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleError = (error: unknown) => {
    setIsLoading(false);
    
    // Determine error message based on error type
    let message = 'An unexpected error occurred';
    
    if (error instanceof Error) {
      message = error.message;
    } else if (typeof error === 'string') {
      message = error;
    } else if (typeof error === 'object' && error !== null && 'message' in error) {
      message = String((error as { message: unknown }).message);
    }
    
    // Set error state
    setError(message);
    
    // Show toast notification
    toast({
      variant: 'destructive',
      title: 'Error',
      description: message,
    });
    
    // Optionally log to monitoring service
    console.error('Error:', error);
  };

  return { isLoading, setIsLoading, error, setError, handleError };
}
```

### Server-Side Error Handling
```typescript
import { NextRequest, NextResponse } from 'next/server';

// Error types
export class ApiError extends Error {
  constructor(
    public readonly message: string,
    public readonly statusCode: number,
    public readonly details?: unknown
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

// Error handler middleware
export function withErrorHandler(handler: Function) {
  return async (req: NextRequest, ...args: any[]) => {
    try {
      return await handler(req, ...args);
    } catch (error) {
      console.error('API error:', error);
      
      if (error instanceof ApiError) {
        return NextResponse.json(
          { error: error.message, details: error.details },
          { status: error.statusCode }
        );
      }
      
      // Database errors
      if (error instanceof Error && error.message.includes('Database')) {
        return NextResponse.json(
          { error: 'Database operation failed' },
          { status: 500 }
        );
      }
      
      // Default error response
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      );
    }
  };
}
```

## Integration Patterns

### PayPal Integration
```typescript
import { PayPalScriptProvider, PayPalButtons } from '@paypal/react-paypal-js';

// PayPal configuration
const paypalOptions = {
  clientId: process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID!,
  currency: 'USD',
  intent: 'capture',
};

// Component implementation
export function PaymentProcessor({ amount, bookingId, onSuccess, onError }) {
  const createOrder = async () => {
    try {
      const response = await fetch('/api/payments/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookingId, amount }),
      });
      
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to create order');
      
      return data.orderId;
    } catch (error) {
      console.error('Create order error:', error);
      onError(error);
      throw error;
    }
  };

  const onApprove = async (data: { orderID: string }) => {
    try {
      const response = await fetch('/api/payments/capture-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId: data.orderID, bookingId }),
      });
      
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Failed to capture payment');
      
      onSuccess(result);
    } catch (error) {
      console.error('Capture order error:', error);
      onError(error);
    }
  };

  return (
    <PayPalScriptProvider options={paypalOptions}>
      <PayPalButtons
        style={{ layout: 'vertical' }}
        createOrder={createOrder}
        onApprove={onApprove}
        onError={(err) => onError(err)}
      />
    </PayPalScriptProvider>
  );
}
```

### iCal Integration
```typescript
import ICAL from 'ical.js';

// Function to parse iCal feed
export async function parseICalFeed(feedUrl: string) {
  try {
    const response = await fetch(feedUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch iCal feed: ${response.statusText}`);
    }
    
    const icalData = await response.text();
    const jcalData = ICAL.parse(icalData);
    const comp = new ICAL.Component(jcalData);
    const events = comp.getAllSubcomponents('vevent');
    
    return events.map(event => {
      const icalEvent = new ICAL.Event(event);
      return {
        uid: icalEvent.uid,
        summary: icalEvent.summary,
        description: icalEvent.description,
        startDate: icalEvent.startDate.toJSDate(),
        endDate: icalEvent.endDate.toJSDate(),
        location: icalEvent.location,
        status: icalEvent.status,
      };
    });
  } catch (error) {
    console.error('Error parsing iCal feed:', error);
    throw error;
  }
}

// Function to generate iCal feed
export function generateICalFeed(bookings: any[]) {
  const calendar = new ICAL.Component(['vcalendar', [], []]);
  calendar.updatePropertyWithValue('prodid', '-//Cluster Estate//EN');
  calendar.updatePropertyWithValue('version', '2.0');
  
  bookings.forEach(booking => {
    const event = new ICAL.Component(['vevent', [], []]);
    event.updatePropertyWithValue('uid', booking.id);
    event.updatePropertyWithValue('summary', `Booking: ${booking.property_name}`);
    event.updatePropertyWithValue('description', `Booking for ${booking.guests} guests`);
    
    const startDate = new ICAL.Time();
    startDate.fromJSDate(new Date(booking.check_in));
    event.updatePropertyWithValue('dtstart', startDate);
    
    const endDate = new ICAL.Time();
    endDate.fromJSDate(new Date(booking.check_out));
    event.updatePropertyWithValue('dtend', endDate);
    
    event.updatePropertyWithValue('status', booking.status);
    calendar.addSubcomponent(event);
  });
  
  return calendar.toString();
}
```

## Security Considerations

### Authentication and Authorization
```typescript
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextRequest, NextResponse } from 'next/server';

// Middleware for protected routes
export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });
  
  // Check if user is authenticated
  const { data: { session } } = await supabase.auth.getSession();
  
  // Redirect to login if no session
  if (!session) {
    const redirectUrl = new URL('/auth/login', req.url);
    redirectUrl.searchParams.set('redirectTo', req.nextUrl.pathname);
    return NextResponse.redirect(redirectUrl);
  }
  
  // Check user role for admin routes
  if (req.nextUrl.pathname.startsWith('/admin')) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('user_id', session.user.id)
      .single();
    
    if (!profile || profile.role !== 'admin') {
      return NextResponse.redirect(new URL('/unauthorized', req.url));
    }
  }
  
  return res;
}

// Specify which routes to protect
export const config = {
  matcher: [
    '/dashboard/:path*',
    '/admin/:path*',
    '/bookings/:path*',
    '/properties/manage/:path*',
  ],
};
```

### Data Sanitization
```typescript
import DOMPurify from 'dompurify';

// Function to sanitize user input
export function sanitizeInput(input: string): string {
  if (typeof window === 'undefined') {
    // Server-side sanitization
    const { JSDOM } = require('jsdom');
    const window = new JSDOM('').window;
    const purify = DOMPurify(window);
    return purify.sanitize(input, { USE_PROFILES: { html: false } });
  }
  
  // Client-side sanitization
  return DOMPurify.sanitize(input, { USE_PROFILES: { html: false } });
}

// Usage in API route
export async function POST(req: NextRequest) {
  const body = await req.json();
  
  // Sanitize user-provided content
  const sanitizedDescription = sanitizeInput(body.description);
  const sanitizedSpecialRequests = body.specialRequests 
    ? sanitizeInput(body.specialRequests) 
    : undefined;
  
  // Proceed with sanitized data
  // ...
}
```

### CSRF Protection
```typescript
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

// Generate CSRF token
export function generateCsrfToken(): string {
  return crypto.randomUUID();
}

// Set CSRF token in cookie and return for form
export async function GET(req: NextRequest) {
  const csrfToken = generateCsrfToken();
  cookies().set('csrf-token', csrfToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
  });
  
  return NextResponse.json({ csrfToken });
}

// Validate CSRF token in form submission
export async function POST(req: NextRequest) {
  const body = await req.json();
  const csrfToken = body.csrfToken;
  const storedToken = cookies().get('csrf-token')?.value;
  
  if (!csrfToken || !storedToken || csrfToken !== storedToken) {
    return NextResponse.json(
      { error: 'Invalid CSRF token' },
      { status: 403 }
    );
  }
  
  // Process the validated request
  // ...
}
```