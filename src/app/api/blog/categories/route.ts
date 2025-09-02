import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/blog/categories - Get all blog categories with post counts (public endpoint)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search')
    const limit = parseInt(searchParams.get('limit') || '50')

    const where: {
      OR?: {
        name?: { contains: string; mode: 'insensitive' }
        description?: { contains: string; mode: 'insensitive' }
      }[]
    } = {}

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ]
    }

    const categories = await prisma.blogCategory.findMany({
      where,
      include: {
        _count: {
          select: { 
            posts: {
              where: {
                isPublished: true
              }
            }
          }
        },
        posts: {
          where: {
            isPublished: true
          },
          take: 3,
          orderBy: {
            publishedAt: 'desc'
          },
          select: {
            id: true,
            title: true,
            slug: true,
            excerpt: true,
            publishedAt: true,
            readTime: true,
            views: true,
            author: {
              select: {
                name: true,
                image: true
              }
            }
          }
        }
      },
      orderBy: { name: 'asc' },
      take: limit
    })

    // Transform the data to match the frontend expectations
    const transformedCategories = categories.map(category => ({
      id: category.id,
      name: category.name,
      slug: category.slug,
      description: category.description || '',
      color: 'bg-blue-500', // Default color, could be stored in DB
      postCount: category._count.posts,
      isPopular: category._count.posts > 5, // Consider popular if more than 5 posts
      posts: category.posts
    }))

    return NextResponse.json({
      categories: transformedCategories,
      total: categories.length
    })
  } catch (error) {
    console.error('Error fetching blog categories:', error)
    return NextResponse.json(
      { error: 'Failed to fetch blog categories' },
      { status: 500 }
    )
  }
}