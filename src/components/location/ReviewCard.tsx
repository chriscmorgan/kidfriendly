import { User } from 'lucide-react'
import type { Review } from '@/lib/types'
import { RATING_DIMENSIONS } from '@/lib/constants'

export default function ReviewCard({ review }: { review: Review }) {
  const ratedDimensions = RATING_DIMENSIONS.filter(
    (d) => review[`rating_${d.key}` as keyof Review] != null
  )

  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
      <div className="flex items-start gap-3">
        {review.user?.avatar_url ? (
          <img src={review.user.avatar_url} alt="" className="w-9 h-9 rounded-full object-cover shrink-0" />
        ) : (
          <div className="w-9 h-9 rounded-full bg-[#e0ecdf] flex items-center justify-center shrink-0">
            <User className="w-4 h-4 text-[#5e8e5c]" />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <span className="text-sm font-semibold text-[#2c2c2c] truncate">
              {review.user?.display_name ?? 'Anonymous'}
            </span>
            <span className="text-xs text-[#6b7280] shrink-0">
              {new Date(review.created_at).toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' })}
            </span>
          </div>

          {/* Mini rating chips */}
          {ratedDimensions.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-2">
              {ratedDimensions.map((d) => {
                const val = review[`rating_${d.key}` as keyof Review] as number
                return (
                  <span key={d.key} className="inline-flex items-center gap-1 bg-[#f2f7f2] text-[#426340] text-xs px-2 py-0.5 rounded-full font-medium">
                    {d.emoji} {val}/5
                  </span>
                )
              })}
            </div>
          )}

          {review.comment && (
            <p className="text-sm text-[#2c2c2c] mt-2 leading-relaxed">{review.comment}</p>
          )}
        </div>
      </div>
    </div>
  )
}
