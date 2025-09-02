'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Check, Star, Zap, Users, Crown } from 'lucide-react';
import { SUBSCRIPTION_PLANS, openCheckout, formatPrice, initPaddle } from '@/lib/paddle';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';

const PricingPage = () => {
  const { data: session } = useSession();
  const [isYearly, setIsYearly] = useState(false);
  const [isLoading, setIsLoading] = useState<string | null>(null);
  const [paddleReady, setPaddleReady] = useState(false);

  useEffect(() => {
    const initializePaddle = async () => {
      try {
        await initPaddle();
        setPaddleReady(true);
      } catch (error) {
        console.error('Failed to initialize Paddle:', error);
      }
    };

    initializePaddle();
  }, []);

  const handleSubscribe = async (planId: string) => {
    if (!paddleReady) {
      console.error('Paddle not ready');
      return;
    }

    setIsLoading(planId);
    
    try {
      await openCheckout(planId, {
        userId: session?.user?.id,
        email: session?.user?.email,
      });
    } catch (error) {
      console.error('Checkout failed:', error);
    } finally {
      setIsLoading(null);
    }
  };

  const getPlanIcon = (planName: string) => {
    switch (planName.toLowerCase()) {
      case 'free':
        return <Star className="h-6 w-6" />;
      case 'pro':
        return <Zap className="h-6 w-6" />;
      case 'team':
        return <Crown className="h-6 w-6" />;
      default:
        return <Users className="h-6 w-6" />;
    }
  };

  const getYearlyPrice = (monthlyPrice: number) => {
    return Math.floor(monthlyPrice * 12 * 0.8); // 20% discount for yearly
  };

  const plans = Object.values(SUBSCRIPTION_PLANS);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <Header />
      
      <main className="container mx-auto px-4 py-16">
        {/* Header Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
            Choose Your Plan
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto">
            Get access to premium UI components, templates, and tools to build amazing applications faster.
          </p>
          
          {/* Billing Toggle */}
          <div className="flex items-center justify-center gap-4 mb-8">
            <span className={`text-sm font-medium ${!isYearly ? 'text-gray-900 dark:text-white' : 'text-gray-500'}`}>
              Monthly
            </span>
            <Switch
              checked={isYearly}
              onCheckedChange={setIsYearly}
              className="data-[state=checked]:bg-blue-600"
            />
            <span className={`text-sm font-medium ${isYearly ? 'text-gray-900 dark:text-white' : 'text-gray-500'}`}>
              Yearly
            </span>
            {isYearly && (
              <Badge variant="secondary" className="ml-2">
                Save 20%
              </Badge>
            )}
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan, index) => {
            const price = isYearly ? getYearlyPrice(plan.price) : plan.price;
            const isPopular = plan.name === 'Pro';
            const isFree = plan.name === 'Free';
            
            return (
              <Card 
                key={plan.id} 
                className={`relative ${isPopular ? 'border-blue-500 shadow-lg scale-105' : 'border-gray-200'} transition-all duration-300 hover:shadow-xl`}
              >
                {isPopular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-blue-600 text-white px-4 py-1">
                      Most Popular
                    </Badge>
                  </div>
                )}
                
                <CardHeader className="text-center pb-8">
                  <div className="flex justify-center mb-4">
                    <div className={`p-3 rounded-full ${isPopular ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'}`}>
                      {getPlanIcon(plan.name)}
                    </div>
                  </div>
                  <CardTitle className="text-2xl font-bold">{plan.name}</CardTitle>
                  <div className="mt-4">
                    <span className="text-4xl font-bold">
                      {isFree ? 'Free' : formatPrice(price)}
                    </span>
                    {!isFree && (
                      <span className="text-gray-500 ml-2">
                        /{isYearly ? 'year' : 'month'}
                      </span>
                    )}
                  </div>
                  {!isFree && isYearly && (
                    <p className="text-sm text-gray-500 mt-2">
                      {formatPrice(plan.price)}/month billed annually
                    </p>
                  )}
                </CardHeader>
                
                <CardContent>
                  <ul className="space-y-3">
                    {plan.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-center gap-3">
                        <Check className="h-5 w-5 text-green-500 flex-shrink-0" />
                        <span className="text-sm text-gray-600 dark:text-gray-300">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
                
                <CardFooter>
                  <Button 
                    className={`w-full ${isPopular ? 'bg-blue-600 hover:bg-blue-700' : ''}`}
                    variant={isPopular ? 'default' : 'outline'}
                    onClick={() => isFree ? null : handleSubscribe(plan.id)}
                    disabled={isLoading === plan.id || (isFree && !!session)}
                  >
                    {isLoading === plan.id ? (
                      'Processing...'
                    ) : isFree ? (
                      session ? 'Current Plan' : 'Get Started'
                    ) : (
                      'Subscribe Now'
                    )}
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>

        {/* FAQ Section */}
        <div className="mt-24 max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Frequently Asked Questions</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-lg font-semibold mb-2">Can I change plans anytime?</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Yes, you can upgrade or downgrade your plan at any time. Changes will be prorated automatically.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-2">What payment methods do you accept?</h3>
              <p className="text-gray-600 dark:text-gray-300">
                We accept all major credit cards, PayPal, and bank transfers through our secure payment processor.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-2">Is there a free trial?</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Our Free plan gives you access to basic components. You can upgrade anytime to unlock premium features.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-2">Do you offer refunds?</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Yes, we offer a 30-day money-back guarantee for all paid plans. No questions asked.
              </p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-24 text-center">
          <div className="bg-blue-600 rounded-2xl p-12 text-white">
            <h2 className="text-3xl font-bold mb-4">Ready to get started?</h2>
            <p className="text-xl mb-8 opacity-90">
              Join thousands of developers building amazing applications with our components.
            </p>
            <Button 
              size="lg" 
              variant="secondary"
              onClick={() => handleSubscribe(SUBSCRIPTION_PLANS.PRO.id)}
              disabled={!paddleReady}
            >
              Start Your Pro Trial
            </Button>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default PricingPage;