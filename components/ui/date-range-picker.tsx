"use client"

import * as React from "react"
import { format } from "date-fns"
import { enUS } from "date-fns/locale"
import { Calendar as CalendarIcon } from "lucide-react"
import { DateRange } from "react-day-picker"
import { useTranslations } from "next-intl"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

interface DateRangePickerProps {
  className?: string
  value: DateRange | undefined
  onChange: (date: DateRange | undefined) => void
  placeholder?: string
}

export function DateRangePicker({
  className,
  value,
  onChange,
  placeholder,
}: DateRangePickerProps) {
  const t = useTranslations('HeroSection.search.dateRange');
  const defaultPlaceholder = t('placeholder');

  return (
    <div className={cn("grid gap-2", className)}>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant={"outline"}
            className={cn(
              "w-full justify-start text-left font-normal",
              !value && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {value?.from ? (
              value.to ? (
                <>
                  {format(value.from, "LLL dd, y", { locale: enUS })} -{" "}
                  {format(value.to, "LLL dd, y", { locale: enUS })}
                </>
              ) : (
                format(value.from, "LLL dd, y", { locale: enUS })
              )
            ) : (
              <span>{placeholder || defaultPlaceholder}</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            initialFocus
            mode="range"
            defaultMonth={value?.from}
            selected={value}
            onSelect={onChange}
            numberOfMonths={2}
            locale={enUS}
            fromLabel={t('from')}
            toLabel={t('to')}
            clearLabel={t('clear')}
          />
        </PopoverContent>
      </Popover>
    </div>
  )
}
