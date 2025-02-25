'use client';

import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Database } from '@/types/supabase';
import { Calendar, CalendarProps, Views, dateFnsLocalizer } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { enUS } from 'date-fns/locale';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { cn } from '@/lib/utils';
import { ChevronLeftIcon, ChevronRightIcon } from '@radix-ui/react-icons';
import { useTranslations } from 'next-intl';

interface PublicAvailabilityCalendarProps {
  propertyId: string;
  className?: string;
}

type CalendarEvent = {
  id: string;
  title: string;
  start: Date;
  end: Date;
  status: 'unavailable' | 'available';
  allDay: boolean;
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

export function PublicAvailabilityCalendar({ propertyId, className }: PublicAvailabilityCalendarProps) {
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [view, setView] = useState<Views>(Views.MONTH);
  const supabase = createClientComponentClient<Database>();
  const t = useTranslations('PropertyDetails');
  const calendarT = useTranslations('PropertyDetails.calendar');

  // Fetch bookings and availability data
  const { data: bookings = [], isLoading: isLoadingBookings } = useQuery({
    queryKey: ['public-bookings', propertyId],
    enabled: !!propertyId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('bookings')
        .select('id, check_in, check_out, status')
        .eq('property_id', propertyId)
        .in('status', ['confirmed', 'pending']);

      if (error) throw error;
      return data;
    }
  });

  const { data: availability = [], isLoading: isLoadingAvailability } = useQuery({
    queryKey: ['public-property-availability', propertyId],
    enabled: !!propertyId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('property_availability')
        .select('id, start_date, end_date, status')
        .eq('property_id', propertyId);

      if (error) throw error;
      return data;
    }
  });

  // Process calendar events - simplified for public view
  const events = useMemo<CalendarEvent[]>(() => {
    const allEvents: CalendarEvent[] = [];

    // Add bookings as unavailable dates
    bookings.forEach(booking => {
      allEvents.push({
        id: `booking-${booking.id}`,
        title: calendarT('unavailable'),
        start: new Date(booking.check_in),
        end: new Date(booking.check_out),
        status: 'unavailable',
        allDay: true
      });
    });

    // Add availability blocks
    availability.forEach(block => {
      allEvents.push({
        id: `availability-${block.id}`,
        title: block.status === 'unavailable' ? calendarT('unavailable') : calendarT('available'),
        start: new Date(block.start_date),
        end: new Date(block.end_date),
        status: block.status as 'unavailable' | 'available',
        allDay: true
      });
    });

    return allEvents;
  }, [bookings, availability, calendarT]);

  // Custom event styling - simplified
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
      case 'unavailable':
        style.backgroundColor = 'hsl(var(--destructive))';
        style.color = 'hsl(var(--destructive-foreground))';
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

  // Custom toolbar to match our UI
  const CustomToolbar: CalendarProps['components']['toolbar'] = (toolbarProps) => {
    const goToToday = () => {
      toolbarProps.onNavigate('TODAY');
      setCurrentDate(new Date());
    };
    
    const goToBack = () => {
      toolbarProps.onNavigate('PREV');
      const newDate = new Date(currentDate);
      newDate.setMonth(newDate.getMonth() - 1);
      setCurrentDate(newDate);
    };
    
    const goToNext = () => {
      toolbarProps.onNavigate('NEXT');
      const newDate = new Date(currentDate);
      newDate.setMonth(newDate.getMonth() + 1);
      setCurrentDate(newDate);
    };

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
            {calendarT('today')}
          </button>
        </div>
        <h2 className="text-lg font-semibold">
          {format(currentDate, 'MMMM yyyy')}
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
            {calendarT('month')}
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
            {calendarT('week')}
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

  // Simplified event component without hover details
  const EventComponent: CalendarProps['components']['event'] = ({ event }) => {
    const calEvent = event as CalendarEvent;
    
    return (
      <div className="w-full h-full cursor-default">
        {calEvent.title}
      </div>
    );
  };

  return (
    <div className={cn('h-[600px] p-4', className)}>
      <Calendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        view={view}
        onView={setView}
        views={[Views.MONTH, Views.WEEK]}
        defaultDate={currentDate}
        date={currentDate}
        onNavigate={setCurrentDate}
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
