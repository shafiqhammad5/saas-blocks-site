'use client'

import { useState } from 'react'
import { useSession, signIn } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Shield, Lock, Eye, EyeOff } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface AdminLoginButtonProps {
  variant?: 'default' | 'outline' | 'ghost'
  size?: 'default' | 'sm' | 'lg'
  className?: string
}

export function AdminLoginButton({ 
  variant = 'outline', 
  size = 'default',
  className = '' 
}: AdminLoginButtonProps) {
  const { data: session } = useSession()
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  // Check if user is already an admin
  const isAdmin = session?.user?.role === 'ADMIN'

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      })

      if (result?.error) {
        setError('Invalid credentials or not an admin user')
      } else {
        // Check if the logged-in user is admin
        const response = await fetch('/api/auth/session')
        const sessionData = await response.json()
        
        if (sessionData?.user?.role === 'ADMIN') {
          setIsOpen(false)
          router.push('/admin')
          router.refresh()
        } else {
          setError('Access denied. Admin privileges required.')
        }
      }
    } catch (error) {
      setError('Login failed. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleAdminAccess = () => {
    if (isAdmin) {
      router.push('/admin')
    } else {
      setIsOpen(true)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button 
          variant={variant} 
          size={size} 
          className={`${className} ${isAdmin ? 'bg-red-600 hover:bg-red-700 text-white' : ''}`}
          onClick={handleAdminAccess}
        >
          <Shield className="w-4 h-4 mr-2" />
          {isAdmin ? 'Admin Panel' : 'Admin Login'}
        </Button>
      </DialogTrigger>
      
      {!isAdmin && (
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Lock className="w-5 h-5 text-red-600" />
              Admin Access Required
            </DialogTitle>
            <DialogDescription>
              Please enter your admin credentials to access the admin panel.
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleAdminLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="admin-email">Email</Label>
              <Input
                id="admin-email"
                type="email"
                placeholder="admin@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="admin-password">Password</Label>
              <div className="relative">
                <Input
                  id="admin-password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter admin password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={isLoading}
                  className="pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isLoading}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
            
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            <div className="flex gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsOpen(false)}
                disabled={isLoading}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isLoading || !email || !password}
                className="flex-1 bg-red-600 hover:bg-red-700"
              >
                {isLoading ? 'Signing in...' : 'Access Admin Panel'}
              </Button>
            </div>
          </form>
        </DialogContent>
      )}
    </Dialog>
  )
}

// Quick access component for navigation bars
export function AdminQuickAccess() {
  const { data: session } = useSession()
  const isAdmin = session?.user?.role === 'ADMIN'
  
  if (!isAdmin && !session) {
    return <AdminLoginButton variant="ghost" size="sm" />
  }
  
  if (isAdmin) {
    return (
      <AdminLoginButton 
        variant="ghost" 
        size="sm" 
        className="text-red-600 hover:text-red-700 hover:bg-red-50" 
      />
    )
  }
  
  return null
}