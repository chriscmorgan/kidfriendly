'use client'
import { cn } from '@/lib/utils'

interface StarRatingProps {
  value: number
  max?: number
  size?: 'sm' | 'md'
  onChange?: (value: number) => void
}

export default function StarRating({ value, max = 5, size = 'md', onChange }: StarRatingProps) {
  const filled = Math.round(value)
  const sizes = size === 'sm' ? 'w-3.5 h-3.5' : 'w-5 h-5'

  return (
    <span className="inline-flex gap-0.5">
      {Array.from({ length: max }).map((_, i) => (
        <button
          key={i}
          type="button"
          onClick={() => onChange?.(i + 1)}
          className={cn(
            sizes,
            'transition-colors',
            onChange ? 'cursor-pointer' : 'cursor-default pointer-events-none'
          )}
          aria-label={`${i + 1} star`}
        >
          <svg viewBox="0 0 20 20" fill={i < filled ? '#f59e0b' : 'none'} stroke={i < filled ? '#f59e0b' : '#d1d5db'} strokeWidth={1.5}>
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        </button>
      ))}
    </span>
  )
}
