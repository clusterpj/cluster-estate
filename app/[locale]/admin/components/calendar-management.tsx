import { AvailabilityCalendar } from '@/components/properties/AvailabilityCalendar';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon } from '@radix-ui/react-icons';
import { format } from 'date-fns';
import { Calendar } from '@/components/ui/calendar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useState } from 'react';

export function CalendarManagement() {
  const t = useTranslations('admin.calendar');
  const [selectedProperty, setSelectedProperty] = useState('all');
  const [date, setDate] = useState<Date>(new Date());

  // Mock properties for filtering
  const properties = [
    { id: 'all', name: t('allProperties') },
    { id: '1', name: 'Villa Azul' },
    { id: '2', name: 'Casa Verde' },
    { id: '3', name: 'Penthouse Rojo' }
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4">
        <h2 className="text-2xl font-bold">{t('title')}</h2>
        <p className="text-muted-foreground">{t('description')}</p>
      </div>

      {/* Filters and Controls */}
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
        <Select value={selectedProperty} onValueChange={setSelectedProperty}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder={t('selectProperty')} />
          </SelectTrigger>
          <SelectContent>
            {properties.map(property => (
              <SelectItem key={property.id} value={property.id}>
                {property.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className="w-[200px] justify-start text-left font-normal"
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {date ? format(date, 'PPP') : <span>{t('pickDate')}</span>}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar
              mode="single"
              selected={date}
              onSelect={(d) => d && setDate(d)}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>

      {/* Calendar Legend */}
      <div className="flex flex-wrap gap-4 text-sm">
        <div className="flex items-center gap-2">
          <span className="h-3 w-3 rounded-full bg-green-100" />
          {t('legend.available')}
        </div>
        <div className="flex items-center gap-2">
          <span className="h-3 w-3 rounded-full bg-red-100" />
          {t('legend.booked')}
        </div>
        <div className="flex items-center gap-2">
          <span className="h-3 w-3 rounded-full bg-yellow-100" />
          {t('legend.pending')}
        </div>
        <div className="flex items-center gap-2">
          <span className="h-3 w-3 rounded-full bg-gray-100" />
          {t('legend.maintenance')}
        </div>
      </div>

      {/* Enhanced Calendar */}
      <div className="w-full overflow-x-auto">
        <AvailabilityCalendar 
          propertyId={selectedProperty === 'all' ? undefined : selectedProperty}
          initialDate={date}
          className="min-w-[1000px]"
        />
      </div>
    </div>
  );
}
