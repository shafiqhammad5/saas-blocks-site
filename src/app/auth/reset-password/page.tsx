'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Eye, EyeOff, Loader2, CheckCircle, XCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { toast } from 'sonner'

function ResetPasswordForm() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const token = searchParams.get('token')
  
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isValidToken, setIsValidToken] = useState<boolean | null>(null)

  // Password validation
  const passwordValidation = {
    minLength: password.length >= 8,
    hasUppercase: /[A-Z]/.test(password),
    hasLowercase: /[a-z]/.test(password),
    hasNumber: /\d/.test(password),
    hasSpecialChar: /[!@#$%^&*(),.?":{}|<>]/.test(password)
  }

  const isPasswordValid = Object.values(passwordValidation).every(Boolean)
  const passwordsMatch = password === confirmPassword && password.length > 0

  useEffect(() => {
    if (!token) {
      setIsValidToken(false)
      return
    }

    // Verify token validity
    const verifyToken = async () => {
      try {
        const response = await fetch(`/api/auth/verify-reset-token?token=${token}`)
        setIsValidToken(response.ok)
      } catch (error) {
        setIsValidToken(false)
      }
    }

    verifyToken()
  }, [token])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!isPasswordValid) {
      toast.error('Please ensure your password meets all requirements')
      return
    }

    if (!passwordsMatch) {
      toast.error('Passwords do not match')
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token, password }),
      })

      const data = await response.json()

      if (response.ok) {
        toast.success('Password reset successfully')
        router.push('/auth/signin?message=Password reset successfully, please sign in')
      } else {
        toast.error(data.error || 'Failed to reset password')
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An error occurred'
      toast.error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  if (isValidToken === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-indigo-600" />
          <p className="mt-2 text-sm text-gray-600">Verifying reset token...</p>
        </div>
      </div>
    )
  }

  if (!isValidToken) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <div className="mx-auto h-12 w-12 text-red-500">
              <XCircle className="h-12 w-12" />
            </div>
            <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
              Invalid Reset Link
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              This password reset link is invalid or has expired
            </p>
          </div>

          <Alert className="border-red-200 bg-red-50">
            <XCircle className="h-4 w-4 text-red-500" />
            <AlertDescription className="text-red-700">
              The password reset link you clicked is either invalid or has expired.
              Please request a new password reset link.
            </AlertDescription>
          </Alert>

          <div className="space-y-4">
            <Button asChild className="w-full">
              <Link href="/auth/forgot-password">
                Request new reset link
              </Link>
            </Button>
            
            <Button variant="outline" asChild className="w-full">
              <Link href="/auth/signin">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to sign in
              </Link>
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Reset your password
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Enter your new password below
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <Label htmlFor="password">New Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  required
                  className="pr-10"
                  placeholder="Enter new password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
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
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  required
                  className="pr-10"
                  placeholder="Confirm new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={isLoading}
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
          {password && (
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

          <div>
            <Button
              type="submit"
              disabled={isLoading || !isPasswordValid || !passwordsMatch}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Reset password
            </Button>
          </div>

          <div className="text-center">
            <Link
              href="/auth/signin"
              className="font-medium text-indigo-600 hover:text-indigo-500 flex items-center justify-center"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to sign in
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div></div>}>
      <ResetPasswordForm />
    </Suspense>
  )
}