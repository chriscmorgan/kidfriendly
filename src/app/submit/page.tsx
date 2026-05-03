import type { Metadata } from 'next'
import SubmitForm from './SubmitForm'

export const metadata: Metadata = { title: 'Add a place' }

export default function SubmitPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#2c2c2c]">Add a place</h1>
        <p className="text-[#6b7280] mt-2">
          Share a kid-friendly spot with the community. Your submission will be reviewed before going live.
        </p>
      </div>
      <SubmitForm />
    </div>
  )
}
