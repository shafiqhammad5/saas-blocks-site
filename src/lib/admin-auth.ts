import { getServerSession } from 'next-auth/next'
import { authOptions } from './auth'
import { redirect } from 'next/navigation'
import { NextRequest, NextResponse } from 'next/server'
import { UserRole } from '@prisma/client'

/**
 * Server-side admin authentication check
 * Use this in server components and API routes
 */
export async function requireAdmin() {
  const session = await getServerSession(authOptions)
  
  if (!session?.user) {
    redirect('/auth/signin?callbackUrl=/admin')
  }
  
  if (session.user.role !== UserRole.ADMIN) {
    redirect('/?error=unauthorized')
  }
  
  return session
}

/**
 * Middleware function for admin routes
 * Use this in middleware.ts or API route handlers
 */
export async function adminMiddleware(request: NextRequest) {
  const session = await getServerSession(authOptions)
  
  if (!session?.user) {
    return NextResponse.redirect(new URL('/auth/signin?callbackUrl=/admin', request.url))
  }
  
  if (session.user.role !== UserRole.ADMIN) {
    return NextResponse.redirect(new URL('/?error=unauthorized', request.url))
  }
  
  return NextResponse.next()
}

/**
 * Client-side admin check hook
 * Use this in client components
 */
export function useAdminAuth() {
  // This would typically use useSession from next-auth/react
  // but since we're in a server-first approach, we'll handle this in components
  return {
    isAdmin: false, // Will be determined by server-side checks
    isLoading: false
  }
}

/**
 * API route admin protection
 * Use this to wrap API route handlers
 */
export function withAdminAuth(handler: (req: NextRequest, context: { params: Record<string, string> }) => Promise<NextResponse>) {
  return async (req: NextRequest, context: { params: Record<string, string> }) => {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    if (session.user.role !== UserRole.ADMIN) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }
    
    return handler(req, context)
  }
}

/**
 * Check if user has admin permissions
 */
export function isAdmin(userRole?: string): boolean {
  return userRole === UserRole.ADMIN
}

/**
 * Admin permissions for different operations
 */
export const AdminPermissions = {
  MANAGE_BLOGS: 'manage_blogs',
  MANAGE_BLOCKS: 'manage_blocks',
  MANAGE_USERS: 'manage_users',
  MANAGE_SUBSCRIPTIONS: 'manage_subscriptions',
  VIEW_ANALYTICS: 'view_analytics'
} as const

export type AdminPermission = typeof AdminPermissions[keyof typeof AdminPermissions]

/**
 * Check if admin has specific permission
 * For now, all admins have all permissions, but this can be extended
 */
export function hasPermission(userRole?: string, permission?: AdminPermission): boolean {
  return isAdmin(userRole)
}