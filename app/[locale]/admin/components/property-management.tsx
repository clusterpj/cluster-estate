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
import { Toast } from '@/components/ui/toast'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from '@/components/ui/dialog'
import { PropertyForm } from './property-form'
import { useTranslations } from 'next-intl'

type Property = Database['public']['Tables']['properties']['Row']

export function PropertyManagement() {
  const [properties, setProperties] = useState<Property[]>([])
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [toastMessage, setToastMessage] = useState<{ title: string; description: string; type: 'success' | 'error' } | null>(null)
  const supabase = createClientComponentClient<Database>()
  const t = useTranslations('auth.adminSection.properties')

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

  if (loading) {
    return <div>{t('loading')}</div>
  }

  return (
    <div className="space-y-4">
      {toastMessage && (
        <Toast
          title={toastMessage.title}
          description={toastMessage.description}
          variant={toastMessage.type === 'error' ? 'destructive' : 'default'}
          onOpenChange={() => setToastMessage(null)}
        />
      )}
      
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">{t('title')}</h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>{t('actions.createProperty')}</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>{t('form.createProperty')}</DialogTitle>
              <DialogDescription>
                {t('form.createPropertyDescription')}
              </DialogDescription>
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
                  'success'
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
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
