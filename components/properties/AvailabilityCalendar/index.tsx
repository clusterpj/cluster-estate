'use client'

import { useState } from 'react'
import { format, addDays } from 'date-fns'
import { logger } from '@/lib/logger'
import { DayPicker } from 'react-day-picker'
import 'react-day-picker/dist/style.css'
import { Toggle } from '@/components/ui/toggle'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { useQuery } from '@tanstack/react-query'
import { PropertyStatus } from '@/types/property'
import { useTranslations } from 'next-intl'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

interface AvailabilityCalendarProps {
  propertyId?: string // Optional to support "all" properties view
  initialDate: Date
  className?: string
}

interface CalendarDay {
  date: Date
  status: PropertyStatus | 'partial'
  propertyCount?: number
  availabilityPercentage?: number
}

const dayStyles = {
  base: 'h-9 w-9 p-0 font-normal aria-selected:opacity-100 rounded-full',
  selected: 'bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground',
  today: 'bg-accent text-accent-foreground',
  outside: 'text-muted-foreground opacity-50',
  available: 'bg-green-100 hover:bg-green-200 text-green-800 border-2 border-green-300',
  booked: 'bg-red-100 hover:bg-red-200 text-red-800 border-2 border-red-300',
  pending: 'bg-yellow-100 hover:bg-yellow-200 text-yellow-800 border-2 border-yellow-300',
  maintenance: 'bg-gray-100 hover:bg-gray-200 text-gray-800 border-2 border-gray-300',
  partial: 'bg-blue-100 hover:bg-blue-200 text-blue-800 border-2 border-blue-300'
}

export function AvailabilityCalendar({ 
  propertyId, 
  initialDate,
  className 
}: AvailabilityCalendarProps) {
  const t = useTranslations('auth.adminSection.calendar')
  const [viewMode, setViewMode] = useState<'single' | 'aggregate'>('single')
  const [selectedDate, setSelectedDate] = useState<Date>(initialDate)

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
      
      const data = await response.json() as Array<{
        date: string
        status: PropertyStatus
        propertyCount?: number
        availableCount?: number
        totalProperties?: number
      }>
      
      // Transform data to include partial availability
      return data.map((day) => {
        const totalProperties = day.totalProperties || 1
        const availableCount = day.availableCount || 0
        
        // Calculate availability percentage
        const availabilityPercentage = (availableCount / totalProperties) * 100
        
        // Determine status based on availability
        let status = day.status as PropertyStatus | 'partial'
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
    
    return availabilityData.map((day) => ({
      date: new Date(day.date),
      status: day.status,
      propertyCount: day.propertyCount,
      availabilityPercentage: day.availabilityPercentage
    }))
  }

  if (isError) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t('legend.errorTitle')}</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <p className="text-destructive">{t('legend.errorMessage')}</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className={cn("w-full h-full flex flex-col gap-6", className)}>
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">
          {viewMode === 'single'
            ? t('legend.singlePropertyTitle')
            : t('legend.allProperties')}
        </h2>
        <Toggle
          pressed={viewMode === 'single'}
          onPressedChange={(pressed) => setViewMode(pressed ? 'single' : 'aggregate')}
          aria-label={t('legend.singleView')}
        >
          {viewMode === 'single' ? t('legend.singleView') : t('legend.allProperties')}
        </Toggle>
      </div>
      
      {isLoading ? (
        <Skeleton className="h-[400px] w-full" />
      ) : (
        <DayPicker
          mode="single"
          selected={selectedDate}
          onSelect={(date: Date | undefined) => date && setSelectedDate(date)}
          initialFocus
          className={cn("p-3 border rounded-lg bg-background", className)}
          classNames={{
            months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
            month: "space-y-4",
            caption: "flex justify-center pt-1 relative items-center",
            caption_label: "text-sm font-medium",
            nav: "space-x-1 flex items-center",
            nav_button: cn(
              "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100"
            ),
            nav_button_previous: "absolute left-1",
            nav_button_next: "absolute right-1",
            table: "w-full border-collapse space-y-1",
            head_row: "flex",
            head_cell: "text-muted-foreground rounded-md w-9 font-normal text-[0.8rem]",
            row: "flex w-full mt-2",
            cell: "text-center text-sm p-0 relative [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
            day: "h-9 w-9 p-0 font-normal aria-selected:opacity-100",
            day_selected: "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
            day_today: "bg-accent text-accent-foreground",
            day_outside: "text-muted-foreground opacity-50",
            day_disabled: "text-muted-foreground opacity-50",
            day_hidden: "invisible"
          }}
          modifiers={{
            booked: (date) => {
              const dayData = getCalendarDays().find(d => 
                d.date.toDateString() === date.toDateString()
              )
              return dayData?.status === PropertyStatus.BOOKED
            },
            available: (date) => {
              const dayData = getCalendarDays().find(d => 
                d.date.toDateString() === date.toDateString()
              )
              return dayData?.status === PropertyStatus.AVAILABLE
            },
            pending: (date) => {
              const dayData = getCalendarDays().find(d => 
                d.date.toDateString() === date.toDateString()
              )
              return dayData?.status === PropertyStatus.PENDING
            },
            partial: (date) => {
              const dayData = getCalendarDays().find(d => 
                d.date.toDateString() === date.toDateString()
              )
              return dayData?.status === 'partial'
            }
          }}
          modifiersClassNames={{
            booked: dayStyles.booked,
            available: dayStyles.available,
            pending: dayStyles.pending,
            maintenance: dayStyles.maintenance,
            partial: dayStyles.partial
          }}
          components={{
            DayContent: ({ date }: { date: Date }) => {
              const dayData = getCalendarDays().find(d => 
                d.date.toDateString() === date.toDateString()
              )
              
              return (
                <div className="relative w-full h-full flex items-center justify-center">
                  <span>{date.getDate()}</span>
                  {viewMode === 'aggregate' && dayData?.propertyCount && (
                    <Badge 
                      variant="secondary" 
                      className="absolute -top-1 -right-1 h-4 w-4 p-0 text-xs flex items-center justify-center"
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
