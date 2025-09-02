import { Sidebar } from '@/components/admin/sidebar'
import { AdminHeader } from '@/components/admin/header'
import { AdminRouteGuard } from '@/components/admin/AdminRouteGuard'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Admin Dashboard - SaaSBlocks',
  description: 'Admin panel for managing SaaSBlocks content and users',
  robots: 'noindex, nofollow', // Prevent search engine indexing
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AdminRouteGuard>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="flex">
          {/* Sidebar */}
          <Sidebar />
          
          {/* Main content */}
          <div className="flex-1 flex flex-col">
            {/* Header */}
            <AdminHeader />
            
            {/* Page content */}
            <main className="flex-1 p-6">
              <div className="max-w-7xl mx-auto">
                {children}
              </div>
            </main>
          </div>
        </div>
      </div>
    </AdminRouteGuard>
  )
}