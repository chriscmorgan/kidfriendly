import type { Metadata } from 'next'
import Link from 'next/link'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://kidfriendlyeats.space'
const LAST_UPDATED = '9 May 2025'
const CONTACT_EMAIL = 'support@kidfriendlyeats.space'

export const metadata: Metadata = {
  title: 'Terms of Service',
  description: 'The terms that apply when you use KidFriendlyEats.',
  alternates: { canonical: `${SITE_URL}/terms` },
  robots: { index: true, follow: false },
}

function Section({ title, id, children }: { title: string; id: string; children: React.ReactNode }) {
  return (
    <div id={id}>
      <h2 className="font-display italic font-700 text-xl text-ink mb-3">{title}</h2>
      <div className="space-y-3 text-sm text-stone leading-relaxed">{children}</div>
    </div>
  )
}

export default function TermsPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-16">
      <h1 className="font-display italic font-700 text-3xl text-ink mb-2">Terms of Service</h1>
      <p className="text-xs text-stone mb-10">Last updated: {LAST_UPDATED}</p>

      <div className="space-y-10">

        <Section title="About these terms" id="about">
          <p>
            KidFriendlyEats is a community directory of kid-friendly cafes and venues in Melbourne,
            operated by an individual based in Australia. These terms govern your use of the site at{' '}
            <a href={SITE_URL} className="text-rust hover:underline">kidfriendlyeats.space</a>.
          </p>
          <p>
            By creating an account or submitting content, you agree to these terms. If you don&rsquo;t
            agree, please don&rsquo;t use the service. These terms are governed by the laws of Victoria, Australia.
          </p>
        </Section>

        <Section title="Who can use the service" id="eligibility">
          <p>
            You must be 18 or older to create an account and submit content. The service itself
            (searching and browsing listings) is available to anyone.
          </p>
        </Section>

        <Section title="Your account" id="account">
          <p>
            You are responsible for keeping your account credentials secure. You must not share access
            to your account with others. If you become aware of any unauthorised use, contact us
            immediately at{' '}
            <a href={`mailto:${CONTACT_EMAIL}`} className="text-rust hover:underline">{CONTACT_EMAIL}</a>.
          </p>
          <p>
            We may suspend or terminate your account if you breach these terms, without notice where
            the breach is serious.
          </p>
        </Section>

        <Section title="Submitting listings" id="listings">
          <p>
            Listings are submitted by community members and reviewed by us before going live. By submitting
            a listing you confirm that:
          </p>
          <ul className="space-y-2 list-none">
            {[
              'The venue is real, currently operating, and open to the public',
              'The information you provide is accurate to the best of your knowledge',
              'You have personally visited or have first-hand knowledge of the venue',
              'You are not the venue owner or operator, or affiliated with the venue in a commercial capacity',
            ].map((item) => (
              <li key={item} className="flex gap-3">
                <span className="text-rust shrink-0 mt-0.5">–</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
          <p>
            We do not accept listings submitted by venue owners, marketing agencies, or anyone with a
            commercial interest in the venue. If we become aware that a listing was submitted in bad
            faith, we will remove it.
          </p>
        </Section>

        <Section title="Reviews and ratings" id="reviews">
          <p>
            Reviews reflect the personal opinion of the individual who submitted them. They are not
            the views of KidFriendlyEats. We do not verify the accuracy of reviews.
          </p>
          <p>
            Reviews must be honest and based on genuine personal experience. You must not:
          </p>
          <ul className="space-y-2 list-none">
            {[
              'Submit a review for a venue you have not personally visited',
              'Submit fake positive reviews (including if you have a connection to the venue)',
              'Submit fake negative reviews intended to harm a competitor',
              'Include personal attacks on venue staff or other users',
              'Include content that is defamatory, harassing, or unlawful',
            ].map((item) => (
              <li key={item} className="flex gap-3">
                <span className="text-rust shrink-0 mt-0.5">–</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </Section>

        <Section title="Photos" id="photos">
          <p>
            By uploading a photo you confirm that:
          </p>
          <ul className="space-y-2 list-none">
            {[
              'You took the photo and own the copyright, or you have the right to share it',
              'The photo does not contain identifiable people — including adults or children — without their (or their guardian\'s) explicit consent',
              'The photo accurately represents the venue',
            ].map((item) => (
              <li key={item} className="flex gap-3">
                <span className="text-rust shrink-0 mt-0.5">–</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
          <p>
            By uploading a photo you grant KidFriendlyEats a non-exclusive, royalty-free, worldwide
            licence to display, reproduce and host the photo as part of the service. This licence ends
            when you delete the photo or close your account, subject to the data retention terms in
            our <Link href="/privacy" className="text-rust hover:underline">Privacy Policy</Link>.
          </p>
          <p>
            If you believe a photo on this site contains an identifiable person without consent,
            please use the Report button on the listing and select &ldquo;Contains identifiable
            person in photo.&rdquo; We will remove it within 24 hours.
          </p>
        </Section>

        <Section title="Content you submit — licence and ownership" id="licence">
          <p>
            You retain ownership of content (listings, reviews, photos) that you submit. By submitting
            content you grant KidFriendlyEats a non-exclusive, royalty-free, worldwide licence to
            display, host and use that content to operate and promote the service.
          </p>
          <p>
            You must not submit content that infringes someone else&rsquo;s copyright or other intellectual
            property rights.
          </p>
        </Section>

        <Section title="Reporting and takedowns" id="reporting">
          <p>
            Use the Report button on any listing to flag content that is inaccurate, defamatory,
            contains an identifiable person in a photo, or otherwise breaches these terms. We aim to
            review all reports within 48 hours and remove content that clearly breaches these terms.
          </p>
          <p>
            <strong className="text-ink">Are you the owner of a listed venue?</strong> If you want
            to update, correct or remove your venue&rsquo;s listing — or if you believe the listing or
            a review is defamatory — contact us at{' '}
            <a href={`mailto:${CONTACT_EMAIL}`} className="text-rust hover:underline">{CONTACT_EMAIL}</a>{' '}
            with the venue name and your concern. We will respond within 5 business days.
          </p>
        </Section>

        <Section title="Our rights" id="our-rights">
          <p>
            We may at any time, without notice:
          </p>
          <ul className="space-y-2 list-none">
            {[
              'Edit, remove or decline to publish any listing, review or photo that breaches these terms or that we consider inappropriate',
              'Suspend or terminate accounts that breach these terms',
              'Modify or discontinue the service or any part of it',
            ].map((item) => (
              <li key={item} className="flex gap-3">
                <span className="text-rust shrink-0 mt-0.5">–</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </Section>

        <Section title="Disclaimers" id="disclaimers">
          <p>
            Listings and reviews are submitted by community members. We do not verify whether venues
            are still open, whether information is current, or whether reviews are accurate. Always
            check directly with the venue before visiting.
          </p>
          <p>
            The service is provided &ldquo;as is&rdquo; without warranties of any kind. To the extent permitted
            by Australian law (including the Australian Consumer Law), we exclude all implied warranties
            and conditions.
          </p>
        </Section>

        <Section title="Limitation of liability" id="liability">
          <p>
            To the extent permitted by law, KidFriendlyEats is not liable for any loss or damage
            arising from your use of the service, reliance on listings or reviews, or any content
            submitted by other users.
          </p>
          <p>
            Nothing in these terms excludes, restricts or modifies any right or remedy, or any guarantee,
            warranty or other term or condition, implied or imposed by the Australian Consumer Law
            that cannot lawfully be excluded or limited.
          </p>
        </Section>

        <Section title="Changes to these terms" id="changes">
          <p>
            We may update these terms from time to time. We will post the updated version here with
            a new &ldquo;Last updated&rdquo; date. Continued use of the service after changes are posted
            constitutes acceptance of the revised terms.
          </p>
        </Section>

        <Section title="Contact" id="contact">
          <p>
            Questions about these terms:{' '}
            <a href={`mailto:${CONTACT_EMAIL}`} className="text-rust hover:underline">{CONTACT_EMAIL}</a>
          </p>
        </Section>

        <div className="border-t border-border pt-8 text-xs text-stone space-y-1">
          <p>Governing law: these terms are governed by the laws of Victoria, Australia.</p>
          <p>
            <strong className="text-ink">Note:</strong> These terms were drafted to be readable and honest.
            They have not been reviewed by a solicitor. If you are a legal professional and notice an
            issue, please get in touch.
          </p>
        </div>

      </div>

      <div className="mt-10 flex gap-3">
        <Link href="/privacy" className="text-sm text-rust hover:underline">Privacy Policy →</Link>
        <Link href="/" className="text-sm text-stone hover:text-ink">← Home</Link>
      </div>
    </div>
  )
}
