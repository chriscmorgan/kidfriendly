'use client'
import { useState } from 'react'
import Image from 'next/image'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import type { LocationPhoto } from '@/lib/types'
import { cn } from '@/lib/utils'

export default function PhotoCarousel({ photos }: { photos: LocationPhoto[] }) {
  const [index, setIndex] = useState(0)
  if (!photos.length) return (
    <div className="w-full h-80 bg-[#f7eed9] rounded-2xl flex items-center justify-center text-5xl opacity-50">
      📍
    </div>
  )

  const prev = () => setIndex((i) => (i === 0 ? photos.length - 1 : i - 1))
  const next = () => setIndex((i) => (i === photos.length - 1 ? 0 : i + 1))

  return (
    <div className="relative w-full h-80 rounded-2xl overflow-hidden bg-[#f7eed9] group">
      <Image
        src={photos[index].url}
        alt=""
        fill
        className="object-cover transition-opacity duration-300"
        sizes="(max-width: 768px) 100vw, 800px"
        priority
      />

      {photos.length > 1 && (
        <>
          <button
            onClick={prev}
            className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity cursor-pointer shadow-sm hover:bg-white"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={next}
            className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity cursor-pointer shadow-sm hover:bg-white"
          >
            <ChevronRight className="w-5 h-5" />
          </button>

          {/* Dots — padded for larger tap targets on mobile */}
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex">
            {photos.map((_, i) => (
              <button
                key={i}
                onClick={() => setIndex(i)}
                className="p-2 cursor-pointer"
              >
                <div className={cn(
                  'h-2 rounded-full transition-all duration-200',
                  i === index ? 'w-4 bg-white' : 'w-2 bg-white/60'
                )} />
              </button>
            ))}
          </div>

          {/* Counter */}
          <div className="absolute top-3 right-3 bg-black/40 text-white text-xs rounded-full px-2 py-0.5">
            {index + 1} / {photos.length}
          </div>
        </>
      )}
    </div>
  )
}
