'use client'

import { useState, useEffect } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Property, isValidPropertyStatus, PropertyStatus } from '@/types/property'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from '@/components/ui/dialog'
import { PropertyForm } from './property-form'
import { useTranslations } from 'next-intl'
import { useToast } from '@/hooks/use-toast'
import { X, MoreHorizontal, Check, Ban, Star, Edit, Trash, Calendar } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ICalendarSync } from '@/components/calendar/ICalendarSync'

export function PropertyManagement() {
  const [properties, setProperties] = useState<Property[]>([])
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isCalendarDialogOpen, setIsCalendarDialogOpen] = useState(false)
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null)
  const [listingTypeFilter, setListingTypeFilter] = useState<'all' | 'sale' | 'rent' | 'both'>('all')
  const supabase = createClientComponentClient()
  const t = useTranslations('auth.adminSection.properties')
  const [toastMessage, setToastMessage] = useState<{ title: string; description: string; type: 'success' | 'error' } | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    fetchProperties()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  async function fetchProperties() {
    try {
      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error

      if (data) {
        const typedData = data.map(property => ({
          ...property,
          status: isValidPropertyStatus(property.status) ? property.status : 'available'
        }))
        setProperties(typedData)
      }
    } catch (err) {
      console.error('Error fetching properties:', err)
      setToastMessage({
        title: t('error'),
        description: t('fetchError'),
        type: 'error'
      })
    } finally {
      setLoading(false)
    }
  }
  

  const validStatusTransitions: Record<PropertyStatus, PropertyStatus[]> = {
    available: ['pending', 'sold', 'rented', 'booked'],
    pending: ['available', 'sold', 'rented', 'booked'],
    sold: ['available'],
    rented: ['available'],
    booked: ['available']
  } as const;

  async function updatePropertyStatus(id: string, update: PropertyStatus | { features?: string[] }) {
    try {
      // Get current property status and features
      const { data: currentProperty } = await supabase
        .from('properties')
        .select('status, property_type, features')
        .eq('id', id)
        .single();

      if (!currentProperty) {
        throw new Error('Property not found');
      }

      let updateData: any = {};

      // Handle status update
      if (typeof update === 'string') {
        const currentStatus = currentProperty.status as PropertyStatus;
        if (!validStatusTransitions[currentStatus].includes(update)) {
          throw new Error(t('invalidStatusTransition', { 
            current: currentStatus, 
            target: update 
          }));
        }
        updateData.status = update;
      } 
      // Handle features update
      else if ('features' in update) {
        updateData.features = update.features;
      }

      const { error } = await supabase
        .from('properties')
        .update(updateData)
        .eq('id', id);

      if (error) throw error;

      // Update local state
      setProperties(prev => prev.map(p => 
        p.id === id ? { ...p, ...updateData } : p
      ));

      setToastMessage({
        title: t('success'),
        description: typeof update === 'string' ? t('statusUpdateSuccess') : t('featuresUpdateSuccess'),
        type: 'success'
      });
    } catch (err) {
      console.error('Error updating property:', err);
      setToastMessage({
        title: t('error'),
        description: typeof update === 'string' ? t('statusUpdateError') : t('featuresUpdateError'),
        type: 'error'
      });
    }
  }

  async function updatePropertyFeatured(id: string, featured: boolean) {
    try {
      const { error } = await supabase
        .from('properties')
        .update({ featured })
        .eq('id', id);

      if (error) throw error;

      // Update local state
      setProperties(prev => prev.map(p => 
        p.id === id ? { ...p, featured } : p
      ));

      setToastMessage({
        title: t('success'),
        description: featured ? t('markFeaturedSuccess') : t('unmarkFeaturedSuccess'),
        type: 'success'
      });
    } catch (err) {
      console.error('Error updating property featured status:', err);
      setToastMessage({
        title: t('error'),
        description: t('featuredUpdateError'),
        type: 'error'
      });
    }
  }

  async function handleDeleteProperty(id: string) {
    try {
      const { error } = await supabase
        .from('properties')
        .delete()
        .eq('id', id)

      if (error) throw error

      fetchProperties()
      setIsDeleteDialogOpen(false)
      setToastMessage({
        title: t('success'),
        description: t('deleteSuccess'),
        type: 'success'
      })
    } catch (err) {
      console.error('Error deleting property:', err)
      setToastMessage({
        title: t('error'),
        description: t('deleteError'),
        type: 'error'
      })
    }
  }

  useEffect(() => {
    if (toastMessage) {
      toast({
        title: toastMessage.title,
        description: toastMessage.description,
        variant: toastMessage.type === 'error' ? 'destructive' : 'default',
      })
      setToastMessage(null)
    }
  }, [toastMessage, toast])

  const filteredProperties = properties.filter(property => {
    if (listingTypeFilter === 'all') return true;
    return property.listing_type === listingTypeFilter || 
           (listingTypeFilter === 'both' && property.listing_type === 'both');
  })

  async function syncIcalCalendars() {
    try {
      const response = await fetch('/api/sync-ical', { method: 'POST' })
      if (!response.ok) throw new Error('Failed to sync calendars.')

      // Optionally re-fetch updated properties or bookings
      await fetchProperties()
      setToastMessage({
        title: t('success'),
        description: t('syncSuccess'),
        type: 'success'
      })
    } catch (err) {
      console.error(err)
      setToastMessage({
        title: t('error'),
        description: t('syncError'),
        type: 'error'
      })
    }
  }

  if (loading) {
    return <div>{t('loading')}</div>
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="space-y-1">
          <Select
            value={listingTypeFilter}
            onValueChange={(value) => setListingTypeFilter(value as typeof listingTypeFilter)}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder={t('selectListingType')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('allListings')}</SelectItem>
              <SelectItem value="sale">{t('forSale')}</SelectItem>
              <SelectItem value="rent">{t('forRent')}</SelectItem>
              <SelectItem value="both">{t('saleAndRent')}</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          if (!open) return;
          setIsDialogOpen(open);
        }}>
          <DialogTrigger asChild>
            <Button>{t('actions.createProperty')}</Button>
          </DialogTrigger>
          <DialogContent className="max-w-[95vw] w-full lg:max-w-[1400px]" hideDefaultClose>
            <DialogHeader>
              <div className="flex justify-between items-center">
                <DialogTitle>{t('form.createProperty')}</DialogTitle>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsDialogOpen(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <DialogDescription>{t('form.createPropertyDescription')}</DialogDescription>
            </DialogHeader>
            <PropertyForm
              onSuccess={() => {
                setIsDialogOpen(false)
                fetchProperties()
                setToastMessage({
                  title: t('success'),
                  description: t('createSuccess'),
                  type: 'success'
                })
              }}
              onError={() => {
                setToastMessage({
                  title: t('error'),
                  description: t('createError'),
                  type: 'error'
                })
              }}
            />
          </DialogContent>
        </Dialog>
      </div>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-[95vw] w-full lg:max-w-[1400px]" hideDefaultClose>
          <DialogHeader>
            <div className="flex justify-between items-center">
              <DialogTitle>{t('form.editProperty')}</DialogTitle>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsEditDialogOpen(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <DialogDescription>{t('form.editPropertyDescription')}</DialogDescription>
          </DialogHeader>
          {selectedProperty && (
            <PropertyForm
              mode="edit"
              propertyId={selectedProperty.id}
              initialData={selectedProperty}
              onSuccess={() => {
                setIsEditDialogOpen(false)
                fetchProperties()
                setToastMessage({
                  title: t('success'),
                  description: t('updateSuccess'),
                  type: 'success'
                })
              }}
              onError={() => {
                setToastMessage({
                  title: t('error'),
                  description: t('updateError'),
                  type: 'error'
                })
              }}
            />
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={isDeleteDialogOpen} onOpenChange={(open) => {
        if (!open) return;
        setIsDeleteDialogOpen(open);
      }}>
        <DialogContent hideDefaultClose>
          <DialogHeader>
            <DialogTitle>{t('deleteConfirmation.title')}</DialogTitle>
            <DialogDescription>{t('deleteConfirmation.description')}</DialogDescription>
          </DialogHeader>
          <div className="flex justify-end space-x-2 mt-4">
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              {t('deleteConfirmation.cancel')}
            </Button>
            <Button
              variant="destructive"
              onClick={() => selectedProperty && handleDeleteProperty(selectedProperty.id)}
            >
              {t('deleteConfirmation.confirm')}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isCalendarDialogOpen} onOpenChange={setIsCalendarDialogOpen}>
        <DialogContent className="max-w-[95vw] w-full lg:max-w-[800px]" hideDefaultClose>
          <DialogHeader>
            <div className="flex justify-between items-center">
              <DialogTitle>{t('calendar.manageTitle')}</DialogTitle>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsCalendarDialogOpen(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <DialogDescription>
              {selectedProperty && (
                <span>
                  {t('calendar.manageDescription')} {selectedProperty.title}
                </span>
              )}
            </DialogDescription>
          </DialogHeader>
          {selectedProperty && (
            <div className="mt-4">
              <ICalendarSync
                propertyId={selectedProperty.id}
                onSuccess={() => {
                  setIsCalendarDialogOpen(false)
                  fetchProperties()
                  toast({
                    title: t('calendar.syncSuccess'),
                    description: t('calendar.syncSuccessDescription'),
                  })
                }}
              />
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{t('table.title')}</TableHead>
            <TableHead>{t('table.listingType')}</TableHead>
            <TableHead>{t('table.propertyType')}</TableHead>
            <TableHead>{t('table.price')}</TableHead>
            <TableHead>{t('table.rentalPrice')}</TableHead>
            <TableHead>{t('table.location')}</TableHead>
            <TableHead>{t('table.status')}</TableHead>
            <TableHead>{t('table.featured')}</TableHead>
            <TableHead>{t('table.actions')}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredProperties.map((property) => (
            <TableRow key={property.id}>
              <TableCell>
                <div className="flex flex-col">
                  <span className="font-semibold">{property.title}</span>
                  {property.ical_url && (
                    <Badge variant="secondary" className="mt-1 break-all">
                      iCal: {property.ical_url}
                    </Badge>
                  )}
                </div>
              </TableCell>
              <TableCell>
                <Badge variant="outline">
                  {t(`listingType.${property.listing_type}`)}
                </Badge>
              </TableCell>
              <TableCell>
                <Badge variant="outline">
                  {t(`propertyType.${property.property_type}`)}
                </Badge>
              </TableCell>
              <TableCell>
                {(property.listing_type === 'sale' || property.listing_type === 'both') && property.sale_price && (
                  <>${property.sale_price.toLocaleString()}</>
                )}
              </TableCell>
              <TableCell>
                {(property.listing_type === 'rent' || property.listing_type === 'both') && property.rental_price && (
                  <div className="flex flex-col">
                    <span>${property.rental_price.toLocaleString()}</span>
                    <span className="text-sm text-muted-foreground">
                      {property.rental_frequency && t(`rentalFrequency.${property.rental_frequency}`)}
                    </span>
                  </div>
                )}
              </TableCell>
              <TableCell>
                <div className="flex flex-col">
                  <span>{property.city}</span>
                  <span className="text-sm text-muted-foreground">{property.country}</span>
                </div>
              </TableCell>
              <TableCell>
                <Badge variant={
                  property.status === 'available' ? 'default' :
                  ['sold', 'pending'].includes(property.status) ? 'destructive' : 'secondary'
                }>
                  {t(`status.${property.status}`)}
                </Badge>
              </TableCell>
              <TableCell>
                <Badge variant={property.featured ? 'default' : 'outline'}>
                  {property.featured ? t('status.featured') : t('status.notFeatured')}
                </Badge>
              </TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>{t('actions.title')}</DropdownMenuLabel>
                    <DropdownMenuItem
                      onClick={() => {
                        updatePropertyFeatured(property.id, !property.featured);
                      }}
                    >
                      <Star className="mr-2 h-4 w-4" />
                      {property.featured ? t('actions.unmarkFeatured') : t('actions.markFeatured')}
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuLabel>{t('actions.status')}</DropdownMenuLabel>
                    <DropdownMenuItem
                      onClick={() => updatePropertyStatus(property.id, 'available')}
                      disabled={property.status === 'available'}
                    >
                      <Check className="mr-2 h-4 w-4" />
                      {t('actions.markAvailable')}
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => updatePropertyStatus(property.id, 'pending')}
                      disabled={['pending', 'sold', 'rented'].includes(property.status)}>
                      <Ban className="mr-2 h-4 w-4" />
                      {t('actions.markPending')}
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => updatePropertyStatus(property.id, 'sold')}
                      disabled={property.status === 'sold'}
                    >
                      <Check className="mr-2 h-4 w-4" />
                      {t('actions.markSold')}
                    </DropdownMenuItem>
                    {(property.listing_type === 'rent' || property.listing_type === 'both') && (
                      <>
                        <DropdownMenuItem
                          onClick={() => updatePropertyStatus(property.id, 'rented' as PropertyStatus)}
                          disabled={property.status === 'rented'}
                        >
                          <Check className="mr-2 h-4 w-4" />
                          {t('actions.markRented')}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                      </>
                    )}
                    <DropdownMenuItem
                      onClick={() => {
                        setSelectedProperty(property)
                        setIsEditDialogOpen(true)
                      }}
                    >
                      <Edit className="mr-2 h-4 w-4" />
                      {t('actions.edit')}
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => {
                        setSelectedProperty(property)
                        setIsCalendarDialogOpen(true)
                      }}
                    >
                      <Calendar className="mr-2 h-4 w-4" />
                      {t('actions.manageCalendar')}
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="text-red-600"
                      onClick={() => {
                        setSelectedProperty(property)
                        setIsDeleteDialogOpen(true)
                      }}
                    >
                      <Trash className="mr-2 h-4 w-4" />
                      {t('actions.delete')}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
