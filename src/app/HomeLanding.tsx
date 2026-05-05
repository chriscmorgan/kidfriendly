import Link from 'next/link'
import SearchBar from '@/components/search/SearchBar'
import LocationCard from '@/components/location/LocationCard'
import { TAGS } from '@/lib/constants'
import type { Location } from '@/lib/types'

interface Props {
  locations: Location[]
}

export default function HomeLanding({ locations }: Props) {
  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="bg-[#4a7a48] min-h-[50vh] flex flex-col items-center justify-center text-center px-4 py-16 sm:py-24">
        <h1 className="text-3xl sm:text-5xl font-bold text-white leading-tight max-w-2xl">
          Find the best spots for young kids near you
        </h1>
        <p className="text-[#c8e6c6] text-base sm:text-lg mt-4 max-w-xl">
          Playgrounds, parks, cafes and more — recommended by parents, for parents.
        </p>
        <div className="w-full max-w-xl mt-8">
          <SearchBar size="hero" />
        </div>
      </section>

      {/* Category pills */}
      <section className="bg-white border-b border-gray-100 px-4 py-5">
        <div className="max-w-4xl mx-auto">
          <p className="text-xs font-semibold text-[#6b7280] uppercase tracking-wide mb-3">Browse by type</p>
          <div className="flex flex-wrap gap-2">
            {TAGS.map((tag) => (
              <Link
                key={tag.value}
                href={`/search?tag=${tag.value}`}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium border border-gray-200 bg-white hover:border-[#7da87b] hover:text-[#426340] transition-colors"
              >
                {tag.emoji} {tag.label}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Recently added */}
      {locations.length > 0 && (
        <section className="max-w-4xl mx-auto w-full px-4 py-10">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-xl font-bold text-[#2c2c2c]">Recently added</h2>
            <Link href="/search" className="text-sm font-semibold text-[#5e8e5c] hover:text-[#426340] transition-colors">
              Explore the map →
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {locations.map((loc) => (
              <LocationCard key={loc.id} location={loc} />
            ))}
          </div>
        </section>
      )}

      {/* Add a place CTA */}
      <section className="bg-[#f2f7f2] border-t border-[#c1d9bf] px-4 py-12 text-center">
        <div className="max-w-md mx-auto">
          <div className="text-4xl mb-3">📍</div>
          <h2 className="text-xl font-bold text-[#2c2c2c]">Know a great spot?</h2>
          <p className="text-[#6b7280] mt-2 text-sm leading-relaxed">
            Help other families discover it. Add it to the map and share what makes it special for kids.
          </p>
          <Link
            href="/submit"
            className="inline-flex items-center gap-2 mt-5 bg-[#7da87b] hover:bg-[#5e8e5c] text-white font-semibold text-sm px-6 py-3 rounded-2xl transition-colors"
          >
            Add a place
          </Link>
        </div>
      </section>
    </div>
  )
}
