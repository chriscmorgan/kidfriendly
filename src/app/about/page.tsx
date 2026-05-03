import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = { title: 'About' }

export default function AboutPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-16">
      <h1 className="text-3xl font-bold text-[#2c2c2c] mb-6">About KidFriendlyEats</h1>

      <div className="prose prose-sm max-w-none text-[#2c2c2c] space-y-5 text-[15px] leading-relaxed">
        <p>
          KidFriendlyEats is a community-powered map helping Australian parents and caregivers discover
          the best kid-friendly spots near them — from playgrounds and nature spots to cafes, activities, and entertainment.
        </p>

        <h2 className="text-xl font-semibold mt-8">How it works</h2>
        <p>
          Anyone can browse and search for locations. Signed-in members can add new places and write reviews.
          Every submission is reviewed by our team before going live to keep the quality high.
        </p>

        <h2 className="text-xl font-semibold mt-8">Community guidelines</h2>
        <ul className="list-disc pl-5 space-y-1">
          <li>Only add real, publicly accessible places</li>
          <li>Photos must be your own or ones you have permission to share</li>
          <li>Reviews should be honest and helpful to other families</li>
          <li>No promotional or commercial content</li>
          <li>Be respectful — we&apos;re all just trying to find good spots for our kids</li>
        </ul>

        <h2 className="text-xl font-semibold mt-8">Rating dimensions</h2>
        <p>
          Rather than a single star rating, we ask reviewers to rate specific dimensions that matter most to parents —
          things like safety, cleanliness, parking and access, and age suitability. This gives a more nuanced picture
          than a single number.
        </p>
      </div>

      <div className="mt-10 flex gap-3">
        <Link
          href="/search"
          className="bg-[#7da87b] text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-[#5e8e5c] transition-colors"
        >
          Explore spots
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
