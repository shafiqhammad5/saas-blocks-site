'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { 
  CreditCard, 
  Calendar, 
  DollarSign, 
  Download, 
  ExternalLink, 
  Loader2, 
  CheckCircle, 
  XCircle,
  AlertTriangle,
  Crown,
  Zap
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { toast } from 'sonner'

interface Subscription {
  id: string
  status: 'active' | 'canceled' | 'past_due' | 'trialing'
  planName: string
  planPrice: number
  billingCycle: 'monthly' | 'yearly'
  currentPeriodStart: string
  currentPeriodEnd: string
  cancelAtPeriodEnd: boolean
}

interface Invoice {
  id: string
  amount: number
  status: 'paid' | 'pending' | 'failed'
  date: string
  downloadUrl?: string
}

export default function BillingPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  
  const [isLoading, setIsLoading] = useState(true)
  const [subscription, setSubscription] = useState<Subscription | null>(null)
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [isUpdating, setIsUpdating] = useState(false)

  useEffect(() => {
    if (status === 'loading') return
    if (status === 'unauthenticated') {
      router.push('/auth/signin')
      return
    }
    
    fetchBillingData()
  }, [session, status, router])

  const fetchBillingData = async () => {
    try {
      const response = await fetch('/api/billing/subscription')
      const data = await response.json()
      
      if (response.ok) {
        setSubscription(data.subscription)
        setInvoices(data.invoices || [])
      } else {
        console.error('Failed to fetch billing data:', data.error)
      }
    } catch (error) {
      console.error('Error fetching billing data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancelSubscription = async () => {
    if (!subscription) return
    
    setIsUpdating(true)
    try {
      const response = await fetch('/api/billing/cancel', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const data = await response.json()

      if (response.ok) {
        toast.success('Subscription canceled successfully')
        setSubscription({ ...subscription, cancelAtPeriodEnd: true })
      } else {
        toast.error(data.error || 'Failed to cancel subscription')
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An error occurred'
      toast.error(errorMessage)
    } finally {
      setIsUpdating(false)
    }
  }

  const handleReactivateSubscription = async () => {
    if (!subscription) return
    
    setIsUpdating(true)
    try {
      const response = await fetch('/api/billing/reactivate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const data = await response.json()

      if (response.ok) {
        toast.success('Subscription reactivated successfully')
        setSubscription({ ...subscription, cancelAtPeriodEnd: false })
      } else {
        toast.error(data.error || 'Failed to reactivate subscription')
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An error occurred'
      toast.error(errorMessage)
    } finally {
      setIsUpdating(false)
    }
  }

  const handleUpgrade = () => {
    // Redirect to pricing page or upgrade flow
    router.push('/pricing')
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" />Active</Badge>
      case 'canceled':
        return <Badge className="bg-red-100 text-red-800"><XCircle className="w-3 h-3 mr-1" />Canceled</Badge>
      case 'past_due':
        return <Badge className="bg-yellow-100 text-yellow-800"><AlertTriangle className="w-3 h-3 mr-1" />Past Due</Badge>
      case 'trialing':
        return <Badge className="bg-blue-100 text-blue-800"><Zap className="w-3 h-3 mr-1" />Trial</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const getInvoiceStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return <Badge className="bg-green-100 text-green-800">Paid</Badge>
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>
      case 'failed':
        return <Badge className="bg-red-100 text-red-800">Failed</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  if (status === 'loading' || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-indigo-600" />
          <p className="mt-2 text-sm text-gray-600">Loading billing information...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Billing & Subscription</h1>
          <p className="mt-2 text-gray-600">
            Manage your subscription, view invoices, and update billing information
          </p>
        </div>

        <div className="space-y-8">
          {/* Current Subscription */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Crown className="mr-2 h-5 w-5" />
                Current Subscription
              </CardTitle>
              <CardDescription>
                Your current plan and billing information
              </CardDescription>
            </CardHeader>
            <CardContent>
              {subscription ? (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold">{subscription.planName}</h3>
                      <p className="text-gray-600">
                        ${subscription.planPrice}/{subscription.billingCycle === 'monthly' ? 'month' : 'year'}
                      </p>
                    </div>
                    <div className="text-right">
                      {getStatusBadge(subscription.status)}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Current Period</Label>
                      <p className="text-sm text-gray-900">
                        {new Date(subscription.currentPeriodStart).toLocaleDateString()} - {new Date(subscription.currentPeriodEnd).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Next Billing Date</Label>
                      <p className="text-sm text-gray-900">
                        {subscription.cancelAtPeriodEnd 
                          ? 'Subscription will end on ' + new Date(subscription.currentPeriodEnd).toLocaleDateString()
                          : new Date(subscription.currentPeriodEnd).toLocaleDateString()
                        }
                      </p>
                    </div>
                  </div>

                  {subscription.cancelAtPeriodEnd && (
                    <Alert>
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>
                        Your subscription is set to cancel at the end of the current billing period. 
                        You&apos;ll continue to have access until {new Date(subscription.currentPeriodEnd).toLocaleDateString()}.
                      </AlertDescription>
                    </Alert>
                  )}

                  <div className="flex flex-wrap gap-3">
                    <Button onClick={handleUpgrade} className="flex items-center">
                      <Crown className="mr-2 h-4 w-4" />
                      Upgrade Plan
                    </Button>
                    
                    {subscription.cancelAtPeriodEnd ? (
                      <Button 
                        variant="outline" 
                        onClick={handleReactivateSubscription}
                        disabled={isUpdating}
                      >
                        {isUpdating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Reactivate Subscription
                      </Button>
                    ) : (
                      <Button 
                        variant="outline" 
                        onClick={handleCancelSubscription}
                        disabled={isUpdating}
                      >
                        {isUpdating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Cancel Subscription
                      </Button>
                    )}
                    
                    <Button variant="outline" className="flex items-center">
                      <ExternalLink className="mr-2 h-4 w-4" />
                      Manage Payment Method
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Crown className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Active Subscription</h3>
                  <p className="text-gray-600 mb-4">
                    You don&apos;t have an active subscription. Upgrade to access premium features.
                  </p>
                  <Button onClick={handleUpgrade} className="flex items-center mx-auto">
                    <Crown className="mr-2 h-4 w-4" />
                    View Plans
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          <Separator />

          {/* Billing History */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <CreditCard className="mr-2 h-5 w-5" />
                Billing History
              </CardTitle>
              <CardDescription>
                View and download your past invoices
              </CardDescription>
            </CardHeader>
            <CardContent>
              {invoices.length > 0 ? (
                <div className="space-y-4">
                  {invoices.map((invoice) => (
                    <div key={invoice.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="flex-shrink-0">
                          <Calendar className="h-5 w-5 text-gray-400" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            Invoice #{invoice.id.slice(-8)}
                          </p>
                          <p className="text-sm text-gray-600">
                            {new Date(invoice.date).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-4">
                        <div className="text-right">
                          <p className="text-sm font-medium text-gray-900">
                            ${invoice.amount.toFixed(2)}
                          </p>
                          {getInvoiceStatusBadge(invoice.status)}
                        </div>
                        
                        {invoice.downloadUrl && (
                          <Button variant="outline" size="sm" className="flex items-center">
                            <Download className="mr-2 h-4 w-4" />
                            Download
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <CreditCard className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Billing History</h3>
                  <p className="text-gray-600">
                    Your billing history will appear here once you have an active subscription.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Usage & Limits */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <DollarSign className="mr-2 h-5 w-5" />
                Usage & Limits
              </CardTitle>
              <CardDescription>
                Track your current usage against plan limits
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900">API Requests</p>
                    <p className="text-sm text-gray-600">This month</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">1,250 / 10,000</p>
                    <div className="w-32 bg-gray-200 rounded-full h-2 mt-1">
                      <div className="bg-indigo-600 h-2 rounded-full" style={{ width: '12.5%' }}></div>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900">Storage Used</p>
                    <p className="text-sm text-gray-600">Total storage</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">2.3 GB / 10 GB</p>
                    <div className="w-32 bg-gray-200 rounded-full h-2 mt-1">
                      <div className="bg-indigo-600 h-2 rounded-full" style={{ width: '23%' }}></div>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900">Team Members</p>
                    <p className="text-sm text-gray-600">Active members</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">3 / 5</p>
                    <div className="w-32 bg-gray-200 rounded-full h-2 mt-1">
                      <div className="bg-indigo-600 h-2 rounded-full" style={{ width: '60%' }}></div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

function Label({ className, children }: { className?: string; children: React.ReactNode }) {
  return <label className={className}>{children}</label>
}