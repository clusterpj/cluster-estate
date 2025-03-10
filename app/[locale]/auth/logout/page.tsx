'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { useAuth } from '@/components/providers/auth-provider'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Loader2 } from 'lucide-react'

export default function LogoutPage() {
  const t = useTranslations('auth')
  const router = useRouter()
  const { signOut } = useAuth()
  const [isLoggingOut, setIsLoggingOut] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const performLogout = async () => {
      try {
        setIsLoggingOut(true)
        await signOut()
        
        // Wait a moment to ensure state updates
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        // Redirect to home page
        router.push('/')
        router.refresh()
      } catch (err) {
        console.error('Error during logout:', err)
        setError(String(err))
        setIsLoggingOut(false)
      }
    }

    performLogout()
  }, [signOut, router])

  const handleManualRedirect = () => {
    router.push('/')
  }

  return (
    <div className="container mx-auto flex h-screen items-center justify-center px-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>{t('loggingOut')}</CardTitle>
          <CardDescription>
            {isLoggingOut 
              ? t('loggingOutDescription') 
              : error 
                ? t('logoutError') 
                : t('logoutSuccess')}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center space-y-4">
          {isLoggingOut ? (
            <div className="flex flex-col items-center space-y-4">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p>{t('pleaseWait')}</p>
            </div>
          ) : error ? (
            <div className="space-y-4 w-full">
              <div className="bg-red-50 p-3 rounded-md text-red-800">
                <p className="font-medium">{t('error')}</p>
                <p className="text-sm">{error}</p>
              </div>
              <div className="flex justify-between">
                <Button variant="outline" onClick={() => router.back()}>
                  {t('goBack')}
                </Button>
                <Button onClick={handleManualRedirect}>
                  {t('goToHome')}
                </Button>
              </div>
            </div>
          ) : (
            <Button onClick={handleManualRedirect}>
              {t('goToHome')}
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
