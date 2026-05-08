export type UserRole = 'contributor' | 'admin'
export type LocationStatus = 'pending' | 'approved' | 'rejected'
export type ReportTarget = 'location' | 'review'

export type AgeRange = 'toddler' | 'preschool' | 'primary' | 'all_ages'

export type Tag =
  | 'indoor_playground'
  | 'kids_play_area'
  | 'adjacent_playground'
  | 'outdoor_run_area'
  | 'play_centre'

export type OpenTime = 'breakfast' | 'lunch' | 'dinner'

export type SortOption = 'nearest' | 'highest_rated' | 'most_reviewed' | 'newest'

export interface User {
  id: string
  display_name: string
  avatar_url: string | null
  role: UserRole
  created_at: string
}

export interface Location {
  id: string
  slug: string
  name: string
  description: string
  address: string
  lat: number
  lng: number
  suburb: string
  tags: Tag[]
  open_times: OpenTime[]
  age_ranges: AgeRange[]
  tips: string | null
  website?: string | null
  opening_hours?: string | null
  status: LocationStatus
  submitted_by: string
  rejection_note: string | null
  created_at: string
  approved_at: string | null
  photos?: LocationPhoto[]
  reviews?: Review[]
  avg_ratings?: AvgRatings
  review_count?: number
  distance_km?: number
  submitter?: { display_name: string; avatar_url: string | null }
}

export interface SiteStats {
  total_venues: number
  total_contributors: number
  added_this_week: number
}

export interface LocationPhoto {
  id: string
  location_id: string
  url: string
  sort_order: number
  uploaded_by: string
}

export interface Review {
  id: string
  location_id: string
  user_id: string
  comment: string | null
  rating_food: number | null
  rating_noise: number | null
  rating_safety: number | null
  rating_cleanliness: number | null
  rating_access: number | null
  rating_weather: number | null
  rating_age_suitability: number | null
  created_at: string
  updated_at: string
  user?: User
}

export interface AvgRatings {
  food: number | null
  noise: number | null
  safety: number | null
  cleanliness: number | null
  access: number | null
  weather: number | null
  age_suitability: number | null
}

export interface Report {
  id: string
  target_type: ReportTarget
  target_id: string
  reported_by: string
  reason: string
  created_at: string
}

export interface SearchParams {
  q?: string
  lat?: number
  lng?: number
  radius?: number
  tag?: Tag
  sort?: SortOption
}
