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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Toast, ToastTitle, ToastDescription } from '@/components/ui/toast'
import { useTranslations } from 'next-intl'

type Profile = Database['public']['Tables']['profiles']['Row']

export function UserManagement() {
  const [users, setUsers] = useState<Profile[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClientComponentClient<Database>()
  const t = useTranslations('auth.adminSection.users')
  const [toastMessage, setToastMessage] = useState<{ title: string; description: string; type: 'success' | 'error' } | null>(null)

  // Fetch users on component mount
  useEffect(() => {
    fetchUsers()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  async function fetchUsers() {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setUsers(data || [])
    } catch (error) {
      console.error('Error fetching users:', error)
      setToastMessage({
        title: t('error'),
        description: t('fetchError'),
        type: 'error'
      })
    } finally {
      setLoading(false)
    }
  }

  async function updateUserRole(userId: string, newRole: Profile['role']) {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ role: newRole })
        .eq('id', userId)

      if (error) throw error

      // Refresh users
      fetchUsers()
      
      setToastMessage({
        title: t('success'),
        description: t('updateSuccess'),
        type: 'success'
      })
    } catch (error) {
      console.error('Error updating user role:', error)
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
          variant={toastMessage.type === 'error' ? 'destructive' : 'default'}
          onOpenChange={() => setToastMessage(null)}
        >
          <div className="grid gap-1">
            {toastMessage.title && <ToastTitle>{toastMessage.title}</ToastTitle>}
            {toastMessage.description && (
              <ToastDescription>{toastMessage.description}</ToastDescription>
            )}
          </div>
        </Toast>
      )}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{t('table.user')}</TableHead>
            <TableHead>{t('table.email')}</TableHead>
            <TableHead>{t('table.role')}</TableHead>
            <TableHead>{t('table.joined')}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => (
            <TableRow key={user.id}>
              <TableCell className="flex items-center gap-2">
                <Avatar>
                  <AvatarImage src={user.avatar_url || undefined} />
                  <AvatarFallback>
                    {user.full_name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                {user.full_name}
              </TableCell>
              <TableCell>{user.email}</TableCell>
              <TableCell>
                <Select
                  defaultValue={user.role}
                  onValueChange={(value) => updateUserRole(user.id, value as Profile['role'])}
                >
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="user">{t('roles.user')}</SelectItem>
                    <SelectItem value="agent">{t('roles.agent')}</SelectItem>
                    <SelectItem value="admin">{t('roles.admin')}</SelectItem>
                  </SelectContent>
                </Select>
              </TableCell>
              <TableCell>
                {new Date(user.created_at).toLocaleDateString()}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
