import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/blocks - Get published blocks with pagination and filters (public endpoint)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '12')
    const search = searchParams.get('search')
    const category = searchParams.get('category')
    const difficulty = searchParams.get('difficulty')
    const sort = searchParams.get('sort') || 'popular'
    const showPremiumOnly = searchParams.get('premium') === 'true'
    const skip = (page - 1) * limit

    // Build where clause
    const where: {
      isPublished: boolean
      OR?: Array<{
        title?: { contains: string; mode: 'insensitive' }
        description?: { contains: string; mode: 'insensitive' }
      }>
      category?: {
        slug: string
      }
      difficulty?: string
      isPro?: boolean
    } = {
      isPublished: true
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ]
    }

    if (category && category !== 'All') {
      where.category = {
        slug: category.toLowerCase()
      }
    }

    if (difficulty && difficulty !== 'All') {
      where.difficulty = difficulty
    }

    if (showPremiumOnly) {
      where.isPro = true
    }

    // Determine sort order
    let orderBy: { createdAt?: 'desc' | 'asc'; likes?: 'desc' | 'asc'; views?: 'desc' | 'asc' } = { createdAt: 'desc' }
    switch (sort) {
      case 'likes':
        orderBy = { likes: 'desc' }
        break
      case 'views':
        orderBy = { views: 'desc' }
        break
      case 'recent':
        orderBy = { createdAt: 'desc' }
        break
      case 'popular':
      default:
        orderBy = { views: 'desc' }
        break
    }

    const [blocks, total] = await Promise.all([
      prisma.block.findMany({
        where,
        select: {
          id: true,
          title: true,
          slug: true,
          description: true,
          preview: true,
          isPro: true,
          likes: true,
          views: true,
          category: {
            select: {
              id: true,
              name: true,
              slug: true
            }
          },
          tags: {
            select: {
              name: true,
              slug: true
            }
          },
          author: {
            select: {
              name: true,
              image: true
            }
          }
        },
        orderBy,
        skip,
        take: limit
      }),
      prisma.block.count({ where })
    ])

    // Transform the data to match the frontend expectations
    const transformedBlocks = blocks.map(block => ({
      id: block.id,
      title: block.title,
      description: block.description,
      category: block.category?.name || 'Uncategorized',
      tags: block.tags.map(tag => tag.name),
      isPremium: block.isPro,
      likes: block.likes || 0,
      views: block.views || 0,
      image: block.preview || '/api/placeholder/400/300',
      slug: block.slug
    }))

    return NextResponse.json({
      blocks: transformedBlocks,
      total,
      page,
      totalPages: Math.ceil(total / limit)
    })
  } catch (error) {
    console.error('Error fetching blocks:', error)
    return NextResponse.json(
      { error: 'Failed to fetch blocks' },
      { status: 500 }
    )
  }
}