import { describe, test, expect } from 'vitest'
import {
  cn,
  getTagMeta,
  getOpenTimeMeta,
  getPrimaryTagMeta,
  slugify,
  formatDistance,
  formatRating,
  averageRatings,
  truncate,
  safeJsonLd,
} from '../utils'
import { TAGS, OPEN_TIMES } from '../constants'

describe('cn', () => {
  test('merges class strings', () => {
    expect(cn('a', 'b')).toBe('a b')
  })
  test('resolves tailwind conflicts (last wins)', () => {
    expect(cn('p-2', 'p-4')).toBe('p-4')
  })
  test('drops falsy values', () => {
    expect(cn('a', false && 'b', null, undefined, 'c')).toBe('a c')
  })
})

describe('getTagMeta', () => {
  test('returns correct meta for a known tag', () => {
    const meta = getTagMeta('kids_play_area')
    expect(meta.value).toBe('kids_play_area')
    expect(meta.label).toBe('Has kids play area')
  })
  test('falls back to first TAGS entry for an unknown value', () => {
    // Cast to satisfy TypeScript — testing the runtime fallback
    const meta = getTagMeta('does_not_exist' as never)
    expect(meta).toBe(TAGS[0])
  })
})

describe('getOpenTimeMeta', () => {
  test('returns correct meta for a known time', () => {
    const meta = getOpenTimeMeta('lunch')
    expect(meta.value).toBe('lunch')
    expect(meta.label).toBe('Lunch')
  })
  test('falls back to first OPEN_TIMES entry for an unknown value', () => {
    const meta = getOpenTimeMeta('supper' as never)
    expect(meta).toBe(OPEN_TIMES[0])
  })
})

describe('getPrimaryTagMeta', () => {
  test('returns meta for the first tag in the array', () => {
    const meta = getPrimaryTagMeta(['play_centre', 'kids_play_area'])
    expect(meta.value).toBe('play_centre')
  })
  test('falls back to first TAGS entry for empty array', () => {
    expect(getPrimaryTagMeta([])).toBe(TAGS[0])
  })
  test('falls back to first TAGS entry for null', () => {
    expect(getPrimaryTagMeta(null)).toBe(TAGS[0])
  })
  test('falls back to first TAGS entry for undefined', () => {
    expect(getPrimaryTagMeta(undefined)).toBe(TAGS[0])
  })
})

describe('slugify', () => {
  test('lowercases and replaces spaces with hyphens', () => {
    expect(slugify('Hello World')).toBe('hello-world')
  })
  test('removes non-word characters', () => {
    // & and ! are stripped; é becomes 'é' which is also stripped as non-ASCII non-word
    const result = slugify('Grill & Bar!')
    expect(result).toBe('grill-bar')
  })
  test('collapses consecutive hyphens', () => {
    expect(slugify('foo---bar')).toBe('foo-bar')
  })
  test('trims leading and trailing hyphens', () => {
    expect(slugify('-hello-')).toBe('hello')
  })
  test('already-slugified strings are unchanged', () => {
    expect(slugify('my-location')).toBe('my-location')
  })
  test('handles single word', () => {
    expect(slugify('cafe')).toBe('cafe')
  })
})

describe('formatDistance', () => {
  test('formats sub-kilometre as metres', () => {
    expect(formatDistance(0.5)).toBe('500m')
    expect(formatDistance(0.1)).toBe('100m')
  })
  test('rounds to nearest metre', () => {
    expect(formatDistance(0.123)).toBe('123m')
  })
  test('formats km with one decimal place', () => {
    expect(formatDistance(1.5)).toBe('1.5km')
    expect(formatDistance(10)).toBe('10.0km')
  })
  test('boundary: exactly 1km uses km format', () => {
    expect(formatDistance(1)).toBe('1.0km')
  })
})

describe('formatRating', () => {
  test('returns em dash for null', () => {
    expect(formatRating(null)).toBe('—')
  })
  test('formats integer to one decimal place', () => {
    expect(formatRating(4)).toBe('4.0')
  })
  test('formats decimal to one decimal place (rounds)', () => {
    expect(formatRating(3.75)).toBe('3.8')
  })
  test('formats 0 correctly', () => {
    expect(formatRating(0)).toBe('0.0')
  })
})

describe('averageRatings', () => {
  test('returns empty object for empty array', () => {
    expect(averageRatings([])).toEqual({})
  })
  test('returns same values for a single review', () => {
    expect(averageRatings([{ food: 4, noise: 3 }])).toEqual({ food: 4, noise: 3 })
  })
  test('averages multiple reviews correctly', () => {
    const result = averageRatings([{ food: 4 }, { food: 2 }])
    expect(result.food).toBe(3)
  })
  test('null values are excluded from the average', () => {
    const result = averageRatings([
      { food: 4, noise: null },
      { food: 2, noise: 3 },
    ])
    expect(result.food).toBe(3)
    expect(result.noise).toBe(3)
  })
  test('returns null when all values for a key are null', () => {
    const result = averageRatings([{ food: null }, { food: null }])
    expect(result.food).toBeNull()
  })
  test('handles mixed null and non-null across multiple keys', () => {
    const result = averageRatings([
      { food: 5, noise: null },
      { food: null, noise: null },
      { food: 3, noise: null },
    ])
    expect(result.food).toBe(4)
    expect(result.noise).toBeNull()
  })
})

describe('truncate', () => {
  test('returns original string when within limit', () => {
    expect(truncate('hello', 10)).toBe('hello')
  })
  test('returns original string at exactly the limit', () => {
    expect(truncate('hello', 5)).toBe('hello')
  })
  test('truncates and appends ellipsis beyond the limit', () => {
    const result = truncate('hello world', 5)
    expect(result.endsWith('…')).toBe(true)
    expect(result).not.toContain('world')
  })
  test('trims trailing whitespace before the ellipsis', () => {
    // 'hello ' truncated at 6 chars → 'hello' (trimEnd) + '…'
    const result = truncate('hello world', 6)
    expect(result).toBe('hello…')
  })
})

describe('safeJsonLd', () => {
  test('escapes < and > to prevent script tag injection', () => {
    const result = safeJsonLd({ x: '<script>alert(1)</script>' })
    expect(result).not.toContain('<script>')
    expect(result).not.toContain('</script>')
    expect(result).toContain('\\u003c')
    expect(result).toContain('\\u003e')
  })
  test('escapes forward slashes', () => {
    const result = safeJsonLd({ url: 'https://example.com/path' })
    expect(result).not.toContain('/')
    expect(result).toContain('\\u002f')
  })
  test('output is valid JSON (parses back to the original value)', () => {
    const input = { name: 'Café & Grill', tags: ['food', 'kids'] }
    const parsed = JSON.parse(safeJsonLd(input))
    expect(parsed).toEqual(input)
  })
  test('handles nested objects', () => {
    const input = { a: { b: '</script>' } }
    const result = safeJsonLd(input)
    expect(result).not.toContain('<')
    expect(JSON.parse(result)).toEqual(input)
  })
  test('handles arrays', () => {
    const input = ['<item>', '>other<']
    const result = safeJsonLd(input)
    expect(result).not.toContain('<')
    expect(result).not.toContain('>')
    expect(JSON.parse(result)).toEqual(input)
  })
})
