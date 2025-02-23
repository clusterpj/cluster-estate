'use client';

import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Database } from '@/types/supabase';
import { Calendar, CalendarProps, Views, dateFnsLocalizer } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay, formatDistance } from 'date-fns';
import { enUS } from 'date-fns/locale';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { cn } from '@/lib/utils';
import { ChevronLeftIcon, ChevronRightIcon } from '@radix-ui/react-icons';
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface AvailabilityCalendarProps {
  propertyId?: string;
  initialDate?: Date;
  className?: string;
  onDateChange?: (date: Date) => void;
}

type CalendarEvent = {
  id: string;
  title: string;
  start: Date;
  end: Date;
  type: 'booking' | 'availability';
  status: 'confirmed' | 'pending' | 'unavailable' | 'available';
  allDay?: boolean;
  source?: 'platform' | 'calendar_sync' | 'manual';
  // Additional booking details
  bookingDetails?: {
    guestName?: string;
    guestEmail?: string;
    guests: number;
    totalPrice?: number;
    createdAt: string;
    notes?: string;
  };
  // Calendar sync details
  calendarDetails?: {
    feedUrl: string;
    feedPriority: number;
    lastSync: string;
  };
};

// Setup localizer for react-big-calendar
const locales = {
  'en-US': enUS,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

export function AvailabilityCalendar({ propertyId, initialDate, className, onDateChange }: AvailabilityCalendarProps) {
  const [view, setView] = useState<Views>(Views.MONTH);
  const supabase = createClientComponentClient<Database>();

  // Fetch bookings and availability data
  const { data: bookings = [], isLoading: isLoadingBookings } = useQuery({
    queryKey: ['bookings', propertyId],
    enabled: !!propertyId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('bookings')
        .select('*')
        .eq('property_id', propertyId)
        .in('status', ['confirmed', 'pending']);

      if (error) throw error;
      return data;
    }
  });

  const { data: availability = [], isLoading: isLoadingAvailability } = useQuery({
    queryKey: ['property_availability', propertyId],
    enabled: !!propertyId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('property_availability')
        .select('*')
        .eq('property_id', propertyId);

      if (error) throw error;
      return data;
    }
  });

  // Process calendar events
  const events = useMemo<CalendarEvent[]>(() => {
    const allEvents: CalendarEvent[] = [];

    // Add bookings
    bookings.forEach(booking => {
      allEvents.push({
        id: `booking-${booking.id}`,
        title: `Booking - ${booking.guests} guests`,
        start: new Date(booking.check_in),
        end: new Date(booking.check_out),
        type: 'booking',
        status: booking.status as 'confirmed' | 'pending',
        source: 'platform',
        allDay: true,
        bookingDetails: {
          guestName: booking.guest_name || 'Guest',
          guestEmail: booking.guest_email,
          guests: booking.guests,
          totalPrice: booking.total_price,
          createdAt: booking.created_at,
          notes: booking.notes
        }
      });
    });

    // Add availability blocks
    availability.forEach(block => {
      allEvents.push({
        id: `availability-${block.id}`,
        title: block.status === 'unavailable' ? 'Unavailable' : 'Available',
        start: new Date(block.start_date),
        end: new Date(block.end_date),
        type: 'availability',
        status: block.status as 'unavailable' | 'available',
        source: block.source,
        allDay: true,
        ...(block.source === 'calendar_sync' && {
          calendarDetails: {
            feedUrl: block.feed_id, // You might want to fetch the actual feed URL
            feedPriority: block.feed_priority,
            lastSync: new Date().toISOString() // You might want to fetch the actual last sync time
          }
        })
      });
    });

    return allEvents;
  }, [bookings, availability]);

  // Custom event styling
  const eventStyleGetter = (event: CalendarEvent) => {
    let style: React.CSSProperties = {
      borderRadius: '6px',
      border: '0',
      fontSize: '0.875rem',
      padding: '2px 6px',
      color: 'white',
      fontWeight: 500
    };

    switch (event.status) {
      case 'confirmed':
        style.backgroundColor = 'hsl(var(--destructive))';
        style.color = 'hsl(var(--destructive-foreground))';
        break;
      case 'pending':
        style.backgroundColor = 'hsl(var(--warning))';
        style.color = 'hsl(var(--warning-foreground))';
        break;
      case 'unavailable':
        style.backgroundColor = 'hsl(var(--muted))';
        style.color = 'hsl(var(--muted-foreground))';
        break;
      case 'available':
        style.backgroundColor = 'hsl(var(--success))';
        style.color = 'hsl(var(--success-foreground))';
        break;
    }

    return {
      style
    };
  };

  // Custom event component with tooltip
  const EventComponent: CalendarProps['components']['event'] = ({ event }) => {
    const calEvent = event as CalendarEvent;
    
    return (
      <HoverCard>
        <HoverCardTrigger asChild>
          <div className="w-full h-full cursor-pointer">
            {calEvent.title}
          </div>
        </HoverCardTrigger>
        <HoverCardContent className="w-80">
          <div className="flex justify-between space-x-4">
            <Avatar>
              <AvatarFallback>
                {calEvent.source === 'platform' ? 'PB' : calEvent.source === 'calendar_sync' ? 'CS' : 'MA'}
              </AvatarFallback>
            </Avatar>
            <div className="space-y-1 flex-1">
              <h4 className="text-sm font-semibold">
                {calEvent.type === 'booking' ? 'Booking Details' : 'Availability Block'}
              </h4>
              <div className="text-sm text-muted-foreground space-y-1">
                <div>
                  {format(calEvent.start, 'PPP')} - {format(calEvent.end, 'PPP')}
                  <span className="text-xs ml-1 text-muted-foreground">
                    ({formatDistance(calEvent.start, calEvent.end)})
                  </span>
                </div>
                
                {calEvent.source === 'platform' && calEvent.bookingDetails && (
                  <>
                    <div>Guest: {calEvent.bookingDetails.guestName}</div>
                    <div>Email: {calEvent.bookingDetails.guestEmail}</div>
                    <div>Guests: {calEvent.bookingDetails.guests}</div>
                    {calEvent.bookingDetails.totalPrice && (
                      <div>Price: ${calEvent.bookingDetails.totalPrice}</div>
                    )}
                    {calEvent.bookingDetails.notes && (
                      <div>Notes: {calEvent.bookingDetails.notes}</div>
                    )}
                    <div className="text-xs">
                      Booked {formatDistance(new Date(calEvent.bookingDetails.createdAt), new Date(), { addSuffix: true })}
                    </div>
                  </>
                )}

                {calEvent.source === 'calendar_sync' && calEvent.calendarDetails && (
                  <>
                    <div>Source: External Calendar</div>
                    <div>Priority: {calEvent.calendarDetails.feedPriority}</div>
                    <div className="text-xs">
                      Last synced {formatDistance(new Date(calEvent.calendarDetails.lastSync), new Date(), { addSuffix: true })}
                    </div>
                  </>
                )}

                {calEvent.source === 'manual' && (
                  <div>Manually set availability</div>
                )}

                <div className="mt-2 inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2">
                  {calEvent.status}
                </div>
              </div>
            </div>
          </div>
        </HoverCardContent>
      </HoverCard>
    );
  };

  // Custom toolbar to match our UI
  const CustomToolbar: CalendarProps['components']['toolbar'] = (toolbarProps) => {
    const goToToday = () => toolbarProps.onNavigate('TODAY');
    const goToBack = () => toolbarProps.onNavigate('PREV');
    const goToNext = () => toolbarProps.onNavigate('NEXT');

    return (
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-2">
          <button
            onClick={goToBack}
            className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground h-9 w-9"
          >
            <ChevronLeftIcon className="h-4 w-4" />
          </button>
          <button
            onClick={goToNext}
            className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground h-9 w-9"
          >
            <ChevronRightIcon className="h-4 w-4" />
          </button>
          <button
            onClick={goToToday}
            className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground h-9 px-4"
          >
            Today
          </button>
        </div>
        <h2 className="text-lg font-semibold">
          {format(toolbarProps.date, 'MMMM yyyy')}
        </h2>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setView(Views.MONTH)}
            className={cn(
              'inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 h-9 px-4',
              view === Views.MONTH
                ? 'bg-primary text-primary-foreground shadow hover:bg-primary/90'
                : 'border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground'
            )}
          >
            Month
          </button>
          <button
            onClick={() => setView(Views.WEEK)}
            className={cn(
              'inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 h-9 px-4',
              view === Views.WEEK
                ? 'bg-primary text-primary-foreground shadow hover:bg-primary/90'
                : 'border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground'
            )}
          >
            Week
          </button>
        </div>
      </div>
    );
  };

  // Custom day cell styling
  const dayPropGetter = (date: Date) => {
    return {
      className: cn(
        'hover:bg-accent hover:text-accent-foreground',
        'transition-colors',
        'border border-border'
      )
    };
  };

  return (
    <div className={cn('h-[700px] p-4', className)}>
      <Calendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        view={view}
        onView={setView}
        views={[Views.MONTH, Views.WEEK]}
        defaultDate={initialDate || new Date()}
        date={initialDate}
        onNavigate={(newDate) => onDateChange?.(newDate)}
        eventPropGetter={eventStyleGetter}
        dayPropGetter={dayPropGetter}
        components={{
          toolbar: CustomToolbar,
          event: EventComponent
        }}
        className={cn(
          'rounded-lg border shadow-sm bg-background text-foreground',
          '[&_.rbc-off-range-bg]:bg-muted/50',
          '[&_.rbc-today]:bg-accent/50',
          '[&_.rbc-header]:border-border [&_.rbc-header]:p-2 [&_.rbc-header]:font-medium',
          '[&_.rbc-month-row]:border-border',
          '[&_.rbc-day-bg]:border-border',
          '[&_.rbc-time-header]:border-border',
          '[&_.rbc-time-content]:border-border',
          '[&_.rbc-time-slot]:border-border',
          '[&_.rbc-event]:rounded-md [&_.rbc-event]:font-medium',
          '[&_.rbc-event-content]:text-sm'
        )}
      />
    </div>
  );
}
