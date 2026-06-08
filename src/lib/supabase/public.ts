import { createClient as createSupabaseClient } from '@supabase/supabase-js'

// Cookieless anon client for reading public data (approved locations) in
// server components. Because it never touches cookies(), pages that use it
// can be statically generated / ISR-cached instead of forced dynamic.
export function createPublicClient() {
  const url = /^https?:\/\//i.test(process.env.NEXT_PUBLIC_SUPABASE_URL ?? '')
    ? process.env.NEXT_PUBLIC_SUPABASE_URL!
    : 'https://placeholder.supabase.co'
  return createSupabaseClient(url, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder', {
    auth: { persistSession: false, autoRefreshToken: false },
  })
}
