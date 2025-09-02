'use client'

import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Mail } from 'lucide-react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'

function VerifyRequestContent() {
  const searchParams = useSearchParams()
  const email = searchParams.get('email')
  const provider = searchParams.get('provider')

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 text-blue-500">
            <Mail className="h-12 w-12" />
          </div>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Check your email
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            We&apos;ve sent you a sign-in link
          </p>
        </div>

        <Alert className="border-blue-200 bg-blue-50">
          <Mail className="h-4 w-4 text-blue-500" />
          <AlertDescription className="text-blue-700">
            {email ? (
              <>
                A sign-in link has been sent to <strong>{email}</strong>.
                Click the link in the email to sign in to your account.
              </>
            ) : (
              'A sign-in link has been sent to your email address. Click the link in the email to sign in to your account.'
            )}
          </AlertDescription>
        </Alert>

        <div className="space-y-4">
          <div className="bg-gray-50 border border-gray-200 rounded-md p-4">
            <h3 className="text-sm font-medium text-gray-900 mb-2">
              What to do next:
            </h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Check your email inbox</li>
              <li>• Look for an email from our service</li>
              <li>• Click the sign-in link in the email</li>
              <li>• If you don&apos;t see it, check your spam folder</li>
            </ul>
          </div>

          <Button variant="outline" asChild className="w-full">
            <Link href="/auth/signin">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to sign in
            </Link>
          </Button>
        </div>

        <div className="text-center">
          <p className="text-sm text-gray-600">
            Didn&apos;t receive the email?{' '}
            <Link href="/auth/signin" className="font-medium text-indigo-600 hover:text-indigo-500">
              Try again
            </Link>
          </p>
        </div>

        <div className="text-center">
          <p className="text-xs text-gray-500">
            For security reasons, the link will expire in 24 hours.
          </p>
        </div>
      </div>
    </div>
  )
}

export default function VerifyRequestPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div></div>}>
      <VerifyRequestContent />
    </Suspense>
  )
}