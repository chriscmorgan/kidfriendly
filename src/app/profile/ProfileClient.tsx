'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useAuth } from '@/components/auth/AuthProvider'
import { createClient } from '@/lib/supabase/client'
import LocationCard from '@/components/location/LocationCard'
import type { Location, Review } from '@/lib/types'
import { User, MapPin, Clock } from 'lucide-react'
import { cn } from '@/lib/utils'

type Tab = 'submissions' | 'reviews'

export default function ProfileClient() {
  const { user, profile } = useAuth()
  const supabase = createClient()
  const [tab, setTab] = useState<Tab>('submissions')
  const [submissions, setSubmissions] = useState<Location[]>([])
  const [reviews, setReviews] = useState<(Review & { location: Location })[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    async function load() {
      setLoading(true)
      const [{ data: locs }, { data: revs }] = await Promise.all([
        supabase
          .from('locations')
          .select('*, photos:location_photos(id, url, sort_order)')
          .eq('submitted_by', user!.id)
          .order('created_at', { ascending: false }),
        supabase
          .from('reviews')
          .select('*, location:locations(*, photos:location_photos(id, url, sort_order))')
          .eq('user_id', user!.id)
          .order('created_at', { ascending: false }),
      ])
      setSubmissions((locs ?? []).map((l) => ({ ...l, photos: (l.photos ?? []).sort((a: { sort_order: number }, b: { sort_order: number }) => a.sort_order - b.sort_order) })))
      setReviews((revs ?? []).map((r) => ({
        ...r,
        location: { ...r.location, photos: (r.location?.photos ?? []).sort((a: { sort_order: number }, b: { sort_order: number }) => a.sort_order - b.sort_order) },
      })))
      setLoading(false)
    }
    load()
  }, [user])

  if (!user || !profile) return (
    <div className="max-w-2xl mx-auto px-4 py-20 text-center">
      <p className="text-[#6b7280]">Please sign in to view your profile.</p>
    </div>
  )

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Profile header */}
      <div className="flex items-center gap-4 mb-10">
        {profile.avatar_url ? (
          <Image src={profile.avatar_url} alt="" width={64} height={64} className="rounded-full object-cover" />
        ) : (
          <div className="w-16 h-16 rounded-full bg-[#e0ecdf] flex items-center justify-center">
            <User className="w-8 h-8 text-[#5e8e5c]" />
          </div>
        )}
        <div>
          <h1 className="text-2xl font-bold text-[#2c2c2c]">{profile.display_name}</h1>
          <div className="flex items-center gap-3 mt-1 text-sm text-[#6b7280]">
            <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {submissions.length} place{submissions.length !== 1 ? 's' : ''} added</span>
            <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> Joined {new Date(profile.created_at).toLocaleDateString('en-AU', { month: 'long', year: 'numeric' })}</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-100 mb-8 gap-1">
        {(['submissions', 'reviews'] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={cn(
              'px-4 py-2.5 text-sm font-medium transition-colors cursor-pointer rounded-t-lg',
              tab === t
                ? 'text-[#5e8e5c] border-b-2 border-[#7da87b]'
                : 'text-[#6b7280] hover:text-[#2c2c2c]'
            )}
          >
            {t === 'submissions' ? `Places (${submissions.length})` : `Reviews (${reviews.length})`}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-52 rounded-2xl bg-white border border-gray-100 animate-pulse" />
          ))}
        </div>
      ) : tab === 'submissions' ? (
        submissions.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-4xl mb-3">📍</div>
            <p className="font-semibold text-[#2c2c2c]">No places added yet</p>
            <p className="text-sm text-[#6b7280] mt-1 mb-4">Share your favourite kid-friendly spots!</p>
            <Link href="/submit" className="inline-flex items-center gap-1.5 bg-[#7da87b] text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-[#5e8e5c] transition-colors">
              + Add a place
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {submissions.map((loc) => (
              <div key={loc.id} className="relative">
                <LocationCard location={loc} />
                <StatusBadge status={loc.status} />
              </div>
            ))}
          </div>
        )
      ) : (
        reviews.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-4xl mb-3">✍️</div>
            <p className="font-semibold text-[#2c2c2c]">No reviews yet</p>
            <p className="text-sm text-[#6b7280] mt-1">Share your experiences with other families.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {reviews.map((r) => (
              <div key={r.id} className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm flex gap-4">
                <div className="w-24 h-20 rounded-xl overflow-hidden bg-[#f7eed9] shrink-0 relative">
                  {r.location?.photos?.[0] ? (
                    <Image src={r.location.photos[0].url} alt="" fill className="object-cover" sizes="96px" />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-2xl opacity-30">📍</div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <Link href={`/location/${r.location?.slug}`} className="font-semibold text-[#2c2c2c] hover:text-[#5e8e5c] transition-colors">
                    {r.location?.name}
                  </Link>
                  <div className="flex items-center gap-1 mt-0.5 text-xs text-[#6b7280]">
                    <MapPin className="w-3 h-3" />
                    {r.location?.suburb}
                  </div>
                  {r.comment && <p className="text-sm text-[#2c2c2c] mt-2 line-clamp-2">{r.comment}</p>}
                  <p className="text-xs text-[#6b7280] mt-1">{new Date(r.created_at).toLocaleDateString('en-AU')}</p>
                </div>
              </div>
            ))}
          </div>
        )
      )}
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    pending: 'bg-[#f7eed9] text-[#9e7c48]',
    approved: 'bg-[#f2f7f2] text-[#426340]',
    rejected: 'bg-red-50 text-red-600',
  }
  const labels: Record<string, string> = {
    pending: '⏳ Pending review',
    approved: '✓ Live',
    rejected: '✗ Rejected',
  }
  if (status === 'approved') return null
  return (
    <div className={cn('absolute top-3 right-3 text-xs font-medium px-2.5 py-1 rounded-full', styles[status])}>
      {labels[status]}
    </div>
  )
}
