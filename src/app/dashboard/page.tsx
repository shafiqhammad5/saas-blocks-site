'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  User, 
  CreditCard, 
  Download, 
  Eye, 
  Calendar, 
  Crown, 
  Settings,
  BarChart3,
  Package
} from 'lucide-react';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { SUBSCRIPTION_PLANS, openCheckout, cancelSubscription } from '@/lib/paddle';

interface UserSubscription {
  id: string;
  status: string;
  planId: string | null;
  currentPeriodEnd: string | null;
  cancelAtPeriodEnd: boolean;
}

interface DashboardStats {
  totalDownloads: number;
  totalViews: number;
  componentsUsed: number;
  daysRemaining: number;
}

const DashboardPage = () => {
  const { data: session, status } = useSession();
  const [subscription, setSubscription] = useState<UserSubscription | null>(null);
  const [stats, setStats] = useState<DashboardStats>({
    totalDownloads: 0,
    totalViews: 0,
    componentsUsed: 0,
    daysRemaining: 0
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Fetch user subscription and stats
    const fetchUserData = async () => {
      try {
        // Mock data for now - in a real app, you'd fetch from your API
        setSubscription({
          id: 'sub_123',
          status: 'ACTIVE',
          planId: 'pro_monthly',
          currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          cancelAtPeriodEnd: false
        });
        
        setStats({
          totalDownloads: 45,
          totalViews: 1250,
          componentsUsed: 23,
          daysRemaining: 30
        });
      } catch (error) {
        console.error('Failed to fetch user data:', error);
      }
    };

    if (session?.user) {
      fetchUserData();
    }
  }, [session]);

  // Redirect if not authenticated
  if (status === 'loading') {
    return <div>Loading...</div>;
  }

  if (status === 'unauthenticated') {
    redirect('/api/auth/signin');
  }

  const getCurrentPlan = () => {
    if (!subscription?.planId) return SUBSCRIPTION_PLANS.FREE;
    
    return Object.values(SUBSCRIPTION_PLANS).find(plan => 
      plan.id === subscription.planId
    ) || SUBSCRIPTION_PLANS.FREE;
  };

  const handleUpgrade = async (planId: string) => {
    setIsLoading(true);
    try {
      await openCheckout(planId, {
        userId: session?.user?.id,
        email: session?.user?.email,
      });
    } catch (error) {
      console.error('Upgrade failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelSubscription = async () => {
    if (!subscription?.id) return;
    
    setIsLoading(true);
    try {
      await cancelSubscription(subscription.id);
      // Refresh subscription data
      setSubscription(prev => prev ? { ...prev, cancelAtPeriodEnd: true } : null);
    } catch (error) {
      console.error('Cancellation failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const currentPlan = getCurrentPlan();
  const isFreePlan = currentPlan.name === 'Free';
  const isPro = currentPlan.name === 'Pro';

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Welcome back, {session?.user?.name || 'User'}!
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Manage your subscription, track your usage, and access premium components.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Downloads</CardTitle>
              <Download className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalDownloads}</div>
              <p className="text-xs text-muted-foreground">This month</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Views</CardTitle>
              <Eye className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalViews}</div>
              <p className="text-xs text-muted-foreground">Total views</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Components</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.componentsUsed}</div>
              <p className="text-xs text-muted-foreground">Components used</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Days Left</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{isFreePlan ? '∞' : stats.daysRemaining}</div>
              <p className="text-xs text-muted-foreground">
                {isFreePlan ? 'Free forever' : 'Until renewal'}
              </p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="subscription" className="space-y-6">
          <TabsList>
            <TabsTrigger value="subscription">Subscription</TabsTrigger>
            <TabsTrigger value="usage">Usage</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>
          
          <TabsContent value="subscription" className="space-y-6">
            {/* Current Plan */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Crown className="h-5 w-5" />
                  Current Plan
                </CardTitle>
                <CardDescription>
                  Manage your subscription and billing information
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold">{currentPlan.name}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      {isFreePlan ? 'Free forever' : `$${currentPlan.price}/month`}
                    </p>
                  </div>
                  <Badge variant={isFreePlan ? 'secondary' : 'default'}>
                    {subscription?.status || 'FREE'}
                  </Badge>
                </div>
                
                {subscription?.currentPeriodEnd && (
                  <div className="text-sm text-gray-600 dark:text-gray-300">
                    {subscription.cancelAtPeriodEnd ? (
                      <span className="text-orange-600">Cancels on {new Date(subscription.currentPeriodEnd).toLocaleDateString()}</span>
                    ) : (
                      <span>Renews on {new Date(subscription.currentPeriodEnd).toLocaleDateString()}</span>
                    )}
                  </div>
                )}
                
                <Separator />
                
                <div className="space-y-2">
                  <h4 className="font-medium">Plan Features:</h4>
                  <ul className="text-sm space-y-1">
                    {currentPlan.features.map((feature, index) => (
                      <li key={index} className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
              </CardContent>
              <CardFooter className="flex gap-2">
                {isFreePlan ? (
                  <Button 
                    onClick={() => handleUpgrade(SUBSCRIPTION_PLANS.PRO.id)}
                    disabled={isLoading}
                  >
                    Upgrade to Pro
                  </Button>
                ) : (
                  <>
                    {!isPro && (
                      <Button 
                        onClick={() => handleUpgrade(SUBSCRIPTION_PLANS.TEAM.id)}
                        disabled={isLoading}
                      >
                        Upgrade to Team
                      </Button>
                    )}
                    {!subscription?.cancelAtPeriodEnd && (
                      <Button 
                        variant="outline"
                        onClick={handleCancelSubscription}
                        disabled={isLoading}
                      >
                        Cancel Subscription
                      </Button>
                    )}
                  </>
                )}
              </CardFooter>
            </Card>
            
            {/* Billing History */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Billing History
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-gray-600 dark:text-gray-300">
                  No billing history available yet.
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="usage" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Usage Statistics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>Components Downloaded</span>
                    <span className="font-semibold">{stats.totalDownloads}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Total Views</span>
                    <span className="font-semibold">{stats.totalViews}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Components Used</span>
                    <span className="font-semibold">{stats.componentsUsed}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Account Settings
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Email</label>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      {session?.user?.email}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Name</label>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      {session?.user?.name || 'Not set'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
      
      <Footer />
    </div>
  );
};

export default DashboardPage;