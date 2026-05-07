import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import AdminDashboardClient from './AdminDashboardClient'
import type { Location } from '@/lib/types'

export const dynamic = 'force-dynamic'
export const metadata: Metadata = { title: 'Admin' }

export interface Report {
  id: string
  target_id: string
  reason: string
  created_at: string
  location: { name: string; slug: string } | null
  reporter: { display_name: string } | null
}

async function getPendingLocations(): Promise<Location[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('locations')
    .select(`*, photos:location_photos(id, url, sort_order), submitter:users!submitted_by(id, display_name, avatar_url)`)
    .eq('status', 'pending')
    .order('created_at', { ascending: true })
  if (!data) return []
  return data.map((loc) => ({ ...loc, photos: (loc.photos ?? []).sort((a: { sort_order: number }, b: { sort_order: number }) => a.sort_order - b.sort_order) }))
}

async function getAllLocations(): Promise<Location[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('locations')
    .select(`*, photos:location_photos(id, url, sort_order), submitter:users!submitted_by(id, display_name, avatar_url)`)
    .neq('status', 'pending')
    .order('created_at', { ascending: false })
    .limit(200)
  if (!data) return []
  return data.map((loc) => ({ ...loc, photos: (loc.photos ?? []).sort((a: { sort_order: number }, b: { sort_order: number }) => a.sort_order - b.sort_order) }))
}

async function getReports(): Promise<Report[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('reports')
    .select(`id, target_id, reason, created_at, location:locations!target_id(name, slug), reporter:users!reported_by(display_name)`)
    .order('created_at', { ascending: false })
  if (!data) return []
  return data as unknown as Report[]
}

export default async function AdminPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/')

  const { data: profile } = await supabase.from('users').select('role').eq('id', user.id).single()
  if (profile?.role !== 'admin') redirect('/')

  const [pending, all, reports] = await Promise.all([getPendingLocations(), getAllLocations(), getReports()])
  return <AdminDashboardClient initialPending={pending} initialAll={all} initialReports={reports} />
}
