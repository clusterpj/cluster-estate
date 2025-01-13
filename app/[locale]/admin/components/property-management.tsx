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
import { X, MoreHorizontal, Check, Ban, Star, Edit, Trash } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

export function PropertyManagement() {
  const [properties, setProperties] = useState<Property[]>([])
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
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
    available: ['pending', 'sold', 'rented'],
    pending: ['available', 'sold', 'rented'],
    sold: ['available'],
    rented: ['available']
  } as const;

  async function updatePropertyStatus(id: string, status: PropertyStatus | { features?: string[] }) {
    try {
      // Get current property status
      const { data: currentProperty } = await supabase
        .from('properties')
        .select('status')
        .eq('id', id)
        .single();

      if (!currentProperty) {
        throw new Error('Property not found');
      }

      // Validate status transition if it's a status change
      if (typeof status === 'string') {
        const currentStatus = currentProperty.status as PropertyStatus;
        if (!validStatusTransitions[currentStatus]?.includes(status)) {
          throw new Error(`Invalid status transition from ${currentStatus} to ${status}`);
        }
      }

      const { error } = await supabase
        .from('properties')
        .update(typeof status === 'string' ? { status } : status)
        .eq('id', id);

      if (error) throw error;

      fetchProperties()
      setToastMessage({
        title: t('success'),
        description: t('updateSuccess'),
        type: 'success'
      })
    } catch (err) {
      console.error('Error updating property:', err);
      setToastMessage({
        title: t('error'),
        description: err instanceof Error ? err.message : t('updateError'),
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

  const filteredProperties = properties.filter(property => 
    listingTypeFilter === 'all' ? true : property.listing_type === listingTypeFilter
  )

  if (loading) {
    return <div>{t('loading')}</div>
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold">{t('title')}</h2>
          <div className="flex gap-2">
            <Select value={listingTypeFilter} onValueChange={(value: typeof listingTypeFilter) => setListingTypeFilter(value)}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder={t('filters.selectListingType')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('filters.all')}</SelectItem>
                <SelectItem value="sale">{t('listingType.sale')}</SelectItem>
                <SelectItem value="rent">{t('listingType.rent')}</SelectItem>
                <SelectItem value="both">{t('listingType.both')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
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
              initialData={selectedProperty ? {
                ...selectedProperty,
                title: selectedProperty.title || '',
                description: selectedProperty.description || '',
                status: isValidPropertyStatus(selectedProperty.status) ? selectedProperty.status : 'available',
                property_type: selectedProperty.property_type || 'house',
                sale_price: selectedProperty.sale_price || 0,
                rental_price: selectedProperty.rental_price || 0,
                location: selectedProperty.location || '',
                bedrooms: selectedProperty.bedrooms || 0,
                bathrooms: selectedProperty.bathrooms || 0,
                square_feet: selectedProperty.square_feet || 0,
                minimum_rental_period: selectedProperty.minimum_rental_period ?? undefined,
                available_from: selectedProperty.available_from ? 
                  new Date(selectedProperty.available_from).toISOString().split('T')[0] : undefined,
                available_to: selectedProperty.available_to ? 
                  new Date(selectedProperty.available_to).toISOString().split('T')[0] : undefined,
                features: Array.isArray(selectedProperty.features) ? selectedProperty.features : [],
                images: Array.isArray(selectedProperty.images) ? selectedProperty.images : [],
                rental_frequency: selectedProperty.rental_frequency ?? undefined,
              } : undefined}
              onOpenChange={(open: boolean) => {
                if (open) {
                  console.group('Edit Property Debug');
                  console.log('Selected Property:', selectedProperty);
                  console.log('Processed Initial Data:', {
                    ...selectedProperty,
                    status: isValidPropertyStatus(selectedProperty?.status || '') ? selectedProperty?.status : 'available',
                    property_type: selectedProperty?.property_type || 'house',
                    available_from: selectedProperty?.available_from ? new Date(selectedProperty.available_from + 'Z').toISOString() : '',
                    available_to: selectedProperty?.available_to ? new Date(selectedProperty.available_to + 'Z').toISOString() : '',
                    features: Array.isArray(selectedProperty?.features) ? selectedProperty.features : [],
                    images: Array.isArray(selectedProperty?.images) ? selectedProperty.images : [],
                  });
                  console.groupEnd();
                }
              }}
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
              <TableCell>{property.title}</TableCell>
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
              <TableCell>{property.location}</TableCell>
              <TableCell>
                <Badge variant={
                  property.status === 'available' ? 'default' :
                  property.status === 'pending' ? 'secondary' :
                  property.status === 'sold' ? 'destructive' :
                  property.status === 'rented' ? 'secondary' :
                  'outline'
                }>
                  {t(`status.${property.status}`)}
                </Badge>
              </TableCell>
              <TableCell>
                <Badge variant={property.features?.includes('featured') ? 'default' : 'outline'}>
                  {property.features?.includes('featured') ? t('status.featured') : t('status.notFeatured')}
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
                    <DropdownMenuLabel>{t('actions.manage')}</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    
                    <DropdownMenuItem
                      onClick={() => {
                        const features = property.features || [];
                        const isFeatured = features.includes('featured');
                        const updatedFeatures = isFeatured 
                          ? features.filter(f => f !== 'featured')
                          : [...features, 'featured'];
                        updatePropertyStatus(property.id, { features: updatedFeatures });
                      }}
                    >
                      <Star className="mr-2 h-4 w-4" />
                      {property.features?.includes('featured') ? t('actions.unmarkFeatured') : t('actions.markFeatured')}
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
                      disabled={property.status === 'pending'}
                    >
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
                          onClick={() => updatePropertyStatus(property.id, 'rented')}
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
