'use client'
import { useEffect, useState } from 'react'
import { useSearchParams, useRouter, usePathname } from 'next/navigation'
import SignInModal from './SignInModal'

export default function AuthGate() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (searchParams.get('auth') === 'required') {
      setOpen(true)
      // Clean the param from the URL without a navigation
      const params = new URLSearchParams(searchParams.toString())
      params.delete('auth')
      const newUrl = pathname + (params.size > 0 ? `?${params}` : '')
      router.replace(newUrl, { scroll: false })
    }
  }, [searchParams, pathname, router])

  if (!open) return null
  return <SignInModal onClose={() => setOpen(false)} />
}
