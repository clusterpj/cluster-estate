import React, { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase-client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Plus, Trash2, RefreshCw } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { AvailabilityCalendar } from '@/components/properties/AvailabilityCalendar';

interface CalendarSource {
  id: string;
  name: string;
  url: string;
  property_id: string;
  last_synced_at: string;
  is_active: boolean;
}

export function CalendarManagement() {
  const [sources, setSources] = useState<CalendarSource[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newSource, setNewSource] = useState({ name: '', url: '', property_id: '' });
  const [properties, setProperties] = useState<any[]>([]);
  const { toast } = useToast();
  const supabase = createClient();

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    try {
      const [
        { data: sourcesData },
        { data: propertiesData }
      ] = await Promise.all([
        supabase.from('calendar_sources').select('*'),
        supabase.from('properties').select('id, title')
      ]);

      setSources(sourcesData || []);
      setProperties(propertiesData || []);
    } catch (error) {
      console.error('Error fetching calendar data:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to load calendar data'
      });
    } finally {
      setLoading(false);
    }
  }

  async function addCalendarSource() {
    try {
      const { data, error } = await supabase
        .from('calendar_sources')
        .insert({
          name: newSource.name,
          url: newSource.url,
          property_id: newSource.property_id
        })
        .select()
        .single();

      if (error) throw error;

      setSources([...sources, data]);
      setIsDialogOpen(false);
      setNewSource({ name: '', url: '', property_id: '' });
      
      toast({
        title: 'Success',
        description: 'Calendar source added successfully'
      });
    } catch (error) {
      console.error('Error adding calendar source:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to add calendar source'
      });
    }
  }

  async function syncCalendars() {
    setSyncing(true);
    try {
      // Here you would typically call your backend API to handle the iCal sync
      // For now, we'll just simulate the sync
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast({
        title: 'Success',
        description: 'Calendars synchronized successfully'
      });
    } catch (error) {
      console.error('Error syncing calendars:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to sync calendars'
      });
    } finally {
      setSyncing(false);
    }
  }

  async function deleteSource(id: string) {
    try {
      const { error } = await supabase
        .from('calendar_sources')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setSources(sources.filter(source => source.id !== id));
      toast({
        title: 'Success',
        description: 'Calendar source deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting calendar source:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to delete calendar source'
      });
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Calendar Management</h2>
        <div className="flex gap-2">
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Calendar
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Calendar Source</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    value={newSource.name}
                    onChange={e => setNewSource({ ...newSource, name: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="url">iCal URL</Label>
                  <Input
                    id="url"
                    value={newSource.url}
                    onChange={e => setNewSource({ ...newSource, url: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="property">Property</Label>
                  <select
                    id="property"
                    className="w-full p-2 border rounded"
                    value={newSource.property_id}
                    onChange={e => setNewSource({ ...newSource, property_id: e.target.value })}
                  >
                    <option value="">Select a property</option>
                    {properties.map(property => (
                      <option key={property.id} value={property.id}>
                        {property.title}
                      </option>
                    ))}
                  </select>
                </div>
                <Button 
                  className="w-full"
                  onClick={addCalendarSource}
                  disabled={!newSource.name || !newSource.url || !newSource.property_id}
                >
                  Add Calendar
                </Button>
              </div>
            </DialogContent>
          </Dialog>
          <Button 
            variant="outline"
            onClick={syncCalendars}
            disabled={syncing}
          >
            <RefreshCw className={cn("mr-2 h-4 w-4", syncing && "animate-spin")} />
            Sync Now
          </Button>
        </div>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Calendar Sources</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Property</TableHead>
                  <TableHead>Last Synced</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sources.map(source => (
                  <TableRow key={source.id}>
                    <TableCell>{source.name}</TableCell>
                    <TableCell>
                      {properties.find(p => p.id === source.property_id)?.title}
                    </TableCell>
                    <TableCell>
                      {source.last_synced_at
                        ? new Date(source.last_synced_at).toLocaleString()
                        : 'Never'}
                    </TableCell>
                    <TableCell>
                      {source.is_active ? (
                        <Badge variant="default">Active</Badge>
                      ) : (
                        <Badge variant="secondary">Inactive</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteSource(source.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <AvailabilityCalendar />
      </div>
    </div>
  );
}
