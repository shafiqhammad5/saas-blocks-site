'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { User, Mail, Lock, Save, Loader2, Eye, EyeOff, CheckCircle, XCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { toast } from 'sonner'

export default function AccountSettingsPage() {
  const { data: session, status, update } = useSession()
  const router = useRouter()
  
  const [isLoading, setIsLoading] = useState(false)
  const [isPasswordLoading, setIsPasswordLoading] = useState(false)
  
  // Profile form state
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  
  // Password form state
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  // Password validation
  const passwordValidation = {
    minLength: newPassword.length >= 8,
    hasUppercase: /[A-Z]/.test(newPassword),
    hasLowercase: /[a-z]/.test(newPassword),
    hasNumber: /\d/.test(newPassword),
    hasSpecialChar: /[!@#$%^&*(),.?":{}|<>]/.test(newPassword)
  }

  const isPasswordValid = Object.values(passwordValidation).every(Boolean)
  const passwordsMatch = newPassword === confirmPassword && newPassword.length > 0

  useEffect(() => {
    if (status === 'loading') return
    if (status === 'unauthenticated') {
      router.push('/auth/signin')
      return
    }
    
    if (session?.user) {
      setName(session.user.name || '')
      setEmail(session.user.email || '')
    }
  }, [session, status, router])

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!name.trim()) {
      toast.error('Name is required')
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email }),
      })

      const data = await response.json()

      if (response.ok) {
        toast.success('Profile updated successfully')
        // Update the session with new data
        await update({
          name: data.user.name,
          email: data.user.email
        })
      } else {
        toast.error(data.error || 'Failed to update profile')
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An error occurred'
      toast.error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!currentPassword) {
      toast.error('Current password is required')
      return
    }

    if (!isPasswordValid) {
      toast.error('Please ensure your new password meets all requirements')
      return
    }

    if (!passwordsMatch) {
      toast.error('New passwords do not match')
      return
    }

    setIsPasswordLoading(true)

    try {
      const response = await fetch('/api/user/password', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          currentPassword, 
          newPassword 
        }),
      })

      const data = await response.json()

      if (response.ok) {
        toast.success('Password updated successfully')
        setCurrentPassword('')
        setNewPassword('')
        setConfirmPassword('')
      } else {
        toast.error(data.error || 'Failed to update password')
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An error occurred'
      toast.error(errorMessage)
    } finally {
      setIsPasswordLoading(false)
    }
  }

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-indigo-600" />
          <p className="mt-2 text-sm text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Account Settings</h1>
          <p className="mt-2 text-gray-600">
            Manage your account information and security settings
          </p>
        </div>

        <div className="space-y-8">
          {/* Profile Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <User className="mr-2 h-5 w-5" />
                Profile Information
              </CardTitle>
              <CardDescription>
                Update your personal information and email address
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleProfileUpdate} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Enter your full name"
                      disabled={isLoading}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email"
                      disabled={isLoading}
                      required
                    />
                  </div>
                </div>
                
                <div className="flex justify-end">
                  <Button type="submit" disabled={isLoading}>
                    {isLoading && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    <Save className="mr-2 h-4 w-4" />
                    Save Changes
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          <Separator />

          {/* Password Security */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Lock className="mr-2 h-5 w-5" />
                Password & Security
              </CardTitle>
              <CardDescription>
                Update your password to keep your account secure
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handlePasswordUpdate} className="space-y-4">
                <div>
                  <Label htmlFor="currentPassword">Current Password</Label>
                  <div className="relative">
                    <Input
                      id="currentPassword"
                      type={showCurrentPassword ? 'text' : 'password'}
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder="Enter current password"
                      disabled={isPasswordLoading}
                      className="pr-10"
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    >
                      {showCurrentPassword ? (
                        <EyeOff className="h-4 w-4 text-gray-400" />
                      ) : (
                        <Eye className="h-4 w-4 text-gray-400" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="newPassword">New Password</Label>
                    <div className="relative">
                      <Input
                        id="newPassword"
                        type={showNewPassword ? 'text' : 'password'}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Enter new password"
                        disabled={isPasswordLoading}
                        className="pr-10"
                      />
                      <button
                        type="button"
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                      >
                        {showNewPassword ? (
                          <EyeOff className="h-4 w-4 text-gray-400" />
                        ) : (
                          <Eye className="h-4 w-4 text-gray-400" />
                        )}
                      </button>
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="confirmPassword">Confirm New Password</Label>
                    <div className="relative">
                      <Input
                        id="confirmPassword"
                        type={showConfirmPassword ? 'text' : 'password'}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Confirm new password"
                        disabled={isPasswordLoading}
                        className="pr-10"
                      />
                      <button
                        type="button"
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="h-4 w-4 text-gray-400" />
                        ) : (
                          <Eye className="h-4 w-4 text-gray-400" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Password Requirements */}
                {newPassword && (
                  <div className="bg-gray-50 border border-gray-200 rounded-md p-4">
                    <h3 className="text-sm font-medium text-gray-900 mb-2">
                      Password Requirements:
                    </h3>
                    <ul className="text-sm space-y-1">
                      <li className={`flex items-center ${passwordValidation.minLength ? 'text-green-600' : 'text-red-600'}`}>
                        {passwordValidation.minLength ? (
                          <CheckCircle className="h-3 w-3 mr-2" />
                        ) : (
                          <XCircle className="h-3 w-3 mr-2" />
                        )}
                        At least 8 characters
                      </li>
                      <li className={`flex items-center ${passwordValidation.hasUppercase ? 'text-green-600' : 'text-red-600'}`}>
                        {passwordValidation.hasUppercase ? (
                          <CheckCircle className="h-3 w-3 mr-2" />
                        ) : (
                          <XCircle className="h-3 w-3 mr-2" />
                        )}
                        One uppercase letter
                      </li>
                      <li className={`flex items-center ${passwordValidation.hasLowercase ? 'text-green-600' : 'text-red-600'}`}>
                        {passwordValidation.hasLowercase ? (
                          <CheckCircle className="h-3 w-3 mr-2" />
                        ) : (
                          <XCircle className="h-3 w-3 mr-2" />
                        )}
                        One lowercase letter
                      </li>
                      <li className={`flex items-center ${passwordValidation.hasNumber ? 'text-green-600' : 'text-red-600'}`}>
                        {passwordValidation.hasNumber ? (
                          <CheckCircle className="h-3 w-3 mr-2" />
                        ) : (
                          <XCircle className="h-3 w-3 mr-2" />
                        )}
                        One number
                      </li>
                      <li className={`flex items-center ${passwordValidation.hasSpecialChar ? 'text-green-600' : 'text-red-600'}`}>
                        {passwordValidation.hasSpecialChar ? (
                          <CheckCircle className="h-3 w-3 mr-2" />
                        ) : (
                          <XCircle className="h-3 w-3 mr-2" />
                        )}
                        One special character
                      </li>
                    </ul>
                  </div>
                )}

                {/* Password Match Indicator */}
                {confirmPassword && (
                  <div className={`text-sm ${passwordsMatch ? 'text-green-600' : 'text-red-600'}`}>
                    {passwordsMatch ? (
                      <div className="flex items-center">
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Passwords match
                      </div>
                    ) : (
                      <div className="flex items-center">
                        <XCircle className="h-4 w-4 mr-2" />
                        Passwords do not match
                      </div>
                    )}
                  </div>
                )}
                
                <div className="flex justify-end">
                  <Button 
                    type="submit" 
                    disabled={isPasswordLoading || !isPasswordValid || !passwordsMatch || !currentPassword}
                  >
                    {isPasswordLoading && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    <Lock className="mr-2 h-4 w-4" />
                    Update Password
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Account Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Mail className="mr-2 h-5 w-5" />
                Account Information
              </CardTitle>
              <CardDescription>
                View your account details and status
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Account ID</Label>
                    <p className="text-sm text-gray-900 font-mono">{session?.user?.id}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Account Role</Label>
                    <p className="text-sm text-gray-900 capitalize">{session?.user?.role?.toLowerCase()}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Email Verified</Label>
                    <p className="text-sm text-gray-900">
                      Not Available
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Member Since</Label>
                    <p className="text-sm text-gray-900">
                      {new Date().toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}