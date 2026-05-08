'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/auth/AuthProvider'
import SignInModal from '@/components/auth/SignInModal'
import AddressSearch from '@/components/forms/AddressSearch'
import VenueSearch, { type PlaceResult } from '@/components/forms/VenueSearch'
import Button from '@/components/ui/Button'
import { createClient } from '@/lib/supabase/client'
import { TAGS, OPEN_TIMES, AGE_RANGES } from '@/lib/constants'
import type { Tag, OpenTime, AgeRange } from '@/lib/types'
import { Upload, X, MapPin } from 'lucide-react'
import { cn } from '@/lib/utils'

interface AddressData {
  place_name: string
  lat: number
  lng: number
  suburb: string
}

export default function SubmitForm() {
  const { user, session } = useAuth()
  const router = useRouter()
  const [showSignIn, setShowSignIn] = useState(false)

  const [name, setName] = useState('')
  const [address, setAddress] = useState<AddressData | null>(null)
  const [selectedTags, setSelectedTags] = useState<Tag[]>([])
  const [selectedOpenTimes, setSelectedOpenTimes] = useState<OpenTime[]>([])
  const [description, setDescription] = useState('')
  const [tips, setTips] = useState('')
  const [website, setWebsite] = useState('')
  const [openingHours, setOpeningHours] = useState('')
  const [ageRanges, setAgeRanges] = useState<AgeRange[]>([])
  const [venueSelected, setVenueSelected] = useState(false)
  const [photos, setPhotos] = useState<File[]>([])
  const [previews, setPreviews] = useState<string[]>([])
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)

  if (!user) return (
    <>
      <div className="bg-[#edf8f8] border border-[#aadbd8] rounded-2xl p-8 text-center">
        <div className="text-4xl mb-4">📍</div>
        <h2 className="text-xl font-bold text-[#2c2c2c] mb-2">Add a kid-friendly spot</h2>
        <p className="text-sm text-[#4b5563] mb-6 max-w-xs mx-auto leading-relaxed">
          Know a cafe with a play area that other parents would love? Sign in for free — it only takes 2 minutes to add it to the map.
        </p>
        <div className="flex flex-col gap-3 max-w-xs mx-auto mb-6">
          {[
            '📍 Pin it on the map for families nearby',
            '🛝 Describe the play setup in detail',
            '⭐ Help parents make better decisions',
          ].map((line) => (
            <div key={line} className="flex items-start gap-2 text-sm text-[#4b5563] text-left">
              <span className="shrink-0">{line.slice(0, 2)}</span>
              <span>{line.slice(3)}</span>
            </div>
          ))}
        </div>
        <Button size="lg" onClick={() => setShowSignIn(true)}>Sign in to add a place</Button>
        <p className="text-xs text-[#9ca3af] mt-4">Free · No password needed · Reviewed before going live</p>
      </div>
      {showSignIn && <SignInModal onClose={() => setShowSignIn(false)} />}
    </>
  )

  if (done) return (
    <div className="bg-[#edf8f8] border border-[#aadbd8] rounded-2xl p-8 text-center">
      <div className="text-4xl mb-3">🎉</div>
      <h2 className="text-xl font-bold text-[#2c2c2c] mb-2">Thanks! Your submission is under review.</h2>
      <p className="text-sm text-[#6b7280] mb-6">We&apos;ll have it live as soon as our team takes a look.</p>
      <div className="flex gap-3 justify-center">
        <Button variant="secondary" onClick={() => router.push('/')}>Go home</Button>
        <Button onClick={() => {
          setDone(false); setName(''); setAddress(null); setSelectedTags([])
          setSelectedOpenTimes([]); setDescription(''); setTips(''); setAgeRanges([])
          setPhotos([]); setPreviews([])
        }}>
          Add another
        </Button>
      </div>
    </div>
  )

  function handleVenueSelect(result: PlaceResult) {
    setName(result.name)
    setAddress({ place_name: result.address, lat: result.lat, lng: result.lng, suburb: result.suburb })
    if (result.website) setWebsite(result.website)
    if (result.opening_hours) setOpeningHours(result.opening_hours)
    setVenueSelected(true)
  }

  function clearVenue() {
    setName('')
    setAddress(null)
    setWebsite('')
    setOpeningHours('')
    setVenueSelected(false)
  }

  function toggleTag(tag: Tag) {
    setSelectedTags((prev) => prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag])
  }

  function toggleOpenTime(time: OpenTime) {
    setSelectedOpenTimes((prev) => prev.includes(time) ? prev.filter((t) => t !== time) : [...prev, time])
  }

  function toggleAgeRange(range: AgeRange) {
    setAgeRanges((prev) => prev.includes(range) ? prev.filter((r) => r !== range) : [...prev, range])
  }

  function handlePhotoFiles(files: FileList | null) {
    if (!files) return
    const newFiles = Array.from(files).filter(
      (f) => ['image/jpeg', 'image/png', 'image/webp'].includes(f.type) && f.size <= 5 * 1024 * 1024
    )
    const combined = [...photos, ...newFiles].slice(0, 10)
    setPhotos(combined)
    setPreviews(combined.map((f) => URL.createObjectURL(f)))
  }

  function removePhoto(i: number) {
    setPhotos((p) => p.filter((_, idx) => idx !== i))
    setPreviews((p) => p.filter((_, idx) => idx !== i))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (!name.trim()) { setError('Name is required'); return }
    if (!address) { setError('Address is required'); return }
    if (selectedTags.length === 0) { setError('Select at least one tag'); return }
    if (!description.trim() || description.length < 30) { setError('Description must be at least 30 characters'); return }

    if (!user) return
    setSubmitting(true)
    const supabase = createClient(session?.access_token)

    const locRes = await fetch('/api/submit/location', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: name.trim(),
        address: address.place_name,
        lat: address.lat,
        lng: address.lng,
        suburb: address.suburb,
        tags: selectedTags,
        open_times: selectedOpenTimes,
        age_ranges: ageRanges,
        description: description.trim(),
        tips: tips.trim() || null,
        website: website.trim() || null,
        opening_hours: openingHours.trim() || null,
      }),
    })

    if (!locRes.ok) {
      const data = await locRes.json()
      setError(`Submission failed: ${data.error ?? 'unknown error'}`)
      setSubmitting(false)
      return
    }

    const loc = await locRes.json()

    for (let i = 0; i < photos.length; i++) {
      const file = photos[i]
      const ext = file.name.split('.').pop()
      const path = `${loc.id}/${i}.${ext}`
      const { data: uploadData, error: uploadError } = await supabase.storage.from('Photos').upload(path, file, { upsert: true })
      if (uploadError) {
        console.error('[photo upload] failed:', uploadError.message, { path, bucket: 'Photos' })
        setError(`Photo upload failed: ${uploadError.message}`)
        setSubmitting(false)
        return
      }
      if (uploadData) {
        const { data: urlData } = supabase.storage.from('Photos').getPublicUrl(path)
        const { error: insertError } = await supabase.from('location_photos').insert({
          location_id: loc.id,
          url: urlData.publicUrl,
          sort_order: i,
          uploaded_by: user.id,
        })
        if (insertError) console.error('[photo insert] failed:', insertError.message)
      }
    }

    setSubmitting(false)
    setDone(true)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Venue search shortcut */}
      <div className="bg-[#f0fbfb] border border-[#b5e6e6] rounded-2xl p-4">
        <label className="block text-sm font-semibold text-[#2c2c2c] mb-1">
          Find your venue <span className="text-[#6b7280] font-normal">(optional shortcut)</span>
        </label>
        <p className="text-xs text-[#6b7280] mb-2.5">Search by business name to auto-fill details below.</p>
        {venueSelected ? (
          <div className="flex items-center justify-between bg-white border border-[#a5dede] rounded-xl px-3 py-2.5">
            <span className="text-sm text-[#38a5a0] font-medium truncate">✓ Auto-filled from &ldquo;{name}&rdquo;</span>
            <button type="button" onClick={clearVenue} className="text-xs text-[#6b7280] hover:text-red-500 transition-colors ml-3 shrink-0 cursor-pointer">Clear ×</button>
          </div>
        ) : (
          <VenueSearch onSelect={handleVenueSelect} />
        )}
      </div>

      {/* Name */}
      <div>
        <label className="block text-sm font-semibold text-[#2c2c2c] mb-1.5">
          Place name <span className="text-red-500">*</span>
        </label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. The Grounds of Alexandria"
          className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-[#4abfc0] text-[#2c2c2c] placeholder:text-[#6b7280]"
          maxLength={120}
        />
      </div>

      {/* Address */}
      <div>
        <label className="block text-sm font-semibold text-[#2c2c2c] mb-1.5">
          Address / location <span className="text-red-500">*</span>
        </label>
        {venueSelected && address ? (
          <div className="flex items-center justify-between border border-gray-200 rounded-xl px-3 py-2.5 bg-gray-50">
            <div className="flex items-center gap-2 min-w-0">
              <MapPin className="w-4 h-4 text-[#6b7280] shrink-0" />
              <span className="text-sm text-[#2c2c2c] truncate">{address.place_name}</span>
            </div>
            <button type="button" onClick={clearVenue} className="text-xs text-[#38a5a0] hover:underline ml-3 shrink-0 cursor-pointer">Change</button>
          </div>
        ) : (
          <AddressSearch value={address?.place_name ?? ''} onChange={setAddress} />
        )}
        {address && (
          <p className="text-xs text-[#38a5a0] mt-1">✓ Geocoded: {address.lat.toFixed(5)}, {address.lng.toFixed(5)}</p>
        )}
      </div>

      {/* Tags */}
      <div>
        <label className="block text-sm font-semibold text-[#2c2c2c] mb-1.5">
          What kind of place is it? <span className="text-red-500">*</span>
          <span className="text-[#6b7280] font-normal ml-1">(select all that apply)</span>
        </label>
        <div className="flex flex-wrap gap-2">
          {TAGS.map((tag) => (
            <button
              key={tag.value}
              type="button"
              onClick={() => toggleTag(tag.value)}
              className={cn(
                'flex items-center gap-1.5 px-3 py-2 rounded-xl border text-sm font-medium transition-colors cursor-pointer',
                selectedTags.includes(tag.value)
                  ? `${tag.bgColor} ${tag.color} border-transparent`
                  : 'bg-white border-gray-200 text-[#6b7280] hover:bg-[#edf8f8]'
              )}
            >
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
            <button
              key={t.value}
              type="button"
              onClick={() => toggleOpenTime(t.value)}
              className={cn(
                'flex items-center gap-1.5 px-3 py-2 rounded-xl border text-sm font-medium transition-colors cursor-pointer',
                selectedOpenTimes.includes(t.value)
                  ? `${t.bgColor} ${t.color} border-transparent`
                  : 'bg-white border-gray-200 text-[#6b7280] hover:bg-[#edf8f8]'
              )}
            >
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
          placeholder="What's the play area like? What can parents eat or drink while kids play? How long can kids keep themselves busy? What to expect…"
          className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm resize-none h-32 outline-none focus:border-[#4abfc0] text-[#2c2c2c] placeholder:text-[#6b7280]"
        />
        <div className="flex justify-between text-xs text-[#6b7280] mt-1">
          <span>{description.length < 30 ? `${30 - description.length} more characters needed` : '✓ Good to go'}</span>
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
          placeholder="e.g. 'Bring your own food', 'Parking tricky on weekends', 'Arrive before 10am'…"
          className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm resize-none h-20 outline-none focus:border-[#4abfc0] text-[#2c2c2c] placeholder:text-[#6b7280]"
        />
        <p className="text-xs text-[#6b7280] mt-1 text-right">{tips.length}/280</p>
      </div>

      {/* Website */}
      <div>
        <label className="block text-sm font-semibold text-[#2c2c2c] mb-1.5">
          Website <span className="text-[#6b7280] font-normal">(optional)</span>
          {venueSelected && website && <span className="text-xs text-[#38a5a0] ml-2">✓ auto-filled</span>}
        </label>
        <input
          value={website}
          onChange={(e) => setWebsite(e.target.value)}
          placeholder="https://..."
          type="url"
          className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-[#4abfc0] text-[#2c2c2c] placeholder:text-[#6b7280]"
        />
      </div>

      {/* Opening hours */}
      <div>
        <label className="block text-sm font-semibold text-[#2c2c2c] mb-1.5">
          Opening hours <span className="text-[#6b7280] font-normal">(optional)</span>
          {venueSelected && openingHours && <span className="text-xs text-[#38a5a0] ml-2">✓ auto-filled</span>}
        </label>
        <textarea
          value={openingHours}
          onChange={(e) => setOpeningHours(e.target.value)}
          placeholder="e.g. Mon–Fri 9am–5pm, Sat–Sun 8am–6pm"
          maxLength={500}
          rows={openingHours.includes('\n') ? 7 : 2}
          className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-[#4abfc0] text-[#2c2c2c] placeholder:text-[#6b7280] resize-none"
        />
      </div>

      {/* Age ranges */}
      <div>
        <label className="block text-sm font-semibold text-[#2c2c2c] mb-1.5">Age ranges</label>
        <div className="flex flex-wrap gap-2">
          {AGE_RANGES.map((range) => (
            <button
              key={range.value}
              type="button"
              onClick={() => toggleAgeRange(range.value)}
              className={cn(
                'px-3 py-1.5 rounded-xl border text-sm font-medium transition-colors cursor-pointer',
                ageRanges.includes(range.value)
                  ? 'bg-[#f7eed9] text-[#9e7c48] border-transparent'
                  : 'bg-white border-gray-200 text-[#6b7280] hover:bg-[#f7eed9]'
              )}
            >
              {range.label}
            </button>
          ))}
        </div>
      </div>

      {/* Photos */}
      <div>
        <label className="block text-sm font-semibold text-[#2c2c2c] mb-1.5">
          Photos <span className="text-[#6b7280] font-normal">(optional, max 10, ≤5MB each)</span>
        </label>

        {previews.length > 0 && (
          <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 mb-3">
            {previews.map((src, i) => (
              <div key={i} className="relative aspect-square rounded-xl overflow-hidden bg-gray-100 group">
                <img src={src} alt="" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => removePhoto(i)}
                  className="absolute top-1 right-1 w-6 h-6 rounded-full bg-black/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}

        {photos.length < 10 && (
          <label className="flex flex-col items-center justify-center border-2 border-dashed border-gray-200 rounded-2xl p-6 cursor-pointer hover:border-[#4abfc0] hover:bg-[#edf8f8] transition-colors">
            <Upload className="w-6 h-6 text-[#6b7280] mb-2" />
            <span className="text-sm text-[#6b7280]">Click to upload photos</span>
            <span className="text-xs text-[#6b7280] mt-0.5">JPEG, PNG, WEBP</span>
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              multiple
              className="hidden"
              onChange={(e) => handlePhotoFiles(e.target.files)}
            />
          </label>
        )}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">
          {error}
        </div>
      )}

      <Button type="submit" size="lg" className="w-full justify-center" loading={submitting}>
        Submit for review
      </Button>
    </form>
  )
}
