'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Calendar } from '@/types/calendar'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useTranslations } from 'next-intl'
import { toast } from '@/hooks/use-toast'
import { z } from 'zod'

const calendarFormSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  type: z.enum(['internal', 'ical']),
  ical_url: z.string().url().optional(),
  sync_frequency: z.enum(['daily', 'weekly', 'monthly']).default('daily'),
})

type CalendarFormValues = z.infer<typeof calendarFormSchema>

interface CalendarFormProps {
  propertyId: string
  onSuccess?: () => void
}

export function CalendarForm({ propertyId, onSuccess }: CalendarFormProps) {
  const t = useTranslations('calendar')
  const form = useForm<CalendarFormValues>({
    resolver: zodResolver(calendarFormSchema),
    defaultValues: {
      name: '',
      type: 'internal',
      sync_frequency: 'daily',
    },
  })

  const calendarType = form.watch('type')

  async function onSubmit(data: CalendarFormValues) {
    try {
      const response = await fetch('/api/calendars', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...data,
          property_id: propertyId
        }),
      })

      if (!response.ok) throw new Error('Failed to create calendar')

      toast({
        title: t('createSuccess'),
        description: t('createSuccessDescription'),
      })

      onSuccess?.()
    } catch (error) {
      console.error('Error creating calendar:', error)
      toast({
        variant: 'destructive',
        title: t('createError'),
        description: error instanceof Error ? error.message : t('createErrorDescription'),
      })
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('name')}</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('type')}</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder={t('selectType')} />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="internal">{t('internalCalendar')}</SelectItem>
                  <SelectItem value="ical">{t('externalCalendar')}</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {calendarType === 'ical' && (
          <FormField
            control={form.control}
            name="ical_url"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('icalUrl')}</FormLabel>
                <FormControl>
                  <Input 
                    {...field}
                    placeholder="https://example.com/calendar.ics"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        <FormField
          control={form.control}
          name="sync_frequency"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('syncFrequency')}</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder={t('selectSyncFrequency')} />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="daily">{t('daily')}</SelectItem>
                  <SelectItem value="weekly">{t('weekly')}</SelectItem>
                  <SelectItem value="monthly">{t('monthly')}</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end">
          <Button type="submit">{t('createCalendar')}</Button>
        </div>
      </form>
    </Form>
  )
}
