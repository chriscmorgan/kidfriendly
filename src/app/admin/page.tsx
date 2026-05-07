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
  const { data: rows } = await supabase
    .from('reports')
    .select('id, target_id, reason, created_at, reported_by')
    .order('created_at', { ascending: false })
  if (!rows || rows.length === 0) return []

  const locationIds = [...new Set(rows.map((r) => r.target_id as string))]
  const reporterIds = [...new Set(rows.map((r) => r.reported_by as string))]

  const [{ data: locations }, { data: reporters }] = await Promise.all([
    supabase.from('locations').select('id, name, slug').in('id', locationIds),
    supabase.from('users').select('id, display_name').in('id', reporterIds),
  ])

  const locMap = new Map((locations ?? []).map((l) => [l.id, l]))
  const repMap = new Map((reporters ?? []).map((u) => [u.id, u]))

  return rows.map((r) => ({
    id: r.id,
    target_id: r.target_id,
    reason: r.reason,
    created_at: r.created_at,
    location: locMap.get(r.target_id) ?? null,
    reporter: repMap.get(r.reported_by) ?? null,
  }))
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
