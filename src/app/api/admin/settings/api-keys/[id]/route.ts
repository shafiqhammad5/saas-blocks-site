import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// Mock API keys data - in a real app, this would be stored in database
// This should be shared with the main route, but for simplicity we'll import it
const apiKeys = [
  {
    id: '1',
    name: 'Mobile App',
    key: 'sk_test_abcd1234efgh5678ijkl9012mnop3456',
    permissions: ['read:blocks', 'write:blocks'],
    lastUsed: new Date().toISOString(),
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    isActive: true
  },
  {
    id: '2',
    name: 'Third-party Integration',
    key: 'sk_test_qrst5678uvwx9012yzab3456cdef7890',
    permissions: ['read:blocks', 'read:users'],
    lastUsed: null,
    createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
    isActive: false
  }
]

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is admin
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { role: true }
    })

    if (user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { id } = await params
    const { isActive } = await request.json()

    // Find the API key
    const apiKeyIndex = apiKeys.findIndex(key => key.id === id)
    if (apiKeyIndex === -1) {
      return NextResponse.json(
        { error: 'API key not found' },
        { status: 404 }
      )
    }

    // Validate isActive field
    if (typeof isActive !== 'boolean') {
      return NextResponse.json(
        { error: 'isActive must be a boolean value' },
        { status: 400 }
      )
    }

    // Update the API key
    apiKeys[apiKeyIndex] = {
      ...apiKeys[apiKeyIndex],
      isActive
    }

    return NextResponse.json(apiKeys[apiKeyIndex])
  } catch (error) {
    console.error('API Key PATCH error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is admin
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { role: true }
    })

    if (user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { id } = await params

    // Find the API key
    const apiKeyIndex = apiKeys.findIndex(key => key.id === id)
    if (apiKeyIndex === -1) {
      return NextResponse.json(
        { error: 'API key not found' },
        { status: 404 }
      )
    }

    // Remove the API key
    const deletedApiKey = apiKeys[apiKeyIndex]
    apiKeys.splice(apiKeyIndex, 1)

    return NextResponse.json({ 
      message: 'API key deleted successfully',
      deletedKey: {
        id: deletedApiKey.id,
        name: deletedApiKey.name
      }
    })
  } catch (error) {
    console.error('API Key DELETE error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}