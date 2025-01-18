"use client"

import { useState } from 'react'
import Image from 'next/image'
import { Dialog, DialogContent, DialogHeader } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Property } from '@/types/property'

interface PropertyGalleryProps {
  property: Property
}

export function PropertyGallery({ property }: PropertyGalleryProps) {
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

  if (images.length === 0) {
    return (
      <div className="relative aspect-[16/9] w-full bg-muted rounded-lg">
        <Image
          src="/placeholder-property.jpg"
          alt="Property placeholder"
          fill
          className="object-cover rounded-lg"
        />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Main Gallery Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        {/* Large primary image */}
        <div 
          className="relative aspect-[16/9] cursor-pointer"
          onClick={() => handleImageClick(0)}
        >
          <Image
            src={images[0]}
            alt={`Property image 1`}
            fill
            className="object-cover rounded-lg"
            priority
          />
        </div>

        {/* 2x2 grid for smaller images */}
        <div className="grid grid-cols-2 gap-2">
          {images.slice(1, 5).map((image, index) => (
            <div
              key={index}
              className={cn(
                "relative aspect-[16/9] cursor-pointer",
                index === 3 && images.length > 5 && "relative"
              )}
              onClick={() => handleImageClick(index + 1)}
            >
              <Image
                src={image}
                alt={`Property image ${index + 2}`}
                fill
                className="object-cover rounded-lg"
              />
              {index === 3 && images.length > 5 && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-lg">
                  <Button
                    variant="ghost"
                    className="text-white hover:bg-white/10"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleImageClick(4)
                    }}
                  >
                    +{images.length - 5} more
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Full Screen Modal */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-[90vw] h-[90vh] p-0">
          <DialogHeader className="absolute top-4 left-4 z-10 bg-background/80 px-3 py-2 rounded-lg">
            {currentIndex + 1} / {images.length}
          </DialogHeader>
          
          {/* Navigation Buttons */}
          <Button
            variant="ghost"
            size="icon"
            className="absolute left-4 top-1/2 -translate-y-1/2 z-10"
            onClick={handlePrev}
          >
            <ChevronLeft className="h-8 w-8" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-4 top-1/2 -translate-y-1/2 z-10"
            onClick={handleNext}
          >
            <ChevronRight className="h-8 w-8" />
          </Button>

          {/* Current Image */}
          <div className="relative h-full w-full">
            <Image
              src={images[currentIndex]}
              alt={`Property image ${currentIndex + 1}`}
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
