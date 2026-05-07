import type { Metadata } from 'next'
import { Suspense } from 'react'
import SearchResultsClient from './SearchResultsClient'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://kidfriendlyeats.space'

export const metadata: Metadata = {
  title: 'Find Kid-Friendly Cafes Near You',
  description: 'Search and browse cafes, restaurants and play venues with kids areas near you across Australia — filter by suburb, distance, and play area type.',
  alternates: { canonical: `${SITE_URL}/search` },
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="flex-1 flex items-center justify-center text-[#6b7280]">Loading…</div>}>
      <SearchResultsClient />
    </Suspense>
  )
}
