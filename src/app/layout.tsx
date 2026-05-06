import type { Metadata } from 'next'
import { Geist } from 'next/font/google'
import './globals.css'
import { AuthProvider } from '@/components/auth/AuthProvider'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'

const geist = Geist({ subsets: ['latin'], variable: '--font-geist-sans' })

export const metadata: Metadata = {
  title: { default: 'KidFriendlyEats', template: '%s | KidFriendlyEats' },
  description: 'Find cafes and restaurants where kids can play — on-site play areas, spots next to playgrounds, and more. Reviewed by local parents.',
  keywords: ['kids play area', 'cafe with play area', 'family cafe', 'Australia', 'playground nearby', 'family restaurant'],
  openGraph: { siteName: 'KidFriendlyEats', type: 'website' },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${geist.variable} h-full`}>
      <body className="min-h-full flex flex-col antialiased bg-[#faf6f4] text-[#2c2c2c]">
        <AuthProvider>
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
        </AuthProvider>
      </body>
    </html>
  )
}
