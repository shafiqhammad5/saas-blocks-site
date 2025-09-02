import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { isAdmin } from '@/lib/admin-auth'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { v4 as uuidv4 } from 'uuid'

// GET /api/admin/blocks - List all blocks with pagination and filters
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || !isAdmin(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '12')
    const search = searchParams.get('search')
    const category = searchParams.get('category')
    const status = searchParams.get('status')
    const type = searchParams.get('type')
    const sort = searchParams.get('sort') || 'createdAt'
    const order = searchParams.get('order') || 'desc'
    const skip = (page - 1) * limit

    // Build where clause
    const where: {
      OR?: Array<{
        title?: { contains: string; mode: 'insensitive' }
        description?: { contains: string; mode: 'insensitive' }
      }>
      categoryId?: string
      isPublished?: boolean
      isPro?: boolean
    } = {}

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ]
    }

    if (category && category !== 'all') {
      where.categoryId = category
    }

    if (status === 'published') {
      where.isPublished = true
    } else if (status === 'draft') {
      where.isPublished = false
    }

    if (type === 'pro') {
      where.isPro = true
    } else if (type === 'free') {
      where.isPro = false
    }

    // Build orderBy clause
    const orderBy: Record<string, 'asc' | 'desc'> = {}
    if (sort === 'title' || sort === 'createdAt' || sort === 'views' || sort === 'likes') {
      orderBy[sort] = order as 'asc' | 'desc'
    } else {
      orderBy.createdAt = 'desc'
    }

    const [blocks, totalCount] = await Promise.all([
      prisma.block.findMany({
        where,
        include: {
          category: {
            select: {
              id: true,
              name: true,
              slug: true,
              color: true
            }
          },
          author: {
            select: {
              id: true,
              name: true,
              email: true
            }
          },
          tags: {
            select: {
              id: true,
              name: true,
              slug: true
            }
          }
        },
        orderBy,
        skip,
        take: limit
      }),
      prisma.block.count({ where })
    ])

    const totalPages = Math.ceil(totalCount / limit)

    return NextResponse.json({
      blocks,
      total: totalCount,
      totalPages,
      currentPage: page
    })
  } catch (error) {
    console.error('Error fetching blocks:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/admin/blocks - Create a new block
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || !isAdmin(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await request.formData()
    
    // Extract form fields
    const title = formData.get('title') as string
    const slug = formData.get('slug') as string
    const description = formData.get('description') as string
    const category = formData.get('category') as string
    const isPublished = formData.get('isPublished') === 'true'
    const isPremium = formData.get('isPremium') === 'true'
    const htmlCode = formData.get('htmlCode') as string
    const cssCode = formData.get('cssCode') as string
    const jsCode = formData.get('jsCode') as string
    const reactCode = formData.get('reactCode') as string
    const vueCode = formData.get('vueCode') as string
    const instructions = formData.get('instructions') as string
    const demoUrl = formData.get('demoUrl') as string
    const githubUrl = formData.get('githubUrl') as string
    const tags = JSON.parse(formData.get('tags') as string || '[]')
    const dependencies = JSON.parse(formData.get('dependencies') as string || '[]')
    const previewImage = formData.get('previewImage') as File | null

    // Check if slug already exists
    const existingBlock = await prisma.block.findUnique({
      where: { slug }
    })

    if (existingBlock) {
      return NextResponse.json(
        { error: 'A block with this slug already exists' },
        { status: 400 }
      )
    }

    // Find or create category
    const categorySlug = category.toLowerCase().replace(/[^a-z0-9 -]/g, '').replace(/\s+/g, '-')
    const blockCategory = await prisma.category.upsert({
      where: { slug: categorySlug },
      update: {},
      create: {
        name: category,
        slug: categorySlug
      }
    })

    // Handle preview image upload
    let previewImagePath = null
    if (previewImage && previewImage.size > 0) {
      const bytes = await previewImage.arrayBuffer()
      const buffer = Buffer.from(bytes)
      
      // Create uploads directory if it doesn't exist
      const uploadsDir = join(process.cwd(), 'public', 'uploads', 'blocks')
      await mkdir(uploadsDir, { recursive: true })
      
      // Generate unique filename
      const fileExtension = previewImage.name.split('.').pop()
      const fileName = `${uuidv4()}.${fileExtension}`
      const filePath = join(uploadsDir, fileName)
      
      await writeFile(filePath, buffer)
      previewImagePath = `/uploads/blocks/${fileName}`
    }

    // Create or connect tags
    const tagConnections = await Promise.all(
      tags.map(async (tagName: string) => {
        const tagSlug = tagName.toLowerCase().replace(/[^a-z0-9 -]/g, '').replace(/\s+/g, '-')
        const tag = await prisma.tag.upsert({
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

    // Combine all code into a single code field
    const combinedCode = JSON.stringify({
      html: htmlCode || '',
      css: cssCode || '',
      js: jsCode || '',
      react: reactCode || '',
      vue: vueCode || '',
      dependencies: dependencies || [],
      instructions: instructions || '',
      demoUrl: demoUrl || '',
      githubUrl: githubUrl || ''
    })

    const block = await prisma.block.create({
      data: {
        title,
        slug,
        description,
        code: combinedCode,
        preview: previewImagePath,
        isPro: isPremium,
        isPublished,
        categoryId: blockCategory.id,
        authorId: session.user.id,
        tags: {
          connect: tagConnections
        }
      },
      include: {
        category: {
          select: {
            name: true,
            slug: true
          }
        },
        author: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        tags: {
          select: {
            name: true
          }
        }
      }
    })

    return NextResponse.json(block, { status: 201 })
  } catch (error) {
    console.error('Error creating block:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}