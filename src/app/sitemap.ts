import { createClient } from '@/lib/supabase/server'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://kidfriendlyeats.space'

export default async function sitemap() {
  const supabase = await createClient()
  const { data: locations } = await supabase
    .from('locations')
    .select('slug, approved_at')
    .eq('status', 'approved')

  const locationUrls = (locations ?? []).map((loc) => ({
    url: `${SITE_URL}/location/${loc.slug}`,
    lastModified: loc.approved_at ? new Date(loc.approved_at) : new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }))

  return [
    { url: SITE_URL, lastModified: new Date(), changeFrequency: 'daily' as const, priority: 1.0 },
    { url: `${SITE_URL}/search`, lastModified: new Date(), changeFrequency: 'daily' as const, priority: 0.9 },
    { url: `${SITE_URL}/melbourne`, lastModified: new Date(), changeFrequency: 'weekly' as const, priority: 0.85 },
    { url: `${SITE_URL}/sydney`, lastModified: new Date(), changeFrequency: 'weekly' as const, priority: 0.85 },
    { url: `${SITE_URL}/indoor-playground-cafes`, lastModified: new Date(), changeFrequency: 'weekly' as const, priority: 0.8 },
    { url: `${SITE_URL}/cafes-next-to-playgrounds`, lastModified: new Date(), changeFrequency: 'weekly' as const, priority: 0.8 },
    { url: `${SITE_URL}/about`, lastModified: new Date(), changeFrequency: 'monthly' as const, priority: 0.5 },
    ...locationUrls,
  ]
}
