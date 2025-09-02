import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { randomBytes } from 'crypto'

// Mock API keys data - in a real app, this would be stored in database
const apiKeys = [
  {
    id: '1',
    name: 'Mobile App',
    key: 'sk_test_' + randomBytes(16).toString('hex'),
    permissions: ['read:blocks', 'write:blocks'],
    lastUsed: new Date().toISOString(),
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    isActive: true
  },
  {
    id: '2',
    name: 'Third-party Integration',
    key: 'sk_test_' + randomBytes(16).toString('hex'),
    permissions: ['read:blocks', 'read:users'],
    lastUsed: null,
    createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
    isActive: false
  }
]

export async function GET(request: NextRequest) {
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

    return NextResponse.json(apiKeys)
  } catch (error) {
    console.error('API Keys GET error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
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

    const { name, permissions = [] } = await request.json()

    // Validate required fields
    if (!name || name.trim().length === 0) {
      return NextResponse.json(
        { error: 'API key name is required' },
        { status: 400 }
      )
    }

    if (name.length > 100) {
      return NextResponse.json(
        { error: 'API key name must be less than 100 characters' },
        { status: 400 }
      )
    }

    // Check for duplicate names
    const existingKey = apiKeys.find(key => key.name.toLowerCase() === name.toLowerCase())
    if (existingKey) {
      return NextResponse.json(
        { error: 'API key with this name already exists' },
        { status: 400 }
      )
    }

    // Generate new API key
    const newApiKey = {
      id: (apiKeys.length + 1).toString(),
      name: name.trim(),
      key: 'sk_live_' + randomBytes(24).toString('hex'),
      permissions,
      lastUsed: null,
      createdAt: new Date().toISOString(),
      isActive: true
    }

    apiKeys.push(newApiKey)

    return NextResponse.json(newApiKey, { status: 201 })
  } catch (error) {
    console.error('API Keys POST error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}