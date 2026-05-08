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

const STEPS = [
  {
    n: '1',
    title: 'Add a spot you know',
    desc: 'Sign in with Google and add a place in about 2 minutes. It goes live after a quick check.',
  },
  {
    n: '2',
    title: 'Search your suburb',
    desc: 'Enter a suburb or postcode to find what\'s nearby. Filter by type of play area.',
  },
  {
    n: '3',
    title: 'Send it to your group',
    desc: 'Drop the link in your parents WhatsApp or Facebook group. More people = more spots added.',
  },
]

const FAQS = [
  {
    q: 'What is this?',
    a: 'A map of cafes, restaurants and venues in Melbourne where the kids can actually play — not just sit nicely. Places are added by parents who\'ve been there. It\'s free to use and free to add to.',
  },
  {
    q: 'How do I find somewhere near me?',
    a: 'Type your suburb or postcode into the search bar. You can also filter by type — indoor playgrounds, spots next to a public playground, outdoor run areas, and so on.',
  },
  {
    q: 'What counts as a "play area"?',
    a: 'We cover five types: indoor playgrounds built inside the venue, on-site kids\' equipment, venues right next to a public playground, outdoor run areas, and dedicated play centres. Each place is tagged so you can filter.',
  },
  {
    q: 'Can I add a place?',
    a: 'Yes — that\'s the whole point. Sign in with Google and use the Add page. Takes about 2 minutes. We check each submission before it goes live.',
  },
  {
    q: 'How do I know the info is right?',
    a: 'Places are added by parents who\'ve visited. If something looks outdated — hours changed, play area removed — hit the Report button and we\'ll sort it.',
  },
  {
    q: 'What parts of Melbourne are on here?',
    a: 'All of Greater Melbourne, but honestly some suburbs have more coverage than others right now. If your area is thin, adding a place or two would make a real difference.',
  },
  {
    q: 'Is it free?',
    a: 'Yes. Browsing, searching, adding places, leaving reviews — all free.',
  },
  {
    q: 'Do venues pay to be listed?',
    a: 'No. Every listing was added by a parent, not the venue. We don\'t take money for listings.',
  },
]

const TAG_DESCRIPTIONS: Record<string, string> = {
  indoor_playground: 'Playground built inside the venue',
  kids_play_area: 'Dedicated equipment on-site',
  adjacent_playground: 'Playground right next door',
  outdoor_run_area: 'Space to run around outside',
  play_centre: 'Dedicated play venue',
}

function ContributorInitial({ name, seed }: { name: string; seed: string }) {
  const palettes = [
    'bg-[#f4d4c8] text-[#7a2a14]',
    'bg-[#c8e4d4] text-[#1a4a2e]',
    'bg-[#d4d0c8] text-[#3a3428]',
    'bg-[#f0e4c8] text-[#6a4a10]',
    'bg-[#c8d4e4] text-[#1a2e4a]',
  ]
  let hash = 0
  for (let i = 0; i < seed.length; i++) hash = (hash * 31 + seed.charCodeAt(i)) | 0
  const initials = name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
  return (
    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-semibold shrink-0 ring-2 ring-paper ${palettes[Math.abs(hash) % palettes.length]}`}>
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
  ).slice(0, 5)

  return (
    <div className="flex flex-col">

      {/* ── Hero ── */}
      <section className="bg-parchment px-4 pt-14 pb-12 sm:pt-20 sm:pb-16">
        <div className="max-w-2xl mx-auto">

          <p className="text-xs font-medium text-stone tracking-wide uppercase mb-6">
            Melbourne · new, still adding places
          </p>

          <h1 className="font-display italic font-700 text-[clamp(2.4rem,8vw,4.5rem)] leading-[1.05] text-ink">
            Melbourne cafes and places where the kids can actually play
          </h1>

          <p className="text-stone text-base sm:text-lg mt-5 max-w-lg leading-relaxed">
            Good places to go with kids are hard to find. They&apos;re not well-covered on Google Maps
            and the lists floating around are mostly out of date. This is our attempt at keeping
            a better one. If you know a spot, add it.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 mt-8">
            <Link
              href="/submit"
              className="inline-flex items-center justify-center gap-2 bg-rust text-paper text-sm font-medium px-6 py-3 rounded hover:bg-rust-dark transition-colors min-h-[48px]"
            >
              + Add a place
            </Link>
            <Link
              href="/search"
              className="inline-flex items-center justify-center gap-2 bg-paper border border-border text-ink text-sm font-medium px-6 py-3 rounded hover:bg-parchment transition-colors min-h-[48px]"
            >
              Search the map
            </Link>
          </div>

          <div className="mt-8 max-w-xl">
            <SearchBar size="hero" />
          </div>

          {recentContributors.length > 0 && (
            <div className="mt-6 flex items-center gap-3">
              <div className="flex -space-x-1.5">
                {recentContributors.map(([id, name]) => (
                  <ContributorInitial key={id} name={name} seed={id} />
                ))}
              </div>
              <p className="text-xs text-stone">
                Added by {recentContributors.map(([, n]) => n.split(' ')[0]).slice(0, 3).join(', ')} and others
              </p>
            </div>
          )}
        </div>
      </section>

      <div className="border-t border-border" />

      {/* ── Miss a spot banner ── */}
      <section className="bg-rust-light px-4 py-4">
        <div className="max-w-2xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <p className="text-sm text-ink">
            Know a spot we&apos;ve missed? Add it — takes about 2 minutes.
          </p>
          <Link
            href="/submit"
            className="shrink-0 text-sm font-medium text-rust hover:text-rust-dark underline underline-offset-2 min-h-[44px] flex items-center"
          >
            Add it now →
          </Link>
        </div>
      </section>

      <div className="border-t border-border" />

      {/* ── How it works ── */}
      <section className="bg-paper px-4 py-12">
        <div className="max-w-2xl mx-auto">
          <h2 className="font-display italic font-700 text-2xl text-ink mb-8">How it works</h2>
          <div className="space-y-8">
            {STEPS.map((step) => (
              <div key={step.n} className="flex gap-5">
                <span className="font-display italic text-3xl text-border select-none shrink-0 leading-tight">{step.n}</span>
                <div>
                  <h3 className="text-sm font-semibold text-ink mb-1">{step.title}</h3>
                  <p className="text-sm text-stone leading-relaxed">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="border-t border-border" />

      {/* ── Recently added ── */}
      {locations.length > 0 && (
        <section className="bg-parchment px-4 py-12">
          <div className="max-w-5xl mx-auto">
            <div className="flex items-baseline justify-between mb-6 max-w-5xl">
              <h2 className="font-display italic font-700 text-2xl text-ink">Recently added</h2>
              <Link href="/search" className="text-xs text-stone hover:text-ink underline underline-offset-2">
                See all
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {locations.map((loc) => (
                <LocationCard key={loc.id} location={loc} showContributor />
              ))}
            </div>
            <p className="text-sm text-stone mt-8">
              Don&apos;t see your suburb?{' '}
              <Link href="/submit" className="text-rust hover:text-rust-dark underline underline-offset-2">
                Add a place — it takes about 2 minutes.
              </Link>
            </p>
          </div>
        </section>
      )}

      <div className="border-t border-border" />

      {/* ── Browse by type ── */}
      <section className="bg-paper px-4 py-12">
        <div className="max-w-5xl mx-auto">
          <h2 className="font-display italic font-700 text-2xl text-ink mb-1">Browse by type</h2>
          <p className="text-sm text-stone mb-6">Filter by what kind of play setup the venue has</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
            {TAGS.map((tag) => (
              <Link
                key={tag.value}
                href={`/search?tag=${tag.value}`}
                className="flex flex-col p-4 rounded border border-border bg-parchment hover:border-ink hover:bg-paper transition-colors"
              >
                <span className="text-2xl mb-2">{tag.emoji}</span>
                <span className="text-xs font-semibold text-ink leading-snug mb-1">{tag.label}</span>
                <span className="text-xs text-stone leading-snug">{TAG_DESCRIPTIONS[tag.value]}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <div className="border-t border-border" />

      {/* ── Filtered lists ── */}
      <section className="bg-parchment px-4 py-12">
        <div className="max-w-2xl mx-auto">
          <h2 className="font-display italic font-700 text-2xl text-ink mb-1">Filtered lists</h2>
          <p className="text-sm text-stone mb-6">If you know what you&apos;re after</p>
          <div className="space-y-3">
            <Link
              href="/indoor-playground-cafes"
              className="flex items-center justify-between py-4 border-b border-border hover:text-rust transition-colors group"
            >
              <div>
                <p className="text-sm font-medium text-ink group-hover:text-rust transition-colors">Cafes with indoor playgrounds</p>
                <p className="text-xs text-stone mt-0.5">A proper playground inside the venue — drink your coffee while it&apos;s hot.</p>
              </div>
              <span className="text-stone group-hover:text-rust text-lg ml-4 transition-colors">→</span>
            </Link>
            <Link
              href="/cafes-next-to-playgrounds"
              className="flex items-center justify-between py-4 border-b border-border hover:text-rust transition-colors group"
            >
              <div>
                <p className="text-sm font-medium text-ink group-hover:text-rust transition-colors">Cafes next to playgrounds</p>
                <p className="text-xs text-stone mt-0.5">A playground right next door — perfect for good-weather days out.</p>
              </div>
              <span className="text-stone group-hover:text-rust text-lg ml-4 transition-colors">→</span>
            </Link>
          </div>
        </div>
      </section>

      <div className="border-t border-border" />

      {/* ── Share ── */}
      <section className="bg-paper px-4 py-12">
        <div className="max-w-2xl mx-auto">
          <h2 className="font-display italic font-700 text-2xl text-ink mb-2">Know someone who&apos;d find this useful?</h2>
          <p className="text-sm text-stone mb-6">Drop the link in your parents WhatsApp or local Facebook group. More people finding it means more spots getting added.</p>
          <div className="flex flex-wrap gap-3">
            <a
              href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(SITE_URL)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 border border-border bg-parchment text-ink text-sm font-medium px-4 py-2.5 rounded hover:border-ink transition-colors min-h-[44px]"
            >
              Share on Facebook
            </a>
            <a
              href={`https://wa.me/?text=${encodeURIComponent('Found this — a map of cafes and places in Melbourne where the kids can play, added by parents: ' + SITE_URL)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 border border-border bg-parchment text-ink text-sm font-medium px-4 py-2.5 rounded hover:border-ink transition-colors min-h-[44px]"
            >
              Share on WhatsApp
            </a>
          </div>
        </div>
      </section>

      <div className="border-t border-border" />

      {/* ── Questions ── */}
      <section className="bg-parchment px-4 py-12">
        <div className="max-w-2xl mx-auto">
          <h2 className="font-display italic font-700 text-2xl text-ink mb-8">Questions</h2>
          <div className="space-y-0">
            {FAQS.map((faq, i) => (
              <div key={i} className="border-b border-border py-5">
                <p className="text-sm font-semibold text-ink mb-2">{faq.q}</p>
                <p className="text-sm text-stone leading-relaxed">{faq.a}</p>
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
              description: 'Melbourne cafes and places where the kids can play',
              potentialAction: {
                '@type': 'SearchAction',
                target: { '@type': 'EntryPoint', urlTemplate: `${SITE_URL}/search?q={search_term_string}` },
                'query-input': 'required name=search_term_string',
              },
            }),
          }}
        />
      </section>

      <div className="border-t border-border" />

      {/* ── Bottom CTA ── */}
      <section className="bg-paper px-4 py-14 text-center">
        <div className="max-w-md mx-auto">
          <h2 className="font-display italic font-700 text-3xl text-ink mb-3">Know a spot? Add it.</h2>
          <p className="text-sm text-stone mb-6">Sign in with Google — takes about 2 minutes.</p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/submit"
              className="inline-flex items-center gap-2 bg-rust text-paper text-sm font-medium px-6 py-3 rounded hover:bg-rust-dark transition-colors"
            >
              + Add a place
            </Link>
            <Link
              href="/search"
              className="text-sm text-stone hover:text-ink underline underline-offset-2"
            >
              Browse the map first
            </Link>
          </div>
        </div>
      </section>

    </div>
  )
}
