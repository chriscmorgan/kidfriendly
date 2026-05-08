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
      <h1 className="text-3xl font-bold text-ink mb-2">About</h1>

      <div className="space-y-8 text-[15px] leading-relaxed text-ink">

        <div className="bg-[#fff8ee] border border-[#f0d8b0] rounded-2xl p-6 space-y-4 text-base leading-relaxed">
          <p>
            When I had my first kid, finding a cafe where they could actually run around — not just sit quietly
            and behave — was way harder than I expected. Google Maps doesn&apos;t filter for &quot;has a play area&quot;.
            The lists you find online are usually a few years old and half the places have changed.
            Most of the time I ended up asking in a WhatsApp group and hoping someone had been recently.
          </p>
          <p>
            I wanted somewhere to keep track of the good spots and actually share them properly.
            So I built this.
          </p>
          <p>
            It&apos;s pretty simple — anyone can add a place they know, anyone can search for somewhere nearby.
            The more people add to it, the more useful it gets. That&apos;s genuinely it.
          </p>
        </div>

        <div>
          <h2 className="text-lg font-semibold mb-3">Adding a place</h2>
          <p className="text-stone">
            Sign in with Google and hit the Add button. Takes about 2 minutes. We do a quick check on each
            submission before it goes live — just to make sure it&apos;s a real place that fits.
            If something looks outdated on an existing listing, hit the Report button and we&apos;ll look at it.
          </p>
        </div>

        <div>
          <h2 className="text-lg font-semibold mb-3">Ratings</h2>
          <p className="text-stone">
            Rather than a single star rating, you can rate the things that actually matter when you&apos;re
            going out with kids — how safe the play area is, noise level, parking, whether it suits
            toddlers vs older kids, and so on. Gives a more useful picture than just &quot;four stars&quot;.
          </p>
        </div>

        <div>
          <h2 className="text-lg font-semibold mb-3">A few ground rules</h2>
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
              Reviews should be honest — if a place wasn&apos;t great, say so
            </li>
            <li className="flex items-start gap-2">
              <span className="text-rust mt-0.5">–</span>
              No listings from the venues themselves or promotional content
            </li>
          </ul>
        </div>

        <div>
          <h2 className="text-lg font-semibold mb-3">Get in touch</h2>
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
