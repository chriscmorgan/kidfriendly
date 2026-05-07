'use client'
import { useState } from 'react'
import { Flag } from 'lucide-react'
import { useAuth } from '@/components/auth/AuthProvider'
import SignInModal from '@/components/auth/SignInModal'

const QUICK_REASONS = [
  { label: '🚫 Venue is closed or no longer open', value: 'Venue is closed or no longer open' },
  { label: '🛝 Play area is closed or unavailable', value: 'Play area is closed or unavailable' },
  { label: '📝 Information is incorrect', value: 'Information is incorrect' },
]

export default function ReportButton({ locationId }: { locationId: string }) {
  const { user } = useAuth()
  const [open, setOpen] = useState(false)
  const [reason, setReason] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [showSignIn, setShowSignIn] = useState(false)

  async function handleSubmit() {
    if (!user || !reason.trim()) return
    await fetch('/api/report', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ locationId, reason }),
    })
    setSubmitted(true)
    setOpen(false)
  }

  if (submitted) return (
    <span className="text-xs text-[#6b7280]">✓ Reported — thank you</span>
  )

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-1.5 text-xs text-[#6b7280] hover:text-red-500 transition-colors cursor-pointer"
      >
        <Flag className="w-3.5 h-3.5" />
        Report this listing
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40" onClick={() => setOpen(false)} />
          <div className="relative bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl">
            <h3 className="font-semibold text-[#2c2c2c] mb-1">Report this listing</h3>

            {!user ? (
              <div className="py-4 text-center">
                <p className="text-sm text-[#4b5563] mb-4">Sign in to submit a report — it only takes a few seconds.</p>
                <button
                  onClick={() => { setOpen(false); setShowSignIn(true) }}
                  className="w-full bg-[#4abfc0] hover:bg-[#38a5a0] text-white font-semibold text-sm py-3 rounded-xl transition-colors cursor-pointer"
                >
                  Sign in to report
                </button>
                <button onClick={() => setOpen(false)} className="mt-3 text-xs text-[#9ca3af] hover:text-[#6b7280] cursor-pointer">
                  Cancel
                </button>
              </div>
            ) : (
              <>
                <p className="text-xs text-[#6b7280] mb-4">Select a reason or describe the issue below.</p>

                <div className="flex flex-col gap-2 mb-4">
                  {QUICK_REASONS.map((r) => (
                    <button
                      key={r.value}
                      type="button"
                      onClick={() => setReason(r.value)}
                      className={`text-left text-sm px-3 py-2.5 rounded-xl border transition-colors cursor-pointer ${
                        reason === r.value
                          ? 'border-[#4abfc0] bg-[#f0fbfb] text-[#2a8a85]'
                          : 'border-gray-200 hover:bg-gray-50 text-[#2c2c2c]'
                      }`}
                    >
                      {r.label}
                    </button>
                  ))}
                </div>

                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Or describe the issue…"
                  className="w-full border border-gray-200 rounded-xl p-3 text-sm resize-none h-20 outline-none focus:border-[#4abfc0]"
                />
                <div className="flex gap-2 mt-3 justify-end">
                  <button onClick={() => setOpen(false)} className="px-4 py-2 text-sm text-[#6b7280] hover:bg-gray-100 rounded-xl cursor-pointer">
                    Cancel
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={!reason.trim()}
                    className="px-4 py-2 text-sm bg-red-500 text-white rounded-xl hover:bg-red-600 disabled:opacity-50 cursor-pointer"
                  >
                    Submit report
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {showSignIn && <SignInModal onClose={() => setShowSignIn(false)} />}
    </>
  )
}
