import { useState, useEffect } from "react"
import { createCalendarFeed, updateCalendarFeed, deleteCalendarFeed, getCalendarFeeds } from "@/services/calendarSync"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/hooks/use-toast"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"

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
}

type ICalendarSyncProps = {
  propertyId: string
  initialFeeds?: CalendarFeed[]
}

export function ICalendarSync({ propertyId, initialFeeds = [] }: ICalendarSyncProps) {
  const [feeds, setFeeds] = useState<CalendarFeed[]>(initialFeeds)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    const fetchFeeds = async () => {
      try {
        setIsLoading(true)
        const data = await getCalendarFeeds(propertyId)
        setFeeds(data)
      } catch (error) {
        console.error("Failed to fetch calendar feeds:", error)
        toast({
          title: "Error",
          description: "Failed to fetch calendar feeds",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchFeeds()
  }, [propertyId])
  const { toast } = useToast()
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      feed_type: "import",
      sync_frequency: 60,
      sync_enabled: true,
    },
  })

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      setIsLoading(true)
      const newFeed = await createCalendarFeed(propertyId, {
        ...values,
        last_sync_at: new Date().toISOString(),
        last_sync_status: 'success',
        last_sync_result: {
          eventsProcessed: 0,
          conflicts: 0,
          warnings: []
        }
      })
      setFeeds([...feeds, newFeed])
      form.reset()
      toast({
        title: "Success",
        description: "Calendar feed added successfully",
      })
    } catch (error) {
      console.error("Failed to add calendar feed:", error)
      toast({
        title: "Error",
        description: "Failed to add calendar feed",
        variant: "destructive",
      })
    }
  }

  const toggleSync = async (feedId: string) => {
    try {
      const updatedFeed = await updateCalendarFeed(propertyId, feedId, {
        sync_enabled: !feeds.find(f => f.id === feedId)?.sync_enabled
      })
      setFeeds(feeds.map(feed => 
        feed.id === feedId ? updatedFeed : feed
      ))
      toast({
        title: "Success",
        description: "Sync status updated",
      })
    } catch (error) {
      console.error("Failed to update sync status:", error)
      toast({
        title: "Error",
        description: "Failed to update sync status",
        variant: "destructive",
      })
    }
  }

  const deleteFeed = async (feedId: string) => {
    try {
      await deleteCalendarFeed(propertyId, feedId)
      setFeeds(feeds.filter(feed => feed.id !== feedId))
      toast({
        title: "Success",
        description: "Calendar feed deleted",
      })
    } catch (error) {
      console.error("Failed to delete calendar feed:", error)
      toast({
        title: "Error",
        description: "Failed to delete calendar feed",
        variant: "destructive",
      })
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
                    <FormLabel>Feed URL</FormLabel>
                    <FormControl>
                      <Input placeholder="https://" {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="feed_type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Feed Type</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                    >
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
                      <Input 
                        type="number" 
                        min={15}
                        {...field}
                        onChange={e => field.onChange(parseInt(e.target.value))}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="sync_enabled"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between">
                    <FormLabel>Enable Sync</FormLabel>
                    <FormControl>
                      <Switch 
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              
              <Button type="submit">Add Feed</Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Calendar Feeds</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {feeds.map((feed) => (
              <div 
                key={feed.id}
                className="flex items-center justify-between p-4 border rounded-lg"
              >
                <div className="space-y-1">
                  <p className="font-medium">{feed.feed_url}</p>
                  <p className="text-sm text-muted-foreground">
                    {feed.feed_type} • Sync every {feed.sync_frequency} minutes
                  </p>
                  <div className="text-sm text-muted-foreground">
                    {feed.last_sync_at && (
                      <p>
                        Last sync: {new Date(feed.last_sync_at).toLocaleString()} • 
                        Status: {feed.last_sync_status === 'success' ? '✅' : '❌'}
                      </p>
                    )}
                    {feed.last_sync_result && (
                      <p>
                        Processed: {feed.last_sync_result.eventsProcessed} events • 
                        Conflicts: {feed.last_sync_result.conflicts || 0}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Switch 
                    checked={feed.sync_enabled}
                    onCheckedChange={() => toggleSync(feed.id)}
                  />
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => deleteFeed(feed.id)}
                  >
                    Delete
                  </Button>
                </div>
              </div>
            ))}
            {feeds.length === 0 && (
              <p className="text-center text-muted-foreground">
                No calendar feeds added yet
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
