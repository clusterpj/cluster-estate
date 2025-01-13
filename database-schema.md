# Database Schema Changes

## New Tables

### Calendars
```sql
CREATE TABLE calendars (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('internal', 'ical')),
  ical_url TEXT,
  sync_token TEXT,
  last_sync TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

### Calendar Events
```sql
CREATE TABLE calendar_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  calendar_id UUID NOT NULL REFERENCES calendars(id) ON DELETE CASCADE,
  event_id TEXT NOT NULL,
  summary TEXT,
  description TEXT,
  start TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('confirmed', 'tentative', 'cancelled')),
  attendees JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

## Modified Tables

### Bookings
Added calendar event reference:
```sql
ALTER TABLE bookings
ADD COLUMN calendar_event_id UUID REFERENCES calendar_events(id);
```

### Properties
Added availability fields:
```sql
ALTER TABLE properties
ADD COLUMN available_from TIMESTAMPTZ,
ADD COLUMN available_to TIMESTAMPTZ,
ADD COLUMN minimum_rental_period INT;
```
