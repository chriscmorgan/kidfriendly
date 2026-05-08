export const dynamic = 'force-dynamic'

import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center">
      <div className="text-6xl mb-4">🗺️</div>
      <h1 className="font-display italic font-700 text-3xl text-ink mb-2">Page not found</h1>
      <p className="text-stone mb-8 max-w-sm">
        We couldn&apos;t find what you were looking for.
      </p>
      <Link
        href="/"
        className="bg-rust text-paper px-6 py-3 rounded font-medium hover:bg-rust-dark transition-colors"
      >
        Back to map
      </Link>
    </div>
  )
}
