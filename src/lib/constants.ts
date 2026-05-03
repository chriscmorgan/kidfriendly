import type { Category, AgeRange } from './types'

export const CATEGORIES: {
  value: Category
  label: string
  emoji: string
  color: string
  bgColor: string
}[] = [
  { value: 'playground', label: 'Playground', emoji: '🛝', color: 'text-green-700', bgColor: 'bg-green-100' },
  { value: 'food_cafe', label: 'Food & Cafe', emoji: '🍔', color: 'text-orange-700', bgColor: 'bg-orange-100' },
  { value: 'activities', label: 'Activities', emoji: '🎨', color: 'text-purple-700', bgColor: 'bg-purple-100' },
  { value: 'nature', label: 'Nature', emoji: '🌿', color: 'text-emerald-700', bgColor: 'bg-emerald-100' },
  { value: 'stuff', label: 'Stuff', emoji: '🛍️', color: 'text-pink-700', bgColor: 'bg-pink-100' },
  { value: 'entertainment', label: 'Entertainment', emoji: '🎠', color: 'text-blue-700', bgColor: 'bg-blue-100' },
  { value: 'sport_swim', label: 'Sport & Swim', emoji: '🏊', color: 'text-cyan-700', bgColor: 'bg-cyan-100' },
]

export const AGE_RANGES: { value: AgeRange; label: string }[] = [
  { value: 'toddler', label: 'Toddler (0–2)' },
  { value: 'preschool', label: 'Preschool (3–5)' },
  { value: 'primary', label: 'Primary (6–12)' },
  { value: 'all_ages', label: 'All ages' },
]

export const RADIUS_OPTIONS = [
  { value: 2, label: '2km' },
  { value: 5, label: '5km' },
  { value: 10, label: '10km' },
  { value: 20, label: '20km' },
]

export const RATING_DIMENSIONS = [
  { key: 'food', label: 'Food quality', emoji: '🍽️' },
  { key: 'noise', label: 'Noise level', emoji: '📢' },
  { key: 'safety', label: 'Safety', emoji: '🔒' },
  { key: 'cleanliness', label: 'Cleanliness', emoji: '🧹' },
  { key: 'access', label: 'Parking & Access', emoji: '🅿️' },
  { key: 'weather', label: 'Weather dependency', emoji: '🌦️' },
  { key: 'age_suitability', label: 'Age suitability', emoji: '👶' },
] as const

export const DEFAULT_RADIUS = 10
export const DEFAULT_MAP_CENTER = { lng: 151.2093, lat: -33.8688 } // Sydney
export const DEFAULT_MAP_ZOOM = 11
