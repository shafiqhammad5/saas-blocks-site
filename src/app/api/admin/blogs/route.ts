import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { isAdmin } from '@/lib/admin-auth'

// GET /api/admin/blogs - List all blog posts with pagination and filters
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || !isAdmin(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const search = searchParams.get('search')
    const status = searchParams.get('status')
    const skip = (page - 1) * limit

    // Build where clause
    const where: {
      OR?: Array<{
        title?: { contains: string; mode: 'insensitive' }
        excerpt?: { contains: string; mode: 'insensitive' }
        author?: { name: { contains: string; mode: 'insensitive' } }
      }>
      isPublished?: boolean
    } = {}

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { excerpt: { contains: search, mode: 'insensitive' } },
        { author: { name: { contains: search, mode: 'insensitive' } } }
      ]
    }

    if (status === 'published') {
      where.isPublished = true
    } else if (status === 'draft') {
      where.isPublished = false
    }

    const [posts, totalCount] = await Promise.all([
      prisma.blogPost.findMany({
        where,
        include: {
          author: {
            select: {
              id: true,
              name: true,
              email: true
            }
          },
          categories: {
            select: {
              name: true
            }
          },
          tags: {
            select: {
              name: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        },
        skip,
        take: limit
      }),
      prisma.blogPost.count({ where })
    ])

    const totalPages = Math.ceil(totalCount / limit)

    return NextResponse.json({
      posts,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages
      }
    })
  } catch (error) {
    console.error('Error fetching blog posts:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/admin/blogs - Create a new blog post
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || !isAdmin(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const {
      title,
      slug,
      excerpt,
      content,
      isPublished,
      metaTitle,
      metaDescription,
      tags,
      categories
    } = body

    // Check if slug already exists
    const existingPost = await prisma.blogPost.findUnique({
      where: { slug }
    })

    if (existingPost) {
      return NextResponse.json(
        { error: 'A blog post with this slug already exists' },
        { status: 400 }
      )
    }

    // Create or connect tags
    const tagConnections = await Promise.all(
      tags.map(async (tagName: string) => {
        const tagSlug = tagName.toLowerCase().replace(/[^a-z0-9 -]/g, '').replace(/\s+/g, '-')
        const tag = await prisma.blogTag.upsert({
          where: { name: tagName },
          update: {},
          create: { 
            name: tagName,
            slug: tagSlug
          }
        })
        return { id: tag.id }
      })
    )

    // Create or connect categories
    const categoryConnections = await Promise.all(
      categories.map(async (categoryName: string) => {
        const categorySlug = categoryName.toLowerCase().replace(/[^a-z0-9 -]/g, '').replace(/\s+/g, '-')
        const category = await prisma.blogCategory.upsert({
          where: { name: categoryName },
          update: {},
          create: { 
            name: categoryName,
            slug: categorySlug
          }
        })
        return { id: category.id }
      })
    )

    const post = await prisma.blogPost.create({
      data: {
        title,
        slug,
        excerpt,
        content,
        isPublished,
        authorId: session.user.id,
        tags: {
          connect: tagConnections
        },
        categories: {
          connect: categoryConnections
        }
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        categories: {
          select: {
            name: true
          }
        },
        tags: {
          select: {
            name: true
          }
        }
      }
    })

    return NextResponse.json(post, { status: 201 })
  } catch (error) {
    console.error('Error creating blog post:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}