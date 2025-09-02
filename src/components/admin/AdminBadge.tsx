'use client'

import { useSession } from 'next-auth/react'
import { Badge } from '@/components/ui/badge'
import { Shield, Crown } from 'lucide-react'
import { cn } from '@/lib/utils'

interface AdminBadgeProps {
  variant?: 'default' | 'outline' | 'secondary'
  size?: 'default' | 'sm' | 'lg'
  className?: string
  showIcon?: boolean
  showText?: boolean
}

export function AdminBadge({ 
  variant = 'default',
  size = 'default', 
  className = '',
  showIcon = true,
  showText = true
}: AdminBadgeProps) {
  const { data: session } = useSession()
  const isAdmin = session?.user?.role === 'ADMIN'

  if (!isAdmin) {
    return null
  }

  return (
    <Badge 
      variant={variant}
      className={cn(
        'bg-red-100 text-red-800 hover:bg-red-200 border-red-200 dark:bg-red-900 dark:text-red-100 dark:border-red-800',
        size === 'sm' && 'text-xs px-2 py-0.5',
        size === 'lg' && 'text-sm px-3 py-1',
        className
      )}
    >
      {showIcon && <Shield className="w-3 h-3 mr-1" />}
      {showText && 'Admin'}
    </Badge>
  )
}

// Compact version for tight spaces
export function AdminIndicator({ className = '' }: { className?: string }) {
  const { data: session } = useSession()
  const isAdmin = session?.user?.role === 'ADMIN'

  if (!isAdmin) {
    return null
  }

  return (
    <div className={cn('flex items-center', className)} title="Administrator">
      <Crown className="w-4 h-4 text-red-600" />
    </div>
  )
}

// Text-only version
export function AdminLabel({ className = '' }: { className?: string }) {
  const { data: session } = useSession()
  const isAdmin = session?.user?.role === 'ADMIN'

  if (!isAdmin) {
    return null
  }

  return (
    <span className={cn('text-xs text-red-600 font-medium', className)}>
      Administrator
    </span>
  )
}