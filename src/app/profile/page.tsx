import type { Metadata } from 'next'
import ProfileClient from './ProfileClient'

export const metadata: Metadata = { title: 'My profile' }

export default function ProfilePage() {
  return <ProfileClient />
}
