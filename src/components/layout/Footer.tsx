import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="border-t border-border bg-paper">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <Link href="/" className="font-display italic font-700 text-[1.1rem] text-ink hover:text-rust transition-colors">
            KidFriendlyEats
          </Link>
          <nav className="flex flex-wrap items-center gap-5 text-sm text-stone">
            <Link href="/about" className="hover:text-ink transition-colors py-3 min-h-[44px] flex items-center">About</Link>
            <Link href="/search" className="hover:text-ink transition-colors py-3 min-h-[44px] flex items-center">Explore</Link>
            <Link href="/submit" className="hover:text-ink transition-colors py-3 min-h-[44px] flex items-center">Add a place</Link>
            <a href="mailto:support@kidfriendlyeats.space" className="hover:text-ink transition-colors py-3 min-h-[44px] flex items-center">Contact</a>
            <Link href="/privacy" className="hover:text-ink transition-colors py-3 min-h-[44px] flex items-center">Privacy</Link>
            <Link href="/terms" className="hover:text-ink transition-colors py-3 min-h-[44px] flex items-center">Terms</Link>
          </nav>
          <p className="text-xs text-stone">
            © {new Date().getFullYear()} KidFriendlyEats
          </p>
        </div>
      </div>
    </footer>
  )
}
