# Booking System Setup

This document outlines the setup process for the property booking system with PayPal integration.

## Prerequisites

1. PayPal Business Account (Sandbox or Production)
2. Supabase Project with the latest migrations applied

## Environment Variables

Add the following variables to your `.env` file:

```env
# PayPal Configuration
NEXT_PUBLIC_PAYPAL_CLIENT_ID=your_paypal_client_id
PAYPAL_CLIENT_SECRET=your_paypal_client_secret
PAYPAL_MODE=sandbox # or 'production' for live environment
```

## PayPal Setup

1. Go to [PayPal Developer Dashboard](https://developer.paypal.com/dashboard/)
2. Create a new app in your PayPal account
3. Get your client ID and secret
4. Add them to your environment variables

## Database Setup

The booking system requires the following tables:
- `properties` (with rental-specific fields)
- `bookings` (for storing booking information)

Apply the migrations:

```bash
pnpm supabase migration up
```

## Features

- Property availability checking
- Booking form with date selection
- PayPal payment integration
- Booking management
- Email notifications (coming soon)

## Usage

### Creating a Booking

1. Navigate to a property detail page
2. If the property is available for rent, you'll see a booking form
3. Select dates and number of guests
4. Click "Continue to Payment"
5. Complete payment through PayPal
6. Receive booking confirmation

### Managing Bookings

(Coming soon)
- View bookings in user dashboard
- Cancel bookings
- Modify booking dates

## Development

### Adding New Features

1. Create a new migration for any database changes
2. Update types in `types/` directory
3. Add new components in `components/properties/PropertyBooking/`
4. Update API routes in `app/api/bookings/`

### Testing

(Coming soon)
- Unit tests for booking logic
- Integration tests for PayPal flow
- E2E tests for booking process

## Troubleshooting

### Common Issues

1. PayPal button not showing
   - Check if NEXT_PUBLIC_PAYPAL_CLIENT_ID is set correctly
   - Ensure you're using the correct PayPal mode (sandbox/production)

2. Booking creation fails
   - Check if all required fields are filled
   - Verify database connection and migrations
   - Check server logs for detailed error messages

## Security Considerations

- All booking operations require authentication
- Payment processing is handled securely through PayPal
- Sensitive data is not stored in the frontend
- Database access is controlled through Row Level Security

## Future Improvements

- [ ] Add booking modification functionality
- [ ] Implement email notifications
- [ ] Add calendar sync functionality
- [ ] Create booking management dashboard
- [ ] Add booking analytics