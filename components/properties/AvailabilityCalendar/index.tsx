'use client'

import { useState } from 'react'
import { logger } from '@/lib/logger'
import { DayPicker } from 'react-day-picker'
import 'react-day-picker/dist/style.css'
import { Toggle } from '@/components/ui/toggle'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { useQuery } from '@tanstack/react-query'
import { Property, PropertyStatus } from '@/types/property'
import { useTranslations } from 'next-intl'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'

interface AvailabilityCalendarProps {
  propertyId?: string // Optional for single property view
}

interface CalendarDay {
  date: Date
  status: PropertyStatus
  propertyCount?: number // For aggregate view
}

export function AvailabilityCalendar({ propertyId }: AvailabilityCalendarProps) {
  const t = useTranslations('AvailabilityCalendar')
  const [viewMode, setViewMode] = useState<'single' | 'aggregate'>('single')
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date())

  // Fetch availability data
  const { data: availabilityData, isLoading, isError } = useQuery({
    queryKey: ['property-availability', propertyId, viewMode],
    queryFn: async () => {
      const today = new Date()
      const startDate = format(today, 'yyyy-MM-dd')
      const endDate = format(addDays(today, 60), 'yyyy-MM-dd')
      
      const endpoint = viewMode === 'single' && propertyId 
        ? `/api/properties/${propertyId}/availability?start=${startDate}&end=${endDate}`
        : `/api/properties/availability?start=${startDate}&end=${endDate}`
      
      logger.info(`Fetching availability data from: ${endpoint} in ${viewMode} view mode`)
      
      const response = await fetch(endpoint, {
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      })
      
      if (!response.ok) {
        console.error('Failed to fetch availability data:', response.statusText)
        throw new Error('Failed to fetch availability data')
      }
      
      const data = await response.json()
      console.log('Received availability data:', data)
      
      // Transform data to include partial availability
      return data.map((day: any) => {
        const totalProperties = day.totalProperties || 1
        const availableCount = day.availableCount || 0
        
        // Calculate availability percentage
        const availabilityPercentage = (availableCount / totalProperties) * 100
        
        // Determine status based on availability
        let status = day.status
        if (availabilityPercentage > 0 && availabilityPercentage < 100) {
          status = 'partial'
        }
        
        return {
          ...day,
          status,
          availabilityPercentage
        }
      })
    }
  })

  // Generate calendar days with status
  const getCalendarDays = (): CalendarDay[] => {
    if (!availabilityData) {
      logger.info('No availability data available')
      return []
    }
    
    const days = availabilityData.map((day: any) => {
      logger.info(`Processing day ${day.date} with status ${day.status} and ${day.propertyCount} properties available`)
      return {
        date: new Date(day.date),
        status: day.status,
        propertyCount: day.propertyCount
      }
    })
    
    console.log('Generated calendar days:', days)
    return days
  }

  // Calendar day styling based on status
  const getDayClassName = (day: CalendarDay) => {
    const baseClasses = 'h-10 w-10 rounded-full flex items-center justify-center text-sm border-2'
    
    switch (day.status) {
      case 'available':
        return `${baseClasses} bg-green-100 hover:bg-green-200 text-green-800 border-green-300`
      case 'booked':
        return `${baseClasses} bg-red-100 hover:bg-red-200 text-red-800 border-red-300`
      case 'pending':
        return `${baseClasses} bg-yellow-100 hover:bg-yellow-200 text-yellow-800 border-yellow-300`
      case 'maintenance':
        return `${baseClasses} bg-gray-100 hover:bg-gray-200 text-gray-800 border-gray-300`
      case 'partial':
        return `${baseClasses} bg-blue-100 hover:bg-blue-200 text-blue-800 border-blue-300`
      default:
        return `${baseClasses} bg-background hover:bg-accent border-border`
    }
  }

  if (isError) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t('errorTitle')}</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <p className="text-destructive">{t('errorMessage')}</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">
          {viewMode === 'single' 
            ? t('singlePropertyTitle') 
            : t('allPropertiesTitle')}
        </h2>
        <Toggle
          pressed={viewMode === 'single'}
          onPressedChange={(pressed) => setViewMode(pressed ? 'single' : 'aggregate')}
          aria-label={t('toggleViewMode')}
        >
          {viewMode === 'single' ? t('singleView') : t('aggregateView')}
        </Toggle>
      </div>
      
      {isLoading ? (
        <Skeleton className="h-[400px] w-full" />
      ) : (
        <DayPicker
          mode="single"
          selected={selectedDate}
          onSelect={setSelectedDate}
          className="w-full"
          classNames={{
            root: 'w-full',
            months: 'w-full',
            month: 'w-full',
            caption: 'flex justify-center items-center h-12',
            nav_button: 'h-6 w-6 bg-transparent hover:bg-accent',
            table: 'w-full',
            head_row: 'w-full',
            head_cell: 'w-1/7 text-center',
            row: 'w-full',
            cell: 'w-1/7 text-center',
            day: (date) => {
              const dayData = getCalendarDays().find(d => 
                d.date.toDateString() === date.toDateString()
              )
              return dayData ? getDayClassName(dayData) : ''
            }
          }}
          disabled={(date) => date < new Date()}
          components={{
            DayContent: ({ date }) => {
              const dayData = getCalendarDays().find(d => 
                d.date.toDateString() === date.toDateString()
              )
              
              return (
                <div className="relative">
                  <span>{date.getDate()}</span>
                  {viewMode === 'aggregate' && dayData?.propertyCount && (
                    <Badge 
                      variant="secondary" 
                      className="absolute -top-1 -right-1 h-4 w-4 p-0 text-xs"
                    >
                      {dayData.propertyCount}
                    </Badge>
                  )}
                </div>
              )
            }
          }}
        />
      )}
    </div>
  )
}
