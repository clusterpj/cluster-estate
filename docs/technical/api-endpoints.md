# API Endpoints

## Calendars

### Create Calendar
`POST /api/calendars`
```json
{
  "property_id": "uuid",
  "name": "string",
  "type": "internal|ical",
  "ical_url": "string?",
  "sync_frequency": "daily|weekly|monthly?"
}
```

### Get Calendars
`GET /api/calendars?property_id=uuid`

### Sync Calendar
`POST /api/calendars/{id}/sync`

### Manage Calendar Events
`POST /api/calendars/{id}/events`
```json
{
  "summary": "string",
  "description": "string?",
  "start": "ISO8601",
  "end_time": "ISO8601",
  "status": "confirmed|tentative|cancelled",
  "attendees": [
    {
      "email": "string",
      "name": "string?"
    }
  ]
}
```

## Bookings

### Create Booking
`POST /api/bookings/create`
```json
{
  "property_id": "uuid",
  "check_in": "ISO8601",
  "check_out": "ISO8601",
  "guests": "number",
  "special_requests": "string?",
  "total_price": "number"
}
```

### Capture Payment
`POST /api/bookings/capture`
```json
{
  "orderId": "string",
  "bookingId": "uuid"
}
```
