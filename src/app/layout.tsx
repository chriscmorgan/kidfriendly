import type { Metadata } from 'next'
import { Geist } from 'next/font/google'
import './globals.css'
import { AuthProvider } from '@/components/auth/AuthProvider'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'

const geist = Geist({ subsets: ['latin'], variable: '--font-geist-sans' })

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://kidfriendlyeats.space'

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: 'KidFriendlyEats', template: '%s | KidFriendlyEats' },
  description: 'Find cafes and restaurants where kids can play — on-site play areas, spots next to playgrounds, and more. Reviewed by local parents.',
  keywords: ['kids play area', 'cafe with play area', 'family cafe', 'Australia', 'playground nearby', 'family restaurant', 'indoor playground cafe', 'kid friendly restaurant'],
  openGraph: {
    siteName: 'KidFriendlyEats',
    type: 'website',
    url: SITE_URL,
    locale: 'en_AU',
  },
  twitter: { card: 'summary_large_image' },
  alternates: { canonical: SITE_URL },
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
    <html lang="en" className={`${geist.variable} h-full`}>
      <head>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }} />
      </head>
      <body className="min-h-full flex flex-col antialiased bg-[#edf6f6] text-[#2c2c2c]">
        <AuthProvider>
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
        </AuthProvider>
      </body>
    </html>
  )
}
