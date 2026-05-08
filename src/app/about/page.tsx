import type { Metadata } from 'next'
import Link from 'next/link'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://kidfriendlyeats.space'

export const metadata: Metadata = {
  title: 'About KidFriendlyEats — Community Directory for Parents',
  description: 'KidFriendlyEats is a free community directory of cafes and venues with kids play areas across Melbourne — built by parents, for parents.',
  alternates: { canonical: `${SITE_URL}/about` },
}

export default function AboutPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-16">
      <h1 className="text-3xl font-bold text-[#2c2c2c] mb-2">About KidFriendlyEats</h1>
      <p className="text-[#6b7280] text-sm mb-10">A community project. No ads, no paid listings, no fluff.</p>

      <div className="space-y-8 text-[15px] leading-relaxed text-[#2c2c2c]">

        <div className="bg-[#fff8ee] border border-[#f0d8b0] rounded-2xl p-6">
          <p className="text-base leading-relaxed">
            When we had our first baby, I thought going out would stay roughly the same — just with a pram.
            It was not. You realise pretty quickly that most recommendations assume you can walk in anywhere,
            sit anywhere, and leave whenever you want.
          </p>
          <p className="mt-4 text-base leading-relaxed">
            Finding a cafe where the kids could actually play — not just be tolerated — meant asking
            in group chats, scrolling through outdated Google reviews, or just turning up and hoping.
            KidFriendlyEats is the resource I wanted back then.
          </p>
          <p className="mt-4 text-base leading-relaxed font-medium text-[#2c2c2c]">
            But it only works if people add to it.
          </p>
          <p className="mt-3 text-base leading-relaxed">
            Every listing on here was added by a real parent who has been there. That&apos;s what makes it
            useful — and the more parents contribute, the more useful it gets for everyone.
          </p>
        </div>

        <div>
          <h2 className="text-lg font-semibold mb-3">How it works</h2>
          <p className="text-[#4b5563]">
            Anyone can browse and search for free. Sign in to add a new place or write a review.
            Every submission is reviewed before going live to keep quality high. There are no paid listings,
            no sponsored spots, and no ads — just places real parents have added.
          </p>
        </div>

        <div>
          <h2 className="text-lg font-semibold mb-3">How you can help</h2>
          <ul className="space-y-3 text-[#4b5563]">
            <li className="flex items-start gap-3">
              <span className="text-[#f4a090] font-bold mt-0.5 text-base">📍</span>
              <span><strong className="text-[#2c2c2c]">Add a spot</strong> — takes 2 minutes. If you know a cafe or venue that should be here, add it.</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-[#f4a090] font-bold mt-0.5 text-base">📣</span>
              <span><strong className="text-[#2c2c2c]">Share it</strong> — drop the link in your parents group. Every new person who finds it is a potential new contributor.</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-[#f4a090] font-bold mt-0.5 text-base">⭐</span>
              <span><strong className="text-[#2c2c2c]">Leave a review</strong> — your experience (good or bad) helps other families make a better call.</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-[#f4a090] font-bold mt-0.5 text-base">🚩</span>
              <span><strong className="text-[#2c2c2c]">Flag outdated info</strong> — places close, menus change. Hit "Report" on any listing if something looks wrong.</span>
            </li>
          </ul>
        </div>

        <div>
          <h2 className="text-lg font-semibold mb-3">Community guidelines</h2>
          <ul className="space-y-2 text-[#4b5563]">
            <li className="flex items-start gap-2">
              <span className="text-[#4abfc0] font-bold mt-0.5">✓</span>
              Only add real, publicly accessible places
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#4abfc0] font-bold mt-0.5">✓</span>
              Photos must be your own or ones you have permission to share
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#4abfc0] font-bold mt-0.5">✓</span>
              Reviews should be honest and genuinely helpful to other families
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#4abfc0] font-bold mt-0.5">✓</span>
              No promotional or commercial content
            </li>
          </ul>
        </div>

        <div>
          <h2 className="text-lg font-semibold mb-3">How we rate places</h2>
          <p className="text-[#4b5563]">
            Instead of a single star rating, reviewers rate the things that actually matter —
            safety, cleanliness, parking and access, noise level, age suitability, and more.
            You get a real picture of a place, not just whether someone had a nice time.
          </p>
        </div>

        <div>
          <h2 className="text-lg font-semibold mb-3">Get in touch</h2>
          <p className="text-[#4b5563]">
            Questions, feedback, or spotted something that needs fixing?{' '}
            <a href="mailto:support@kidfriendlyeats.space" className="text-[#4abfc0] hover:underline">
              support@kidfriendlyeats.space
            </a>
          </p>
        </div>

      </div>

      <div className="mt-10 flex gap-3">
        <Link
          href="/submit"
          className="bg-[#f4a090] text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-[#e8887a] transition-colors"
        >
          Add a place
        </Link>
        <Link
          href="/search"
          className="bg-white border border-gray-200 text-[#2c2c2c] px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-[#faf8f4] transition-colors"
        >
          Browse the map
        </Link>
      </div>
    </div>
  )
}
