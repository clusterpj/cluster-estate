'use client'

import { useState, useEffect } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Property } from '@/types/property'
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

export function PropertyManagement() {
  const [properties, setProperties] = useState<Property[]>([])
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null)
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
      setProperties(data || [])
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

  async function updatePropertyStatus(id: string, status: Property['status'] | { featured?: boolean }) {
    try {
      const { error } = await supabase
        .from('properties')
        .update(typeof status === 'string' ? { status } : status)
        .eq('id', id)

      if (error) throw error

      fetchProperties()
      setToastMessage({
        title: t('success'),
        description: t('updateSuccess'),
        type: 'success'
      })
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (err) {
      setToastMessage({
        title: t('error'),
        description: t('updateError'),
        type: 'error'
      })
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

  if (loading) {
    return <div>{t('loading')}</div>
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">{t('title')}</h2>
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          if (!open) return;
          setIsDialogOpen(open);
        }}>
          <DialogTrigger asChild>
            <Button>{t('actions.createProperty')}</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]" hideDefaultClose>
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

      <Dialog open={isEditDialogOpen} onOpenChange={(open) => {
        if (!open) return;
        setIsEditDialogOpen(open);
      }}>
        <DialogContent className="sm:max-w-[600px]" hideDefaultClose>
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

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{t('table.title')}</TableHead>
            <TableHead>{t('table.price')}</TableHead>
            <TableHead>{t('table.location')}</TableHead>
            <TableHead>{t('table.status')}</TableHead>
            <TableHead>{t('table.featured')}</TableHead>
            <TableHead>{t('table.actions')}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {properties.map((property) => (
            <TableRow key={property.id}>
              <TableCell>{property.title}</TableCell>
              <TableCell>${property.price.toLocaleString()}</TableCell>
              <TableCell>{property.location}</TableCell>
              <TableCell>
                <Badge variant={
                  property.status === 'available' ? 'default' :
                  property.status === 'pending' ? 'secondary' :
                  'outline'
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
                    <DropdownMenuLabel>{t('actions.manage')}</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    
                    <DropdownMenuItem
                      onClick={() => updatePropertyStatus(property.id, { featured: !property.featured })}
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
                    
                    <DropdownMenuSeparator />
                    
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
