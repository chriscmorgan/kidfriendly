import type { Metadata } from 'next'
import Link from 'next/link'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://kidfriendlyeats.space'

export const metadata: Metadata = {
  title: 'About — KidFriendlyEats',
  description: 'A map of Melbourne cafes and places where the kids can play. Free to use, free to add to.',
  alternates: { canonical: `${SITE_URL}/about` },
}

export default function AboutPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-16">
      <h1 className="font-display italic font-700 text-3xl text-ink mb-8">About</h1>

      <div className="space-y-8 text-[15px] leading-relaxed text-ink">

        <div className="bg-[#fff8ee] border border-[#f0d8b0] rounded p-6 space-y-4 text-base leading-relaxed">
          <p>
            Eating out got a lot harder after we had our first kid, our little guy loved to run around and
            just wouldn&apos;t sit still. We soon found that dining at places with a kids&apos; play area made
            life so much less stressful.
          </p>
          <p>
            But finding those spots was way harder than it should be. Google Maps doesn&apos;t filter for play areas,
            and online lists are always outdated or tough to navigate when you&apos;re exploring a new area.
          </p>
          <p>
            We built this webpage to change that. It&apos;s simple: anyone can pin a great family-friendly spot,
            and anyone can search for one nearby. The more we add, the better it gets.
          </p>
        </div>

        <div>
          <h2 className="font-display italic font-700 text-xl text-ink mb-3">Adding a place</h2>
          <p className="text-stone">
            Hit the Add button — no account needed. It only takes seconds. We do a quick check on each
            submission before it goes live — just to make sure it&apos;s a real place that fits.
            If something looks outdated on an existing listing, hit the Report button and we&apos;ll look at it.
          </p>
        </div>

        <div>
          <h2 id="rules" className="font-display italic font-700 text-xl text-ink mb-3">A few ground rules</h2>
          <ul className="space-y-2 text-stone">
            <li className="flex items-start gap-2">
              <span className="text-rust mt-0.5">–</span>
              Only add real places that are actually open to the public
            </li>
            <li className="flex items-start gap-2">
              <span className="text-rust mt-0.5">–</span>
              Photos should be your own
            </li>
            <li className="flex items-start gap-2">
              <span className="text-rust mt-0.5">–</span>
              No listings from the venues themselves or promotional content
            </li>
          </ul>
        </div>

        <div>
          <h2 className="font-display italic font-700 text-xl text-ink mb-3">Get in touch</h2>
          <p className="text-stone">
            Questions or spotted something wrong?{' '}
            <a href="mailto:support@kidfriendlyeats.space" className="text-rust hover:underline">
              support@kidfriendlyeats.space
            </a>
          </p>
        </div>

      </div>

      <div className="mt-10 flex gap-3">
        <Link
          href="/submit"
          className="bg-rust text-paper px-5 py-2.5 rounded text-sm font-medium hover:bg-rust-dark transition-colors"
        >
          Add a place
        </Link>
        <Link
          href="/search"
          className="bg-paper border border-border text-ink px-5 py-2.5 rounded text-sm font-medium hover:bg-parchment transition-colors"
        >
          Browse the map
        </Link>
      </div>
    </div>
  )
}
