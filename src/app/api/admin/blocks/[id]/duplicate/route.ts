import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

interface RouteParams {
  params: Promise<{
    id: string
  }>
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { id } = await params

    // Find the original block with its tags
    const originalBlock = await prisma.block.findUnique({
      where: { id },
      include: {
        tags: true,
        category: true
      }
    })

    if (!originalBlock) {
      return NextResponse.json(
        { error: 'Block not found' },
        { status: 404 }
      )
    }

    // Generate a unique slug for the duplicated block
    let duplicateSlug = `${originalBlock.slug}-copy`
    let counter = 1
    
    while (await prisma.block.findUnique({ where: { slug: duplicateSlug } })) {
      duplicateSlug = `${originalBlock.slug}-copy-${counter}`
      counter++
    }

    // Create the duplicate block
    const duplicatedBlock = await prisma.block.create({
      data: {
        title: `${originalBlock.title} (Copy)`,
        slug: duplicateSlug,
        description: originalBlock.description,
        code: originalBlock.code,
        preview: originalBlock.preview,
        isPro: originalBlock.isPro,
        isPublished: false, // Set as draft by default
        views: 0, // Reset views
        likes: 0, // Reset likes
        categoryId: originalBlock.categoryId,
        authorId: session.user.id,
        tags: {
          connect: originalBlock.tags.map(tag => ({ id: tag.id }))
        }
      },
      include: {
        category: true,
        author: true,
        tags: true
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Block duplicated successfully',
      block: duplicatedBlock
    })

  } catch (error) {
    console.error('Duplicate block error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}