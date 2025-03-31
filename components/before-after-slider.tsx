'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';

interface BeforeAfterSliderProps {
  beforeImage: string;
  afterImage: string;
  beforeLabel?: string;
  afterLabel?: string;
}

export function BeforeAfterSlider({
  beforeImage,
  afterImage,
  beforeLabel = '2000',
  afterLabel = 'Now'
}: BeforeAfterSliderProps) {
  const [sliderPosition, setSliderPosition] = useState(50);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMove = (event: React.MouseEvent | React.TouchEvent) => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    const rect = container.getBoundingClientRect();
    
    // Get pageX from either mouse or touch event
    const pageX = 'touches' in event 
      ? event.touches[0].pageX 
      : event.pageX;

    const position = ((pageX - rect.left) / rect.width) * 100;
    setSliderPosition(Math.min(Math.max(position, 0), 100));
  };

  const handleMouseDown = () => {
    if (!containerRef.current) return;

    const container = containerRef.current;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const position = ((e.pageX - rect.left) / rect.width) * 100;
      setSliderPosition(Math.min(Math.max(position, 0), 100));
    };

    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  return (
    <div 
      ref={containerRef}
      className="relative h-[400px] md:h-[600px] w-full overflow-hidden cursor-ew-resize rounded-lg"
      onMouseDown={handleMouseDown}
      onTouchMove={handleMove}
    >
      {/* Before Image (Full width) */}
      <div className="absolute inset-0">
        <Image
          src={beforeImage}
          alt="Before"
          fill
          className="object-cover"
          priority
        />
        <span className="absolute top-4 left-4 bg-black/50 text-white px-2 py-1 rounded">
          {beforeLabel}
        </span>
      </div>

      {/* After Image (Controlled width) */}
      <div 
        className="absolute inset-0"
        style={{ 
          clipPath: `inset(0 ${100 - sliderPosition}% 0 0)`
        }}
      >
        <Image
          src={afterImage}
          alt="After"
          fill
          className="object-cover"
          priority
        />
        <span className="absolute top-4 right-4 bg-black/50 text-white px-2 py-1 rounded">
          {afterLabel}
        </span>
      </div>

      {/* Slider Line */}
      <div 
        className="absolute top-0 bottom-0 w-1 bg-white cursor-ew-resize"
        style={{ left: `${sliderPosition}%` }}
      >
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-white rounded-full shadow-lg flex items-center justify-center">
          <svg 
            width="20" 
            height="20" 
            viewBox="0 0 20 20" 
            fill="none" 
            xmlns="http://www.w3.org/2000/svg"
            className="text-gray-600"
          >
            <path 
              d="M13 4L7 10L13 16" 
              stroke="currentColor" 
              strokeWidth="2"
            />
            <path 
              d="M7 4L13 10L7 16" 
              stroke="currentColor" 
              strokeWidth="2"
            />
          </svg>
        </div>
      </div>
    </div>
  );
}