'use client'
import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/components/auth/AuthProvider'
import SignInModal from '@/components/auth/SignInModal'
import { cn } from '@/lib/utils'
import { Menu, X, User, LogOut } from 'lucide-react'

export default function Header() {
  const pathname = usePathname()
  const { user, profile, signOut, loading } = useAuth()
  const [showSignIn, setShowSignIn] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)

  const navLinks = [
    { href: '/search', label: 'Explore' },
    { href: '/about', label: 'About' },
  ]

  return (
    <>
      <header className="sticky top-0 z-40 bg-paper border-b border-border">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-14">

            {/* Logo — Fraunces wordmark */}
            <Link href="/" className="group min-h-[44px] flex items-center">
              <span className="font-display italic font-700 text-[1.25rem] text-ink tracking-[-0.01em] leading-none group-hover:text-rust transition-colors">
                KidFriendlyEats
              </span>
            </Link>

            {/* Desktop nav */}
            <nav className="hidden md:flex items-center gap-6">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    'text-sm transition-colors',
                    pathname.startsWith(link.href)
                      ? 'text-ink font-medium'
                      : 'text-stone hover:text-ink'
                  )}
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            {/* Actions */}
            <div className="flex items-center gap-3">
              {!loading && (
                <>
                  {user ? (
                    <>
                      <Link
                        href="/submit"
                        className="hidden sm:inline-flex items-center gap-1.5 bg-rust text-paper text-sm font-medium px-4 py-2 rounded hover:bg-rust-dark transition-colors min-h-[36px]"
                      >
                        + Add a place
                      </Link>
                      <div className="relative">
                        <button
                          onClick={() => setUserMenuOpen(!userMenuOpen)}
                          className="flex items-center p-1.5 rounded hover:bg-sand-100 transition-colors cursor-pointer min-h-[44px]"
                        >
                          {profile?.avatar_url ? (
                            <img src={profile.avatar_url} alt="" className="w-7 h-7 rounded-full object-cover" />
                          ) : (
                            <div className="w-7 h-7 rounded-full bg-border flex items-center justify-center">
                              <User className="w-3.5 h-3.5 text-stone" />
                            </div>
                          )}
                        </button>
                        {userMenuOpen && (
                          <>
                            <div className="fixed inset-0 z-30" onClick={() => setUserMenuOpen(false)} />
                            <div className="absolute right-0 top-full mt-1 z-40 bg-paper border border-border rounded shadow-sm py-1 w-44">
                              <div className="px-3 py-2 border-b border-border">
                                <p className="text-xs font-medium text-ink truncate">{profile?.display_name}</p>
                              </div>
                              <Link
                                href="/profile"
                                className="flex items-center gap-2 px-3 py-2 text-sm text-ink hover:bg-parchment transition-colors"
                                onClick={() => setUserMenuOpen(false)}
                              >
                                <User className="w-3.5 h-3.5" />
                                My profile
                              </Link>
                              {profile?.role === 'admin' && (
                                <Link
                                  href="/admin"
                                  className="flex items-center gap-2 px-3 py-2 text-sm text-ink hover:bg-parchment transition-colors"
                                  onClick={() => setUserMenuOpen(false)}
                                >
                                  Admin
                                </Link>
                              )}
                              <button
                                onClick={() => { signOut(); setUserMenuOpen(false) }}
                                className="flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 w-full text-left transition-colors cursor-pointer"
                              >
                                <LogOut className="w-3.5 h-3.5" />
                                Sign out
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    </>
                  ) : (
                    <button
                      onClick={() => setShowSignIn(true)}
                      className="inline-flex items-center gap-1.5 bg-rust text-paper text-sm font-medium px-4 py-2 rounded hover:bg-rust-dark transition-colors min-h-[36px] cursor-pointer"
                    >
                      + Add a place
                    </button>
                  )}
                </>
              )}

              {/* Mobile menu toggle */}
              <button
                className="md:hidden p-2 rounded hover:bg-parchment transition-colors cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center"
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
          <div className="md:hidden border-t border-border bg-paper px-4 py-3 flex flex-col gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="px-2 py-3 text-base text-ink hover:text-rust min-h-[44px] flex items-center"
                onClick={() => setMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/submit"
              className="px-2 py-3 text-base font-medium text-rust min-h-[44px] flex items-center"
              onClick={() => setMenuOpen(false)}
            >
              + Add a place
            </Link>
            {!user && (
              <button
                onClick={() => { setMenuOpen(false); setShowSignIn(true) }}
                className="px-2 py-3 text-base text-ink hover:text-rust min-h-[44px] flex items-center text-left cursor-pointer"
              >
                Sign in
              </button>
            )}
          </div>
        )}
      </header>

      {showSignIn && <SignInModal onClose={() => setShowSignIn(false)} />}
    </>
  )
}
