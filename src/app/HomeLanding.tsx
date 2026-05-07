import Link from 'next/link'
import SearchBar from '@/components/search/SearchBar'
import LocationCard from '@/components/location/LocationCard'
import { TAGS } from '@/lib/constants'
import type { Location } from '@/lib/types'
import { safeJsonLd } from '@/lib/utils'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://kidfriendlyeats.space'

interface Props {
  locations: Location[]
}

const HOW_IT_WORKS = [
  {
    emoji: '🔍',
    title: 'Search your area',
    desc: 'Search your suburb or postcode to find nearby cafes and spots with play areas.',
  },
  {
    emoji: '📍',
    title: 'Discover great spots',
    desc: 'Browse venues with on-site play areas or right next to a playground.',
  },
  {
    emoji: '📸',
    title: 'Add a missing place',
    desc: 'Know a spot that\'s not listed? Add it in two minutes and help other families find it.',
  },
]

const CITY_LINKS = [
  { city: 'Melbourne', href: '/melbourne', emoji: '☕' },
]

const FAQS = [
  {
    q: 'What is KidFriendlyEats?',
    a: 'KidFriendlyEats is a free community directory of cafes, restaurants and venues in Melbourne that have dedicated play areas for kids — like indoor playgrounds, on-site equipment, or spots right next to a public playground.',
  },
  {
    q: 'How do I find kid-friendly venues near me?',
    a: 'Use the search bar to enter your suburb or postcode. The map will show nearby venues with play areas, which you can filter by type (indoor playground, outdoor run area, adjacent playground, etc.).',
  },
  {
    q: 'What types of play areas are listed?',
    a: 'We list five types: indoor playgrounds (built inside the venue), on-site kids play areas (equipment in the venue grounds), venues adjacent to a public playground, outdoor run areas, and dedicated play centres. Each venue is tagged so you can filter for exactly what you\'re after.',
  },
  {
    q: 'Can I add a place that\'s not listed?',
    a: 'Absolutely. Sign in for free and use the Submit page to add a venue. Every submission is reviewed before going live to keep quality high.',
  },
  {
    q: 'How do I know the information is accurate?',
    a: 'Every listing is submitted and reviewed by real parents who have visited. We rely on the community to flag anything that\'s outdated — use the "Report" button on any listing if something looks wrong.',
  },
  {
    q: 'What areas of Melbourne are covered?',
    a: 'All of Greater Melbourne — inner suburbs, outer suburbs, and the Peninsula. Coverage grows as the community adds more places, so if your area is light on listings, add a place you know.',
  },
  {
    q: 'Is it free to use?',
    a: 'Completely free — no ads, no subscriptions. KidFriendlyEats is a community project built by parents for parents.',
  },
  {
    q: 'Do venues pay to be listed?',
    a: 'No. Listings are not paid placements — they are added by community members who have visited. We do not accept sponsored or promotional content.',
  },
]

const TAG_DESCRIPTIONS: Record<string, string> = {
  indoor_playground: 'Indoor playground inside the venue',
  kids_play_area: 'Dedicated equipment on-site',
  adjacent_playground: 'Playground right next door',
  outdoor_run_area: 'Outdoor space to burn energy',
  play_centre: 'Dedicated play venue',
}

export default function HomeLanding({ locations }: Props) {
  return (
    <div className="flex flex-col overflow-x-hidden">

      {/* ── Hero ── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#b8e4e4] via-[#cceece] to-[#e8f5f0] min-h-[56vh] flex flex-col justify-center text-center py-16 sm:py-24">

        {/* Decorative floating emojis */}
        <span className="absolute top-8 left-[8%] text-4xl opacity-15 rotate-[-15deg] select-none" aria-hidden>🛝</span>
        <span className="absolute top-16 right-[10%] text-5xl opacity-10 rotate-[12deg] select-none" aria-hidden>☕</span>
        <span className="absolute bottom-12 left-[15%] text-3xl opacity-15 rotate-[8deg] select-none" aria-hidden>🍰</span>
        <span className="absolute bottom-8 right-[12%] text-4xl opacity-15 rotate-[-10deg] select-none" aria-hidden>🧒</span>
        <span className="absolute top-1/2 left-[3%] text-2xl opacity-10 select-none" aria-hidden>🍴</span>

        <div className="relative z-10 w-full max-w-2xl mx-auto px-4">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm border border-[#5ecece]/30 text-[#38a5a0] text-xs font-semibold px-3 py-1.5 rounded-full mb-5">
            <span>👶</span> Made by parents, for parents
          </div>

          <h1 className="text-[clamp(1.6rem,7vw,4rem)] leading-tight font-extrabold text-[#2c2c2c] tracking-tight">
            Find Venues Where You Can Eat{' '}
            <span className="text-[#e8756a]">and the Kids Can Actually Play</span>
          </h1>
          <p className="text-[#4a7a7a] text-base sm:text-xl mt-5 max-w-xl mx-auto leading-relaxed">
            Cafes, restaurants and play centres in Melbourne with real play areas — discovered and shared by local parents.
          </p>

          <div className="w-full max-w-xl mt-8 mx-auto">
            <SearchBar size="hero" />
          </div>

          {/* City quick links — min 44px tap targets */}
          <div className="flex flex-wrap items-center justify-center gap-2 mt-6">
            {CITY_LINKS.map(({ city, href, emoji }) => (
              <Link
                key={city}
                href={href}
                className="inline-flex items-center gap-1.5 bg-white/70 backdrop-blur-sm border border-[#5ecece]/30 text-[#38a5a0] text-sm font-semibold px-4 py-3 rounded-full hover:bg-white transition-colors min-h-[44px]"
              >
                <span>{emoji}</span> {city}
              </Link>
            ))}
          </div>

        </div>
      </section>

      {/* ── How it works ── */}
      <section className="bg-white border-b border-gray-100 px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-center text-xl font-bold text-[#2c2c2c] mb-8">How it works</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {HOW_IT_WORKS.map((step, i) => (
              <div key={i} className="flex flex-col items-center text-center px-4">
                <div className="w-14 h-14 rounded-2xl bg-[#edf8f8] flex items-center justify-center text-2xl mb-3 shadow-sm">
                  {step.emoji}
                </div>
                <h3 className="font-semibold text-[#2c2c2c] mb-1">{step.title}</h3>
                <p className="text-sm text-[#6b7280] leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Categories ── */}
      <section className="bg-[#faf8f4] px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-xl font-bold text-[#2c2c2c] mb-2">Browse by type</h2>
          <p className="text-sm text-[#6b7280] mb-6">Filter by what kind of play setup the venue has</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {TAGS.map((tag) => (
              <Link
                key={tag.value}
                href={`/search?tag=${tag.value}`}
                className={`group flex flex-col items-center text-center p-4 rounded-2xl border-2 border-transparent bg-white hover:border-current transition-all shadow-sm hover:shadow-md min-h-[100px] ${tag.color}`}
              >
                <span className="text-3xl mb-2">{tag.emoji}</span>
                <span className="text-xs font-semibold leading-tight mb-1">{tag.label}</span>
                <span className="text-xs text-[#6b7280] leading-snug">{TAG_DESCRIPTIONS[tag.value]}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── Feature guides ── */}
      <section className="bg-white px-4 py-12 border-b border-gray-100">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-xl font-bold text-[#2c2c2c] mb-2">Popular guides</h2>
          <p className="text-sm text-[#6b7280] mb-6">Curated lists by play type</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Link
              href="/indoor-playground-cafes"
              className="group flex items-start gap-4 bg-[#edf8f8] border border-[#aadbd8] rounded-2xl p-5 hover:border-[#4abfc0] transition-colors"
            >
              <div className="w-12 h-12 shrink-0 rounded-2xl bg-white flex items-center justify-center text-2xl shadow-sm">🛝</div>
              <div>
                <h3 className="font-semibold text-[#2c2c2c] text-sm group-hover:text-[#38a5a0] transition-colors">Cafes with Indoor Playgrounds</h3>
                <p className="text-xs text-[#6b7280] mt-1 leading-relaxed">A proper playground inside the venue — drink your coffee while it&apos;s hot.</p>
              </div>
            </Link>
            <Link
              href="/cafes-next-to-playgrounds"
              className="group flex items-start gap-4 bg-[#f0fdf0] border border-[#a8dba8] rounded-2xl p-5 hover:border-[#4abfc0] transition-colors"
            >
              <div className="w-12 h-12 shrink-0 rounded-2xl bg-white flex items-center justify-center text-2xl shadow-sm">🏞️</div>
              <div>
                <h3 className="font-semibold text-[#2c2c2c] text-sm group-hover:text-[#38a5a0] transition-colors">Cafes Next to Playgrounds</h3>
                <p className="text-xs text-[#6b7280] mt-1 leading-relaxed">A playground right next door — perfect for good-weather days out.</p>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* ── Recently added ── */}
      {locations.length > 0 && (
        <section className="bg-white px-4 py-12">
          <div className="max-w-4xl mx-auto">
            <div className="mb-6">
              <h2 className="text-xl font-bold text-[#2c2c2c]">Recently added</h2>
              <p className="text-sm text-[#6b7280] mt-0.5">Fresh spots added by the community</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {locations.map((loc) => (
                <LocationCard key={loc.id} location={loc} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── FAQ ── */}
      <section className="bg-[#faf8f4] px-4 py-12 border-t border-gray-100">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-xl font-bold text-[#2c2c2c] mb-2">Frequently asked questions</h2>
          <p className="text-sm text-[#6b7280] mb-8">Everything parents want to know</p>
          <div className="space-y-4">
            {FAQS.map((faq, i) => (
              <div key={i} className="bg-white rounded-2xl border border-gray-100 shadow-sm px-6 py-5">
                <h3 className="font-semibold text-[#2c2c2c] text-sm mb-2">{faq.q}</h3>
                <p className="text-sm text-[#4b5563] leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: safeJsonLd({
              '@context': 'https://schema.org',
              '@type': 'FAQPage',
              mainEntity: FAQS.map((faq) => ({
                '@type': 'Question',
                name: faq.q,
                acceptedAnswer: { '@type': 'Answer', text: faq.a },
              })),
            }),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: safeJsonLd({
              '@context': 'https://schema.org',
              '@type': 'WebSite',
              '@id': `${SITE_URL}/#website`,
              url: SITE_URL,
              name: 'KidFriendlyEats',
              description: 'Community directory of kid-friendly cafes and venues with play areas in Melbourne',
              potentialAction: {
                '@type': 'SearchAction',
                target: {
                  '@type': 'EntryPoint',
                  urlTemplate: `${SITE_URL}/search?q={search_term_string}`,
                },
                'query-input': 'required name=search_term_string',
              },
            }),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: safeJsonLd({
              '@context': 'https://schema.org',
              '@type': 'Organization',
              '@id': `${SITE_URL}/#organization`,
              name: 'KidFriendlyEats',
              url: SITE_URL,
              contactPoint: {
                '@type': 'ContactPoint',
                email: 'support@kidfriendlyeats.space',
                contactType: 'customer support',
              },
            }),
          }}
        />
      </section>

      {/* ── Add a place CTA ── */}
      <section className="bg-gradient-to-br from-[#3aaeae] to-[#2a9494] px-4 py-16 text-center">
        <div className="max-w-lg mx-auto">
          <div className="w-16 h-16 bg-white/30 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-4">
            📍
          </div>
          <h2 className="text-2xl font-bold text-white">Know a great spot?</h2>
          <p className="text-white/80 mt-3 text-sm leading-relaxed max-w-sm mx-auto">
            Help other families discover it. Takes 2 minutes to add a place to the map.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-6">
            <Link
              href="/submit"
              className="inline-flex items-center gap-2 bg-white text-[#38a5a0] font-bold text-sm px-7 py-3.5 rounded-2xl hover:bg-[#f0fbfb] transition-colors shadow-lg"
            >
              <span>📍</span> Add a place
            </Link>
            <Link
              href="/search"
              className="inline-flex items-center gap-2 bg-white/20 border border-white/40 text-white font-semibold text-sm px-7 py-3.5 rounded-2xl hover:bg-white/30 transition-colors"
            >
              Explore the map →
            </Link>
          </div>
        </div>
      </section>

    </div>
  )
}
