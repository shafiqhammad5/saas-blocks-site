import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { subscriptionId } = await request.json();
    
    if (!subscriptionId) {
      return NextResponse.json({ error: 'Subscription ID is required' }, { status: 400 });
    }

    // Verify the subscription belongs to the current user
    const subscription = await prisma.subscription.findFirst({
      where: {
        paddleSubscriptionId: subscriptionId,
        userId: session.user.id,
      },
    });

    if (!subscription) {
      return NextResponse.json({ error: 'Subscription not found' }, { status: 404 });
    }

    // In a real implementation, you would call Paddle's API to cancel the subscription
    // For now, we'll just update the local database
    // Example Paddle API call:
    // const paddleResponse = await fetch(`https://api.paddle.com/subscriptions/${subscriptionId}/cancel`, {
    //   method: 'POST',
    //   headers: {
    //     'Authorization': `Bearer ${process.env.PADDLE_API_KEY}`,
    //     'Content-Type': 'application/json',
    //   },
    //   body: JSON.stringify({
    //     effective_from: 'next_billing_period' // or 'immediately'
    //   })
    // });

    // Update the subscription status locally
    await prisma.subscription.update({
      where: { id: subscription.id },
      data: {
        cancelAtPeriodEnd: true,
        updatedAt: new Date(),
      },
    });

    return NextResponse.json({ 
      success: true, 
      message: 'Subscription will be cancelled at the end of the current billing period' 
    });
  } catch (error) {
    console.error('Subscription cancellation error:', error);
    return NextResponse.json(
      { error: 'Failed to cancel subscription' }, 
      { status: 500 }
    );
  }
}