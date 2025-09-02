import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import crypto from 'crypto';
import { prisma } from '@/lib/prisma';
import { SubscriptionStatus } from '@prisma/client';

interface PaddleWebhookData {
  id: string;
  customer_id?: string;
  items?: Array<{
    price?: {
      id: string;
    };
  }>;
  status?: string;
  next_billed_at?: string;
  canceled_at?: string;
  custom_data?: {
    userId?: string;
    email?: string;
  };
}

// Paddle webhook signature verification
function verifyPaddleSignature(body: string, signature: string, secret: string): boolean {
  const hmac = crypto.createHmac('sha256', secret);
  hmac.update(body);
  const expectedSignature = hmac.digest('hex');
  
  return crypto.timingSafeEqual(
    Buffer.from(signature, 'hex'),
    Buffer.from(expectedSignature, 'hex')
  );
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const headersList = await headers();
    const signature = headersList.get('paddle-signature');
    
    // Verify webhook signature
    const webhookSecret = process.env.PADDLE_WEBHOOK_SECRET;
    if (!webhookSecret || !signature) {
      return NextResponse.json({ error: 'Missing webhook secret or signature' }, { status: 400 });
    }

    if (!verifyPaddleSignature(body, signature, webhookSecret)) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }

    const event = JSON.parse(body);
    
    console.log('Paddle webhook received:', event.event_type);

    // Handle different webhook events
    switch (event.event_type) {
      case 'subscription.created':
        await handleSubscriptionCreated(event.data);
        break;
        
      case 'subscription.updated':
        await handleSubscriptionUpdated(event.data);
        break;
        
      case 'subscription.cancelled':
        await handleSubscriptionCancelled(event.data);
        break;
        
      case 'transaction.completed':
        await handleTransactionCompleted(event.data);
        break;
        
      case 'transaction.payment_failed':
        await handlePaymentFailed(event.data);
        break;
        
      default:
        console.log('Unhandled webhook event:', event.event_type);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}

async function handleSubscriptionCreated(data: PaddleWebhookData) {
  try {
    const { id, customer_id, items, status, next_billed_at, custom_data } = data;
    
    // Extract user ID from custom data
    const userId = custom_data?.userId;
    if (!userId) {
      console.error('No user ID found in subscription data');
      return;
    }

    // Get the price ID to determine the plan
    const priceId = items?.[0]?.price?.id;
    let planType = 'FREE';
    
    if (priceId === process.env.NEXT_PUBLIC_PADDLE_PRO_PRICE_ID) {
      planType = 'PRO';
    } else if (priceId === process.env.NEXT_PUBLIC_PADDLE_TEAM_PRICE_ID) {
      planType = 'TEAM';
    }

    // Create or update user subscription
    await prisma.user.update({
      where: { id: userId },
      data: {
        subscription: {
          upsert: {
            create: {
              paddleSubscriptionId: id,
              status: (status as SubscriptionStatus) || 'INACTIVE',
              planId: priceId,
              currentPeriodEnd: next_billed_at ? new Date(next_billed_at) : null,
            },
            update: {
              paddleSubscriptionId: id,
              status: (status as SubscriptionStatus) || 'INACTIVE',
              planId: priceId,
              currentPeriodEnd: next_billed_at ? new Date(next_billed_at) : null,
            },
          },
        },
      },
    });

    console.log(`Subscription created for user ${userId}: ${planType}`);
  } catch (error) {
    console.error('Error handling subscription created:', error);
  }
}

async function handleSubscriptionUpdated(data: PaddleWebhookData) {
  try {
    const { id, items, status, next_billed_at } = data;
    
    // Get the price ID to determine the new plan
    const priceId = items?.[0]?.price?.id;
    let planType = 'FREE';
    
    if (priceId === process.env.NEXT_PUBLIC_PADDLE_PRO_PRICE_ID) {
      planType = 'PRO';
    } else if (priceId === process.env.NEXT_PUBLIC_PADDLE_TEAM_PRICE_ID) {
      planType = 'TEAM';
    }

    // Update subscription
    await prisma.subscription.updateMany({
      where: { paddleSubscriptionId: id },
      data: {
        status: (status as SubscriptionStatus) || 'INACTIVE',
        planId: priceId,
        currentPeriodEnd: next_billed_at ? new Date(next_billed_at) : null,
      },
    });

    console.log(`Subscription updated: ${id} -> ${planType}`);
  } catch (error) {
    console.error('Error handling subscription updated:', error);
  }
}

async function handleSubscriptionCancelled(data: PaddleWebhookData) {
  try {
    const { id, canceled_at } = data;
    
    // Update subscription to cancelled
    await prisma.subscription.updateMany({
      where: { paddleSubscriptionId: id },
      data: {
        status: 'CANCELED',
        currentPeriodEnd: canceled_at ? new Date(canceled_at) : null,
      },
    });

    console.log(`Subscription cancelled: ${id}`);
  } catch (error) {
    console.error('Error handling subscription cancelled:', error);
  }
}

async function handleTransactionCompleted(data: PaddleWebhookData) {
  try {
    const { id, customer_id, items, status, custom_data } = data;
    
    // Log successful payment
    console.log(`Transaction completed: ${id} for customer ${customer_id}`);
    
    // You could store transaction records here if needed
    // await prisma.transaction.create({ ... });
  } catch (error) {
    console.error('Error handling transaction completed:', error);
  }
}

async function handlePaymentFailed(data: PaddleWebhookData) {
  try {
    const { id, customer_id } = data;
    
    // Log failed payment
    console.log(`Payment failed: ${id} for customer ${customer_id}`);
    
    // You might want to notify the user or update their subscription status
    // This could involve sending an email or updating the database
  } catch (error) {
    console.error('Error handling payment failed:', error);
  }
}