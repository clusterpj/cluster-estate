import { useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { v4 as uuidv4 } from 'uuid'
import type { Database } from '@/types/supabase'

export function useImageUpload(
  initialImages: string[] = [],
  onError?: (error: Error) => void
) {
  const [uploadedImages, setUploadedImages] = useState<string[]>(initialImages || [])
  const supabase = createClientComponentClient<Database>()

  const handleImageUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return

    try {
      const uploadedUrls: string[] = []

      for (const file of Array.from(files)) {
        const fileExt = file.name.split('.').pop()
        const fileName = `${uuidv4()}.${fileExt}`
        const filePath = `properties/${fileName}`
        
        const { error: uploadError } = await supabase.storage
          .from('property-images')
          .upload(filePath, file)

        if (uploadError) throw uploadError

        const { data: { publicUrl } } = supabase.storage
          .from('property-images')
          .getPublicUrl(filePath)

        uploadedUrls.push(publicUrl)
      }

      setUploadedImages(prev => [...prev, ...uploadedUrls])
    } catch (error: unknown) {
      console.error('Error uploading images:', error)
      if (onError) {
        onError(error instanceof Error ? error : new Error('Image upload failed', { cause: error }))
      }
    }
  }

  const handleImageRemove = (image: string) => {
    setUploadedImages(prev => prev.filter(img => img !== image))
  }

  return {
    uploadedImages,
    handleImageUpload,
    handleImageRemove
  }
}
