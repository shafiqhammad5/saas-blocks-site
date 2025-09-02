import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is admin
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { role: true }
    })

    if (user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const range = searchParams.get('range') || '30d'

    // Calculate date range
    const now = new Date()
    let startDate: Date
    
    switch (range) {
      case '7d':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        break
      case '90d':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)
        break
      case '1y':
        startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000)
        break
      default: // 30d
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
    }

    // Get overview statistics
    const [totalUsers, totalBlocks, activeSubscriptions] = await Promise.all([
      prisma.user.count(),
      prisma.block.count(),
      prisma.subscription.count({
        where: { status: 'ACTIVE' }
      })
    ])

    // Calculate growth metrics (comparing with previous period)
    const previousPeriodStart = new Date(startDate.getTime() - (now.getTime() - startDate.getTime()))
    
    const [currentPeriodUsers, previousPeriodUsers] = await Promise.all([
      prisma.user.count({
        where: {
          createdAt: {
            gte: startDate
          }
        }
      }),
      prisma.user.count({
        where: {
          createdAt: {
            gte: previousPeriodStart,
            lt: startDate
          }
        }
      })
    ])

    const userGrowth = previousPeriodUsers > 0 
      ? ((currentPeriodUsers - previousPeriodUsers) / previousPeriodUsers) * 100 
      : 0

    // Mock data for demonstration (replace with real calculations)
    const totalViews = Math.floor(Math.random() * 100000) + 50000
    const totalLikes = Math.floor(Math.random() * 10000) + 5000
    const totalRevenue = Math.floor(Math.random() * 50000) + 25000 // in cents
    const revenueGrowth = Math.floor(Math.random() * 40) - 20 // -20% to +20%

    // Generate chart data
    const userGrowthData = []
    const blockViewsData = []
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun']
    
    for (let i = 0; i < 6; i++) {
      userGrowthData.push({
        month: months[i],
        users: Math.floor(Math.random() * 1000) + 500,
        revenue: Math.floor(Math.random() * 10000) + 5000
      })
      
      blockViewsData.push({
        date: `2024-0${i + 1}-15`,
        views: Math.floor(Math.random() * 5000) + 2000,
        likes: Math.floor(Math.random() * 500) + 200
      })
    }

    // Get category distribution
    const categories = await prisma.category.findMany({
      include: {
        _count: {
          select: { blocks: true }
        }
      }
    })

    const categoryDistribution = categories.map((category, index) => ({
      name: category.name,
      value: category._count.blocks,
      color: `hsl(${index * 60}, 70%, 50%)`
    }))

    // Get top blocks (mock data)
    const topBlocks = [
      {
        id: '1',
        title: 'Hero Section Component',
        views: 15420,
        likes: 892,
        category: 'Hero'
      },
      {
        id: '2',
        title: 'Pricing Table',
        views: 12350,
        likes: 743,
        category: 'Pricing'
      },
      {
        id: '3',
        title: 'Contact Form',
        views: 9876,
        likes: 567,
        category: 'Forms'
      },
      {
        id: '4',
        title: 'Feature Grid',
        views: 8765,
        likes: 432,
        category: 'Features'
      },
      {
        id: '5',
        title: 'Testimonials Carousel',
        views: 7654,
        likes: 398,
        category: 'Testimonials'
      }
    ]

    // Get recent activity
    const recentUsers = await prisma.user.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true
      }
    })

    const recentBlocks = await prisma.block.findMany({
      take: 3,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        title: true,
        createdAt: true,
        author: {
          select: { name: true }
        }
      }
    })

    const recentActivity = [
      ...recentUsers.map(user => ({
        id: `user-${user.id}`,
        type: 'user_signup' as const,
        description: `${user.name || user.email} signed up`,
        timestamp: user.createdAt.toISOString(),
        user: user.name || user.email
      })),
      ...recentBlocks.map(block => ({
        id: `block-${block.id}`,
        type: 'block_created' as const,
        description: `${block.author?.name || 'User'} created "${block.title}"`,
        timestamp: block.createdAt.toISOString(),
        user: block.author?.name
      }))
    ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).slice(0, 10)

    const analyticsData = {
      overview: {
        totalUsers,
        totalBlocks,
        totalViews,
        totalLikes,
        totalRevenue,
        activeSubscriptions,
        userGrowth: Math.round(userGrowth * 100) / 100,
        revenueGrowth
      },
      chartData: {
        userGrowth: userGrowthData,
        blockViews: blockViewsData,
        categoryDistribution,
        topBlocks
      },
      recentActivity
    }

    return NextResponse.json(analyticsData)
  } catch (error) {
    console.error('Analytics API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}