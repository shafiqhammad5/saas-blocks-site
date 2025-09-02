import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const search = searchParams.get('search')
    const skip = (page - 1) * limit

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

    const [categories, total] = await Promise.all([
      prisma.blogCategory.findMany({
        where,
        include: {
          _count: {
            select: { posts: true }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      }),
      prisma.blogCategory.count({ where })
    ])

    return NextResponse.json({
      categories,
      total,
      page,
      totalPages: Math.ceil(total / limit)
    })
  } catch (error) {
    console.error('Error fetching blog categories:', error)
    return NextResponse.json(
      { error: 'Failed to fetch blog categories' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { name, slug, description } = body

    // Validate required fields
    if (!name) {
      return NextResponse.json(
        { error: 'Name is required' },
        { status: 400 }
      )
    }

    // Generate slug if not provided
    const finalSlug = slug || name
      .toLowerCase()
      .replace(/[^a-z0-9 -]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim()

    // Check if name or slug already exists
    const existingCategory = await prisma.blogCategory.findFirst({
      where: {
        OR: [
          { name: name },
          { slug: finalSlug }
        ]
      }
    })

    if (existingCategory) {
      if (existingCategory.name === name) {
        return NextResponse.json(
          { error: 'A category with this name already exists' },
          { status: 400 }
        )
      }
      if (existingCategory.slug === finalSlug) {
        return NextResponse.json(
          { error: 'A category with this slug already exists' },
          { status: 400 }
        )
      }
    }

    // Create the blog category
    const blogCategory = await prisma.blogCategory.create({
      data: {
        name,
        slug: finalSlug,
        description: description || null
      },
      include: {
        _count: {
          select: { posts: true }
        }
      }
    })

    return NextResponse.json(blogCategory, { status: 201 })
  } catch (error) {
    console.error('Error creating blog category:', error)
    return NextResponse.json(
      { error: 'Failed to create blog category' },
      { status: 500 }
    )
  }
}