import { Paddle, initializePaddle } from '@paddle/paddle-js';

let paddle: Paddle | undefined;

export const initPaddle = async (): Promise<Paddle | undefined> => {
  if (paddle) {
    return paddle;
  }

  try {
    // Initialize Paddle with environment variables
    paddle = await initializePaddle({
      environment: process.env.NEXT_PUBLIC_PADDLE_ENVIRONMENT as 'sandbox' | 'production' || 'sandbox',
      token: process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN || '',
      eventCallback: (data) => {
        console.log('Paddle event:', data);
      },
    });

    return paddle;
  } catch (error) {
    console.error('Failed to initialize Paddle:', error);
    return undefined;
  }
};

export const getPaddle = (): Paddle | undefined => {
  return paddle;
};

// Subscription plans configuration
export const SUBSCRIPTION_PLANS = {
  FREE: {
    id: 'free',
    name: 'Free',
    price: 0,
    interval: 'month',
    features: [
      '10 UI Components',
      'Basic Templates',
      'Community Support',
      'Personal Use License'
    ],
    limits: {
      components: 10,
      downloads: 50
    }
  },
  PRO: {
    id: process.env.NEXT_PUBLIC_PADDLE_PRO_PRICE_ID || 'pro_monthly',
    name: 'Pro',
    price: 29,
    interval: 'month',
    features: [
      '200+ UI Components',
      'Premium Templates',
      'Priority Support',
      'Commercial Use License',
      'Figma Design Files',
      'Regular Updates'
    ],
    limits: {
      components: -1, // unlimited
      downloads: -1 // unlimited
    }
  },
  TEAM: {
    id: process.env.NEXT_PUBLIC_PADDLE_TEAM_PRICE_ID || 'team_monthly',
    name: 'Team',
    price: 99,
    interval: 'month',
    features: [
      'Everything in Pro',
      'Team Collaboration',
      'Custom Components',
      'White-label License',
      'Dedicated Support',
      'Custom Integrations'
    ],
    limits: {
      components: -1, // unlimited
      downloads: -1, // unlimited
      teamMembers: 10
    }
  }
} as const;

export type SubscriptionPlan = keyof typeof SUBSCRIPTION_PLANS;

// Paddle checkout functions
export const openCheckout = async (priceId: string, customData?: Record<string, unknown>) => {
  const paddleInstance = await initPaddle();
  
  if (!paddleInstance) {
    throw new Error('Paddle not initialized');
  }

  return paddleInstance.Checkout.open({
    items: [{ priceId, quantity: 1 }],
    customData,
    settings: {
      successUrl: `${window.location.origin}/dashboard?checkout=success`,
    }
  });
};

export const updateSubscription = async (subscriptionId: string, priceId: string) => {
  const paddleInstance = await initPaddle();
  
  if (!paddleInstance) {
    throw new Error('Paddle not initialized');
  }

  // This would typically be handled via your backend API
  // For now, we'll redirect to Paddle's billing portal
  return paddleInstance.Checkout.open({
    items: [{ priceId, quantity: 1 }],
    settings: {
      successUrl: `${window.location.origin}/dashboard?update=success`,
    }
  });
};

export const cancelSubscription = async (subscriptionId: string) => {
  // This should be handled via your backend API to Paddle's API
  try {
    const response = await fetch('/api/subscriptions/cancel', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ subscriptionId }),
    });

    if (!response.ok) {
      throw new Error('Failed to cancel subscription');
    }

    return await response.json();
  } catch (error) {
    console.error('Error cancelling subscription:', error);
    throw error;
  }
};

// Utility functions
export const formatPrice = (price: number, currency: string = 'USD') => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(price);
};

export const getPlanByPriceId = (priceId: string) => {
  return Object.values(SUBSCRIPTION_PLANS).find(plan => plan.id === priceId);
};

export const getUserPlanLimits = (planId: SubscriptionPlan) => {
  return SUBSCRIPTION_PLANS[planId]?.limits || SUBSCRIPTION_PLANS.FREE.limits;
};