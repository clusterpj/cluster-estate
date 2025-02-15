// app/api/ical/route.ts
export async function GET() {
    const icsContent = `BEGIN:VCALENDAR
  VERSION:2.0
  PRODID:-//Property Management//Test Feed//EN
  BEGIN:VEVENT
  UID:test-event-1@cluster-estate
  DTSTAMP:20250130T230000Z
  DTSTART:20250201T090000Z
  DTEND:20250205T170000Z
  SUMMARY:Test Booking - Property 123
  STATUS:CONFIRMED
  DESCRIPTION:Sample booking for testing purposes
  LOCATION:Test Property Location
  END:VEVENT
  BEGIN:VEVENT
  UID:test-event-2@cluster-estate
  DTSTAMP:20250130T230000Z
  DTSTART:20250210T120000Z
  DTEND:20250215T120000Z
  SUMMARY:Blocked Dates
  STATUS:canceled
  DESCRIPTION:Maintenance period
  END:VEVENT
  END:VCALENDAR`;
  
    return new Response(icsContent, {
      headers: {
        'Content-Type': 'text/calendar',
        'Content-Disposition': 'attachment; filename="test-feed.ics"'
      }
    });
  }