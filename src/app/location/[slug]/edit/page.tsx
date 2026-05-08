import { notFound, redirect } from 'next/navigation'
import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import EditForm from './EditForm'

export const metadata: Metadata = { title: 'Edit location' }

interface Props {
  params: Promise<{ slug: string }>
}

export default async function EditPage({ params }: Props) {
  const { slug } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/')

  const { data: profile } = await supabase.from('users').select('role').eq('id', user.id).single()
  if (profile?.role !== 'admin') redirect('/')

  const { data: loc } = await supabase
    .from('locations')
    .select('*, photos:location_photos(id, url, sort_order)')
    .eq('slug', slug)
    .single()

  if (!loc) notFound()

  const location = {
    ...loc,
    photos: (loc.photos ?? []).sort((a: { sort_order: number }, b: { sort_order: number }) => a.sort_order - b.sort_order),
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10">
      <div className="mb-8">
        <a href="/admin" className="text-sm text-rust hover:underline">← Back to admin</a>
        <h1 className="font-display italic font-700 text-2xl text-ink mt-3">Edit location</h1>
        <p className="text-sm text-stone mt-1">{loc.name}</p>
      </div>
      <EditForm location={location} />
    </div>
  )
}
