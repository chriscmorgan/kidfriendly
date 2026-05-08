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
    { href: '/search', label: 'Explore' },
    { href: '/about', label: 'About' },
  ]

  return (
    <>
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo — min 44px touch target */}
            <Link href="/" className="flex items-center gap-2.5 group min-h-[44px]">
              <div className="w-10 h-10 bg-[#f4a090] rounded-full flex items-center justify-center shrink-0 shadow-sm group-hover:bg-[#f0907e] transition-colors">
                <span className="text-white text-base leading-none" aria-hidden>🍴</span>
              </div>
              <div className="flex flex-col leading-none">
                <span className="font-black text-[14px] tracking-[0.12em] uppercase text-[#2c2c2c]">Kid Friendly</span>
                <span className="font-semibold text-[11px] tracking-[0.25em] uppercase text-[#4abfc0] mt-0.5">Eats</span>
              </div>
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
                      <Link
                        href="/submit"
                        className="hidden sm:flex items-center gap-1.5 bg-[#f4a090] text-white font-semibold text-sm px-4 py-2 rounded-xl hover:bg-[#e8887a] transition-colors min-h-[36px]"
                      >
                        <PlusCircle className="w-4 h-4" />
                        Add a place
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
                    <button
                      onClick={() => setShowSignIn(true)}
                      className="inline-flex items-center gap-1.5 bg-[#f4a090] text-white font-semibold text-sm px-4 py-2 rounded-xl hover:bg-[#e8887a] transition-colors min-h-[36px] cursor-pointer"
                    >
                      <PlusCircle className="w-4 h-4" />
                      Add a place
                    </button>
                  )}
                </>
              )}

              {/* Mobile menu toggle — 44px tap target */}
              <button
                className="md:hidden p-3 rounded-lg hover:bg-sand-100 transition-colors cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center"
                onClick={() => setMenuOpen(!menuOpen)}
                aria-label="Toggle menu"
              >
                {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile nav — 44px tap targets */}
        {menuOpen && (
          <div className="md:hidden border-t border-gray-100 bg-white px-4 py-2 flex flex-col">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="px-3 py-3.5 rounded-lg text-base font-medium text-charcoal hover:bg-sand-50 min-h-[44px] flex items-center"
                onClick={() => setMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/submit"
              className="px-3 py-3.5 rounded-lg text-base font-medium text-[#38a5a0] hover:bg-[#edf8f8] min-h-[44px] flex items-center gap-2"
              onClick={() => setMenuOpen(false)}
            >
              <span>📍</span> Add a place
            </Link>
            {!user && (
              <button
                onClick={() => { setMenuOpen(false); setShowSignIn(true) }}
                className="px-3 py-3.5 rounded-lg text-base font-medium text-[#2c2c2c] hover:bg-sand-50 min-h-[44px] flex items-center text-left cursor-pointer"
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
