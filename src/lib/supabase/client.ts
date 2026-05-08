import { createBrowserClient } from '@supabase/ssr'

const FALLBACK_URL = 'https://placeholder.supabase.co'
const FALLBACK_KEY = 'placeholder'

function safeUrl(val: string | undefined): string {
  return /^https?:\/\//i.test(val ?? '') ? val! : FALLBACK_URL
}

export function createClient() {
  return createBrowserClient(
    safeUrl(process.env.NEXT_PUBLIC_SUPABASE_URL),
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || FALLBACK_KEY,
  )
}
