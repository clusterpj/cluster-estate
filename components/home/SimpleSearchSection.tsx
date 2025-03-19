"use client";

import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Calendar, Users } from 'lucide-react';
import { DateRange } from 'react-day-picker';
import { Button } from '@/components/ui/button';
import { DateRangePicker } from '@/components/ui/date-range-picker';
import { cn } from '@/lib/utils';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface SimpleSearchSectionProps {
  className?: string;
}

export function SimpleSearchSection({ className }: SimpleSearchSectionProps) {
  const t = useTranslations('Search');
  const [dateRange, setDateRange] = useState<DateRange>({
    from: new Date(),
    to: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
  });

  return (
    <section className={cn("py-8 md:py-12", className)}>
      <div className="container px-4 md:px-6">
        <div className="mx-auto max-w-3xl bg-white rounded-lg shadow-md p-4 md:p-6">
          <div className="grid gap-4 md:grid-cols-3">
            {/* People Count */}
            <div className="space-y-2">
              <div className="flex items-center">
                <Users className="mr-2 h-4 w-4 text-primary" />
                <span className="text-sm font-medium">{t('guests')}</span>
              </div>
              <Select defaultValue="2">
                <SelectTrigger className="w-full">
                  <SelectValue placeholder={t('selectGuests')} />
                </SelectTrigger>
                <SelectContent>
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((num) => (
                    <SelectItem key={num} value={num.toString()}>
                      {num} {num === 1 ? t('guest') : t('guests')}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Check-in/Check-out dates */}
            <div className="md:col-span-2 space-y-2">
              <div className="flex items-center">
                <Calendar className="mr-2 h-4 w-4 text-primary" />
                <span className="text-sm font-medium">{t('dates')}</span>
              </div>
              <DateRangePicker
                className="w-full"
                value={dateRange}
                onChange={(range) => {
                  if (range) {
                    setDateRange(range);
                  }
                }}
              />
            </div>
          </div>
          
          <div className="mt-4 flex justify-end">
            <Button type="submit" className="w-full md:w-auto">
              {t('search')}
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}