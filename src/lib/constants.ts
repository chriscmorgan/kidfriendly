import type { Tag, OpenTime, AgeRange } from './types'

export const TAGS: {
  value: Tag
  label: string
  emoji: string
  color: string
  bgColor: string
  pinColor: string
}[] = [
  { value: 'indoor_playground',  label: 'Has indoor playground',     emoji: '🛝', color: 'text-purple-700', bgColor: 'bg-purple-100', pinColor: '#9333ea' },
  { value: 'kids_play_area',     label: 'Has kids play area',        emoji: '🏠', color: 'text-blue-700',   bgColor: 'bg-blue-100',   pinColor: '#2563eb' },
  { value: 'adjacent_playground',label: 'Next to a playground',      emoji: '🌳', color: 'text-green-700',  bgColor: 'bg-green-100',  pinColor: '#16a34a' },
  { value: 'outdoor_run_area',   label: 'Outdoor space for kids',    emoji: '🏃', color: 'text-orange-700', bgColor: 'bg-orange-100', pinColor: '#ea580c' },
  { value: 'play_centre',        label: 'Play centre',               emoji: '🎪', color: 'text-pink-700',   bgColor: 'bg-pink-100',   pinColor: '#db2777' },
]

export const OPEN_TIMES: {
  value: OpenTime
  label: string
  emoji: string
  color: string
  bgColor: string
}[] = [
  { value: 'breakfast', label: 'Breakfast', emoji: '☕', color: 'text-amber-700',  bgColor: 'bg-amber-100'  },
  { value: 'lunch',     label: 'Lunch',     emoji: '🥗', color: 'text-lime-700',   bgColor: 'bg-lime-100'   },
  { value: 'dinner',    label: 'Dinner',    emoji: '🌙', color: 'text-indigo-700', bgColor: 'bg-indigo-100' },
]

export const AGE_RANGES: { value: AgeRange; label: string }[] = [
  { value: 'toddler',   label: 'Toddler (0–2)'   },
  { value: 'preschool', label: 'Preschool (3–5)'  },
  { value: 'primary',   label: 'Primary (6–12)'   },
  { value: 'all_ages',  label: 'All ages'          },
]

export const RADIUS_OPTIONS = [
  { value: 2,  label: '2km'  },
  { value: 5,  label: '5km'  },
  { value: 10, label: '10km' },
  { value: 20, label: '20km' },
]

export const RATING_DIMENSIONS = [
  { key: 'food',            label: 'Food quality',       emoji: '🍽️' },
  { key: 'noise',           label: 'Noise level',        emoji: '📢' },
  { key: 'safety',          label: 'Safety',             emoji: '🔒' },
  { key: 'cleanliness',     label: 'Cleanliness',        emoji: '🧹' },
  { key: 'access',          label: 'Parking & Access',   emoji: '🅿️' },
  { key: 'weather',         label: 'Weather dependency', emoji: '🌦️' },
  { key: 'age_suitability', label: 'Age suitability',    emoji: '👶' },
] as const

export const DEFAULT_RADIUS = 10
export const DEFAULT_MAP_CENTER = { lng: 144.9631, lat: -37.8136 } // Melbourne
export const DEFAULT_MAP_ZOOM = 11
