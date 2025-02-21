import { useState, useEffect } from "react"
import { calendarSyncService } from "@/services/calendar-sync"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/hooks/use-toast"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Loader2 } from "lucide-react"
import { FeedPrioritySelect } from './FeedPrioritySelect'

const formSchema = z.object({
  feed_url: z.string().url({ message: "Please enter a valid URL" }),
  feed_type: z.enum(["import", "export"]),
  sync_frequency: z.number().min(15, "Minimum sync frequency is 15 minutes"),
  sync_enabled: z.boolean(),
})

type CalendarFeed = {
  id: string
  feed_url: string
  feed_type: "import" | "export"
  sync_frequency: number
  sync_enabled: boolean
  last_sync_at?: string
  last_sync_status?: 'success' | 'error'
  last_sync_result?: {
    eventsProcessed: number
    conflicts?: number
    warnings?: string[]
  }
  priority?: number
}

type ICalendarSyncProps = {
  propertyId: string
  onSuccess?: () => void
}

export function ICalendarSync({ propertyId, onSuccess }: ICalendarSyncProps) {
  const [feeds, setFeeds] = useState<CalendarFeed[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isSyncing, setIsSyncing] = useState(false)
  const { toast } = useToast()
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      feed_url: '',
      feed_type: 'import',
      sync_frequency: 60,
      sync_enabled: true,
    },
  })

  useEffect(() => {
    loadFeeds()
  }, [propertyId])

  const loadFeeds = async () => {
    if (!propertyId) {
      console.log('[ICalendarSync] No property ID provided, skipping feed load')
      return
    }
    
    console.log('[ICalendarSync] Loading feeds for property:', propertyId)
    try {
      setIsLoading(true)
      const feeds = await calendarSyncService.getCalendarFeeds(propertyId)
      console.log('[ICalendarSync] Successfully loaded feeds:', feeds)
      setFeeds(feeds)
    } catch (error) {
      console.error('[ICalendarSync] Error loading feeds:', error)
      toast({
        title: "Error loading calendar feeds",
        description: error instanceof Error ? error.message : "Failed to load calendar feeds",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    console.log('[ICalendarSync] Submitting new feed:', values)
    try {
      setIsLoading(true)
      const newFeed = await calendarSyncService.createCalendarFeed(propertyId, {
        feed_url: values.feed_url,
        feed_type: values.feed_type,
        sync_frequency: values.sync_frequency,
        sync_enabled: values.sync_enabled,
      })
      
      console.log('[ICalendarSync] Successfully created new feed:', newFeed)
      form.reset()
      await loadFeeds()
      onSuccess?.()
      
      toast({
        title: "Calendar feed added",
        description: "The calendar feed has been successfully added",
      })
    } catch (error) {
      console.error('[ICalendarSync] Error creating feed:', error)
      toast({
        title: "Error adding calendar feed",
        description: error instanceof Error ? error.message : "Failed to add calendar feed",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSyncNow = async (feedId: string) => {
    setIsSyncing(true);
    try {
      console.log('[ICalendarSync] Starting manual sync for feed:', feedId);
      // Fix parameter order to match the service method signature
      const result = await calendarSyncService.syncCalendarFeed(feedId, propertyId);
      console.log('[ICalendarSync] Sync completed:', result);
      
      // Refresh feeds after sync
      await loadFeeds();
    } catch (error) {
      console.error('[ICalendarSync] Error during sync:', error);
      toast({
        title: "Sync Failed",
        description: error instanceof Error ? error.message : "Failed to sync calendar",
        variant: "destructive"
      });
    } finally {
      setIsSyncing(false);
    }
  };

  const handleDelete = async (feedId: string) => {
    console.log('[ICalendarSync] Attempting to delete feed:', feedId)
    if (!confirm("Are you sure you want to delete this calendar feed?")) {
      console.log('[ICalendarSync] Delete cancelled by user')
      return
    }
    
    try {
      setIsLoading(true)
      await calendarSyncService.deleteCalendarFeed(propertyId, feedId)
      console.log('[ICalendarSync] Successfully deleted feed:', feedId)
      await loadFeeds()
      onSuccess?.()
      
      toast({
        title: "Calendar feed deleted",
        description: "The calendar feed has been successfully removed",
      })
    } catch (error) {
      console.error('[ICalendarSync] Error deleting feed:', error)
      toast({
        title: "Error deleting feed",
        description: error instanceof Error ? error.message : "Failed to delete calendar feed",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Add Calendar Feed</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="feed_url"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Calendar Feed URL</FormLabel>
                    <FormControl>
                      <Input placeholder="https://..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="feed_type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Feed Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select feed type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="import">Import</SelectItem>
                        <SelectItem value="export">Export</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="sync_frequency"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Sync Frequency (minutes)</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} onChange={e => field.onChange(parseInt(e.target.value))} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="sync_enabled"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Enable Sync</FormLabel>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <Button type="submit" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Add Feed
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Existing Calendar Feeds</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {feeds.map((feed) => (
              <Card key={feed.id}>
                <CardContent className="pt-6">
                  <div className="flex justify-between items-start gap-4">
                    <div className="space-y-1">
                      <p className="font-medium">{feed.feed_url}</p>
                      <p className="text-sm text-muted-foreground">
                        Type: {feed.feed_type} | Frequency: {feed.sync_frequency} minutes
                      </p>
                      {feed.last_sync_at && (
                        <p className="text-sm text-muted-foreground">
                          Last sync: {new Date(feed.last_sync_at).toLocaleString()}
                          {feed.last_sync_result && ` (${feed.last_sync_result.eventsProcessed} events)`}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <FeedPrioritySelect
                        feedId={feed.id}
                        propertyId={propertyId}
                        currentPriority={feed.priority || 1}
                      />
                      <Button
                        size="sm"
                        onClick={() => handleSyncNow(feed.id)}
                        disabled={isLoading || isSyncing}
                      >
                        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Sync Now
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDelete(feed.id)}
                        disabled={isLoading}
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            {feeds.length === 0 && (
              <p className="text-center text-muted-foreground">No calendar feeds found</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
