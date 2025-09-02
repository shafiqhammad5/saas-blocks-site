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
    const limit = parseInt(searchParams.get('limit') || '10')
    const search = searchParams.get('search')
    const status = searchParams.get('status')
    const category = searchParams.get('category')
    const skip = (page - 1) * limit

    const where: {
      OR?: {
        title?: { contains: string; mode: 'insensitive' }
        excerpt?: { contains: string; mode: 'insensitive' }
        content?: { contains: string; mode: 'insensitive' }
      }[]
      isPublished?: boolean
      categories?: {
        some: {
          slug: string
        }
      }
    } = {}

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { excerpt: { contains: search, mode: 'insensitive' } },
        { content: { contains: search, mode: 'insensitive' } }
      ]
    }

    if (status) {
      where.isPublished = status === 'published'
    }

    if (category) {
      where.categories = {
        some: {
          slug: category
        }
      }
    }

    const [posts, total] = await Promise.all([
      prisma.blogPost.findMany({
        where,
        include: {
          author: {
            select: { id: true, name: true, email: true, image: true }
          },
          categories: {
            select: { id: true, name: true, slug: true }
          },
          tags: {
            select: { id: true, name: true, slug: true }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      }),
      prisma.blogPost.count({ where })
    ])

    return NextResponse.json({
      posts,
      total,
      page,
      totalPages: Math.ceil(total / limit)
    })
  } catch (error) {
    console.error('Error fetching blog posts:', error)
    return NextResponse.json(
      { error: 'Failed to fetch blog posts' },
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
    const {
      title,
      slug,
      excerpt,
      content,
      coverImage,
      isPublished,
      publishedAt,
      readTime,
      categories,
      tags
    } = body

    // Validate required fields
    if (!title || !content) {
      return NextResponse.json(
        { error: 'Title and content are required' },
        { status: 400 }
      )
    }

    // Generate slug if not provided
    const finalSlug = slug || title
      .toLowerCase()
      .replace(/[^a-z0-9 -]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim()

    // Check if slug already exists
    const existingPost = await prisma.blogPost.findUnique({
      where: { slug: finalSlug }
    })

    if (existingPost) {
      return NextResponse.json(
        { error: 'A post with this slug already exists' },
        { status: 400 }
      )
    }

    // Create or find categories
    const categoryConnections = []
    if (categories && categories.length > 0) {
      for (const categoryName of categories) {
        const categorySlug = categoryName
          .toLowerCase()
          .replace(/[^a-z0-9 -]/g, '')
          .replace(/\s+/g, '-')
          .replace(/-+/g, '-')
          .trim()

        const category = await prisma.blogCategory.upsert({
          where: { slug: categorySlug },
          update: {},
          create: {
            name: categoryName,
            slug: categorySlug,
            description: `Category for ${categoryName}`
          }
        })
        categoryConnections.push({ id: category.id })
      }
    }

    // Create or find tags
    const tagConnections = []
    if (tags && tags.length > 0) {
      for (const tagName of tags) {
        const tagSlug = tagName
          .toLowerCase()
          .replace(/[^a-z0-9 -]/g, '')
          .replace(/\s+/g, '-')
          .replace(/-+/g, '-')
          .trim()

        const tag = await prisma.blogTag.upsert({
          where: { slug: tagSlug },
          update: {},
          create: {
            name: tagName,
            slug: tagSlug
          }
        })
        tagConnections.push({ id: tag.id })
      }
    }

    // Calculate read time if not provided
    const wordsPerMinute = 200
    const wordCount = content.split(/\s+/).length
    const calculatedReadTime = Math.ceil(wordCount / wordsPerMinute)

    // Create the blog post
    const blogPost = await prisma.blogPost.create({
      data: {
        title,
        slug: finalSlug,
        excerpt: excerpt || null,
        content,
        coverImage: coverImage || null,
        isPublished: isPublished || false,
        publishedAt: isPublished && publishedAt ? new Date(publishedAt) : (isPublished ? new Date() : null),
        readTime: readTime || calculatedReadTime,
        views: 0,
        authorId: session.user.id,
        categories: {
          connect: categoryConnections
        },
        tags: {
          connect: tagConnections
        }
      },
      include: {
        author: {
          select: { id: true, name: true, email: true, image: true }
        },
        categories: {
          select: { id: true, name: true, slug: true }
        },
        tags: {
          select: { id: true, name: true, slug: true }
        }
      }
    })

    return NextResponse.json(blogPost, { status: 201 })
  } catch (error) {
    console.error('Error creating blog post:', error)
    return NextResponse.json(
      { error: 'Failed to create blog post' },
      { status: 500 }
    )
  }
}