import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { isAdmin } from '@/lib/admin-auth'
import { writeFile, mkdir, unlink } from 'fs/promises'
import { join } from 'path'
import { v4 as uuidv4 } from 'uuid'
import { existsSync } from 'fs'

// GET /api/admin/blocks/[id] - Get a specific block
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
    const block = await prisma.block.findUnique({
      where: { id },
      include: {
        category: {
          select: {
            id: true,
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
            id: true,
            name: true,
            slug: true
          }
        }
      }
    })

    if (!block) {
      return NextResponse.json({ error: 'Block not found' }, { status: 404 })
    }

    // Parse the code field to extract individual code snippets
    let codeData = {
      html: '',
      css: '',
      js: '',
      react: '',
      vue: '',
      dependencies: [],
      instructions: '',
      demoUrl: '',
      githubUrl: ''
    }

    try {
      if (block.code) {
        codeData = JSON.parse(block.code)
      }
    } catch (error) {
      console.error('Error parsing block code:', error)
    }

    const transformedBlock = {
      id: block.id,
      title: block.title,
      slug: block.slug,
      description: block.description,
      category: block.category,
      isPublished: block.isPublished,
      isPremium: block.isPro,
      preview: block.preview,
      views: block.views,
      createdAt: block.createdAt.toISOString(),
      updatedAt: block.updatedAt.toISOString(),
      author: block.author,
      tags: block.tags,
      ...codeData
    }

    return NextResponse.json(transformedBlock)
  } catch (error) {
    console.error('Error fetching block:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PUT /api/admin/blocks/[id] - Update a block
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

    // Check if block exists
    const existingBlock = await prisma.block.findUnique({
      where: { id },
      include: {
        tags: true
      }
    })

    if (!existingBlock) {
      return NextResponse.json({ error: 'Block not found' }, { status: 404 })
    }

    // Check if slug is being changed and if new slug already exists
    if (slug !== existingBlock.slug) {
      const slugExists = await prisma.block.findFirst({
        where: {
          slug,
          id: { not: id }
        }
      })

      if (slugExists) {
        return NextResponse.json(
          { error: 'A block with this slug already exists' },
          { status: 400 }
        )
      }
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
    let previewImagePath = existingBlock.preview
    if (previewImage && previewImage.size > 0) {
      // Delete old image if it exists
      if (existingBlock.preview) {
        const oldImagePath = join(process.cwd(), 'public', existingBlock.preview)
        if (existsSync(oldImagePath)) {
          try {
            await unlink(oldImagePath)
          } catch (error) {
            console.error('Error deleting old image:', error)
          }
        }
      }

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

    // Disconnect existing tags and connect new ones
    await prisma.block.update({
      where: { id },
      data: {
        tags: {
          disconnect: existingBlock.tags.map(tag => ({ id: tag.id }))
        }
      }
    })

    const updatedBlock = await prisma.block.update({
      where: { id },
      data: {
        title,
        slug,
        description,
        code: combinedCode,
        preview: previewImagePath,
        isPro: isPremium,
        isPublished,
        categoryId: blockCategory.id,
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

    return NextResponse.json(updatedBlock)
  } catch (error) {
    console.error('Error updating block:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE /api/admin/blocks/[id] - Delete a block
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
    const block = await prisma.block.findUnique({
      where: { id }
    })

    if (!block) {
      return NextResponse.json({ error: 'Block not found' }, { status: 404 })
    }

    // Delete preview image if it exists
    if (block.preview) {
      const imagePath = join(process.cwd(), 'public', block.preview)
      if (existsSync(imagePath)) {
        try {
          await unlink(imagePath)
        } catch (error) {
          console.error('Error deleting image:', error)
        }
      }
    }

    await prisma.block.delete({
      where: { id }
    })

    return NextResponse.json({ message: 'Block deleted successfully' })
  } catch (error) {
    console.error('Error deleting block:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PATCH /api/admin/blocks/[id] - Partial update (e.g., toggle publish status)
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
      isPro?: boolean
    } = {}

    if ('isPublished' in body) {
      updates.isPublished = body.isPublished
    }

    if ('isPro' in body) {
      updates.isPro = body.isPro
    }

    const updatedBlock = await prisma.block.update({
      where: { id },
      data: updates,
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

    return NextResponse.json(updatedBlock)
  } catch (error) {
    console.error('Error updating block:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}