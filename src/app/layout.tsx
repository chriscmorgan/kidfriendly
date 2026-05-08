import type { Metadata } from 'next'
import { Geist, Fraunces } from 'next/font/google'
import { Suspense } from 'react'
import './globals.css'
import { AuthProvider } from '@/components/auth/AuthProvider'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import AuthGate from '@/components/auth/AuthGate'
import { safeJsonLd } from '@/lib/utils'

const geist = Geist({ subsets: ['latin'], variable: '--font-geist-sans' })
const fraunces = Fraunces({ subsets: ['latin'], variable: '--font-fraunces', style: ['italic', 'normal'], weight: ['400', '600', '700', '900'] })

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://kidfriendlyeats.space'

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'Kid-Friendly Cafes with Play Areas in Australia | KidFriendlyEats',
    template: '%s | KidFriendlyEats',
  },
  description: 'Find cafes, restaurants and venues with kids play areas across Australia — reviewed by local parents. Discover indoor playgrounds, spots next to parks, and family-friendly cafes in Melbourne, Sydney, Brisbane and beyond.',
  keywords: ['kids play area', 'cafe with play area', 'family cafe Australia', 'indoor playground cafe', 'kid friendly cafe Melbourne', 'kid friendly cafe Sydney', 'cafes next to playgrounds', 'family restaurant Australia'],
  openGraph: {
    siteName: 'KidFriendlyEats',
    type: 'website',
    url: SITE_URL,
    locale: 'en_AU',
    title: 'Kid-Friendly Cafes with Play Areas in Australia | KidFriendlyEats',
    description: 'Find cafes, restaurants and venues with kids play areas across Australia — reviewed by local parents. Discover indoor playgrounds, spots next to parks, and family-friendly cafes in Melbourne, Sydney, Brisbane and beyond.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Kid-Friendly Cafes with Play Areas in Australia | KidFriendlyEats',
    description: 'Find cafes, restaurants and venues with kids play areas across Australia — reviewed by local parents.',
  },
}

const organizationSchema = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  '@id': `${SITE_URL}/#organization`,
  name: 'KidFriendlyEats',
  url: SITE_URL,
  description: 'Australian community directory of cafes and venues with play areas for kids — reviewed by local parents.',
  areaServed: { '@type': 'Country', name: 'Australia' },
}

const websiteSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  '@id': `${SITE_URL}/#website`,
  url: SITE_URL,
  name: 'KidFriendlyEats',
  description: 'Find cafes and restaurants where kids can play',
  publisher: { '@id': `${SITE_URL}/#organization` },
  potentialAction: {
    '@type': 'SearchAction',
    target: { '@type': 'EntryPoint', urlTemplate: `${SITE_URL}/search?q={search_term_string}` },
    'query-input': 'required name=search_term_string',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-AU" className={`${geist.variable} ${fraunces.variable} h-full`}>
      <head>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(organizationSchema) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(websiteSchema) }} />
      </head>
      <body className="min-h-full flex flex-col antialiased bg-parchment text-ink">
        <AuthProvider>
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
          <Suspense>
            <AuthGate />
          </Suspense>
        </AuthProvider>
      </body>
    </html>
  )
}
