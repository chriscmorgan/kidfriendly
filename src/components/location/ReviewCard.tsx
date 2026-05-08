import { User } from 'lucide-react'
import type { Review } from '@/lib/types'
import { RATING_DIMENSIONS } from '@/lib/constants'

export default function ReviewCard({ review }: { review: Review }) {
  const ratedDimensions = RATING_DIMENSIONS.filter(
    (d) => review[`rating_${d.key}` as keyof Review] != null
  )

  return (
    <div className="bg-paper border border-border rounded p-4">
      <div className="flex items-start gap-3">
        {review.user?.avatar_url ? (
          <img src={review.user.avatar_url} alt="" className="w-9 h-9 rounded-full object-cover shrink-0" />
        ) : (
          <div className="w-9 h-9 rounded-full bg-parchment border border-border flex items-center justify-center shrink-0">
            <User className="w-4 h-4 text-stone" />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <span className="text-sm font-semibold text-ink truncate">
              {review.user?.display_name ?? 'Anonymous'}
            </span>
            <span className="text-xs text-stone shrink-0">
              {new Date(review.created_at).toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' })}
            </span>
          </div>

          {/* Comment first — primary content */}
          {review.comment ? (
            <p className="text-[15px] text-ink mt-2 leading-relaxed">{review.comment}</p>
          ) : (
            <p className="text-sm text-stone italic mt-2">Rated the experience</p>
          )}

          {/* Rating chips — secondary */}
          {ratedDimensions.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-2.5">
              {ratedDimensions.map((d) => {
                const val = review[`rating_${d.key}` as keyof Review] as number
                return (
                  <span key={d.key} className="inline-flex items-center gap-1 bg-parchment text-stone text-[11px] px-2 py-0.5 rounded font-medium border border-border">
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
