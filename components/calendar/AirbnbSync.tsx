import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormDescription,
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
import { useToast } from '@/components/ui/use-toast'
import { airbnbSyncService, type ConflictResolution } from '@/services/airbnb-sync'
import { LoadingSpinner } from '@/components/ui/loading-spinner'

const formSchema = z.object({
  importUrl: z.string().url(),
  exportUrl: z.string().url(),
  conflictResolution: z.enum(['keep_airbnb', 'keep_local', 'manual']),
})

interface AirbnbSyncProps {
  propertyId: string
}

export function AirbnbSync({ propertyId }: AirbnbSyncProps) {
  const t = useTranslations('calendar')
  const { toast } = useToast()
  const [syncing, setSyncing] = useState(false)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      importUrl: '',
      exportUrl: '',
      conflictResolution: 'manual' as ConflictResolution,
    },
  })

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      setSyncing(true)

      // First import from Airbnb
      const importResult = await airbnbSyncService.importFromAirbnb({
        propertyId,
        importUrl: values.importUrl,
        exportUrl: values.exportUrl,
        conflictResolution: values.conflictResolution,
      })

      if (!importResult.success) {
        throw new Error(importResult.warnings?.[0] || 'Import failed')
      }

      // Then export back to Airbnb
      const exportResult = await airbnbSyncService.exportToAirbnb({
        propertyId,
        importUrl: values.importUrl,
        exportUrl: values.exportUrl,
        conflictResolution: values.conflictResolution,
      })

      if (!exportResult.success) {
        throw new Error(exportResult.warnings?.[0] || 'Export failed')
      }

      toast({
        title: t('sync.success'),
        description: t('sync.successDescription', {
          imported: importResult.eventsProcessed,
          exported: exportResult.eventsProcessed,
        }),
      })

      // If there were conflicts and manual resolution is selected,
      // we should show them to the user
      if (
        values.conflictResolution === 'manual' &&
        importResult.conflicts &&
        importResult.conflicts.length > 0
      ) {
        // TODO: Show conflict resolution dialog
        toast({
          title: t('sync.conflictsFound'),
          description: t('sync.conflictsDescription', {
            count: importResult.conflicts.length,
          }),
          variant: 'warning',
        })
      }
    } catch (error) {
      toast({
        title: t('sync.error'),
        description: error instanceof Error ? error.message : t('sync.unknownError'),
        variant: 'destructive',
      })
    } finally {
      setSyncing(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="importUrl"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('form.importUrl')}</FormLabel>
              <FormControl>
                <Input placeholder="https://..." {...field} />
              </FormControl>
              <FormDescription>
                {t('form.importUrlDescription')}
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="exportUrl"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('form.exportUrl')}</FormLabel>
              <FormControl>
                <Input placeholder="https://..." {...field} />
              </FormControl>
              <FormDescription>
                {t('form.exportUrlDescription')}
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="conflictResolution"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('form.conflictResolution')}</FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder={t('form.selectResolution')} />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="keep_airbnb">
                    {t('form.keepAirbnb')}
                  </SelectItem>
                  <SelectItem value="keep_local">
                    {t('form.keepLocal')}
                  </SelectItem>
                  <SelectItem value="manual">
                    {t('form.manualResolution')}
                  </SelectItem>
                </SelectContent>
              </Select>
              <FormDescription>
                {t('form.conflictResolutionDescription')}
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={syncing}>
          {syncing && <LoadingSpinner className="mr-2" />}
          {t('sync.button')}
        </Button>
      </form>
    </Form>
  )
}
