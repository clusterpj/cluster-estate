'use client';

import { AvailabilityCalendar } from '@/components/properties/AvailabilityCalendar';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, PlusIcon, ReloadIcon } from '@radix-ui/react-icons';
import { format } from 'date-fns';
import { Calendar } from '@/components/ui/calendar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Database } from '@/types/supabase';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/components/ui/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CalendarSyncService } from '@/services/calendar-sync';

export function CalendarManagement() {
  const t = useTranslations('auth.adminSection.calendar');
  const [selectedProperty, setSelectedProperty] = useState('all');
  const [date, setDate] = useState<Date>(new Date());
  const [isAddingFeed, setIsAddingFeed] = useState(false);
  const [newFeedUrl, setNewFeedUrl] = useState('');
  const [feedPriority, setFeedPriority] = useState('5');
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const supabase = createClientComponentClient<Database>();

  // Fetch properties
  const { data: properties = [], isLoading: isLoadingProperties } = useQuery({
    queryKey: ['properties'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('properties')
        .select('id, title')
        .order('title', { ascending: true });
      
      if (error) throw error;
      
      return [
        { id: 'all', name: t('allProperties') },
        ...data.map(p => ({ id: p.id, name: p.title }))
      ];
    }
  });

  // Fetch calendar feeds for selected property
  const { data: feeds = [], isLoading: isLoadingFeeds } = useQuery({
    queryKey: ['calendar-feeds', selectedProperty],
    enabled: selectedProperty !== 'all',
    queryFn: async () => {
      const { data, error } = await supabase
        .from('calendar_feeds')
        .select('*')
        .eq('property_id', selectedProperty)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    }
  });

  // Add new calendar feed
  const addFeedMutation = useMutation({
    mutationFn: async () => {
      if (selectedProperty === 'all') throw new Error(t('selectPropertyFirst'));
      
      const { data, error } = await supabase
        .from('calendar_feeds')
        .insert({
          property_id: selectedProperty,
          feed_url: newFeedUrl,
          priority: parseInt(feedPriority),
          last_sync: null
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['calendar-feeds'] });
      setNewFeedUrl('');
      setIsAddingFeed(false);
      toast({
        title: t('feedAdded'),
        description: t('feedAddedDescription'),
      });
    },
    onError: (error) => {
      toast({
        title: t('error'),
        description: error instanceof Error ? error.message : t('unknownError'),
        variant: 'destructive',
      });
    }
  });

  // Sync calendar feed
  const syncFeedMutation = useMutation({
    mutationFn: async (feedId: string) => {
      const calendarSync = new CalendarSyncService(supabase);
      await calendarSync.syncCalendarFeed(feedId, selectedProperty);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['calendar-feeds'] });
      toast({
        title: t('syncComplete'),
        description: t('syncCompleteDescription'),
      });
    },
    onError: (error) => {
      toast({
        title: t('syncError'),
        description: error instanceof Error ? error.message : t('unknownError'),
        variant: 'destructive',
      });
    }
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4">
        <h2 className="text-2xl font-bold">{t('title')}</h2>
        <p className="text-muted-foreground">{t('description')}</p>
      </div>

      {/* Property Selection and Date Picker */}
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
        <Select value={selectedProperty} onValueChange={setSelectedProperty}>
          <SelectTrigger className="w-[200px]">
            {isLoadingProperties ? (
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-muted-foreground border-t-transparent" />
                <span>{t('loading')}</span>
              </div>
            ) : (
              <SelectValue placeholder={t('selectProperty')} />
            )}
          </SelectTrigger>
          <SelectContent>
            {properties.map(property => (
              <SelectItem key={property.id} value={property.id}>
                {property.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className="w-[200px] justify-start text-left font-normal"
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {date ? format(date, 'PPP') : <span>{t('pickDate')}</span>}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar
              mode="single"
              selected={date}
              onSelect={(d) => d && setDate(d)}
              initialFocus
            />
          </PopoverContent>
        </Popover>

        {selectedProperty !== 'all' && (
          <Dialog open={isAddingFeed} onOpenChange={setIsAddingFeed}>
            <DialogTrigger asChild>
              <Button>
                <PlusIcon className="mr-2 h-4 w-4" />
                {t('addFeed')}
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{t('addNewFeed')}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="feed-url">{t('feedUrl')}</Label>
                  <Input
                    id="feed-url"
                    value={newFeedUrl}
                    onChange={(e) => setNewFeedUrl(e.target.value)}
                    placeholder="https://"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="priority">{t('priority')}</Label>
                  <Select value={feedPriority} onValueChange={setFeedPriority}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((p) => (
                        <SelectItem key={p} value={p.toString()}>
                          {p}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button 
                  className="w-full" 
                  onClick={() => addFeedMutation.mutate()}
                  disabled={!newFeedUrl || addFeedMutation.isPending}
                >
                  {addFeedMutation.isPending && (
                    <ReloadIcon className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  {t('addFeed')}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Calendar Feeds */}
      {selectedProperty !== 'all' && (
        <Card>
          <CardHeader>
            <CardTitle>{t('calendarFeeds')}</CardTitle>
            <CardDescription>{t('calendarFeedsDescription')}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {isLoadingFeeds ? (
                <div className="flex items-center gap-2">
                  <ReloadIcon className="h-4 w-4 animate-spin" />
                  {t('loadingFeeds')}
                </div>
              ) : feeds.length === 0 ? (
                <p className="text-sm text-muted-foreground">{t('noFeeds')}</p>
              ) : (
                <div className="space-y-4">
                  {feeds.map((feed) => (
                    <div key={feed.id} className="flex items-center justify-between gap-4 p-4 border rounded-lg">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{feed.feed_url}</p>
                        <p className="text-sm text-muted-foreground">
                          {t('priority')}: {feed.priority} • {t('lastSync')}: {feed.last_sync ? format(new Date(feed.last_sync), 'PPp') : t('never')}
                        </p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => syncFeedMutation.mutate(feed.id)}
                        disabled={syncFeedMutation.isPending}
                      >
                        {syncFeedMutation.isPending && (
                          <ReloadIcon className="mr-2 h-4 w-4 animate-spin" />
                        )}
                        {t('sync')}
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Calendar Legend */}
      <div className="flex flex-wrap gap-4 text-sm">
        <div className="flex items-center gap-2">
          <span className="h-3 w-3 rounded-full bg-green-100 border border-green-300" />
          {t('legend.available')}
        </div>
        <div className="flex items-center gap-2">
          <span className="h-3 w-3 rounded-full bg-red-100 border border-red-300" />
          {t('legend.booked')}
        </div>
        <div className="flex items-center gap-2">
          <span className="h-3 w-3 rounded-full bg-yellow-100 border border-yellow-300" />
          {t('legend.pending')}
        </div>
        <div className="flex items-center gap-2">
          <span className="h-3 w-3 rounded-full bg-gray-100 border border-gray-300" />
          {t('legend.maintenance')}
        </div>
      </div>

      {/* Calendar View */}
      <div className="w-full overflow-x-auto">
        <AvailabilityCalendar 
          propertyId={selectedProperty === 'all' ? undefined : selectedProperty}
          initialDate={date}
          className="min-w-[1000px]"
        />
      </div>
    </div>
  );
}
