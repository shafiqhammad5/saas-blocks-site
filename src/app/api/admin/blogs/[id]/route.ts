import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { isAdmin } from '@/lib/admin-auth'

// GET /api/admin/blogs/[id] - Get a specific blog post
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || !isAdmin(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const post = await prisma.blogPost.findUnique({
      where: { id },
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

    if (!post) {
      return NextResponse.json({ error: 'Blog post not found' }, { status: 404 })
    }

    return NextResponse.json(post)
  } catch (error) {
    console.error('Error fetching blog post:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PUT /api/admin/blogs/[id] - Update a blog post
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || !isAdmin(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
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

    // Check if slug already exists (excluding current post)
    const existingPost = await prisma.blogPost.findFirst({
      where: {
        slug,
        NOT: { id }
      }
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

    // Disconnect all existing tags and categories, then connect new ones
    const post = await prisma.blogPost.update({
      where: { id },
      data: {
        title,
        slug,
        excerpt,
        content,
        isPublished,
        publishedAt: isPublished ? new Date() : null,
        tags: {
          set: [], // Disconnect all
          connect: tagConnections
        },
        categories: {
          set: [], // Disconnect all
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

    return NextResponse.json(post)
  } catch (error) {
    console.error('Error updating blog post:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE /api/admin/blogs/[id] - Delete a blog post
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || !isAdmin(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const post = await prisma.blogPost.findUnique({
      where: { id }
    })

    if (!post) {
      return NextResponse.json({ error: 'Blog post not found' }, { status: 404 })
    }

    await prisma.blogPost.delete({
      where: { id }
    })

    return NextResponse.json({ message: 'Blog post deleted successfully' })
  } catch (error) {
    console.error('Error deleting blog post:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PATCH /api/admin/blogs/[id] - Partially update a blog post (e.g., toggle published status)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || !isAdmin(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()
    const updates: {
      isPublished?: boolean
      publishedAt?: Date | null
    } = {}

    if ('isPublished' in body) {
      updates.isPublished = body.isPublished
      if (body.isPublished) {
        updates.publishedAt = new Date()
      }
    }

    const post = await prisma.blogPost.update({
      where: { id },
      data: updates,
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

    return NextResponse.json(post)
  } catch (error) {
    console.error('Error updating blog post:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}