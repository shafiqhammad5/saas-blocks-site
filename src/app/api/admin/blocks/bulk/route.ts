import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { action, blockIds } = await request.json()

    if (!action || !Array.isArray(blockIds) || blockIds.length === 0) {
      return NextResponse.json(
        { error: 'Invalid request data' },
        { status: 400 }
      )
    }

    let result

    switch (action) {
      case 'publish':
        result = await prisma.block.updateMany({
          where: {
            id: { in: blockIds }
          },
          data: {
            isPublished: true,
            updatedAt: new Date()
          }
        })
        break

      case 'unpublish':
        result = await prisma.block.updateMany({
          where: {
            id: { in: blockIds }
          },
          data: {
            isPublished: false,
            updatedAt: new Date()
          }
        })
        break

      case 'delete':
        result = await prisma.block.deleteMany({
          where: {
            id: { in: blockIds }
          }
        })
        break

      case 'archive':
        result = await prisma.block.updateMany({
          where: {
            id: { in: blockIds }
          },
          data: {
            isPublished: false,
            updatedAt: new Date()
          }
        })
        break

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        )
    }

    return NextResponse.json({
      success: true,
      message: `Successfully ${action}ed ${result.count} blocks`,
      count: result.count
    })

  } catch (error) {
    console.error('Bulk action error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}