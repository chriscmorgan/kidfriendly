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
          <div className="w-9 h-9 rounded-full bg-[#f8d9d2] flex items-center justify-center shrink-0">
            <User className="w-4 h-4 text-[#b97260]" />
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

          {/* Comment first — primary content */}
          {review.comment ? (
            <p className="text-[15px] text-[#2c2c2c] mt-2 leading-relaxed">{review.comment}</p>
          ) : (
            <p className="text-sm text-[#6b7280] italic mt-2">Rated the experience</p>
          )}

          {/* Rating chips — secondary */}
          {ratedDimensions.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-2.5">
              {ratedDimensions.map((d) => {
                const val = review[`rating_${d.key}` as keyof Review] as number
                return (
                  <span key={d.key} className="inline-flex items-center gap-1 bg-[#fdf0ed] text-[#8b4e3c] text-[11px] px-2 py-0.5 rounded-full font-medium">
                    {d.emoji} {val}/5
                  </span>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
