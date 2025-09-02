import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { isAdmin } from '@/lib/admin-auth'

// POST /api/admin/subscriptions/[id]/refund - Process a refund
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || !isAdmin(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { amount, reason } = await request.json()
    const { id } = await params
    const subscriptionId = id

    if (!amount || amount <= 0) {
      return NextResponse.json(
        { error: 'Valid refund amount is required' },
        { status: 400 }
      )
    }

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

    // For demonstration purposes, we'll set a reasonable refund limit
    // In a real application, you'd get this from your payment processor
    const maxRefundAmount = 100 // Default max refund amount
    if (amount > maxRefundAmount) {
      return NextResponse.json(
        { error: `Refund amount cannot exceed $${maxRefundAmount}` },
        { status: 400 }
      )
    }

    // In a real application, you would integrate with your payment processor here
    // For now, we'll just create a refund record and update the subscription
    
    // Create refund record (you might want to add a Refund model to your schema)
    const refundData = {
      subscriptionId,
      userId: existingSubscription.userId,
      amount: Math.round(amount * 100), // Convert to cents
      reason: reason || 'Admin refund',
      status: 'processed',
      processedBy: session.user.id,
      processedAt: new Date()
    }

    // For demonstration, we'll store this in a simple way
    // In production, you'd want a proper Refund model
    console.log('Refund processed:', refundData)

    // Update subscription status if full refund
    let updatedSubscription = existingSubscription
    if (amount >= maxRefundAmount) {
      updatedSubscription = await prisma.subscription.update({
        where: { id: subscriptionId },
        data: {
          status: 'CANCELED',
          cancelAtPeriodEnd: true,
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
    }

    return NextResponse.json({
      success: true,
      message: `Refund of $${amount} processed successfully`,
      refund: {
        amount,
        reason,
        processedAt: new Date(),
        subscription: updatedSubscription
      }
    })
  } catch (error) {
    console.error('Error processing refund:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}