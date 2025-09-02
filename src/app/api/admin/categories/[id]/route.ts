import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { isAdmin } from '@/lib/admin-auth'

// PUT /api/admin/categories/[id] - Update a category
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
    const { name, slug, description, color } = await request.json()
    const categoryId = id

    if (!name || !slug) {
      return NextResponse.json(
        { error: 'Name and slug are required' },
        { status: 400 }
      )
    }

    // Check if category exists
    const existingCategory = await prisma.category.findUnique({
      where: { id: categoryId }
    })

    if (!existingCategory) {
      return NextResponse.json(
        { error: 'Category not found' },
        { status: 404 }
      )
    }

    // Check if another category with same name or slug already exists
    const duplicateCategory = await prisma.category.findFirst({
      where: {
        AND: [
          { id: { not: categoryId } },
          {
            OR: [
              { name: { equals: name, mode: 'insensitive' } },
              { slug: { equals: slug, mode: 'insensitive' } }
            ]
          }
        ]
      }
    })

    if (duplicateCategory) {
      return NextResponse.json(
        { error: 'Category with this name or slug already exists' },
        { status: 409 }
      )
    }

    const updatedCategory = await prisma.category.update({
      where: { id: categoryId },
      data: {
        name,
        slug,
        description,
        color
      },
      include: {
        _count: {
          select: {
            blocks: true
          }
        }
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Category updated successfully',
      category: updatedCategory
    })
  } catch (error) {
    console.error('Error updating category:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE /api/admin/categories/[id] - Delete a category
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
    const categoryId = id

    // Check if category exists
    const existingCategory = await prisma.category.findUnique({
      where: { id: categoryId },
      include: {
        _count: {
          select: {
            blocks: true
          }
        }
      }
    })

    if (!existingCategory) {
      return NextResponse.json(
        { error: 'Category not found' },
        { status: 404 }
      )
    }

    // Check if category has associated blocks
    if (existingCategory._count.blocks > 0) {
      return NextResponse.json(
        { error: 'Cannot delete category with existing blocks' },
        { status: 400 }
      )
    }

    await prisma.category.delete({
      where: { id: categoryId }
    })

    return NextResponse.json({
      success: true,
      message: 'Category deleted successfully'
    })
  } catch (error) {
    console.error('Error deleting category:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}