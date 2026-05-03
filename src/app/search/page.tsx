import { Suspense } from 'react'
import SearchResultsClient from './SearchResultsClient'

export const metadata = { title: 'Explore' }

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="flex-1 flex items-center justify-center text-[#6b7280]">Loading…</div>}>
      <SearchResultsClient />
    </Suspense>
  )
}
