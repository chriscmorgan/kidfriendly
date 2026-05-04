'use client'
import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/components/auth/AuthProvider'
import SignInModal from '@/components/auth/SignInModal'
import Button from '@/components/ui/Button'
import { cn } from '@/lib/utils'
import { PlusCircle, User, LogOut, Menu, X } from 'lucide-react'

export default function Header() {
  const pathname = usePathname()
  const { user, profile, signOut, loading } = useAuth()
  const [showSignIn, setShowSignIn] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)

  const navLinks = [
    { href: '/about', label: 'About' },
  ]

  return (
    <>
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="w-8 h-8 bg-[#7da87b] rounded-xl flex items-center justify-center shrink-0 shadow-sm group-hover:bg-[#5e8e5c] transition-colors">
                <span className="text-white text-base leading-none" aria-hidden>📍</span>
              </div>
              <span className="font-bold text-[17px] text-[#2c2c2c] tracking-tight">KidFriendly</span>
            </Link>

            {/* Desktop nav */}
            <nav className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    'px-3 py-1.5 rounded-lg text-sm font-medium transition-colors',
                    pathname.startsWith(link.href)
                      ? 'text-sage-700 bg-sage-50'
                      : 'text-muted hover:text-charcoal hover:bg-sand-50'
                  )}
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            {/* Actions */}
            <div className="flex items-center gap-2">
              {!loading && (
                <>
                  {user ? (
                    <>
                      <Link href="/submit">
                        <Button size="sm" className="hidden sm:flex">
                          <PlusCircle className="w-4 h-4" />
                          Add a place
                        </Button>
                      </Link>
                      <div className="relative">
                        <button
                          onClick={() => setUserMenuOpen(!userMenuOpen)}
                          className="flex items-center gap-2 p-1.5 rounded-full hover:bg-sand-100 transition-colors cursor-pointer"
                        >
                          {profile?.avatar_url ? (
                            <img src={profile.avatar_url} alt="" className="w-8 h-8 rounded-full object-cover" />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-sage-100 flex items-center justify-center">
                              <User className="w-4 h-4 text-sage-600" />
                            </div>
                          )}
                        </button>
                        {userMenuOpen && (
                          <>
                            <div className="fixed inset-0 z-30" onClick={() => setUserMenuOpen(false)} />
                            <div className="absolute right-0 top-full mt-2 z-40 bg-white border border-gray-100 rounded-xl shadow-lg py-1 w-48">
                              <div className="px-3 py-2 border-b border-gray-100">
                                <p className="text-sm font-medium text-charcoal truncate">{profile?.display_name}</p>
                              </div>
                              <Link
                                href="/profile"
                                className="flex items-center gap-2 px-3 py-2 text-sm text-charcoal hover:bg-sand-50 transition-colors"
                                onClick={() => setUserMenuOpen(false)}
                              >
                                <User className="w-4 h-4" />
                                My profile
                              </Link>
                              {profile?.role === 'admin' && (
                                <Link
                                  href="/admin"
                                  className="flex items-center gap-2 px-3 py-2 text-sm text-charcoal hover:bg-sand-50 transition-colors"
                                  onClick={() => setUserMenuOpen(false)}
                                >
                                  🛡️ Admin
                                </Link>
                              )}
                              <button
                                onClick={() => { signOut(); setUserMenuOpen(false) }}
                                className="flex items-center gap-2 px-3 py-2 text-sm text-red-500 hover:bg-red-50 w-full text-left transition-colors cursor-pointer"
                              >
                                <LogOut className="w-4 h-4" />
                                Sign out
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    </>
                  ) : (
                    <Button size="sm" onClick={() => setShowSignIn(true)}>
                      Sign in
                    </Button>
                  )}
                </>
              )}

              {/* Mobile menu toggle */}
              <button
                className="md:hidden p-2 rounded-lg hover:bg-sand-100 transition-colors cursor-pointer"
                onClick={() => setMenuOpen(!menuOpen)}
                aria-label="Toggle menu"
              >
                {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile nav */}
        {menuOpen && (
          <div className="md:hidden border-t border-gray-100 bg-white px-4 py-3 flex flex-col gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="px-3 py-2 rounded-lg text-sm font-medium text-charcoal hover:bg-sand-50"
                onClick={() => setMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            {user && (
              <Link
                href="/submit"
                className="px-3 py-2 rounded-lg text-sm font-medium text-sage-700 hover:bg-sage-50"
                onClick={() => setMenuOpen(false)}
              >
                + Add a place
              </Link>
            )}
          </div>
        )}
      </header>

      {showSignIn && <SignInModal onClose={() => setShowSignIn(false)} />}
    </>
  )
}
