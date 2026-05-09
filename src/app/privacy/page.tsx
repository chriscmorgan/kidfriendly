import type { Metadata } from 'next'
import Link from 'next/link'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://kidfriendlyeats.space'
const LAST_UPDATED = '9 May 2025'
const CONTACT_EMAIL = 'support@kidfriendlyeats.space'

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'How KidFriendlyEats collects, uses and protects your personal information.',
  alternates: { canonical: `${SITE_URL}/privacy` },
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

export default function PrivacyPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-16">
      <h1 className="font-display italic font-700 text-3xl text-ink mb-2">Privacy Policy</h1>
      <p className="text-xs text-stone mb-10">Last updated: {LAST_UPDATED}</p>

      <div className="space-y-10">

        <Section title="Who we are" id="who">
          <p>
            KidFriendlyEats is a community directory of cafes and venues in Melbourne where kids can play.
            It is operated by an individual based in Australia. When this policy says &ldquo;we&rdquo;,
            &ldquo;us&rdquo; or &ldquo;KidFriendlyEats&rdquo;, that&rsquo;s who it means.
          </p>
          <p>
            This policy explains what personal information we collect, how we use it, and your rights
            under the <em>Privacy Act 1988</em> (Cth) and the Australian Privacy Principles (APPs).
          </p>
        </Section>

        <Section title="What we collect" id="collect">
          <p>We collect the following personal information:</p>
          <ul className="space-y-2 list-none">
            {[
              ['Account information', 'Your email address and display name, collected when you create an account via Google OAuth or email magic link.'],
              ['Photos you upload', 'Images you submit alongside a place listing. You represent that you took these photos and have the right to share them.'],
              ['Place listings and reviews', 'Descriptions, tips, ratings and other content you submit about venues. This is associated with your account.'],
              ['Location data', 'If you use the "Near me" feature, your device\'s approximate GPS coordinates are used to find nearby venues. This is processed in your browser and is not stored on our servers.'],
              ['IP addresses', 'Collected automatically for rate-limiting and security purposes. Not linked to your account and not retained beyond 24 hours.'],
              ['Usage data', 'Standard server logs (pages visited, browser type). No third-party analytics or tracking cookies are used.'],
            ].map(([term, def]) => (
              <li key={term as string} className="flex gap-3">
                <span className="text-rust shrink-0 mt-0.5">–</span>
                <span><strong className="text-ink">{term}.</strong> {def}</span>
              </li>
            ))}
          </ul>
        </Section>

        <Section title="How we use your information" id="use">
          <p>We use personal information only to operate and improve the service:</p>
          <ul className="space-y-2 list-none">
            {[
              'To authenticate you and manage your account',
              'To display your submitted listings and reviews on the site',
              'To send transactional emails (sign-in magic links and account notifications) — no marketing emails',
              'To enforce our community guidelines and respond to reports',
              'To detect and prevent abuse (rate limiting by IP)',
            ].map((item) => (
              <li key={item} className="flex gap-3">
                <span className="text-rust shrink-0 mt-0.5">–</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
          <p>We do not sell, rent or trade your personal information. We do not use it for advertising.</p>
        </Section>

        <Section title="Third parties we share data with" id="third-parties">
          <p>
            Running the service requires a small number of third-party providers. Each receives only
            the data they need to do their job.
          </p>
          <ul className="space-y-3 list-none">
            {[
              ['Supabase', 'Our database, authentication and file storage provider. Your account data and uploaded photos are stored on Supabase infrastructure hosted on AWS in the United States. Supabase is SOC 2 Type II certified. Under APP 8, we remain responsible for ensuring your data is handled consistently with the APPs.'],
              ['Resend', 'Email delivery provider used to send sign-in magic links. Receives your email address for the purpose of sending the email. US-based.'],
              ['Mapbox', 'Used for the map and address search. When you search for an address or use the map, your search query is sent to Mapbox. No account data is sent. Subject to Mapbox\'s own privacy policy.'],
              ['Cloudflare Turnstile', 'Bot-protection challenge shown during sign-up. Cloudflare receives your IP address and browser signals. No cookies are set.'],
            ].map(([name, desc]) => (
              <li key={name as string} className="flex gap-3">
                <span className="text-rust shrink-0 mt-0.5">–</span>
                <span><strong className="text-ink">{name}.</strong> {desc}</span>
              </li>
            ))}
          </ul>
          <p>
            We do not share data with any other third parties. We will disclose personal information
            if required to do so by Australian law or a valid court order.
          </p>
        </Section>

        <Section title="Photos and children" id="photos">
          <p>
            Because this site is about family venues, photos of play areas may incidentally include
            children. We take this seriously.
          </p>
          <ul className="space-y-2 list-none">
            {[
              'We require users to confirm that photos are their own and do not contain identifiable people.',
              'If you believe a photo on this site contains an identifiable person (including a child) who has not consented to being photographed and published, please use the Report button on the listing and select "Contains identifiable person in photo." We will remove the photo promptly.',
              'Our target response time for photo removal requests of this nature is within 24 hours.',
            ].map((item) => (
              <li key={item} className="flex gap-3">
                <span className="text-rust shrink-0 mt-0.5">–</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </Section>

        <Section title="Data retention and deletion" id="retention">
          <p>
            We retain your account information and content for as long as your account is active.
            If you want your account and associated data deleted, email us at{' '}
            <a href={`mailto:${CONTACT_EMAIL}`} className="text-rust hover:underline">{CONTACT_EMAIL}</a> with
            the subject line &ldquo;Delete my account&rdquo;. We will delete your account and
            personal information within 30 days, except where retention is required by law.
          </p>
          <p>
            Listings and reviews you have submitted may remain on the site in anonymised form
            after your account is deleted, as they form part of the community database.
            If you want specific content removed along with your account, please say so in your
            deletion request.
          </p>
        </Section>

        <Section title="Your rights" id="rights">
          <p>Under the Privacy Act 1988 (Cth) you have the right to:</p>
          <ul className="space-y-2 list-none">
            {[
              'Access the personal information we hold about you',
              'Correct inaccurate or out-of-date information',
              'Request deletion of your personal information',
              'Complain about a breach of the Australian Privacy Principles',
            ].map((item) => (
              <li key={item} className="flex gap-3">
                <span className="text-rust shrink-0 mt-0.5">–</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
          <p>
            To exercise any of these rights, contact us at{' '}
            <a href={`mailto:${CONTACT_EMAIL}`} className="text-rust hover:underline">{CONTACT_EMAIL}</a>.
            We will respond within 30 days. If you are not satisfied with our response, you can
            lodge a complaint with the{' '}
            <a
              href="https://www.oaic.gov.au/privacy/privacy-complaints"
              target="_blank"
              rel="noopener noreferrer"
              className="text-rust hover:underline"
            >
              Office of the Australian Information Commissioner (OAIC)
            </a>.
          </p>
        </Section>

        <Section title="Security" id="security">
          <p>
            We use industry-standard measures to protect your personal information: HTTPS throughout,
            Supabase row-level security policies so users can only access their own data, and no
            storage of passwords (authentication is passwordless via magic links or Google OAuth).
          </p>
          <p>
            No method of internet transmission is 100% secure. If you become aware of a security
            issue, please contact us immediately at{' '}
            <a href={`mailto:${CONTACT_EMAIL}`} className="text-rust hover:underline">{CONTACT_EMAIL}</a>.
          </p>
        </Section>

        <Section title="Changes to this policy" id="changes">
          <p>
            We may update this policy from time to time. We will post the updated version here with
            a new &ldquo;Last updated&rdquo; date. For significant changes, we will notify registered
            users by email.
          </p>
        </Section>

        <Section title="Contact" id="contact">
          <p>
            Questions or concerns about this privacy policy or how we handle your data:
          </p>
          <p>
            <a href={`mailto:${CONTACT_EMAIL}`} className="text-rust hover:underline">{CONTACT_EMAIL}</a>
          </p>
        </Section>

        <div className="border-t border-border pt-8 text-xs text-stone space-y-1">
          <p>Governing law: this policy is governed by the laws of Victoria, Australia.</p>
          <p>
            <strong className="text-ink">Note:</strong> This policy was drafted to be accurate and honest.
            It has not been reviewed by a solicitor. If you are a legal professional and notice an issue,
            please get in touch.
          </p>
        </div>

      </div>

      <div className="mt-10 flex gap-3">
        <Link href="/terms" className="text-sm text-rust hover:underline">Terms of Service →</Link>
        <Link href="/" className="text-sm text-stone hover:text-ink">← Home</Link>
      </div>
    </div>
  )
}
