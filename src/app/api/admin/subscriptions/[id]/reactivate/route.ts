import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { isAdmin } from '@/lib/admin-auth'

// POST /api/admin/subscriptions/[id]/reactivate - Reactivate a subscription
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || !isAdmin(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const subscriptionId = id

    // Check if subscription exists
    const existingSubscription = await prisma.subscription.findUnique({
      where: { id: subscriptionId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    })

    if (!existingSubscription) {
      return NextResponse.json(
        { error: 'Subscription not found' },
        { status: 404 }
      )
    }

    if (existingSubscription.status === 'ACTIVE' && !existingSubscription.cancelAtPeriodEnd) {
      return NextResponse.json(
        { error: 'Subscription is already active' },
        { status: 400 }
      )
    }

    // Calculate new period end date (default to monthly)
    const now = new Date()
    const newPeriodEnd = new Date(now)
    // Default to monthly billing cycle
    newPeriodEnd.setMonth(newPeriodEnd.getMonth() + 1)

    // Update subscription to active status
    const updatedSubscription = await prisma.subscription.update({
      where: { id: subscriptionId },
      data: {
        status: 'ACTIVE',
        cancelAtPeriodEnd: false,
        currentPeriodStart: now,
        currentPeriodEnd: newPeriodEnd,
        updatedAt: new Date()
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Subscription reactivated successfully',
      subscription: updatedSubscription
    })
  } catch (error) {
    console.error('Error reactivating subscription:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}