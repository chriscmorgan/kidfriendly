import type { Metadata } from 'next'
import { Geist } from 'next/font/google'
import './globals.css'
import { AuthProvider } from '@/components/auth/AuthProvider'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'

const geist = Geist({ subsets: ['latin'], variable: '--font-geist-sans' })

export const metadata: Metadata = {
  title: { default: 'KidFriendlyEats', template: '%s | KidFriendlyEats' },
  description: 'Discover the best kid-friendly spots near you — parks, cafes, play centres, and more.',
  keywords: ['kids', 'family', 'Australia', 'playground', 'cafes', 'family-friendly'],
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
