"use client";

import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Calendar, Users, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DateRangePicker } from '@/components/ui/date-range-picker';
import { cn } from '@/lib/utils';
import { usePropertySearch } from '@/hooks/usePropertySearch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { motion } from "framer-motion";

interface SimpleSearchSectionProps {
  className?: string;
}

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

export function SimpleSearchSection({ className }: SimpleSearchSectionProps) {
  const t = useTranslations('Search');
  const { filters, updateFilters, handleSearch, isSearching } = usePropertySearch();
  const [guestCount, setGuestCount] = useState("2");

  return (
    <section className={cn("relative py-16 md:py-24 overflow-hidden", className)}>
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-secondary/5">
        <div className="absolute inset-0" style={{
          backgroundImage: 'url("/pattern.svg")',
          backgroundSize: '30px 30px',
          opacity: 0.1
        }} />
      </div>

      <div className="container relative px-4 md:px-6">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={{
            hidden: { opacity: 0 },
            visible: { opacity: 1 }
          }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
            {t('findYourPerfectStay')}
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            {t('searchDescription')}
          </p>
        </motion.div>

        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeIn}
          transition={{ delay: 0.2 }}
          className="mx-auto max-w-4xl backdrop-blur-sm bg-white/90 rounded-xl shadow-lg p-6 md:p-8"
        >
          <div className="flex flex-col md:flex-row md:items-end gap-4 md:gap-6">
            {/* People Count */}
            <div className="flex-1 min-w-0 space-y-2">
              <div className="flex items-center">
                <Users className="mr-2 h-4 w-4 text-primary" />
                <span className="text-sm font-medium">{t('guests')}</span>
              </div>
              <Select 
                value={guestCount}
                onValueChange={(value) => {
                  setGuestCount(value);
                  updateFilters({ beds: parseInt(value) });
                }}
              >
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
            <div className="flex-[2] min-w-0 space-y-2">
              <div className="flex items-center">
                <Calendar className="mr-2 h-4 w-4 text-primary" />
                <span className="text-sm font-medium">{t('dates')}</span>
              </div>
              <DateRangePicker
                className="w-full"
                value={filters.dateRange}
                onChange={(range) => {
                  updateFilters({ dateRange: range });
                }}
              />
            </div>

            {/* Search Button - Now inline */}
            <div className="md:self-end md:mb-0.5">
              <Button
                type="button"
                size="lg"
                className="w-full md:w-auto gap-2"
                onClick={handleSearch}
                disabled={isSearching}
              >
                <Search className="h-4 w-4" />
                {t('search')}
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}