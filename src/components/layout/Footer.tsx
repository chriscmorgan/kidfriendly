import Link from 'next/link'
import { MapPin } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="mt-auto border-t border-gray-100 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-2 text-sm font-semibold text-charcoal">
            <MapPin className="w-4 h-4 text-sage-500" />
            KidFriendlyEats
          </Link>
          <nav className="flex items-center gap-4 text-sm text-muted">
            <Link href="/about" className="hover:text-charcoal transition-colors">About</Link>
            <Link href="/search" className="hover:text-charcoal transition-colors">Explore</Link>
            <Link href="/submit" className="hover:text-charcoal transition-colors">Add a place</Link>
          </nav>
          <p className="text-xs text-muted">
            © {new Date().getFullYear()} KidFriendlyEats — Australia
          </p>
        </div>
      </div>
    </footer>
  )
}
