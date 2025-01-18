'use client'

import { Button } from '@/components/ui/button'
import { useTranslations } from 'next-intl'

interface UpdateButtonProps {
  isLoading: boolean
}

export function UpdateButton({ isLoading }: UpdateButtonProps) {
  const t = useTranslations('auth.adminSection.properties')
  
  return (
    <Button 
      type="submit" 
      disabled={isLoading}
      className="bg-green-600 hover:bg-green-700"
    >
      {isLoading ? (
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          {t('form.updating')}
        </div>
      ) : (
        t('form.update')
      )}
    </Button>
  )
}
