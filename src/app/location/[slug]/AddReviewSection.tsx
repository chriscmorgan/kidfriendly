'use client'
import { useState } from 'react'
import { useAuth } from '@/components/auth/AuthProvider'
import SignInModal from '@/components/auth/SignInModal'
import StarRating from '@/components/ui/StarRating'
import Button from '@/components/ui/Button'
import { createClient } from '@/lib/supabase/client'
import { RATING_DIMENSIONS } from '@/lib/constants'
import type { Review } from '@/lib/types'
import { useRouter } from 'next/navigation'

interface Props {
  locationId: string
  existingReview: Review | null
}

type Ratings = Record<string, number>

export default function AddReviewSection({ locationId, existingReview }: Props) {
  const { user } = useAuth()
  const router = useRouter()
  const [showSignIn, setShowSignIn] = useState(false)
  const [ratings, setRatings] = useState<Ratings>({})
  const [comment, setComment] = useState(existingReview?.comment ?? '')
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  if (!user) {
    return (
      <>
        <div className="bg-[#f2f7f2] border border-[#c1d9bf] rounded-2xl p-6 text-center">
          <p className="text-[#2c2c2c] font-medium mb-1">Share your experience</p>
          <p className="text-sm text-[#6b7280] mb-4">Sign in to leave a rating and review</p>
          <Button onClick={() => setShowSignIn(true)}>Sign in to review</Button>
        </div>
        {showSignIn && <SignInModal onClose={() => setShowSignIn(false)} />}
      </>
    )
  }

  if (submitted) {
    return (
      <div className="bg-[#f2f7f2] border border-[#c1d9bf] rounded-2xl p-6 text-center">
        <div className="text-3xl mb-2">🎉</div>
        <p className="font-medium text-[#2c2c2c]">Thanks for your review!</p>
      </div>
    )
  }

  async function handleSubmit() {
    if (!user) return
    const hasRating = Object.keys(ratings).length > 0
    if (!hasRating) return

    setSubmitting(true)
    const supabase = createClient()
    const payload: Record<string, unknown> = {
      location_id: locationId,
      user_id: user!.id,
      comment: comment.trim() || null,
    }
    for (const d of RATING_DIMENSIONS) {
      payload[`rating_${d.key}`] = ratings[d.key] ?? null
    }

    const { error } = await supabase
      .from('reviews')
      .upsert(payload, { onConflict: 'location_id,user_id' })

    setSubmitting(false)
    if (!error) {
      setSubmitted(true)
      router.refresh()
    }
  }

  return (
    <section className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-[#2c2c2c] mb-5">
        {existingReview ? 'Update your review' : 'Write a review'}
      </h2>

      <div className="space-y-4">
        {RATING_DIMENSIONS.map((dim) => (
          <div key={dim.key} className="flex items-center gap-3">
            <span className="text-xl w-6 shrink-0">{dim.emoji}</span>
            <span className="text-sm text-[#2c2c2c] flex-1">{dim.label}</span>
            <StarRating
              value={ratings[dim.key] ?? 0}
              onChange={(v) => setRatings((r) => ({ ...r, [dim.key]: v }))}
            />
          </div>
        ))}
      </div>

      <div className="mt-5">
        <label className="block text-sm font-medium text-[#2c2c2c] mb-1.5">
          Comment <span className="text-[#6b7280] font-normal">(optional)</span>
        </label>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          maxLength={280}
          placeholder="What did you think? Tips for other parents?"
          className="w-full border border-gray-200 rounded-xl p-3 text-sm resize-none h-24 outline-none focus:border-[#7da87b] text-[#2c2c2c] placeholder:text-[#6b7280]"
        />
        <p className="text-xs text-[#6b7280] mt-1 text-right">{comment.length}/280</p>
      </div>

      <Button
        className="mt-4 w-full justify-center"
        onClick={handleSubmit}
        loading={submitting}
        disabled={Object.keys(ratings).length === 0}
      >
        Submit review
      </Button>
    </section>
  )
}
