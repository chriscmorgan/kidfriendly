import type { Metadata } from 'next'
import SubmitForm from './SubmitForm'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://kidfriendlyeats.space'

export const metadata: Metadata = {
  title: 'Add a Kid-Friendly Place',
  description: 'Know a cafe or venue in Australia with a kids play area? Add it to the map in 2 minutes — help other parents find it.',
  alternates: { canonical: `${SITE_URL}/submit` },
}

export default function SubmitPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#2c2c2c]">Add a place</h1>
        <p className="text-[#6b7280] mt-2">
          Know a cafe, restaurant or venue with a kids play area? Add it to the map in 2 minutes — every submission is reviewed before going live.
        </p>
      </div>
      <SubmitForm />
    </div>
  )
}
