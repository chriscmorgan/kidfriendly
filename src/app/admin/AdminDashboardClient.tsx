'use client'
import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { TagBadge } from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import type { Location } from '@/lib/types'
import type { Report, AdminUser } from './page'
import { AGE_RANGES } from '@/lib/constants'
import { CheckCircle, XCircle, Clock, MapPin, User, Eye, Pencil, Flag, Users } from 'lucide-react'
import { cn } from '@/lib/utils'

type Tab = 'pending' | 'all' | 'reports' | 'users'

export default function AdminDashboardClient({
  initialPending,
  initialAll,
  initialReports,
  initialUsers,
}: {
  initialPending: Location[]
  initialAll: Location[]
  initialReports: Report[]
  initialUsers: AdminUser[]
}) {
  const router = useRouter()
  const supabase = createClient()
  const [tab, setTab] = useState<Tab>('pending')
  const [pending, setPending] = useState(initialPending)
  const [all, setAll] = useState(initialAll)
  const [reports, setReports] = useState(initialReports)
  const [users] = useState(initialUsers)
  const [processingId, setProcessingId] = useState<string | null>(null)
  const [rejectNote, setRejectNote] = useState<{ id: string; note: string } | null>(null)

  async function dismissReport(id: string) {
    await supabase.from('reports').delete().eq('id', id)
    setReports((prev) => prev.filter((r) => r.id !== id))
  }

  async function approve(id: string) {
    setProcessingId(id)
    await supabase.from('locations').update({ status: 'approved', approved_at: new Date().toISOString() }).eq('id', id)
    setPending((prev) => prev.filter((l) => l.id !== id))
    setProcessingId(null)
    router.refresh()
  }

  async function reject(id: string, note: string) {
    setProcessingId(id)
    await supabase.from('locations').update({ status: 'rejected', rejection_note: note || null }).eq('id', id)
    setPending((prev) => prev.filter((l) => l.id !== id))
    setProcessingId(null)
    setRejectNote(null)
    router.refresh()
  }

  async function deleteLocation(id: string) {
    await supabase.from('locations').delete().eq('id', id)
    setAll((prev) => prev.filter((l) => l.id !== id))
    router.refresh()
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-ink">🛡️ Admin</h1>
        {tab === 'pending' && (
          <div className="flex items-center gap-2 bg-[#f7eed9] text-[#9e7c48] px-3 py-1.5 rounded-full text-sm font-medium">
            <Clock className="w-4 h-4" />
            {pending.length} pending
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex border-b border-border mb-8 gap-1">
        <button onClick={() => setTab('pending')} className={cn('px-4 py-2.5 text-sm font-medium transition-colors cursor-pointer rounded-t-lg', tab === 'pending' ? 'text-rust border-b-2 border-rust' : 'text-stone hover:text-ink')}>
          Pending ({pending.length})
        </button>
        <button onClick={() => setTab('all')} className={cn('px-4 py-2.5 text-sm font-medium transition-colors cursor-pointer rounded-t-lg', tab === 'all' ? 'text-rust border-b-2 border-rust' : 'text-stone hover:text-ink')}>
          All locations ({all.length})
        </button>
        <button onClick={() => setTab('reports')} className={cn('px-4 py-2.5 text-sm font-medium transition-colors cursor-pointer rounded-t-lg flex items-center gap-1.5', tab === 'reports' ? 'text-rust border-b-2 border-rust' : 'text-stone hover:text-ink')}>
          <Flag className="w-3.5 h-3.5" />
          Reports {reports.length > 0 && <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">{reports.length}</span>}
        </button>
        <button onClick={() => setTab('users')} className={cn('px-4 py-2.5 text-sm font-medium transition-colors cursor-pointer rounded-t-lg flex items-center gap-1.5', tab === 'users' ? 'text-rust border-b-2 border-rust' : 'text-stone hover:text-ink')}>
          <Users className="w-3.5 h-3.5" />
          Users ({users.length})
        </button>
      </div>

      {tab === 'users' ? (
        users.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-stone">No users yet.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {users.map((u) => <UserRow key={u.id} user={u} />)}
          </div>
        )
      ) : tab === 'reports' ? (
        reports.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-5xl mb-4">✅</div>
            <p className="font-semibold text-ink">No open reports</p>
            <p className="text-sm text-stone mt-1">Nothing to action right now.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {reports.map((report) => (
              <ReportRow key={report.id} report={report} onDismiss={dismissReport} />
            ))}
          </div>
        )
      ) : tab === 'pending' ? (
        pending.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-5xl mb-4">✅</div>
            <p className="font-semibold text-ink">All caught up!</p>
            <p className="text-sm text-stone mt-1">No pending submissions.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {pending.map((loc) => (
              <PendingCard
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
        )
      ) : (
        all.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-stone">No approved or rejected locations yet.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {all.map((loc) => (
              <AllLocationRow key={loc.id} location={loc} onDelete={deleteLocation} />
            ))}
          </div>
        )
      )}
    </div>
  )
}

/* ── Pending card (approve / reject / preview / edit) ── */

interface PendingCardProps {
  location: Location
  processingId: string | null
  rejectNote: { id: string; note: string } | null
  onApprove: (id: string) => void
  onRejectOpen: (id: string) => void
  onRejectNoteChange: (note: string) => void
  onRejectConfirm: () => void
  onRejectCancel: () => void
}

function PendingCard({ location: loc, processingId, rejectNote, onApprove, onRejectOpen, onRejectNoteChange, onRejectConfirm, onRejectCancel }: PendingCardProps) {
  const isProcessing = processingId === loc.id
  const isRejecting = rejectNote?.id === loc.id
  const heroPhoto = loc.photos?.[0]
  const ageLabels = AGE_RANGES.filter((a) => loc.age_ranges?.includes(a.value)).map((a) => a.label)
  const submitter = (loc as unknown as { submitter?: { display_name: string } }).submitter

  return (
    <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
      <div className="flex flex-col sm:flex-row">
        <div className="relative w-full sm:w-48 h-40 sm:h-auto bg-[#f7eed9] shrink-0">
          {heroPhoto ? (
            <Image src={heroPhoto.url} alt={loc.name} fill className="object-cover" sizes="192px" />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-4xl opacity-30">📍</div>
          )}
        </div>
        <div className="flex-1 p-5">
          <div className="flex flex-wrap gap-2 mb-2">
            {(loc.tags ?? []).map((tag) => <TagBadge key={tag} tag={tag} />)}
          </div>
          <h2 className="text-lg font-bold text-ink">{loc.name}</h2>
          <div className="flex items-center gap-1.5 text-sm text-stone mt-1">
            <MapPin className="w-3.5 h-3.5" />{loc.address}
          </div>
          {submitter && (
            <div className="flex items-center gap-1.5 text-xs text-stone mt-1">
              <User className="w-3 h-3" />
              Submitted by {submitter.display_name} · {new Date(loc.created_at).toLocaleDateString('en-AU')}
            </div>
          )}
          <p className="text-sm text-stone mt-3 line-clamp-3">{loc.description}</p>
          {ageLabels.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-3">
              {ageLabels.map((l) => <span key={l} className="text-xs bg-[#f7eed9] text-[#9e7c48] px-2 py-0.5 rounded-full">{l}</span>)}
            </div>
          )}
          {!isRejecting ? (
            <div className="flex flex-wrap gap-2 mt-4">
              <Button variant="primary" size="sm" loading={isProcessing} onClick={() => onApprove(loc.id)} className="gap-1.5">
                <CheckCircle className="w-4 h-4" /> Approve
              </Button>
              <Button variant="danger" size="sm" disabled={isProcessing} onClick={() => onRejectOpen(loc.id)} className="gap-1.5">
                <XCircle className="w-4 h-4" /> Reject
              </Button>
              <Button variant="ghost" size="sm" disabled={isProcessing} onClick={() => window.open(`/location/${loc.slug}?preview=1`, '_blank')} className="gap-1.5">
                <Eye className="w-4 h-4" /> Preview
              </Button>
              <Link href={`/location/${loc.slug}/edit`}>
                <Button variant="ghost" size="sm" disabled={isProcessing} className="gap-1.5">
                  <Pencil className="w-4 h-4" /> Edit
                </Button>
              </Link>
            </div>
          ) : (
            <div className="mt-4 space-y-2">
              <textarea
                placeholder="Rejection note (optional)…"
                value={rejectNote?.note ?? ''}
                onChange={(e) => onRejectNoteChange(e.target.value)}
                className="w-full border border-border rounded p-3 text-sm resize-none h-20 outline-none focus:border-rust text-ink placeholder:text-stone"
              />
              <div className="flex gap-2">
                <Button variant="danger" size="sm" loading={isProcessing} onClick={onRejectConfirm}>Confirm rejection</Button>
                <Button variant="ghost" size="sm" onClick={onRejectCancel}>Cancel</Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

/* ── All locations row (edit / delete) ── */

function AllLocationRow({ location: loc, onDelete }: { location: Location; onDelete: (id: string) => void }) {
  const [confirming, setConfirming] = useState(false)
  const heroPhoto = loc.photos?.[0]

  return (
    <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden flex items-center gap-4 p-4">
      <div className="relative w-16 h-16 rounded overflow-hidden bg-[#f7eed9] shrink-0">
        {heroPhoto ? (
          <Image src={heroPhoto.url} alt={loc.name} fill className="object-cover" sizes="64px" />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-xl opacity-30">📍</div>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-semibold text-ink truncate">{loc.name}</span>
          <span className={cn(
            'text-xs px-2 py-0.5 rounded-full font-medium',
            loc.status === 'approved' ? 'bg-rust-light text-rust-dark' : 'bg-red-50 text-red-600'
          )}>
            {loc.status === 'approved' ? '✓ Live' : '✗ Rejected'}
          </span>
        </div>
        <div className="flex items-center gap-1 text-xs text-stone mt-0.5">
          <MapPin className="w-3 h-3" />{loc.suburb}
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        {!confirming ? (
          <>
            <Link href={`/location/${loc.slug}/edit`}>
              <Button variant="ghost" size="sm" className="gap-1.5">
                <Pencil className="w-3.5 h-3.5" /> Edit
              </Button>
            </Link>
            <Button variant="danger" size="sm" onClick={() => setConfirming(true)}>Delete</Button>
          </>
        ) : (
          <>
            <span className="text-xs text-stone">Sure?</span>
            <Button variant="danger" size="sm" onClick={() => onDelete(loc.id)}>Yes, delete</Button>
            <Button variant="ghost" size="sm" onClick={() => setConfirming(false)}>Cancel</Button>
          </>
        )}
      </div>
    </div>
  )
}

/* ── User row ── */

function UserRow({ user: u }: { user: AdminUser }) {
  const initials = u.display_name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
  return (
    <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-4 flex items-center gap-4">
      <div className="relative w-10 h-10 rounded-full overflow-hidden bg-[#f7eed9] shrink-0 flex items-center justify-center">
        {u.avatar_url ? (
          <Image src={u.avatar_url} alt={u.display_name} fill className="object-cover" sizes="40px" />
        ) : (
          <span className="text-sm font-semibold text-[#9e7c48]">{initials}</span>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-semibold text-ink truncate">{u.display_name}</span>
          {u.role === 'admin' && (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rust text-paper">Admin</span>
          )}
        </div>
        <p className="text-xs text-stone mt-0.5">
          Joined {new Date(u.created_at).toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' })}
          {' · '}
          {u.submission_count === 0 ? 'No submissions' : `${u.submission_count} submission${u.submission_count !== 1 ? 's' : ''}`}
        </p>
      </div>
    </div>
  )
}

/* ── Report row ── */

function ReportRow({ report: r, onDismiss }: { report: Report; onDismiss: (id: string) => void }) {
  const [confirming, setConfirming] = useState(false)

  return (
    <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-4 flex flex-col sm:flex-row sm:items-center gap-4">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap mb-1">
          <Flag className="w-3.5 h-3.5 text-red-400 shrink-0" />
          {r.location ? (
            <Link href={`/location/${r.location.slug}`} target="_blank" className="font-semibold text-ink hover:text-rust transition-colors">
              {r.location.name}
            </Link>
          ) : (
            <span className="font-semibold text-ink">Unknown venue</span>
          )}
        </div>
        <p className="text-sm text-[#4b5563] mb-1">{r.reason}</p>
        <p className="text-xs text-[#9ca3af]">
          {r.reporter?.display_name ?? 'Unknown user'} · {new Date(r.created_at).toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' })}
        </p>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        {r.location && (
          <Link href={`/location/${r.location.slug}`} target="_blank">
            <Button variant="ghost" size="sm" className="gap-1.5">
              <Eye className="w-3.5 h-3.5" /> View
            </Button>
          </Link>
        )}
        {!confirming ? (
          <Button variant="ghost" size="sm" onClick={() => setConfirming(true)}>Dismiss</Button>
        ) : (
          <>
            <span className="text-xs text-stone">Dismiss?</span>
            <Button variant="danger" size="sm" onClick={() => onDismiss(r.id)}>Yes</Button>
            <Button variant="ghost" size="sm" onClick={() => setConfirming(false)}>Cancel</Button>
          </>
        )}
      </div>
    </div>
  )
}
