import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { isAdmin } from '@/lib/admin-auth'

// GET /api/admin/subscriptions - List subscriptions with stats
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || !isAdmin(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const search = searchParams.get('search') || ''
    const status = searchParams.get('status') || 'all'
    const plan = searchParams.get('plan') || 'all'

    const skip = (page - 1) * limit

    // Build where clause
    const where: Record<string, unknown> = {}
    const andConditions: Record<string, unknown>[] = []

    if (search) {
      andConditions.push({
        user: {
          OR: [
            { name: { contains: search, mode: 'insensitive' } },
            { email: { contains: search, mode: 'insensitive' } }
          ]
        }
      })
    }

    if (status !== 'all') {
      andConditions.push({ status: status.toUpperCase() })
    }

    if (plan !== 'all') {
      andConditions.push({ planId: plan })
    }

    if (andConditions.length > 0) {
      where.AND = andConditions
    }

    // Get subscriptions with pagination
    const [subscriptions, total] = await Promise.all([
      prisma.subscription.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      }),
      prisma.subscription.count({ where })
    ])

    // Calculate stats
    const [totalSubscriptions, activeSubscriptions] = await Promise.all([
      prisma.subscription.count(),
      prisma.subscription.count({ where: { status: 'ACTIVE' } })
    ])

    // For demo purposes, we'll use placeholder revenue values
    // In a real app, you'd calculate this from your payment processor data
    const monthlyRevenue = activeSubscriptions * 2900 // $29 per month in cents
    const yearlyRevenue = activeSubscriptions * 29000 // $290 per year in cents

    // Calculate new subscriptions this month
    const thisMonth = new Date()
    thisMonth.setDate(1)
    thisMonth.setHours(0, 0, 0, 0)

    const newSubscriptions = await prisma.subscription.count({
      where: {
        createdAt: {
          gte: thisMonth
        }
      }
    })

    // Calculate churn rate (simplified)
    const lastMonth = new Date(thisMonth)
    lastMonth.setMonth(lastMonth.getMonth() - 1)

    const [canceledThisMonth, totalLastMonth] = await Promise.all([
      prisma.subscription.count({
        where: {
          status: 'CANCELED',
          updatedAt: {
            gte: thisMonth
          }
        }
      }),
      prisma.subscription.count({
        where: {
          createdAt: {
            lt: thisMonth
          }
        }
      })
    ])

    const churnRate = totalLastMonth > 0 ? (canceledThisMonth / totalLastMonth) * 100 : 0

    const stats = {
      totalSubscriptions,
      activeSubscriptions,
      monthlyRevenue,
      yearlyRevenue,
      churnRate,
      newSubscriptions
    }

    const totalPages = Math.ceil(total / limit)

    return NextResponse.json({
      subscriptions,
      stats,
      total,
      totalPages,
      currentPage: page
    })
  } catch (error) {
    console.error('Error fetching subscriptions:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}