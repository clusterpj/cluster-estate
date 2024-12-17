'use client'

import { useState, useEffect } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import type { Database } from '@/types/supabase'
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
import { useToast } from "@/hooks/use-toast"
import { X } from 'lucide-react'

type Property = Database['public']['Tables']['properties']['Row']

export function PropertyManagement() {
  const [properties, setProperties] = useState<Property[]>([])
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null)
  const supabase = createClientComponentClient<Database>()
  const t = useTranslations('auth.adminSection.properties')
  const [toastMessage, setToastMessage] = useState<{ title: string; description: string; type: 'success' | 'error' } | null>(null)
  const { toast } = useToast()

  // Fetch properties on component mount
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
    } catch (error) {
      console.error('Error fetching properties:', error)
      setToastMessage({
        title: t('error'),
        description: t('fetchError'),
        type: 'error'
      })
    } finally {
      setLoading(false)
    }
  }

  async function updatePropertyStatus(id: string, status: Property['status']) {
    try {
      const { error } = await supabase
        .from('properties')
        .update({ status })
        .eq('id', id)

      if (error) throw error

      // Refresh properties
      fetchProperties()
      setToastMessage({
        title: t('success'),
        description: t('updateSuccess'),
        type: 'success'
      })
    } catch (error) {
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
    } catch (error) {
      console.error('Error deleting property:', error)
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
          // Only allow closing via the close button
          if (!open) {
            return;
          }
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
              onError={(error) => {
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
        // Only allow closing via the close button
        if (!open) {
          return;
        }
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
              onError={(error) => {
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
        // Only allow closing via the close button
        if (!open) {
          return;
        }
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
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => updatePropertyStatus(property.id, 'available')}
                    disabled={property.status === 'available'}
                  >
                    {t('actions.markAvailable')}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => updatePropertyStatus(property.id, 'pending')}
                    disabled={property.status === 'pending'}
                  >
                    {t('actions.markPending')}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => updatePropertyStatus(property.id, 'sold')}
                    disabled={property.status === 'sold'}
                  >
                    {t('actions.markSold')}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSelectedProperty(property)
                      setIsEditDialogOpen(true)
                    }}
                  >
                    {t('actions.edit')}
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => {
                      setSelectedProperty(property)
                      setIsDeleteDialogOpen(true)
                    }}
                  >
                    {t('actions.delete')}
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
