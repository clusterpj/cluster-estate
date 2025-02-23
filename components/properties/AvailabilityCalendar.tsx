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
        allDay: true
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
        allDay: true
      });
    });

    return allEvents;
  }, [bookings, availability]);

  // Custom event styling
  const eventStyleGetter = (event: CalendarEvent) => {
    let style: React.CSSProperties = {
      borderRadius: '4px',
      opacity: 0.8,
      border: '0',
      display: 'block',
      overflow: 'hidden'
    };

    switch (event.status) {
      case 'confirmed':
        style.backgroundColor = '#ef4444';  // red-500
        break;
      case 'pending':
        style.backgroundColor = '#eab308';  // yellow-500
        break;
      case 'unavailable':
        style.backgroundColor = '#6b7280';  // gray-500
        break;
      case 'available':
        style.backgroundColor = '#22c55e';  // green-500
        break;
    }

    return {
      style
    };
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
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            ←
          </button>
          <button
            onClick={goToNext}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            →
          </button>
          <button
            onClick={goToToday}
            className="ml-2 px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-md"
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
              'px-3 py-1 text-sm rounded-md',
              view === Views.MONTH
                ? 'bg-gray-900 text-white'
                : 'bg-gray-100 hover:bg-gray-200'
            )}
          >
            Month
          </button>
          <button
            onClick={() => setView(Views.WEEK)}
            className={cn(
              'px-3 py-1 text-sm rounded-md',
              view === Views.WEEK
                ? 'bg-gray-900 text-white'
                : 'bg-gray-100 hover:bg-gray-200'
            )}
          >
            Week
          </button>
        </div>
      </div>
    );
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
        components={{
          toolbar: CustomToolbar
        }}
        className="rounded-lg border shadow-sm"
      />
    </div>
  );
}
