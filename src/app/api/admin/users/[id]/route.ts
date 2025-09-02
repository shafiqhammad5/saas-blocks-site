import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { isAdmin } from '@/lib/admin-auth'

// PUT /api/admin/users/[id] - Update a user
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || !isAdmin(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { name, email, role } = await request.json()
    const { id } = await params
    const userId = id

    if (!name || !email) {
      return NextResponse.json(
        { error: 'Name and email are required' },
        { status: 400 }
      )
    }

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id: userId }
    })

    if (!existingUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Check if another user with same email already exists
    const duplicateUser = await prisma.user.findFirst({
      where: {
        AND: [
          { id: { not: userId } },
          { email }
        ]
      }
    })

    if (duplicateUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 409 }
      )
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        name,
        email,
        role
      },
      include: {
        _count: {
          select: {
            blocks: true,
            blogPosts: true
          }
        }
      }
    })

    // Remove password from response
    const { password, ...userWithoutPassword } = updatedUser

    return NextResponse.json({
      success: true,
      message: 'User updated successfully',
      user: userWithoutPassword
    })
  } catch (error) {
    console.error('Error updating user:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE /api/admin/users/[id] - Delete a user
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
    const userId = id

    // Prevent deleting the current admin user
    if (session.user.id === userId) {
      return NextResponse.json(
        { error: 'Cannot delete your own account' },
        { status: 400 }
      )
    }

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        _count: {
          select: {
            blocks: true,
            blogPosts: true
          }
        }
      }
    })

    if (!existingUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Check if user has associated content
    if (existingUser._count.blocks > 0 || existingUser._count.blogPosts > 0) {
      return NextResponse.json(
        { error: 'Cannot delete user with existing content. Please transfer or delete their content first.' },
        { status: 400 }
      )
    }

    // Delete user and related data
    await prisma.$transaction(async (tx) => {
      // Delete user sessions
      await tx.session.deleteMany({
        where: { userId }
      })

      // Delete user accounts
      await tx.account.deleteMany({
        where: { userId }
      })

      // Delete subscription if exists
      await tx.subscription.deleteMany({
        where: { userId }
      })

      // Finally delete the user
      await tx.user.delete({
        where: { id: userId }
      })
    })

    return NextResponse.json({
      success: true,
      message: 'User deleted successfully'
    })
  } catch (error) {
    console.error('Error deleting user:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}