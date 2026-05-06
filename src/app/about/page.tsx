import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = { title: 'About' }

export default function AboutPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-16">
      <h1 className="text-3xl font-bold text-[#2c2c2c] mb-2">About KidFriendlyEats</h1>
      <p className="text-[#6b7280] text-sm mb-10">Built by a parent, for parents.</p>

      <div className="space-y-8 text-[15px] leading-relaxed text-[#2c2c2c]">

        <div className="bg-[#fef1ee] border border-[#fabfb0] rounded-2xl p-6">
          <p className="text-base leading-relaxed">
            When we had our first baby, I thought going out would stay roughly the same — just with a pram.
            It was not. You realise pretty quickly that most recommendations assume you can walk in anywhere,
            sit anywhere, and leave whenever you want.
          </p>
          <p className="mt-4 text-base leading-relaxed">
            Finding a cafe that actually had highchairs and wasn&apos;t so loud you couldn&apos;t hear yourself think.
            A park with clean toilets nearby. An indoor activity that was genuinely fun and not total chaos.
            These things exist — but finding them meant asking friends in group chats, scrolling through outdated
            Google reviews, or just turning up and hoping for the best.
          </p>
          <p className="mt-4 text-base leading-relaxed">
            KidFriendlyEats is the resource I wanted back then. A map of places that real parents have been to,
            vetted, and taken the time to describe — so you can spend less time researching and more time
            actually enjoying a day out with your kid.
          </p>
        </div>

        <div>
          <h2 className="text-lg font-semibold mb-3">How it works</h2>
          <p className="text-[#4b5563]">
            Anyone can browse and search for locations. Sign in to add a new place or write a review.
            Every submission is reviewed before going live to keep quality high. The more people contribute,
            the more useful it gets for everyone.
          </p>
        </div>

        <div>
          <h2 className="text-lg font-semibold mb-3">Community guidelines</h2>
          <ul className="space-y-2 text-[#4b5563]">
            <li className="flex items-start gap-2">
              <span className="text-[#e8674a] font-bold mt-0.5">✓</span>
              Only add real, publicly accessible places
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#e8674a] font-bold mt-0.5">✓</span>
              Photos must be your own or ones you have permission to share
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#e8674a] font-bold mt-0.5">✓</span>
              Reviews should be honest and genuinely helpful to other families
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#e8674a] font-bold mt-0.5">✓</span>
              No promotional or commercial content
            </li>
          </ul>
        </div>

        <div>
          <h2 className="text-lg font-semibold mb-3">How we rate places</h2>
          <p className="text-[#4b5563]">
            Instead of a single star rating, reviewers rate the things that actually matter to parents —
            safety, cleanliness, parking and access, noise level, age suitability, and more.
            You get a real picture of what a place is like, not just whether someone had a nice time.
          </p>
        </div>

      </div>

      <div className="mt-10 flex gap-3">
        <Link
          href="/"
          className="bg-[#e8674a] text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-[#cc5235] transition-colors"
        >
          Find spots near me
        </Link>
        <Link
          href="/submit"
          className="bg-white border border-gray-200 text-[#2c2c2c] px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-[#f7eed9] transition-colors"
        >
          Add a place
        </Link>
      </div>
    </div>
  )
}
