export const dynamic = 'force-dynamic'

import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center">
      <div className="text-6xl mb-4">🗺️</div>
      <h1 className="text-3xl font-bold text-[#2c2c2c] mb-2">Page not found</h1>
      <p className="text-[#6b7280] mb-8 max-w-sm">
        We couldn&apos;t find what you were looking for.
      </p>
      <Link
        href="/"
        className="bg-[#7da87b] text-white px-6 py-3 rounded-xl font-medium hover:bg-[#5e8e5c] transition-colors"
      >
        Back to map
      </Link>
    </div>
  )
}
