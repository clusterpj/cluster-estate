# Configuration Options

## Environment Variables
```bash
# Calendar Sync
CALENDAR_SYNC_INTERVAL=3600 # Sync interval in seconds
MAX_SYNC_RETRIES=3

# PayPal
PAYPAL_CLIENT_ID=your_client_id
PAYPAL_CLIENT_SECRET=your_client_secret
PAYPAL_ENVIRONMENT=sandbox|live

# Supabase
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

## Calendar Settings
- Default sync frequency: daily
- Maximum event history: 1 year
- Conflict resolution: prefer internal calendar
- Timezone: UTC (converted to local time for display)

## Booking Settings
- Minimum rental period: 1 day
- Maximum booking window: 1 year
- Cancellation policy: 7 days before check-in
- Payment timeout: 30 minutes
