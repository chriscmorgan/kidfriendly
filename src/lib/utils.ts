import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import type { Tag, OpenTime } from './types'
import { TAGS, OPEN_TIMES } from './constants'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getTagMeta(tag: Tag) {
  return TAGS.find((t) => t.value === tag) ?? TAGS[0]
}

export function getOpenTimeMeta(time: OpenTime) {
  return OPEN_TIMES.find((t) => t.value === time) ?? OPEN_TIMES[0]
}

export function getPrimaryTagMeta(tags: Tag[] | null | undefined) {
  return tags && tags.length > 0 ? getTagMeta(tags[0]) : TAGS[0]
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export function formatDistance(km: number): string {
  if (km < 1) return `${Math.round(km * 1000)}m`
  return `${km.toFixed(1)}km`
}

export function formatRating(value: number | null): string {
  if (value == null) return '—'
  return value.toFixed(1)
}

export function averageRatings(reviews: { [key: string]: number | null }[]): Record<string, number | null> {
  if (!reviews.length) return {}
  const keys = Object.keys(reviews[0])
  const result: Record<string, number | null> = {}
  for (const key of keys) {
    const values = reviews.map((r) => r[key]).filter((v): v is number => v != null)
    result[key] = values.length ? values.reduce((a, b) => a + b, 0) / values.length : null
  }
  return result
}

export function truncate(text: string, maxLen: number): string {
  if (text.length <= maxLen) return text
  return text.slice(0, maxLen).trimEnd() + '…'
}
