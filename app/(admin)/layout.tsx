import { Metadata } from 'next'
import AdminLayoutClient from './admin-layout-client'

// Prevent admin pages from being indexed by search engines
export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
  },
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <AdminLayoutClient>{children}</AdminLayoutClient>
}
