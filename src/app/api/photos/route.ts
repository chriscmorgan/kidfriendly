import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  let formData: FormData
  try {
    formData = await request.formData()
  } catch {
    return NextResponse.json({ error: 'Invalid form data' }, { status: 400 })
  }

  const file = formData.get('file') as File | null
  const locationId = formData.get('location_id') as string | null
  const sortOrder = parseInt((formData.get('sort_order') as string) ?? '0', 10)

  if (!file || !locationId) {
    return NextResponse.json({ error: 'Missing file or location_id' }, { status: 400 })
  }

  const ext = file.name.split('.').pop()
  const path = `${locationId}/${sortOrder}.${ext}`

  const { error: uploadError } = await supabase.storage
    .from('Photos')
    .upload(path, file, { upsert: true, contentType: file.type })

  if (uploadError) {
    console.error('[photos] upload failed:', uploadError.message)
    return NextResponse.json({ error: uploadError.message }, { status: 500 })
  }

  const { data: urlData } = supabase.storage.from('Photos').getPublicUrl(path)

  const { error: insertError } = await supabase.from('location_photos').insert({
    location_id: locationId,
    url: urlData.publicUrl,
    sort_order: sortOrder,
    uploaded_by: user.id,
  })

  if (insertError) {
    console.error('[photos] insert failed:', insertError.message)
  }

  return NextResponse.json({ url: urlData.publicUrl })
}
