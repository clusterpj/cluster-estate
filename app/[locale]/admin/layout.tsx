import { redirect } from 'next/navigation'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import type { Database } from '../../../types/supabase'
import { Suspense } from 'react'

interface AdminLayoutProps {
  children: React.ReactNode
  parallel?: React.ReactNode
}

export default async function AdminLayout({
  children,
  parallel
}: AdminLayoutProps) {
  const supabase = createServerComponentClient<Database>({ cookies })
  
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    redirect('/auth/login')
  }

  // Fetch user profile to check role
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', session.user.id)
    .single()

  if (!profile || profile.role !== 'admin') {
    redirect('/')
  }

  return (
    <div className="flex-1">
      <Suspense fallback={
        <div className="flex min-h-screen items-center justify-center">
          <div className="text-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          </div>
        </div>
      }>
        {children}
      </Suspense>
      {parallel}
    </div>
  )
}

// Add error boundary
export function ErrorBoundary({
  error,
}: {
  error: Error & { digest?: string }
}) {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-destructive">Something went wrong!</h2>
        <p className="text-muted-foreground">{error.message}</p>
      </div>
    </div>
  )
}
