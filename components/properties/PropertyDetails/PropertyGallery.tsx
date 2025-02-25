"use client"

import { useState } from 'react'
import Image from 'next/image'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight, X, Maximize2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Property } from '@/types/property'
import { useTranslations } from 'next-intl'

interface PropertyGalleryProps {
  property: Property
}

export function PropertyGallery({ property }: PropertyGalleryProps) {
  const t = useTranslations('PropertyDetails')
  const [isOpen, setIsOpen] = useState(false)
  const [currentIndex, setCurrentIndex] = useState(0)
  const images = property.images || []

  const handleImageClick = (index: number) => {
    setCurrentIndex(index)
    setIsOpen(true)
  }

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length)
  }

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowRight') handleNext()
    if (e.key === 'ArrowLeft') handlePrev()
    if (e.key === 'Escape') setIsOpen(false)
  }

  if (images.length === 0) {
    return (
      <div className="relative aspect-[16/9] w-full bg-muted rounded-lg overflow-hidden">
        <Image
          src="/placeholder-property.jpg"
          alt={t('gallery.placeholder')}
          fill
          className="object-cover rounded-lg"
        />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Main Gallery Grid with improved hover states and accessibility */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-4">
        {/* Large primary image */}
        <div 
          className="relative aspect-[16/9] overflow-hidden group rounded-lg"
          onClick={() => handleImageClick(0)}
        >
          <Image
            src={images[0]}
            alt={`${property.title} - ${t('gallery.mainImage')}`}
            fill
            className="object-cover rounded-lg transition-transform duration-300 group-hover:scale-105"
            priority
          />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-200 flex items-center justify-center">
            <Maximize2 className="h-8 w-8 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
          </div>
          <span className="sr-only">{t('gallery.viewLarger')}</span>
        </div>

        {/* 2x2 grid for smaller images with improved hover effects */}
        <div className="grid grid-cols-2 gap-2 md:gap-4">
          {images.slice(1, 5).map((image, index) => (
            <div
              key={index}
              className={cn(
                "relative aspect-[16/9] overflow-hidden group rounded-lg",
                index === 3 && images.length > 5 && "relative"
              )}
              onClick={() => handleImageClick(index + 1)}
              role="button"
              tabIndex={0}
              aria-label={`${t('gallery.viewImage')} ${index + 2} ${t('gallery.of')} ${images.length}`}
            >
              <Image
                src={image}
                alt={`${property.title} - ${t('gallery.image')} ${index + 2}`}
                fill
                className="object-cover rounded-lg transition-transform duration-300 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-200" />
              
              {index === 3 && images.length > 5 && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-lg">
                  <div className="text-white text-center">
                    <span className="text-xl font-medium">+{images.length - 5}</span>
                    <p className="text-sm">{t('gallery.morePhotos')}</p>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Full Screen Modal with improved keyboard navigation */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent 
          className="max-w-[95vw] h-[90vh] p-0 bg-black border-none" 
          onKeyDown={handleKeyDown}
        >
          <div className="absolute top-4 right-4 z-20">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setIsOpen(false)}
              className="bg-black/50 hover:bg-black/70 border-none text-white"
              aria-label={t('gallery.close')}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
          
          <DialogHeader className="absolute top-4 left-4 z-10 bg-black/50 px-4 py-2 rounded-full">
            <p className="text-white text-sm font-medium">
              {currentIndex + 1} / {images.length}
            </p>
          </DialogHeader>
          
          {/* Navigation Buttons with improved accessibility */}
          <Button
            variant="outline"
            size="icon"
            className="absolute left-4 top-1/2 -translate-y-1/2 z-10 rounded-full bg-black/50 hover:bg-black/70 border-none text-white"
            onClick={handlePrev}
            aria-label={t('gallery.previous')}
          >
            <ChevronLeft className="h-6 w-6" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="absolute right-4 top-1/2 -translate-y-1/2 z-10 rounded-full bg-black/50 hover:bg-black/70 border-none text-white"
            onClick={handleNext}
            aria-label={t('gallery.next')}
          >
            <ChevronRight className="h-6 w-6" />
          </Button>

          {/* Current Image with loading indicator */}
          <div className="relative h-full w-full flex items-center justify-center">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-10 h-10 border-4 border-gray-400 border-t-white rounded-full animate-spin" />
            </div>
            <Image
              src={images[currentIndex]}
              alt={`${property.title} - ${t('gallery.image')} ${currentIndex + 1}`}
              fill
              className="object-contain"
              priority
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}