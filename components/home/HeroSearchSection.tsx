"use client";

import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Calendar, Users, Search, MapPin, Wind, Umbrella } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
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
import { FadeInView } from '@/components/animations/fade-in-view';

interface HeroSearchSectionProps {
  className?: string;
}

const features = [
  {
    icon: MapPin,
    title: "primeLocation",
    description: "primeLocationDesc",
    filter: "beachfront"
  },
  {
    icon: Wind,
    title: "perfectConditions",
    description: "perfectConditionsDesc",
    filter: "watersports"
  },
  {
    icon: Umbrella,
    title: "beachLifestyle",
    description: "beachLifestyleDesc",
    filter: "lifestyle"
  },
  {
    icon: Users,
    title: "localExpertise",
    description: "localExpertiseDesc",
    filter: "local"
  }
];

export function HeroSearchSection({ className }: HeroSearchSectionProps) {
  const t = useTranslations('Search');
  const heroT = useTranslations('HeroSearchSection');
  const { filters, updateFilters, handleSearch, isSearching } = usePropertySearch();
  const [guestCount, setGuestCount] = useState("2");
  
  // Get current date and next month for the helper text
  const currentDate = new Date();
  const nextMonth = new Date(currentDate);
  nextMonth.setMonth(currentDate.getMonth() + 1);

  return (
    <section className={cn("relative min-h-[90vh] flex flex-col justify-center overflow-hidden", className)}>
      {/* Smooth Gradient Background from light blue to white */}
      <div className="absolute inset-0 z-0">
        {/* Gradient from sky blue to white for seamless transition */}
        <div 
          className="absolute inset-0" 
          style={{ 
            background: 'linear-gradient(to bottom, rgba(128, 207, 255, 0.15), rgba(255, 255, 255, 1))'
          }}
        />
        
        {/* Subtle wave pattern overlay */}
        <div 
          className="absolute inset-0 opacity-5" 
          style={{ 
            backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'100%25\' height=\'50px\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M0,25 C150,50 350,0 500,25 C650,50 850,0 1000,25 L1000,100 L0,100 Z\' fill=\'%23ffffff\'/%3E%3C/svg%3E")',
            backgroundRepeat: 'repeat-x',
            backgroundSize: '1000px 50px',
            backgroundPosition: 'bottom'
          }}
        />
      </div>
      
      <div className="container relative z-10 mx-auto px-4 py-16 md:py-24">
        <FadeInView>
          <h1 className="text-center text-5xl font-bold tracking-tight sm:text-6xl md:text-7xl mb-6 tracking-wide bg-gradient-to-br from-sky-500 to-sky-700 bg-clip-text text-transparent">
            {heroT('title')}
          </h1>
        </FadeInView>
        
        <FadeInView delay={0.2}>
          <p className="mx-auto mt-6 max-w-2xl text-center text-lg leading-8 font-normal text-gray-700">
            {heroT('subtitle')}
          </p>
        </FadeInView>

        {/* Search Card with Refined Styling */}
        <FadeInView delay={0.3} className="mt-12">
          <motion.div
            className="mx-auto max-w-5xl backdrop-blur-sm bg-white/85 rounded-2xl shadow-lg p-8 md:p-10"
            whileHover={{ boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.15), 0 10px 10px -5px rgba(0, 0, 0, 0.08)" }}
            transition={{ duration: 0.3 }}
          >
            {/* Search Title */}
            <div className="mb-6 text-center">
              <h3 className="text-xl font-medium text-gray-900">{heroT('searchTitle')}</h3>
              <p className="text-sm text-gray-600 mt-1">{heroT('searchSubtitle')}</p>
            </div>
            
            <div className="flex flex-col md:flex-row md:items-end gap-5 md:gap-7">
              {/* People Count */}
              <div className="flex-1 min-w-0 space-y-3">
                <div className="flex items-center">
                  <Users className="mr-2 h-4 w-4 text-sky-600" />
                  <span className="text-sm font-medium text-sky-900">{t('guests')}</span>
                </div>
                <Select 
                  value={guestCount}
                  onValueChange={(value) => {
                    setGuestCount(value);
                    updateFilters({ beds: parseInt(value) });
                  }}
                >
                  <SelectTrigger className="w-full min-h-[44px] rounded-xl border-sky-200 shadow-sm hover:border-sky-300 focus:ring-sky-500">
                    <SelectValue placeholder={t('selectGuests')} />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((num) => (
                      <SelectItem key={num} value={num.toString()}>
                        {num} {num === 1 ? t('guest') : t('guests')}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Check-in/Check-out dates without the helper text */}
              <div className="flex-[2] min-w-0 space-y-3">
                <div className="flex items-center">
                  <Calendar className="mr-2 h-4 w-4 text-sky-600" />
                  <span className="text-sm font-medium text-sky-900">{t('dates')}</span>
                </div>
                <div className="shadow-sm rounded-xl">
                  <DateRangePicker
                    className="w-full rounded-xl min-h-[44px] border-sky-200 hover:border-sky-300 focus-within:ring-sky-500"
                    value={filters.dateRange}
                    onChange={(range) => {
                      updateFilters({ dateRange: range });
                    }}
                  />
                </div>
              </div>

              {/* Enhanced Gradient Search Button */}
              <div className="md:self-end md:mb-0.5 mt-2 md:mt-0">
                <motion.div
                  whileHover={{ 
                    scale: 1.05,
                    boxShadow: "0 8px 20px -4px rgba(16, 138, 189, 0.4)"
                  }}
                  transition={{ duration: 0.2 }}
                >
                  <Button
                    type="button"
                    size="lg"
                    className="w-full md:w-auto gap-2 min-h-[44px] rounded-full px-7 py-3 bg-gradient-to-r from-sky-500 to-sky-600 hover:from-sky-600 hover:to-sky-700 text-white shadow-md border-0"
                    onClick={handleSearch}
                    disabled={isSearching}
                  >
                    <Search className="h-4 w-4" />
                    {t('findVillas')}
                  </Button>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </FadeInView>

        {/* Visual Connecting Element - Wave Pattern */}
        <div className="relative mx-auto w-full max-w-xs h-16 my-6 hidden md:block">
          <div className="absolute inset-x-0 h-8 bg-gradient-to-r from-transparent via-gray-200/10 to-transparent"></div>
          <div className="absolute inset-x-0 h-12" style={{ 
            backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'100%25\' height=\'24px\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M0,12 C50,20 100,4 150,12 C200,20 250,4 300,12 C350,20 400,4 450,12 C500,20 550,4 600,12\' stroke=\'%2388888830\' stroke-width=\'2\' fill=\'none\'/%3E%3C/svg%3E")',
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'center',
            backgroundSize: 'cover'
          }}></div>
        </div>

        {/* Feature Cards with Standardized Styling */}
        <div className="mt-8 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
          {features.map((feature, index) => (
            <FadeInView key={feature.title} delay={0.2 * (index + 1)}>
              <motion.div
                whileHover={{ 
                  scale: 1.05,
                  boxShadow: "0 12px 24px -4px rgba(0, 0, 0, 0.15)"
                }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <Card 
                  className={cn(
                    "group h-full overflow-hidden rounded-2xl p-8 transition-all shadow-md backdrop-blur-sm", 
                    "bg-white/80 hover:bg-white/90 border-sky-100"
                  )}
                >
                  <div className="relative">
                    <feature.icon className="h-12 w-12 text-sky-600 transition-transform duration-300 group-hover:scale-110" />
                    <div className="mt-6">
                      <h3 className="text-xl font-semibold tracking-tight text-sky-900">
                        {heroT(`features.${feature.title}`)}
                      </h3>
                      <p className="mt-3 text-sky-700 font-normal">
                        {heroT(`features.${feature.description}`)}
                      </p>
                    </div>
                  </div>
                </Card>
              </motion.div>
            </FadeInView>
          ))}
        </div>
      </div>
    </section>
  );
}
