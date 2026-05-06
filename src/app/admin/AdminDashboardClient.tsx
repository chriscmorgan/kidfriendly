'use client'
import { useState } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { TagBadge } from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import type { Location } from '@/lib/types'
import { AGE_RANGES } from '@/lib/constants'
import { CheckCircle, XCircle, Clock, MapPin, User, Edit } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function AdminDashboardClient({ initialLocations }: { initialLocations: Location[] }) {
  const router = useRouter()
  const supabase = createClient()
  const [locations, setLocations] = useState(initialLocations)
  const [processingId, setProcessingId] = useState<string | null>(null)
  const [rejectNote, setRejectNote] = useState<{ id: string; note: string } | null>(null)

  async function approve(id: string) {
    setProcessingId(id)
    await supabase
      .from('locations')
      .update({ status: 'approved', approved_at: new Date().toISOString() })
      .eq('id', id)
    setLocations((prev) => prev.filter((l) => l.id !== id))
    setProcessingId(null)
    router.refresh()
  }

  async function reject(id: string, note: string) {
    setProcessingId(id)
    await supabase
      .from('locations')
      .update({ status: 'rejected', rejection_note: note || null })
      .eq('id', id)
    setLocations((prev) => prev.filter((l) => l.id !== id))
    setProcessingId(null)
    setRejectNote(null)
    router.refresh()
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-[#2c2c2c]">🛡️ Admin</h1>
          <p className="text-[#6b7280] mt-1">Pending submissions</p>
        </div>
        <div className="flex items-center gap-2 bg-[#f7eed9] text-[#9e7c48] px-3 py-1.5 rounded-full text-sm font-medium">
          <Clock className="w-4 h-4" />
          {locations.length} pending
        </div>
      </div>

      {locations.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-5xl mb-4">✅</div>
          <p className="font-semibold text-[#2c2c2c]">All caught up!</p>
          <p className="text-sm text-[#6b7280] mt-1">No pending submissions.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {locations.map((loc) => (
            <AdminLocationCard
              key={loc.id}
              location={loc}
              processingId={processingId}
              rejectNote={rejectNote}
              onApprove={approve}
              onRejectOpen={(id) => setRejectNote({ id, note: '' })}
              onRejectNoteChange={(note) => setRejectNote((r) => r ? { ...r, note } : r)}
              onRejectConfirm={() => rejectNote && reject(rejectNote.id, rejectNote.note)}
              onRejectCancel={() => setRejectNote(null)}
            />
          ))}
        </div>
      )}
    </div>
  )
}

interface CardProps {
  location: Location
  processingId: string | null
  rejectNote: { id: string; note: string } | null
  onApprove: (id: string) => void
  onRejectOpen: (id: string) => void
  onRejectNoteChange: (note: string) => void
  onRejectConfirm: () => void
  onRejectCancel: () => void
}

function AdminLocationCard({ location: loc, processingId, rejectNote, onApprove, onRejectOpen, onRejectNoteChange, onRejectConfirm, onRejectCancel }: CardProps) {
  const isProcessing = processingId === loc.id
  const isRejecting = rejectNote?.id === loc.id
  const heroPhoto = loc.photos?.[0]
  const ageLabels = AGE_RANGES.filter((a) => loc.age_ranges?.includes(a.value)).map((a) => a.label)
  const submitter = (loc as unknown as { submitter?: { display_name: string } }).submitter

  return (
    <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
      <div className="flex flex-col sm:flex-row">
        {/* Photo */}
        <div className="relative w-full sm:w-48 h-40 sm:h-auto bg-[#f7eed9] shrink-0">
          {heroPhoto ? (
            <Image src={heroPhoto.url} alt={loc.name} fill className="object-cover" sizes="192px" />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-4xl opacity-30">📍</div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 p-5">
          <div className="flex flex-wrap gap-2 mb-2">
            {(loc.tags ?? []).map((tag) => (
              <TagBadge key={tag} tag={tag} />
            ))}
          </div>

          <h2 className="text-lg font-bold text-[#2c2c2c]">{loc.name}</h2>
          <div className="flex items-center gap-1.5 text-sm text-[#6b7280] mt-1">
            <MapPin className="w-3.5 h-3.5" />
            {loc.address}
          </div>

          {submitter && (
            <div className="flex items-center gap-1.5 text-xs text-[#6b7280] mt-1">
              <User className="w-3 h-3" />
              Submitted by {submitter.display_name} · {new Date(loc.created_at).toLocaleDateString('en-AU')}
            </div>
          )}

          <p className="text-sm text-[#6b7280] mt-3 line-clamp-3">{loc.description}</p>

          {ageLabels.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-3">
              {ageLabels.map((l) => (
                <span key={l} className="text-xs bg-[#f7eed9] text-[#9e7c48] px-2 py-0.5 rounded-full">{l}</span>
              ))}
            </div>
          )}

          {/* Actions */}
          {!isRejecting ? (
            <div className="flex flex-wrap gap-2 mt-4">
              <Button
                variant="primary"
                size="sm"
                loading={isProcessing}
                onClick={() => onApprove(loc.id)}
                className="gap-1.5"
              >
                <CheckCircle className="w-4 h-4" />
                Approve
              </Button>
              <Button
                variant="danger"
                size="sm"
                disabled={isProcessing}
                onClick={() => onRejectOpen(loc.id)}
                className="gap-1.5"
              >
                <XCircle className="w-4 h-4" />
                Reject
              </Button>
              <Button
                variant="ghost"
                size="sm"
                disabled={isProcessing}
                onClick={() => window.open(`/location/${loc.slug}?preview=1`, '_blank')}
                className="gap-1.5"
              >
                <Edit className="w-4 h-4" />
                Preview
              </Button>
            </div>
          ) : (
            <div className="mt-4 space-y-2">
              <textarea
                placeholder="Rejection note (optional, sent to contributor)…"
                value={rejectNote?.note ?? ''}
                onChange={(e) => onRejectNoteChange(e.target.value)}
                className="w-full border border-gray-200 rounded-xl p-3 text-sm resize-none h-20 outline-none focus:border-[#4abfc0]"
              />
              <div className="flex gap-2">
                <Button variant="danger" size="sm" loading={isProcessing} onClick={onRejectConfirm}>
                  Confirm rejection
                </Button>
                <Button variant="ghost" size="sm" onClick={onRejectCancel}>Cancel</Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
