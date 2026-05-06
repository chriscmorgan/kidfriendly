'use client'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import type { AvgRatings } from '@/lib/types'
import { RATING_DIMENSIONS } from '@/lib/constants'
import { formatRating } from '@/lib/utils'

interface RatingsChartProps {
  ratings: AvgRatings
  reviewCount: number
}

export default function RatingsChart({ ratings, reviewCount }: RatingsChartProps) {
  const data = RATING_DIMENSIONS
    .map((dim) => ({
      name: dim.emoji,
      label: dim.label,
      value: ratings[dim.key as keyof AvgRatings] ?? 0,
      hasData: ratings[dim.key as keyof AvgRatings] != null,
    }))
    .filter((d) => d.hasData)

  if (!data.length) return (
    <div className="text-sm text-[#6b7280] italic">No ratings yet — be the first to review.</div>
  )

  return (
    <div>
      <p className="text-xs text-[#6b7280] mb-4">Based on {reviewCount} review{reviewCount !== 1 ? 's' : ''}</p>
      <div className="space-y-3">
        {RATING_DIMENSIONS.map((dim) => {
          const val = ratings[dim.key as keyof AvgRatings]
          if (val == null) return null
          return (
            <div key={dim.key} className="flex items-center gap-3">
              <span className="text-lg w-6 shrink-0">{dim.emoji}</span>
              <span className="text-sm text-[#2c2c2c] w-36 shrink-0">{dim.label}</span>
              <div className="flex-1 bg-gray-100 rounded-full h-2 overflow-hidden">
                <div
                  className="h-full bg-[#e8674a] rounded-full transition-all duration-500"
                  style={{ width: `${(val / 5) * 100}%` }}
                />
              </div>
              <span className="text-sm font-semibold text-[#2c2c2c] w-8 text-right">{formatRating(val)}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
