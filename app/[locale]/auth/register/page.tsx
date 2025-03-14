'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { useAuth } from '@/components/providers/auth-provider'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from '@/components/ui/use-toast'

export default function RegisterPage() {
  const t = useTranslations('auth')
  const router = useRouter()
  const { signUp } = useAuth()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [toastMessage, setToastMessage] = useState<{ title: string; description: string; type: 'success' | 'error' } | null>(null)

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (password !== confirmPassword) {
      setToastMessage({
        title: t('error'),
        description: t('passwordMismatch'),
        type: 'error'
      })
      return
    }

    try {
      setLoading(true)
      await signUp(email, password)
      setToastMessage({
        title: t('success'),
        description: t('registrationSuccess'),
        type: 'success'
      })
      router.push('/auth/login')
    } catch (error) {
      setToastMessage({
        title: t('error'),
        description: t('registrationError'),
        type: 'error'
      })
      console.error('Registration error:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto flex h-screen items-center justify-center px-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>{t('registerTitle')}</CardTitle>
          <CardDescription>{t('registerDescription')}</CardDescription>
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
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">{t('confirmPassword')}</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder={t('confirmPasswordPlaceholder')}
                required
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? t('registering') : t('register')}
            </Button>
            <div className="text-sm text-center space-x-1">
              <span>{t('haveAccount')}</span>
              <Button variant="link" className="p-0" onClick={() => router.push('/auth/login')}>
                {t('login')}
              </Button>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
