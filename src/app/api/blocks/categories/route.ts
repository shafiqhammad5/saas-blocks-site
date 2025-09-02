import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/blocks/categories - Get all block categories with block counts (public endpoint)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search')
    const limit = parseInt(searchParams.get('limit') || '50')

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

    const categories = await prisma.category.findMany({
      where,
      include: {
        _count: {
          select: { 
            blocks: {
              where: {
                isPublished: true
              }
            }
          }
        }
      },
      orderBy: { name: 'asc' },
      take: limit
    })

    // Transform the data to match the frontend expectations
    const transformedCategories = categories.map(category => ({
      id: category.id,
      name: category.name,
      slug: category.slug,
      description: category.description || '',
      blockCount: category._count.blocks
    }))

    return NextResponse.json({
      categories: transformedCategories,
      total: categories.length
    })
  } catch (error) {
    console.error('Error fetching block categories:', error)
    return NextResponse.json(
      { error: 'Failed to fetch block categories' },
      { status: 500 }
    )
  }
}