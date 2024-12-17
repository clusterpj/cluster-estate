'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { useAuth } from '@/components/providers/auth-provider'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Toast } from '@/components/ui/toast'

export default function LoginPage() {
  const t = useTranslations('auth')
  const router = useRouter()
  const { signIn } = useAuth()
  const [loading, setLoading] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [toastMessage, setToastMessage] = useState<{ title: string; description: string; type: 'success' | 'error' } | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      setLoading(true)
      await signIn(email, password)
      setToastMessage({
        title: t('success'),
        description: t('loginSuccess'),
        type: 'success'
      })
      router.push('/')
    } catch (error) {
      setToastMessage({
        title: t('error'),
        description: t('loginError'),
        type: 'error'
      })
      console.error('Login error:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto flex h-screen items-center justify-center px-4">
      {toastMessage && (
        <Toast
          title={toastMessage.title}
          description={toastMessage.description}
          variant={toastMessage.type === 'error' ? 'destructive' : 'default'}
          onOpenChange={() => setToastMessage(null)}
        />
      )}
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>{t('loginTitle')}</CardTitle>
          <CardDescription>{t('loginDescription')}</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">{t('email')}</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t('emailPlaceholder')}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">{t('password')}</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={t('passwordPlaceholder')}
                required
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? t('loggingIn') : t('login')}
            </Button>
            <div className="text-sm text-center space-x-1">
              <span>{t('noAccount')}</span>
              <Button variant="link" className="p-0" onClick={() => router.push('/auth/register')}>
                {t('signUp')}
              </Button>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
