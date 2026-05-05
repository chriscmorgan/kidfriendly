import Link from 'next/link'
import SearchBar from '@/components/search/SearchBar'
import LocationCard from '@/components/location/LocationCard'
import { TAGS } from '@/lib/constants'
import type { Location } from '@/lib/types'

interface Props {
  locations: Location[]
}

const HOW_IT_WORKS = [
  {
    emoji: '🔍',
    title: 'Search your area',
    desc: 'Enter your suburb or postcode to find kid-friendly spots near you.',
  },
  {
    emoji: '📍',
    title: 'Discover great spots',
    desc: 'Browse playgrounds, cafes with play areas, parks, and more — all rated by parents.',
  },
  {
    emoji: '⭐',
    title: 'Share your experience',
    desc: 'Leave a review to help other families find their next favourite spot.',
  },
]

const TAG_DESCRIPTIONS: Record<string, string> = {
  indoor_playground: 'Perfect for rainy days',
  kids_play_area: 'Built-in play equipment',
  adjacent_playground: 'Playground right nearby',
  outdoor_run_area: 'Space to burn off energy',
  play_centre: 'Dedicated kids venues',
}

export default function HomeLanding({ locations }: Props) {
  return (
    <div className="flex flex-col overflow-x-hidden">

      {/* ── Hero ── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#1e3d1c] via-[#2d5a2b] to-[#4a7a48] min-h-[56vh] flex flex-col items-center justify-center text-center px-4 py-16 sm:py-24">

        {/* Decorative floating emojis */}
        <span className="absolute top-8 left-[8%] text-4xl opacity-20 rotate-[-15deg] select-none" aria-hidden>🛝</span>
        <span className="absolute top-16 right-[10%] text-5xl opacity-15 rotate-[12deg] select-none" aria-hidden>🌳</span>
        <span className="absolute bottom-12 left-[15%] text-3xl opacity-20 rotate-[8deg] select-none" aria-hidden>🎪</span>
        <span className="absolute bottom-8 right-[12%] text-4xl opacity-20 rotate-[-10deg] select-none" aria-hidden>🏃</span>
        <span className="absolute top-1/2 left-[3%] text-2xl opacity-10 select-none" aria-hidden>📍</span>

        <div className="relative z-10 max-w-2xl mx-auto">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm border border-white/20 text-white/90 text-xs font-semibold px-3 py-1.5 rounded-full mb-5">
            <span>👶</span> Made by parents, for parents
          </div>

          <h1 className="text-[2rem] leading-tight sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight">
            Find the best spots for{' '}
            <span className="text-[#a8d5a6]">young kids</span>{' '}
            near you
          </h1>
          <p className="text-[#c8e6c6] text-base sm:text-xl mt-5 max-w-lg mx-auto leading-relaxed">
            Playgrounds, parks, cafes and more — discovered and reviewed by local parents.
          </p>

          <div className="w-full max-w-xl mt-8 mx-auto">
            <SearchBar size="hero" />
          </div>

          {/* Stats strip */}
          <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 mt-8 text-white/70 text-sm">
            <span className="flex items-center gap-1.5"><span className="text-base">📍</span> {locations.length > 0 ? `${locations.length}+ places listed` : 'Places listed'}</span>
            <span className="text-white/30">·</span>
            <span className="flex items-center gap-1.5"><span className="text-base">⭐</span> Parent reviews</span>
            <span className="text-white/30">·</span>
            <span className="flex items-center gap-1.5"><span className="text-base">🆓</span> Always free</span>
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
                <div className="w-14 h-14 rounded-2xl bg-[#f2f7f2] flex items-center justify-center text-2xl mb-3 shadow-sm">
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
          <p className="text-sm text-[#6b7280] mb-6">Find exactly what you&apos;re looking for</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {TAGS.map((tag) => (
              <Link
                key={tag.value}
                href={`/search?tag=${tag.value}`}
                className={`group flex flex-col items-center text-center p-4 rounded-2xl border-2 border-transparent bg-white hover:border-current transition-all shadow-sm hover:shadow-md ${tag.color}`}
              >
                <span className="text-3xl mb-2">{tag.emoji}</span>
                <span className="text-xs font-semibold leading-tight mb-1">{tag.label}</span>
                <span className="text-[10px] text-[#6b7280] leading-snug">{TAG_DESCRIPTIONS[tag.value]}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── Recently added ── */}
      {locations.length > 0 && (
        <section className="bg-white px-4 py-12">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold text-[#2c2c2c]">Recently added</h2>
                <p className="text-sm text-[#6b7280] mt-0.5">Fresh spots added by the community</p>
              </div>
              <Link
                href="/search"
                className="flex items-center gap-1 text-sm font-semibold text-[#5e8e5c] hover:text-[#426340] transition-colors"
              >
                View all →
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {locations.map((loc) => (
                <LocationCard key={loc.id} location={loc} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Add a place CTA ── */}
      <section className="bg-gradient-to-br from-[#2d5a2b] to-[#4a7a48] px-4 py-16 text-center">
        <div className="max-w-lg mx-auto">
          <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-4">
            📍
          </div>
          <h2 className="text-2xl font-bold text-white">Know a great spot?</h2>
          <p className="text-[#c8e6c6] mt-3 text-sm leading-relaxed max-w-sm mx-auto">
            Help other families discover it. Takes 2 minutes to add a place to the map.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-6">
            <Link
              href="/submit"
              className="inline-flex items-center gap-2 bg-white text-[#2d5a2b] font-bold text-sm px-7 py-3.5 rounded-2xl hover:bg-[#f2f7f2] transition-colors shadow-lg"
            >
              <span>📍</span> Add a place
            </Link>
            <Link
              href="/search"
              className="inline-flex items-center gap-2 bg-white/15 border border-white/30 text-white font-semibold text-sm px-7 py-3.5 rounded-2xl hover:bg-white/25 transition-colors"
            >
              Explore the map →
            </Link>
          </div>
        </div>
      </section>

    </div>
  )
}
