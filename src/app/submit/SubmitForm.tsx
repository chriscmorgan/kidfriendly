'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/auth/AuthProvider'
import SignInModal from '@/components/auth/SignInModal'
import AddressSearch from '@/components/forms/AddressSearch'
import Button from '@/components/ui/Button'
import { createClient } from '@/lib/supabase/client'
import { CATEGORIES, AGE_RANGES } from '@/lib/constants'
import { slugify } from '@/lib/utils'
import type { Category, AgeRange } from '@/lib/types'
import { Upload, X } from 'lucide-react'
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
  const [primaryCat, setPrimaryCat] = useState<Category | ''>('')
  const [additionalCats, setAdditionalCats] = useState<Category[]>([])
  const [description, setDescription] = useState('')
  const [tips, setTips] = useState('')
  const [ageRanges, setAgeRanges] = useState<AgeRange[]>([])
  const [photos, setPhotos] = useState<File[]>([])
  const [previews, setPreviews] = useState<string[]>([])
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)

  if (!user) return (
    <>
      <div className="bg-[#f2f7f2] border border-[#c1d9bf] rounded-2xl p-8 text-center">
        <div className="text-4xl mb-3">🔒</div>
        <p className="font-semibold text-[#2c2c2c] mb-1">Sign in to add a place</p>
        <p className="text-sm text-[#6b7280] mb-4">You need an account to submit new locations.</p>
        <Button onClick={() => setShowSignIn(true)}>Sign in</Button>
      </div>
      {showSignIn && <SignInModal onClose={() => setShowSignIn(false)} />}
    </>
  )

  if (done) return (
    <div className="bg-[#f2f7f2] border border-[#c1d9bf] rounded-2xl p-8 text-center">
      <div className="text-4xl mb-3">🎉</div>
      <h2 className="text-xl font-bold text-[#2c2c2c] mb-2">Thanks! Your submission is under review.</h2>
      <p className="text-sm text-[#6b7280] mb-6">We&apos;ll have it live as soon as our team takes a look.</p>
      <div className="flex gap-3 justify-center">
        <Button variant="secondary" onClick={() => router.push('/')}>Go home</Button>
        <Button onClick={() => { setDone(false); setName(''); setAddress(null); setPrimaryCat(''); setAdditionalCats([]); setDescription(''); setTips(''); setAgeRanges([]); setPhotos([]); setPreviews([]) }}>
          Add another
        </Button>
      </div>
    </div>
  )

  function toggleAdditionalCat(cat: Category) {
    setAdditionalCats((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : prev.length < 3 ? [...prev, cat] : prev
    )
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
    if (!primaryCat) { setError('Primary category is required'); return }
    if (!description.trim() || description.length < 50) { setError('Description must be at least 50 characters'); return }
    if (photos.length === 0) { setError('At least one photo is required'); return }

    if (!user) return
    setSubmitting(true)
    const supabase = createClient()
    const slug = slugify(name) + '-' + Math.random().toString(36).slice(2, 7)

    const { data: loc, error: locError } = await supabase
      .from('locations')
      .insert({
        slug,
        name: name.trim(),
        description: description.trim(),
        address: address.place_name,
        lat: address.lat,
        lng: address.lng,
        suburb: address.suburb,
        primary_category: primaryCat,
        additional_categories: additionalCats,
        age_ranges: ageRanges,
        tips: tips.trim() || null,
        submitted_by: user.id,
        status: 'pending',
      })
      .select('id')
      .single()

    if (locError || !loc) { setError('Failed to submit. Please try again.'); setSubmitting(false); return }

    // Upload photos
    for (let i = 0; i < photos.length; i++) {
      const file = photos[i]
      const ext = file.name.split('.').pop()
      const path = `${loc.id}/${i}.${ext}`
      const { data: uploadData } = await supabase.storage.from('location-photos').upload(path, file, { upsert: true })
      if (uploadData) {
        const { data: urlData } = supabase.storage.from('location-photos').getPublicUrl(path)
        await supabase.from('location_photos').insert({
          location_id: loc.id,
          url: urlData.publicUrl,
          sort_order: i,
          uploaded_by: user.id,
        })
      }
    }

    setSubmitting(false)
    setDone(true)
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
          placeholder="e.g. Rushcutters Bay Park"
          className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-[#7da87b] text-[#2c2c2c] placeholder:text-[#6b7280]"
          maxLength={120}
        />
      </div>

      {/* Address */}
      <div>
        <label className="block text-sm font-semibold text-[#2c2c2c] mb-1.5">
          Address / location <span className="text-red-500">*</span>
        </label>
        <AddressSearch value={address?.place_name ?? ''} onChange={setAddress} />
        {address && (
          <p className="text-xs text-[#5e8e5c] mt-1">✓ Geocoded: {address.lat.toFixed(5)}, {address.lng.toFixed(5)}</p>
        )}
      </div>

      {/* Categories */}
      <div>
        <label className="block text-sm font-semibold text-[#2c2c2c] mb-1.5">
          Primary category <span className="text-red-500">*</span>
        </label>
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.value}
              type="button"
              onClick={() => setPrimaryCat(cat.value)}
              className={cn(
                'flex items-center gap-1.5 px-3 py-2 rounded-xl border text-sm font-medium transition-colors cursor-pointer',
                primaryCat === cat.value
                  ? `${cat.bgColor} ${cat.color} border-transparent`
                  : 'bg-white border-gray-200 text-[#6b7280] hover:bg-[#f2f7f2]'
              )}
            >
              {cat.emoji} {cat.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold text-[#2c2c2c] mb-1">
          Additional categories <span className="text-[#6b7280] font-normal">(up to 3)</span>
        </label>
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.filter((c) => c.value !== primaryCat).map((cat) => (
            <button
              key={cat.value}
              type="button"
              onClick={() => toggleAdditionalCat(cat.value)}
              className={cn(
                'flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-sm font-medium transition-colors cursor-pointer',
                additionalCats.includes(cat.value)
                  ? `${cat.bgColor} ${cat.color} border-transparent`
                  : 'bg-white border-gray-200 text-[#6b7280] hover:bg-[#f2f7f2]'
              )}
            >
              {cat.emoji} {cat.label}
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
          placeholder="What makes this place great for kids? Describe what's there, what you can do, what to expect…"
          className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm resize-none h-32 outline-none focus:border-[#7da87b] text-[#2c2c2c] placeholder:text-[#6b7280]"
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
          placeholder="e.g. 'Bring your own food', 'Parking tricky on weekends', 'Arrive before 10am'…"
          className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm resize-none h-20 outline-none focus:border-[#7da87b] text-[#2c2c2c] placeholder:text-[#6b7280]"
        />
        <p className="text-xs text-[#6b7280] mt-1 text-right">{tips.length}/280</p>
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
          Photos <span className="text-red-500">*</span>{' '}
          <span className="text-[#6b7280] font-normal">(min 1, max 10, ≤5MB each)</span>
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
          <label className="flex flex-col items-center justify-center border-2 border-dashed border-gray-200 rounded-2xl p-6 cursor-pointer hover:border-[#7da87b] hover:bg-[#f2f7f2] transition-colors">
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

      {/* Error */}
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
