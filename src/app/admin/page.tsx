import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import AdminDashboardClient from './AdminDashboardClient'
import type { Location } from '@/lib/types'

export const dynamic = 'force-dynamic'
export const metadata: Metadata = { title: 'Admin' }

async function getPendingLocations(): Promise<Location[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('locations')
    .select(`
      *,
      photos:location_photos(id, url, sort_order),
      submitter:users!submitted_by(id, display_name, avatar_url)
    `)
    .eq('status', 'pending')
    .order('created_at', { ascending: true })

  if (!data) return []
  return data.map((loc) => ({
    ...loc,
    photos: (loc.photos ?? []).sort((a: { sort_order: number }, b: { sort_order: number }) => a.sort_order - b.sort_order),
  }))
}

export default async function AdminPage() {
  const locations = await getPendingLocations()
  return <AdminDashboardClient initialLocations={locations} />
}
