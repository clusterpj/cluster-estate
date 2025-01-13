'use client'

import { useState, useEffect } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Calendar, CalendarEvent } from '@/types/calendar'
import { Button } from '@/components/ui/button'
import { CalendarIcon, RefreshCw, Plus, ExternalLink } from 'lucide-react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/use-toast'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { CalendarForm } from './calendar-form'
import { useTranslations } from 'next-intl'

export function CalendarManagement({ propertyId }: { propertyId: string }) {
  const [calendars, setCalendars] = useState<Calendar[]>([])
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const supabase = createClientComponentClient()
  const { toast } = useToast()
  const t = useTranslations('calendar')

  useEffect(() => {
    fetchCalendars()
  }, [propertyId])

  async function fetchCalendars() {
    try {
      const { data, error } = await supabase
        .from('calendars')
        .select('*')
        .eq('property_id', propertyId)
        .order('created_at', { ascending: false })

      if (error) throw error
      setCalendars(data || [])
    } catch (error) {
      console.error('Error fetching calendars:', error)
      toast({
        variant: 'destructive',
        title: t('fetchError'),
        description: t('fetchErrorDescription'),
      })
    } finally {
      setLoading(false)
    }
  }

  async function handleSync(calendarId: string) {
    try {
      const response = await fetch(`/api/calendars/${calendarId}/sync`, {
        method: 'POST'
      })
      
      if (!response.ok) throw new Error('Sync failed')
      
      const result = await response.json()
      
      toast({
        title: t('syncSuccess'),
        description: result.message,
      })
      
      fetchCalendars()
    } catch (error) {
      console.error('Error syncing calendar:', error)
      toast({
        variant: 'destructive',
        title: t('syncError'),
        description: error instanceof Error ? error.message : t('syncErrorDescription'),
      })
    }
  }

  if (loading) {
    return <div>{t('loading')}</div>
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">{t('title')}</h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              {t('addCalendar')}
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t('addCalendar')}</DialogTitle>
            </DialogHeader>
            <CalendarForm 
              propertyId={propertyId}
              onSuccess={() => {
                setIsDialogOpen(false)
                fetchCalendars()
              }}
            />
          </DialogContent>
        </Dialog>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{t('name')}</TableHead>
            <TableHead>{t('type')}</TableHead>
            <TableHead>{t('lastSync')}</TableHead>
            <TableHead>{t('status')}</TableHead>
            <TableHead>{t('actions')}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {calendars.map((calendar) => (
            <TableRow key={calendar.id}>
              <TableCell>{calendar.name}</TableCell>
              <TableCell>
                <Badge variant="outline">
                  {calendar.type}
                </Badge>
              </TableCell>
              <TableCell>
                {calendar.last_sync ? 
                  new Date(calendar.last_sync).toLocaleString() : 
                  t('neverSynced')}
              </TableCell>
              <TableCell>
                <Badge variant={calendar.last_sync ? 'default' : 'secondary'}>
                  {calendar.last_sync ? t('synced') : t('pendingSync')}
                </Badge>
              </TableCell>
              <TableCell>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleSync(calendar.id)}
                  >
                    <RefreshCw className="mr-2 h-4 w-4" />
                    {t('sync')}
                  </Button>
                  {calendar.type === 'ical' && calendar.ical_url && (
                    <Button
                      variant="outline"
                      size="sm"
                      asChild
                    >
                      <a href={calendar.ical_url} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="mr-2 h-4 w-4" />
                        {t('viewCalendar')}
                      </a>
                    </Button>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
