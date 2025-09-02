import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// Mock data for demonstration - in a real app, this would come from your payment provider (Stripe, Paddle, etc.)
const mockSubscriptionData = {
  subscription: {
    id: 'sub_1234567890',
    status: 'active' as const,
    planName: 'Pro Plan',
    planPrice: 29.99,
    billingCycle: 'monthly' as const,
    currentPeriodStart: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(), // 15 days ago
    currentPeriodEnd: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(), // 15 days from now
    cancelAtPeriodEnd: false
  },
  invoices: [
    {
      id: 'inv_1234567890',
      amount: 29.99,
      status: 'paid' as const,
      date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days ago
      downloadUrl: '/api/billing/invoice/inv_1234567890/download'
    },
    {
      id: 'inv_0987654321',
      amount: 29.99,
      status: 'paid' as const,
      date: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(), // 60 days ago
      downloadUrl: '/api/billing/invoice/inv_0987654321/download'
    },
    {
      id: 'inv_1122334455',
      amount: 29.99,
      status: 'paid' as const,
      date: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(), // 90 days ago
      downloadUrl: '/api/billing/invoice/inv_1122334455/download'
    }
  ]
}

const mockFreeUserData = {
  subscription: null,
  invoices: []
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get user from database to check subscription status
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        email: true,
        role: true
        // In a real app, you'd have subscription-related fields here
      }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // For demonstration purposes, we'll return mock data
    // In a real application, you would:
    // 1. Query your payment provider's API (Stripe, Paddle, etc.)
    // 2. Or query your local subscription table
    // 3. Return actual subscription and invoice data
    
    // Mock logic: if user email contains 'pro', they have a subscription
    const hasSubscription = user.email?.includes('pro') || user.role === 'ADMIN'
    
    if (hasSubscription) {
      return NextResponse.json(mockSubscriptionData)
    } else {
      return NextResponse.json(mockFreeUserData)
    }

  } catch (error) {
    console.error('Billing subscription error:', error)
    
    const errorMessage = error instanceof Error ? error.message : 'Internal server error'
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
}