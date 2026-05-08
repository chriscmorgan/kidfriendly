'use client'
import { useState } from 'react'
import { useAuth } from '@/components/auth/AuthProvider'
import SignInModal from '@/components/auth/SignInModal'
import StarRating from '@/components/ui/StarRating'
import Button from '@/components/ui/Button'
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
        <div className="bg-parchment border border-border rounded p-6 text-center">
          <p className="text-ink font-medium mb-1">Share your experience</p>
          <p className="text-sm text-stone mb-4">Sign in to leave a rating and review</p>
          <Button onClick={() => setShowSignIn(true)}>Sign in to review</Button>
        </div>
        {showSignIn && <SignInModal onClose={() => setShowSignIn(false)} />}
      </>
    )
  }

  if (submitted) {
    return (
      <div className="bg-parchment border border-border rounded p-6 text-center">
        <div className="text-3xl mb-2">🎉</div>
        <p className="font-medium text-ink">Thanks for your review!</p>
      </div>
    )
  }

  const hasComment = comment.trim().length > 0
  const hasRating = Object.keys(ratings).length > 0

  async function handleSubmit() {
    if (!user || (!hasComment && !hasRating)) return
    setSubmitting(true)

    const res = await fetch('/api/review', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ locationId, comment: comment.trim() || null, ratings }),
    })

    setSubmitting(false)
    if (res.ok) {
      setSubmitted(true)
      router.refresh()
    }
  }

  return (
    <section className="bg-paper border border-border rounded p-6">
      <h2 className="text-lg font-semibold text-ink mb-5">
        {existingReview ? 'Update your review' : 'Write a review'}
      </h2>

      {/* Comment first — lower friction */}
      <div className="mb-5">
        <label className="block text-sm font-medium text-ink mb-1.5">
          Your experience
          <span className="text-stone font-normal ml-1">(star ratings below are optional)</span>
        </label>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          maxLength={280}
          placeholder="What did you think? Tips for other parents?"
          className="w-full border border-border rounded p-3 text-sm resize-none h-24 outline-none focus:border-rust text-ink placeholder:text-stone"
        />
        <p className="text-xs text-stone mt-1 text-right">{comment.length}/280</p>
      </div>

      {/* Ratings — optional */}
      <div className="space-y-4">
        {RATING_DIMENSIONS.map((dim) => (
          <div key={dim.key} className="flex items-center gap-3">
            <span className="text-xl w-6 shrink-0">{dim.emoji}</span>
            <span className="text-sm text-ink flex-1">{dim.label}</span>
            <StarRating
              value={ratings[dim.key] ?? 0}
              onChange={(v) => setRatings((r) => ({ ...r, [dim.key]: v }))}
            />
          </div>
        ))}
      </div>

      <Button
        className="mt-5 w-full justify-center"
        onClick={handleSubmit}
        loading={submitting}
        disabled={!hasComment && !hasRating}
      >
        Submit review
      </Button>
    </section>
  )
}
