'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Search,
  MoreHorizontal,
  CreditCard,
  Calendar,
  DollarSign,
  Users,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  XCircle,
  Clock,
  RefreshCw
} from 'lucide-react'
import { toast } from 'sonner'

interface Subscription {
  id: string
  userId: string
  planId: string | null
  status: 'ACTIVE' | 'CANCELED' | 'PAST_DUE' | 'TRIALING' | 'INACTIVE'
  currentPeriodStart: string | null
  currentPeriodEnd: string | null
  cancelAtPeriodEnd: boolean
  user: {
    id: string
    name: string | null
    email: string
  }
  createdAt: string
  updatedAt: string
}

interface SubscriptionStats {
  totalSubscriptions: number
  activeSubscriptions: number
  monthlyRevenue: number
  yearlyRevenue: number
  churnRate: number
  newSubscriptions: number
}

const statusColors = {
  ACTIVE: 'bg-green-100 text-green-800 border-green-200',
  CANCELED: 'bg-red-100 text-red-800 border-red-200',
  PAST_DUE: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  TRIALING: 'bg-blue-100 text-blue-800 border-blue-200',
  INACTIVE: 'bg-gray-100 text-gray-800 border-gray-200'
}

const statusIcons = {
  ACTIVE: CheckCircle,
  CANCELED: XCircle,
  PAST_DUE: AlertCircle,
  TRIALING: Clock,
  INACTIVE: XCircle
}

export default function SubscriptionsPage() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([])
  const [stats, setStats] = useState<SubscriptionStats>({
    totalSubscriptions: 0,
    activeSubscriptions: 0,
    monthlyRevenue: 0,
    yearlyRevenue: 0,
    churnRate: 0,
    newSubscriptions: 0
  })
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [planFilter, setPlanFilter] = useState('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [isRefunding, setIsRefunding] = useState(false)
  const [selectedSubscription, setSelectedSubscription] = useState<Subscription | null>(null)
  const [isRefundDialogOpen, setIsRefundDialogOpen] = useState(false)
  const [refundAmount, setRefundAmount] = useState('')
  const [refundReason, setRefundReason] = useState('')

  const fetchSubscriptions = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: currentPage.toString(),
        search: searchTerm,
        status: statusFilter,
        plan: planFilter
      })

      const response = await fetch(`/api/admin/subscriptions?${params}`)
      if (!response.ok) throw new Error('Failed to fetch subscriptions')

      const data = await response.json()
      setSubscriptions(data.subscriptions)
      setStats(data.stats)
      setTotalPages(data.totalPages)
    } catch (error) {
      console.error('Error fetching subscriptions:', error)
      toast.error('Failed to load subscriptions')
    } finally {
      setLoading(false)
    }
  }

  const handleCancelSubscription = async (subscriptionId: string) => {
    try {
      const response = await fetch(`/api/admin/subscriptions/${subscriptionId}/cancel`, {
        method: 'POST'
      })

      if (!response.ok) throw new Error('Failed to cancel subscription')

      toast.success('Subscription canceled successfully')
      fetchSubscriptions()
    } catch (error) {
      console.error('Error canceling subscription:', error)
      toast.error('Failed to cancel subscription')
    }
  }

  const handleReactivateSubscription = async (subscriptionId: string) => {
    try {
      const response = await fetch(`/api/admin/subscriptions/${subscriptionId}/reactivate`, {
        method: 'POST'
      })

      if (!response.ok) throw new Error('Failed to reactivate subscription')

      toast.success('Subscription reactivated successfully')
      fetchSubscriptions()
    } catch (error) {
      console.error('Error reactivating subscription:', error)
      toast.error('Failed to reactivate subscription')
    }
  }

  const handleRefund = async () => {
    if (!selectedSubscription || !refundAmount) return

    try {
      setIsRefunding(true)
      const response = await fetch(`/api/admin/subscriptions/${selectedSubscription.id}/refund`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: parseFloat(refundAmount),
          reason: refundReason
        })
      })

      if (!response.ok) throw new Error('Failed to process refund')

      toast.success('Refund processed successfully')
      setIsRefundDialogOpen(false)
      setRefundAmount('')
      setRefundReason('')
      setSelectedSubscription(null)
      fetchSubscriptions()
    } catch (error) {
      console.error('Error processing refund:', error)
      toast.error('Failed to process refund')
    } finally {
      setIsRefunding(false)
    }
  }

  const formatCurrency = (planId: string | null) => {
    // Demo pricing based on plan
    const pricing = {
      'basic': '$9.99',
      'pro': '$29.99',
      'enterprise': '$99.99'
    }
    return pricing[planId as keyof typeof pricing] || '$0.00'
  }

  const formatRevenue = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  useEffect(() => {
    fetchSubscriptions()
  }, [currentPage, searchTerm, statusFilter, planFilter])

  const filteredSubscriptions = subscriptions

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Subscriptions</h1>
          <p className="text-muted-foreground">
            Manage user subscriptions and billing
          </p>
        </div>
        <Button onClick={fetchSubscriptions} variant="outline">
          <RefreshCw className="mr-2 h-4 w-4" />
          Refresh
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Subscriptions</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalSubscriptions}</div>
            <p className="text-xs text-muted-foreground">
              +{stats.newSubscriptions} from last month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Subscriptions</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeSubscriptions}</div>
            <p className="text-xs text-muted-foreground">
              {((stats.activeSubscriptions / stats.totalSubscriptions) * 100).toFixed(1)}% of total
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatRevenue(stats.monthlyRevenue)}</div>
            <p className="text-xs text-muted-foreground">
              <TrendingUp className="inline h-3 w-3" /> +12% from last month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Churn Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.churnRate.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">
              -2.1% from last month
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex items-center space-x-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by user name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="canceled">Canceled</SelectItem>
              <SelectItem value="past_due">Past Due</SelectItem>
              <SelectItem value="trialing">Trialing</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>

          <Select value={planFilter} onValueChange={setPlanFilter}>
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="Plan" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Plans</SelectItem>
              <SelectItem value="basic">Basic</SelectItem>
              <SelectItem value="pro">Pro</SelectItem>
              <SelectItem value="enterprise">Enterprise</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Subscriptions Table */}
      <div className="rounded-md border">
        {loading ? (
          <div className="flex items-center justify-center p-8">
            <div className="text-center">
              <RefreshCw className="mx-auto h-8 w-8 animate-spin text-muted-foreground" />
              <p className="mt-2 text-sm text-muted-foreground">Loading subscriptions...</p>
            </div>
          </div>
        ) : filteredSubscriptions.length === 0 ? (
          <div className="flex items-center justify-center p-8">
            <div className="text-center">
              <CreditCard className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-2 text-sm font-semibold text-gray-900">No subscriptions found</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                {searchTerm || statusFilter !== 'all' || planFilter !== 'all'
                  ? 'No subscriptions match your filters.'
                  : 'No subscriptions have been created yet.'}
              </p>
            </div>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Plan</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Period</TableHead>
                <TableHead>Next Billing</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSubscriptions.map((subscription) => {
                const StatusIcon = statusIcons[subscription.status]
                return (
                  <TableRow key={subscription.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{subscription.user.name}</div>
                        <div className="text-sm text-muted-foreground">{subscription.user.email}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="capitalize">
                        {subscription.planId || 'No Plan'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={statusColors[subscription.status]}>
                        <StatusIcon className="mr-1 h-3 w-3" />
                        {subscription.status.replace('_', ' ')}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">
                        {formatCurrency(subscription.planId)}
                      </div>
                      <div className="text-sm text-muted-foreground">/month</div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {subscription.currentPeriodStart && subscription.currentPeriodEnd ? (
                          `${formatDate(subscription.currentPeriodStart)} - ${formatDate(subscription.currentPeriodEnd)}`
                        ) : (
                          'No active period'
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {subscription.cancelAtPeriodEnd ? (
                          <span className="text-red-600">Canceling</span>
                        ) : subscription.currentPeriodEnd ? (
                          formatDate(subscription.currentPeriodEnd)
                        ) : (
                          'N/A'
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {subscription.status === 'ACTIVE' && !subscription.cancelAtPeriodEnd && (
                            <DropdownMenuItem onClick={() => handleCancelSubscription(subscription.id)}>
                              <XCircle className="mr-2 h-4 w-4" />
                              Cancel Subscription
                            </DropdownMenuItem>
                          )}
                          {(subscription.status === 'CANCELED' || subscription.cancelAtPeriodEnd) && (
                            <DropdownMenuItem onClick={() => handleReactivateSubscription(subscription.id)}>
                              <CheckCircle className="mr-2 h-4 w-4" />
                              Reactivate
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem
                            onClick={() => {
                              setSelectedSubscription(subscription)
                              setRefundAmount('29.99') // Default refund amount
                              setIsRefundDialogOpen(true)
                            }}
                          >
                            <DollarSign className="mr-2 h-4 w-4" />
                            Process Refund
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Page {currentPage} of {totalPages}
          </p>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {/* Refund Dialog */}
      <Dialog open={isRefundDialogOpen} onOpenChange={setIsRefundDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Process Refund</DialogTitle>
            <DialogDescription>
              Process a refund for {selectedSubscription?.user.name}&apos;s subscription
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="refundAmount">Refund Amount</Label>
              <Input
                id="refundAmount"
                type="number"
                step="0.01"
                value={refundAmount}
                onChange={(e) => setRefundAmount(e.target.value)}
                placeholder="Enter refund amount"
              />
            </div>
            <div>
              <Label htmlFor="refundReason">Reason (Optional)</Label>
              <Input
                id="refundReason"
                value={refundReason}
                onChange={(e) => setRefundReason(e.target.value)}
                placeholder="Reason for refund"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRefundDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleRefund} disabled={isRefunding || !refundAmount}>
              {isRefunding ? 'Processing...' : 'Process Refund'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}