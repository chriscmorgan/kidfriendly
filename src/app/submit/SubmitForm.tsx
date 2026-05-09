'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/auth/AuthProvider'
import SignInModal from '@/components/auth/SignInModal'
import AddressSearch from '@/components/forms/AddressSearch'
import VenueSearch, { type PlaceResult } from '@/components/forms/VenueSearch'
import Button from '@/components/ui/Button'
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
  const { user } = useAuth()
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
      <div className="bg-parchment border border-border rounded p-8 text-center">
        <h2 className="font-display italic font-700 text-xl text-ink mb-2">Sign in to add a place</h2>
        <p className="text-sm text-stone mb-6 max-w-xs mx-auto leading-relaxed">
          Know a cafe or spot with a play area? Your listing helps another Melbourne family find it — and gives a small local business the kind of word-of-mouth it can&apos;t buy. Free account, takes about 2 minutes.
        </p>
        <Button size="lg" onClick={() => setShowSignIn(true)}>Sign in to add a place</Button>
        <p className="text-xs text-stone mt-4">Free · Sign up with Google or email · Reviewed before going live</p>
      </div>
      {showSignIn && <SignInModal onClose={() => setShowSignIn(false)} />}
    </>
  )

  if (done) return (
    <div className="bg-parchment border border-border rounded p-8 text-center">
      <h2 className="font-display italic font-700 text-xl text-ink mb-2">Thanks — submitted for review.</h2>
      <p className="text-sm text-stone mb-6">We&apos;ll have it live as soon as we take a look.</p>
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
      const fd = new FormData()
      fd.append('file', file)
      fd.append('location_id', loc.id)
      fd.append('sort_order', String(i))
      const uploadRes = await fetch('/api/photos', { method: 'POST', body: fd })
      if (!uploadRes.ok) {
        const err = await uploadRes.json().catch(() => ({ error: 'Upload failed' }))
        console.error('[photo upload] failed:', err.error, { path })
        setError(`Photo upload failed: ${err.error}`)
        setSubmitting(false)
        return
      }
    }

    setSubmitting(false)
    setDone(true)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Venue search shortcut */}
      <div className="bg-parchment border border-border rounded p-4">
        <label className="block text-sm font-semibold text-ink mb-1">
          Find your venue <span className="text-stone font-normal">(optional shortcut)</span>
        </label>
        <p className="text-xs text-stone mb-2.5">Search by business name to auto-fill details below.</p>
        {venueSelected ? (
          <div className="flex items-center justify-between bg-paper border border-border rounded px-3 py-2.5">
            <span className="text-sm text-rust font-medium truncate">✓ Auto-filled from &ldquo;{name}&rdquo;</span>
            <button type="button" onClick={clearVenue} className="text-xs text-stone hover:text-red-500 transition-colors ml-3 shrink-0 cursor-pointer">Clear ×</button>
          </div>
        ) : (
          <VenueSearch onSelect={handleVenueSelect} />
        )}
      </div>

      {/* Name */}
      <div>
        <label className="block text-sm font-semibold text-ink mb-1.5">
          Place name <span className="text-red-500">*</span>
        </label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Auction Rooms, Proud Mary…"
          className="w-full border border-border rounded px-3 py-2.5 text-sm outline-none focus:border-rust text-ink placeholder:text-stone"
          maxLength={120}
        />
      </div>

      {/* Address */}
      <div>
        <label className="block text-sm font-semibold text-ink mb-1.5">
          Address / location <span className="text-red-500">*</span>
        </label>
        {venueSelected && address ? (
          <div className="flex items-center justify-between border border-border rounded px-3 py-2.5 bg-parchment">
            <div className="flex items-center gap-2 min-w-0">
              <MapPin className="w-4 h-4 text-stone shrink-0" />
              <span className="text-sm text-ink truncate">{address.place_name}</span>
            </div>
            <button type="button" onClick={clearVenue} className="text-xs text-rust hover:underline ml-3 shrink-0 cursor-pointer">Change</button>
          </div>
        ) : (
          <AddressSearch value={address?.place_name ?? ''} onChange={setAddress} />
        )}
        {address && (
          <p className="text-xs text-rust mt-1">✓ Geocoded: {address.lat.toFixed(5)}, {address.lng.toFixed(5)}</p>
        )}
      </div>

      {/* Tags */}
      <div>
        <label className="block text-sm font-semibold text-ink mb-1.5">
          What kind of place is it? <span className="text-red-500">*</span>
          <span className="text-stone font-normal ml-1">(select all that apply)</span>
        </label>
        <div className="flex flex-wrap gap-2">
          {TAGS.map((tag) => (
            <button
              key={tag.value}
              type="button"
              onClick={() => toggleTag(tag.value)}
              className={cn(
                'flex items-center gap-1.5 px-3 py-2 rounded border text-sm font-medium transition-colors cursor-pointer',
                selectedTags.includes(tag.value)
                  ? `${tag.bgColor} ${tag.color} border-transparent`
                  : 'bg-paper border-border text-stone hover:bg-rust-light'
              )}
            >
              {tag.emoji} {tag.label}
            </button>
          ))}
        </div>
      </div>

      {/* Open times */}
      <div>
        <label className="block text-sm font-semibold text-ink mb-1.5">
          Open for <span className="text-stone font-normal">(optional)</span>
        </label>
        <div className="flex flex-wrap gap-2">
          {OPEN_TIMES.map((t) => (
            <button
              key={t.value}
              type="button"
              onClick={() => toggleOpenTime(t.value)}
              className={cn(
                'flex items-center gap-1.5 px-3 py-2 rounded border text-sm font-medium transition-colors cursor-pointer',
                selectedOpenTimes.includes(t.value)
                  ? `${t.bgColor} ${t.color} border-transparent`
                  : 'bg-paper border-border text-stone hover:bg-rust-light'
              )}
            >
              {t.emoji} {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-semibold text-ink mb-1.5">
          Description <span className="text-red-500">*</span>
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          maxLength={1000}
          placeholder="What's the play area like? What can parents eat or drink while kids play? How long can kids keep themselves busy? What to expect…"
          className="w-full border border-border rounded px-3 py-2.5 text-sm resize-none h-32 outline-none focus:border-rust text-ink placeholder:text-stone"
        />
        <div className="flex justify-between text-xs text-stone mt-1">
          <span>{description.length < 30 ? `${30 - description.length} more characters needed` : '✓ Good to go'}</span>
          <span>{description.length}/1000</span>
        </div>
      </div>

      {/* Tips */}
      <div>
        <label className="block text-sm font-semibold text-ink mb-1.5">
          Tips <span className="text-stone font-normal">(optional)</span>
        </label>
        <textarea
          value={tips}
          onChange={(e) => setTips(e.target.value)}
          maxLength={280}
          placeholder="e.g. 'Bring your own food', 'Parking tricky on weekends', 'Arrive before 10am'…"
          className="w-full border border-border rounded px-3 py-2.5 text-sm resize-none h-20 outline-none focus:border-rust text-ink placeholder:text-stone"
        />
        <p className="text-xs text-stone mt-1 text-right">{tips.length}/280</p>
      </div>

      {/* Website */}
      <div>
        <label className="block text-sm font-semibold text-ink mb-1.5">
          Website <span className="text-stone font-normal">(optional)</span>
          {venueSelected && website && <span className="text-xs text-rust ml-2">✓ auto-filled</span>}
        </label>
        <input
          value={website}
          onChange={(e) => setWebsite(e.target.value)}
          placeholder="https://..."
          type="url"
          className="w-full border border-border rounded px-3 py-2.5 text-sm outline-none focus:border-rust text-ink placeholder:text-stone"
        />
      </div>

      {/* Opening hours */}
      <div>
        <label className="block text-sm font-semibold text-ink mb-1.5">
          Opening hours <span className="text-stone font-normal">(optional)</span>
          {venueSelected && openingHours && <span className="text-xs text-rust ml-2">✓ auto-filled</span>}
        </label>
        <textarea
          value={openingHours}
          onChange={(e) => setOpeningHours(e.target.value)}
          placeholder="e.g. Mon–Fri 9am–5pm, Sat–Sun 8am–6pm"
          maxLength={500}
          rows={openingHours.includes('\n') ? 7 : 2}
          className="w-full border border-border rounded px-3 py-2.5 text-sm outline-none focus:border-rust text-ink placeholder:text-stone resize-none"
        />
      </div>

      {/* Age ranges */}
      <div>
        <label className="block text-sm font-semibold text-ink mb-1.5">Age ranges</label>
        <div className="flex flex-wrap gap-2">
          {AGE_RANGES.map((range) => (
            <button
              key={range.value}
              type="button"
              onClick={() => toggleAgeRange(range.value)}
              className={cn(
                'px-3 py-1.5 rounded border text-sm font-medium transition-colors cursor-pointer',
                ageRanges.includes(range.value)
                  ? 'bg-[#f7eed9] text-[#9e7c48] border-transparent'
                  : 'bg-paper border-border text-stone hover:bg-[#f7eed9]'
              )}
            >
              {range.label}
            </button>
          ))}
        </div>
      </div>

      {/* Photos */}
      <div>
        <label className="block text-sm font-semibold text-ink mb-1.5">
          Photos <span className="text-stone font-normal">(optional, max 10, ≤5MB each)</span>
        </label>
        <p className="text-xs text-stone mb-2.5 leading-relaxed">
          Photos must be your own — by uploading you confirm you took them and have the right to share them. Please don&apos;t include images where individuals can be identified (faces of adults or children).
        </p>

        {previews.length > 0 && (
          <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 mb-3">
            {previews.map((src, i) => (
              <div key={i} className="relative aspect-square rounded overflow-hidden bg-parchment group">
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
          <label className="flex flex-col items-center justify-center border-2 border-dashed border-border rounded p-6 cursor-pointer hover:border-rust hover:bg-rust-light transition-colors">
            <Upload className="w-6 h-6 text-stone mb-2" />
            <span className="text-sm text-stone">Click to upload photos</span>
            <span className="text-xs text-stone mt-0.5">JPEG, PNG, WEBP</span>
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
        <div className="bg-red-50 border border-red-200 text-red-700 rounded px-4 py-3 text-sm">
          {error}
        </div>
      )}

      <Button type="submit" size="lg" className="w-full justify-center" loading={submitting}>
        Submit for review
      </Button>
    </form>
  )
}
