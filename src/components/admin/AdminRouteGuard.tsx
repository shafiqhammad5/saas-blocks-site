'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Shield, AlertTriangle, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'

interface AdminRouteGuardProps {
  children: React.ReactNode
  fallback?: React.ReactNode
  redirectTo?: string
}

export function AdminRouteGuard({ 
  children, 
  fallback,
  redirectTo = '/auth/signin' 
}: AdminRouteGuardProps) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [isChecking, setIsChecking] = useState(true)

  useEffect(() => {
    if (status === 'loading') return

    setIsChecking(false)

    // If not authenticated, redirect to login
    if (status === 'unauthenticated') {
      router.push(`${redirectTo}?callbackUrl=${encodeURIComponent(window.location.pathname)}`)
      return
    }

    // If authenticated but not admin, show access denied
    if (session?.user?.role !== 'ADMIN') {
      // Don't redirect, just show access denied
      return
    }
  }, [session, status, router, redirectTo])

  // Show loading state
  if (status === 'loading' || isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-red-600" />
          <p className="text-muted-foreground">Verifying admin access...</p>
        </div>
      </div>
    )
  }

  // Show access denied for non-admin users
  if (session?.user?.role !== 'ADMIN') {
    if (fallback) {
      return <>{fallback}</>
    }

    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="max-w-md w-full space-y-6 text-center">
          <div className="space-y-4">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
              <Shield className="w-8 h-8 text-red-600" />
            </div>
            <div className="space-y-2">
              <h1 className="text-2xl font-bold text-gray-900">Access Denied</h1>
              <p className="text-gray-600">
                You need administrator privileges to access this page.
              </p>
            </div>
          </div>

          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              This area is restricted to administrators only. If you believe you should have access, please contact your system administrator.
            </AlertDescription>
          </Alert>

          <div className="space-y-3">
            <Button 
              onClick={() => router.push('/dashboard')}
              className="w-full"
            >
              Go to Dashboard
            </Button>
            <Button 
              variant="outline" 
              onClick={() => router.push('/')}
              className="w-full"
            >
              Back to Home
            </Button>
          </div>

          {session?.user && (
            <div className="text-sm text-gray-500 pt-4 border-t">
              <p>Signed in as: <span className="font-medium">{session.user.email}</span></p>
              <p>Role: <span className="font-medium">{session.user.role || 'USER'}</span></p>
            </div>
          )}
        </div>
      </div>
    )
  }

  // User is admin, render children
  return <>{children}</>
}

// Higher-order component version
export function withAdminGuard<P extends object>(
  Component: React.ComponentType<P>,
  options?: {
    fallback?: React.ReactNode
    redirectTo?: string
  }
) {
  return function AdminGuardedComponent(props: P) {
    return (
      <AdminRouteGuard 
        fallback={options?.fallback}
        redirectTo={options?.redirectTo}
      >
        <Component {...props} />
      </AdminRouteGuard>
    )
  }
}

// Hook for checking admin status
export function useAdminAccess() {
  const { data: session, status } = useSession()
  
  return {
    isAdmin: session?.user?.role === 'ADMIN',
    isAuthenticated: status === 'authenticated',
    isLoading: status === 'loading',
    user: session?.user
  }
}