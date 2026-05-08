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
    emoji: '📍',
    title: 'Add a place you love',
    desc: 'Sign in free and add a spot in 2 minutes. Your submission goes live after a quick review.',
  },
  {
    emoji: '🔍',
    title: 'Search your area',
    desc: 'Find nearby cafes and spots with play areas by suburb or postcode.',
  },
  {
    emoji: '📣',
    title: 'Share with other parents',
    desc: 'Send the link to your parents group. Every share brings in more places.',
  },
]

const FAQS = [
  {
    q: 'What is KidFriendlyEats?',
    a: 'KidFriendlyEats is a free community directory built by Melbourne parents — a map of cafes, restaurants and venues with real play areas for kids. No ads, no paid listings. Just places real parents have been to and taken the time to share.',
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
    a: 'Yes — and we\'d love you to. Sign in free and use the Submit page. It takes about 2 minutes. Every submission is reviewed before going live to keep quality high.',
  },
  {
    q: 'How do I know the information is accurate?',
    a: 'Every listing is submitted by a real parent who has visited. We rely on the community to flag anything outdated — use the "Report" button on any listing if something looks wrong.',
  },
  {
    q: 'What areas of Melbourne are covered?',
    a: 'All of Greater Melbourne. Coverage grows as the community adds more places — if your area is light on listings, you can change that in 2 minutes.',
  },
  {
    q: 'Is it free to use?',
    a: 'Completely free — no ads, no subscriptions. KidFriendlyEats is a community project built by parents for parents.',
  },
  {
    q: 'Do venues pay to be listed?',
    a: 'No. Listings are added by community members who have visited. We do not accept sponsored or promotional content.',
  },
]

const TAG_DESCRIPTIONS: Record<string, string> = {
  indoor_playground: 'Indoor playground inside the venue',
  kids_play_area: 'Dedicated equipment on-site',
  adjacent_playground: 'Playground right next door',
  outdoor_run_area: 'Outdoor space to burn energy',
  play_centre: 'Dedicated play venue',
}

function EarlyBadge() {
  return (
    <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm border border-[#f0d8b0] text-[#a07030] text-xs font-semibold px-4 py-2 rounded-full">
      <span>✨</span> Just launched · Be one of the first to add a spot
    </div>
  )
}

function ContributorAvatar({ name, index }: { name: string; index: number }) {
  const colors = [
    'bg-[#f4a090] text-white',
    'bg-[#4abfc0] text-white',
    'bg-[#a8d5a2] text-[#2c5f2e]',
    'bg-[#f9d56e] text-[#7a5c00]',
    'bg-[#c5a3e8] text-[#4a1080]',
    'bg-[#f0a070] text-white',
  ]
  const initials = name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
  return (
    <div
      className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ring-2 ring-white ${colors[index % colors.length]}`}
      title={name}
    >
      {initials}
    </div>
  )
}

export default function HomeLanding({ locations }: Props) {
  const recentContributors = Array.from(
    new Map(
      locations
        .filter((l) => l.submitter)
        .map((l) => [l.submitted_by, l.submitter!.display_name])
    ).entries()
  ).slice(0, 6)

  return (
    <div className="flex flex-col overflow-x-hidden">

      {/* ── Hero ── */}
      <section className="relative overflow-hidden bg-[#fdf8f2] border-b border-[#e8ddd0] py-14 sm:py-20">

        {/* Subtle texture dots */}
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(circle, #2c2c2c 1px, transparent 1px)', backgroundSize: '24px 24px' }} aria-hidden />

        <div className="relative z-10 w-full max-w-2xl mx-auto px-4 text-center">

          {/* Early community badge */}
          <div className="mb-5">
            <EarlyBadge />
          </div>

          <h1 className="text-[clamp(1.75rem,7vw,3.75rem)] leading-tight font-extrabold text-[#2c2c2c] tracking-tight">
            The Kid-Friendly Map{' '}
            <span className="text-[#4abfc0]">Built by Melbourne Parents</span>
          </h1>

          <p className="text-[#5a6b6b] text-base sm:text-lg mt-4 max-w-xl mx-auto leading-relaxed">
            Finding genuinely good spots with the kids is harder than it should be. We kept sharing
            them in group chats and thought —{' '}
            <strong className="text-[#2c2c2c] font-semibold">there should be a proper place for this.</strong>
            {' '}So we built one. Add the places you love and help other Melbourne parents find them.
          </p>

          {/* Primary CTA — Add a place */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-8">
            <Link
              href="/submit"
              className="inline-flex items-center gap-2 bg-[#f4a090] text-white font-bold text-base px-8 py-3.5 rounded-2xl hover:bg-[#e8887a] transition-colors shadow-md min-h-[48px]"
            >
              📍 Add a place — free, 2 min
            </Link>
            <Link
              href="/search"
              className="inline-flex items-center gap-2 bg-white border border-[#d0e0e0] text-[#38a5a0] font-semibold text-base px-8 py-3.5 rounded-2xl hover:bg-[#edf8f8] transition-colors min-h-[48px]"
            >
              Search the map →
            </Link>
          </div>

          {/* Search bar */}
          <div className="w-full max-w-xl mt-5 mx-auto">
            <SearchBar size="hero" />
          </div>

          {/* Recent contributors */}
          {recentContributors.length > 0 && (
            <div className="mt-6 flex flex-col items-center gap-2">
              <div className="flex -space-x-2">
                {recentContributors.map(([id, name], i) => (
                  <ContributorAvatar key={id} name={name} index={i} />
                ))}
              </div>
              <p className="text-xs text-[#6b8080]">
                Recently added by {recentContributors.map(([, name]) => name.split(' ')[0]).slice(0, 3).join(', ')} and others
              </p>
            </div>
          )}

        </div>
      </section>

      {/* ── Community call-to-action banner ── */}
      <section className="bg-[#fff8ee] border-b border-[#f0d8b0] px-4 py-5">
        <div className="max-w-3xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <div>
            <p className="font-semibold text-[#2c2c2c] text-sm">
              Know a great spot that&apos;s not listed?
            </p>
            <p className="text-xs text-[#7a6040] mt-0.5">
              Every place you add helps the next parent have a better day out. Takes 2 minutes.
            </p>
          </div>
          <Link
            href="/submit"
            className="shrink-0 inline-flex items-center gap-1.5 bg-[#f4a090] text-white font-semibold text-sm px-5 py-2.5 rounded-xl hover:bg-[#e8887a] transition-colors min-h-[44px]"
          >
            📍 Add it now
          </Link>
        </div>
      </section>

      {/* ── How it works ── */}
      <section className="bg-white border-b border-gray-100 px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-center text-xl font-bold text-[#2c2c2c] mb-1">How the community works</h2>
          <p className="text-center text-sm text-[#6b7280] mb-8">Anyone can contribute — the more parents add, the better it gets for everyone</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {HOW_IT_WORKS.map((step, i) => (
              <div key={i} className="flex flex-col items-center text-center px-4">
                <div className="w-14 h-14 rounded-2xl bg-[#fff3ee] flex items-center justify-center text-2xl mb-3 shadow-sm">
                  {step.emoji}
                </div>
                <h3 className="font-semibold text-[#2c2c2c] mb-1">{step.title}</h3>
                <p className="text-sm text-[#6b7280] leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Recently added — community feed ── */}
      {locations.length > 0 && (
        <section className="bg-[#faf8f4] px-4 py-12 border-b border-gray-100">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-baseline justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold text-[#2c2c2c]">Recently added by the community</h2>
                <p className="text-sm text-[#6b7280] mt-0.5">Fresh spots from parents who have just been</p>
              </div>
              <Link href="/search" className="text-sm font-semibold text-[#38a5a0] hover:underline shrink-0 ml-4">
                See all →
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {locations.map((loc) => (
                <LocationCard key={loc.id} location={loc} showContributor />
              ))}
            </div>
            <div className="mt-8 text-center">
              <p className="text-sm text-[#6b7280] mb-3">
                Don&apos;t see your suburb? You can fix that.
              </p>
              <Link
                href="/submit"
                className="inline-flex items-center gap-2 bg-[#f4a090] text-white font-bold text-sm px-6 py-3 rounded-xl hover:bg-[#e8887a] transition-colors shadow-sm"
              >
                📍 Add a place — free sign-up, 2 minutes
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* ── Categories ── */}
      <section className="bg-white px-4 py-12 border-b border-gray-100">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-xl font-bold text-[#2c2c2c] mb-2">Browse by play type</h2>
          <p className="text-sm text-[#6b7280] mb-6">Filter by what kind of setup the venue has</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {TAGS.map((tag) => (
              <Link
                key={tag.value}
                href={`/search?tag=${tag.value}`}
                className={`group flex flex-col items-center text-center p-4 rounded-2xl border-2 border-transparent bg-[#faf8f4] hover:border-current transition-all shadow-sm hover:shadow-md min-h-[100px] ${tag.color}`}
              >
                <span className="text-3xl mb-2">{tag.emoji}</span>
                <span className="text-xs font-semibold leading-tight mb-1">{tag.label}</span>
                <span className="text-xs text-[#6b7280] leading-snug">{TAG_DESCRIPTIONS[tag.value]}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── Popular guides ── */}
      <section className="bg-[#faf8f4] px-4 py-12 border-b border-gray-100">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-xl font-bold text-[#2c2c2c] mb-2">Community guides</h2>
          <p className="text-sm text-[#6b7280] mb-6">Curated by parents, for parents</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Link
              href="/indoor-playground-cafes"
              className="group flex items-start gap-4 bg-white border border-[#e0e0e0] rounded-2xl p-5 hover:border-[#4abfc0] transition-colors"
            >
              <div className="w-12 h-12 shrink-0 rounded-2xl bg-[#fff3ee] flex items-center justify-center text-2xl shadow-sm">🛝</div>
              <div>
                <h3 className="font-semibold text-[#2c2c2c] text-sm group-hover:text-[#38a5a0] transition-colors">Cafes with Indoor Playgrounds</h3>
                <p className="text-xs text-[#6b7280] mt-1 leading-relaxed">A proper playground inside the venue — drink your coffee while it&apos;s hot.</p>
              </div>
            </Link>
            <Link
              href="/cafes-next-to-playgrounds"
              className="group flex items-start gap-4 bg-white border border-[#e0e0e0] rounded-2xl p-5 hover:border-[#4abfc0] transition-colors"
            >
              <div className="w-12 h-12 shrink-0 rounded-2xl bg-[#f0fdf0] flex items-center justify-center text-2xl shadow-sm">🏞️</div>
              <div>
                <h3 className="font-semibold text-[#2c2c2c] text-sm group-hover:text-[#38a5a0] transition-colors">Cafes Next to Playgrounds</h3>
                <p className="text-xs text-[#6b7280] mt-1 leading-relaxed">A playground right next door — perfect for good-weather days out.</p>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* ── Share the community ── */}
      <section className="bg-white px-4 py-12 border-b border-gray-100">
        <div className="max-w-2xl mx-auto text-center">
          <div className="w-14 h-14 rounded-2xl bg-[#fff3ee] flex items-center justify-center text-3xl mx-auto mb-4">
            📣
          </div>
          <h2 className="text-xl font-bold text-[#2c2c2c]">Know other parents who&apos;d find this useful?</h2>
          <p className="text-sm text-[#6b7280] mt-3 max-w-md mx-auto leading-relaxed">
            Share KidFriendlyEats in your parents group, your local Facebook group, or with anyone who&apos;s ever asked for a cafe recommendation. The more people share, the more places get added.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 mt-6">
            <a
              href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(SITE_URL)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-[#1877F2] text-white font-semibold text-sm px-5 py-2.5 rounded-xl hover:bg-[#1464d4] transition-colors min-h-[44px]"
            >
              Share on Facebook
            </a>
            <a
              href={`https://wa.me/?text=${encodeURIComponent('Found this — it\'s a community map of cafes and places with real play areas in Melbourne, added by parents: ' + SITE_URL)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-[#25D366] text-white font-semibold text-sm px-5 py-2.5 rounded-xl hover:bg-[#1dba57] transition-colors min-h-[44px]"
            >
              Share on WhatsApp
            </a>
          </div>
        </div>
      </section>

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
      </section>

      {/* ── Final CTA ── */}
      <section className="bg-[#2c2c2c] px-4 py-16 text-center">
        <div className="max-w-lg mx-auto">
          <p className="text-[#a0b0b0] text-xs font-semibold tracking-widest uppercase mb-3">Join the community</p>
          <h2 className="text-2xl font-bold text-white">Know a great spot? Add it.</h2>
          <p className="text-[#9ab0b0] mt-3 text-sm leading-relaxed max-w-sm mx-auto">
            Every place you add helps a family have a better day out. Sign in free — it takes 2 minutes.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-2 mt-3 text-[#6a9090] text-xs font-medium">
            <span>✓ Free forever</span>
            <span>·</span>
            <span>✓ Sign in with Google</span>
            <span>·</span>
            <span>✓ Reviewed before going live</span>
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-6">
            <Link
              href="/submit"
              className="inline-flex items-center gap-2 bg-[#f4a090] text-white font-bold text-sm px-7 py-3.5 rounded-2xl hover:bg-[#e8887a] transition-colors shadow-lg"
            >
              📍 Add a place — it&apos;s free
            </Link>
            <Link
              href="/search"
              className="inline-flex items-center gap-2 bg-white/10 border border-white/20 text-white font-semibold text-sm px-7 py-3.5 rounded-2xl hover:bg-white/20 transition-colors"
            >
              Browse the map →
            </Link>
          </div>
        </div>
      </section>

    </div>
  )
}
