'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import AddressSearch from '@/components/forms/AddressSearch'
import Button from '@/components/ui/Button'
import { createClient } from '@/lib/supabase/client'
import { TAGS, OPEN_TIMES, AGE_RANGES } from '@/lib/constants'
import type { Tag, OpenTime, AgeRange, Location } from '@/lib/types'
import { Upload, X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface AddressData {
  place_name: string
  lat: number
  lng: number
  suburb: string
}

export default function EditForm({ location: loc }: { location: Location }) {
  const router = useRouter()
  const supabase = createClient()

  const [name, setName] = useState(loc.name)
  const [address, setAddress] = useState<AddressData>({
    place_name: loc.address,
    lat: loc.lat,
    lng: loc.lng,
    suburb: loc.suburb,
  })
  const [selectedTags, setSelectedTags] = useState<Tag[]>(loc.tags ?? [])
  const [selectedOpenTimes, setSelectedOpenTimes] = useState<OpenTime[]>(loc.open_times ?? [])
  const [description, setDescription] = useState(loc.description)
  const [tips, setTips] = useState(loc.tips ?? '')
  const [website, setWebsite] = useState(loc.website ?? '')
  const [openingHours, setOpeningHours] = useState(loc.opening_hours ?? '')
  const [ageRanges, setAgeRanges] = useState<AgeRange[]>(loc.age_ranges ?? [])

  const [existingPhotos, setExistingPhotos] = useState(loc.photos ?? [])
  const [photosToDelete, setPhotosToDelete] = useState<string[]>([])
  const [newPhotos, setNewPhotos] = useState<File[]>([])
  const [newPreviews, setNewPreviews] = useState<string[]>([])

  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  function toggleTag(tag: Tag) {
    setSelectedTags((p) => p.includes(tag) ? p.filter((t) => t !== tag) : [...p, tag])
  }
  function toggleOpenTime(t: OpenTime) {
    setSelectedOpenTimes((p) => p.includes(t) ? p.filter((x) => x !== t) : [...p, t])
  }
  function toggleAgeRange(r: AgeRange) {
    setAgeRanges((p) => p.includes(r) ? p.filter((x) => x !== r) : [...p, r])
  }

  function markPhotoForDeletion(photoId: string) {
    setPhotosToDelete((p) => [...p, photoId])
    setExistingPhotos((p) => p.filter((x) => x.id !== photoId))
  }

  function handleNewFiles(files: FileList | null) {
    if (!files) return
    const valid = Array.from(files).filter(
      (f) => ['image/jpeg', 'image/png', 'image/webp'].includes(f.type) && f.size <= 5 * 1024 * 1024
    )
    const combined = [...newPhotos, ...valid].slice(0, 10 - existingPhotos.length)
    setNewPhotos(combined)
    setNewPreviews(combined.map((f) => URL.createObjectURL(f)))
  }

  function removeNewPhoto(i: number) {
    setNewPhotos((p) => p.filter((_, idx) => idx !== i))
    setNewPreviews((p) => p.filter((_, idx) => idx !== i))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (!name.trim()) { setError('Name is required'); return }
    if (selectedTags.length === 0) { setError('Select at least one tag'); return }
    if (!description.trim() || description.length < 50) { setError('Description must be at least 50 characters'); return }

    setSaving(true)

    // Delete marked photos
    for (const photoId of photosToDelete) {
      const photo = (loc.photos ?? []).find((p) => p.id === photoId)
      if (photo) {
        const pathMatch = photo.url.match(/\/Photos\/(.+)$/)
        if (pathMatch) await supabase.storage.from('Photos').remove([pathMatch[1]])
      }
      await supabase.from('location_photos').delete().eq('id', photoId)
    }

    // Upload new photos
    const { data: { user } } = await supabase.auth.getUser()
    const nextSort = existingPhotos.length > 0
      ? Math.max(...existingPhotos.map((p) => p.sort_order)) + 1
      : 0

    for (let i = 0; i < newPhotos.length; i++) {
      const file = newPhotos[i]
      const ext = file.name.split('.').pop()
      const path = `${loc.id}/${Date.now()}-${i}.${ext}`
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('Photos').upload(path, file, { upsert: true })
      if (uploadError) { setError(`Photo upload failed: ${uploadError.message}`); setSaving(false); return }
      if (uploadData) {
        const { data: urlData } = supabase.storage.from('Photos').getPublicUrl(path)
        await supabase.from('location_photos').insert({
          location_id: loc.id,
          url: urlData.publicUrl,
          sort_order: nextSort + i,
          uploaded_by: user?.id,
        })
      }
    }

    // Update location row
    const { error: updateError } = await supabase
      .from('locations')
      .update({
        name: name.trim(),
        description: description.trim(),
        address: address.place_name,
        lat: address.lat,
        lng: address.lng,
        suburb: address.suburb,
        tags: selectedTags,
        open_times: selectedOpenTimes,
        age_ranges: ageRanges,
        tips: tips.trim() || null,
        website: website.trim() || null,
        opening_hours: openingHours.trim() || null,
      })
      .eq('id', loc.id)

    if (updateError) { setError(`Update failed: ${updateError.message}`); setSaving(false); return }

    router.push('/admin')
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Name */}
      <div>
        <label className="block text-sm font-semibold text-[#2c2c2c] mb-1.5">
          Place name <span className="text-red-500">*</span>
        </label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-[#4abfc0] text-[#2c2c2c]"
          maxLength={120}
        />
      </div>

      {/* Address */}
      <div>
        <label className="block text-sm font-semibold text-[#2c2c2c] mb-1.5">
          Address / location <span className="text-red-500">*</span>
        </label>
        <AddressSearch value={address.place_name} onChange={setAddress} />
        <p className="text-xs text-[#38a5a0] mt-1">✓ {address.lat.toFixed(5)}, {address.lng.toFixed(5)}</p>
      </div>

      {/* Tags */}
      <div>
        <label className="block text-sm font-semibold text-[#2c2c2c] mb-1.5">
          What kind of place is it? <span className="text-red-500">*</span>
        </label>
        <div className="flex flex-wrap gap-2">
          {TAGS.map((tag) => (
            <button key={tag.value} type="button" onClick={() => toggleTag(tag.value)}
              className={cn(
                'flex items-center gap-1.5 px-3 py-2 rounded-xl border text-sm font-medium transition-colors cursor-pointer',
                selectedTags.includes(tag.value)
                  ? `${tag.bgColor} ${tag.color} border-transparent`
                  : 'bg-white border-gray-200 text-[#6b7280] hover:bg-[#edf8f8]'
              )}>
              {tag.emoji} {tag.label}
            </button>
          ))}
        </div>
      </div>

      {/* Open times */}
      <div>
        <label className="block text-sm font-semibold text-[#2c2c2c] mb-1.5">
          Open for <span className="text-[#6b7280] font-normal">(optional)</span>
        </label>
        <div className="flex flex-wrap gap-2">
          {OPEN_TIMES.map((t) => (
            <button key={t.value} type="button" onClick={() => toggleOpenTime(t.value)}
              className={cn(
                'flex items-center gap-1.5 px-3 py-2 rounded-xl border text-sm font-medium transition-colors cursor-pointer',
                selectedOpenTimes.includes(t.value)
                  ? `${t.bgColor} ${t.color} border-transparent`
                  : 'bg-white border-gray-200 text-[#6b7280] hover:bg-[#edf8f8]'
              )}>
              {t.emoji} {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-semibold text-[#2c2c2c] mb-1.5">
          Description <span className="text-red-500">*</span>
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          maxLength={1000}
          className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm resize-none h-32 outline-none focus:border-[#4abfc0] text-[#2c2c2c]"
        />
        <div className="flex justify-between text-xs text-[#6b7280] mt-1">
          <span>{description.length < 50 ? `${50 - description.length} more characters needed` : '✓ Good to go'}</span>
          <span>{description.length}/1000</span>
        </div>
      </div>

      {/* Tips */}
      <div>
        <label className="block text-sm font-semibold text-[#2c2c2c] mb-1.5">
          Tips <span className="text-[#6b7280] font-normal">(optional)</span>
        </label>
        <textarea
          value={tips}
          onChange={(e) => setTips(e.target.value)}
          maxLength={280}
          className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm resize-none h-20 outline-none focus:border-[#4abfc0] text-[#2c2c2c]"
        />
      </div>

      {/* Website */}
      <div>
        <label className="block text-sm font-semibold text-[#2c2c2c] mb-1.5">
          Website <span className="text-[#6b7280] font-normal">(optional)</span>
        </label>
        <input
          value={website}
          onChange={(e) => setWebsite(e.target.value)}
          type="url"
          placeholder="https://..."
          className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-[#4abfc0] text-[#2c2c2c] placeholder:text-[#6b7280]"
        />
      </div>

      {/* Opening hours */}
      <div>
        <label className="block text-sm font-semibold text-[#2c2c2c] mb-1.5">
          Opening hours <span className="text-[#6b7280] font-normal">(optional)</span>
        </label>
        <input
          value={openingHours}
          onChange={(e) => setOpeningHours(e.target.value)}
          placeholder="e.g. Mon–Fri 9am–5pm, Sat–Sun 8am–6pm"
          maxLength={200}
          className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-[#4abfc0] text-[#2c2c2c] placeholder:text-[#6b7280]"
        />
      </div>

      {/* Age ranges */}
      <div>
        <label className="block text-sm font-semibold text-[#2c2c2c] mb-1.5">Age ranges</label>
        <div className="flex flex-wrap gap-2">
          {AGE_RANGES.map((range) => (
            <button key={range.value} type="button" onClick={() => toggleAgeRange(range.value)}
              className={cn(
                'px-3 py-1.5 rounded-xl border text-sm font-medium transition-colors cursor-pointer',
                ageRanges.includes(range.value)
                  ? 'bg-[#f7eed9] text-[#9e7c48] border-transparent'
                  : 'bg-white border-gray-200 text-[#6b7280] hover:bg-[#f7eed9]'
              )}>
              {range.label}
            </button>
          ))}
        </div>
      </div>

      {/* Photos */}
      <div>
        <label className="block text-sm font-semibold text-[#2c2c2c] mb-1.5">
          Photos <span className="text-[#6b7280] font-normal">(optional, max 10 total, ≤5MB each)</span>
        </label>

        {existingPhotos.length > 0 && (
          <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 mb-3">
            {existingPhotos.map((photo) => (
              <div key={photo.id} className="relative aspect-square rounded-xl overflow-hidden bg-gray-100 group">
                <img src={photo.url} alt="" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => markPhotoForDeletion(photo.id)}
                  className="absolute top-1 right-1 w-6 h-6 rounded-full bg-black/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}

        {newPreviews.length > 0 && (
          <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 mb-3">
            {newPreviews.map((src, i) => (
              <div key={i} className="relative aspect-square rounded-xl overflow-hidden bg-gray-100 group">
                <img src={src} alt="" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => removeNewPhoto(i)}
                  className="absolute top-1 right-1 w-6 h-6 rounded-full bg-black/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}

        {existingPhotos.length + newPhotos.length < 10 && (
          <label className="flex flex-col items-center justify-center border-2 border-dashed border-gray-200 rounded-2xl p-6 cursor-pointer hover:border-[#4abfc0] hover:bg-[#edf8f8] transition-colors">
            <Upload className="w-6 h-6 text-[#6b7280] mb-2" />
            <span className="text-sm text-[#6b7280]">Click to upload photos</span>
            <span className="text-xs text-[#6b7280] mt-0.5">JPEG, PNG, WEBP</span>
            <input type="file" accept="image/jpeg,image/png,image/webp" multiple className="hidden"
              onChange={(e) => handleNewFiles(e.target.files)} />
          </label>
        )}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">{error}</div>
      )}

      <div className="flex gap-3">
        <Button type="submit" size="lg" className="flex-1 justify-center" loading={saving}>
          Save changes
        </Button>
        <Button type="button" variant="ghost" size="lg" onClick={() => router.push('/admin')}>
          Cancel
        </Button>
      </div>
    </form>
  )
}
