'use client'
import { useState } from 'react'
import { Flag } from 'lucide-react'
import { useAuth } from '@/components/auth/AuthProvider'
import { createClient } from '@/lib/supabase/client'

export default function ReportButton({ locationId }: { locationId: string }) {
  const { user } = useAuth()
  const [open, setOpen] = useState(false)
  const [reason, setReason] = useState('')
  const [submitted, setSubmitted] = useState(false)

  async function handleSubmit() {
    if (!user || !reason.trim()) return
    const supabase = createClient()
    await supabase.from('reports').insert({
      target_type: 'location',
      target_id: locationId,
      reported_by: user.id,
      reason,
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
            <h3 className="font-semibold text-[#2c2c2c] mb-3">Report this listing</h3>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Describe the issue…"
              className="w-full border border-gray-200 rounded-xl p-3 text-sm resize-none h-24 outline-none focus:border-[#7da87b]"
            />
            <div className="flex gap-2 mt-3 justify-end">
              <button onClick={() => setOpen(false)} className="px-4 py-2 text-sm text-[#6b7280] hover:bg-gray-100 rounded-xl cursor-pointer">
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={!reason.trim() || !user}
                className="px-4 py-2 text-sm bg-red-500 text-white rounded-xl hover:bg-red-600 disabled:opacity-50 cursor-pointer"
              >
                Submit report
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
