import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// Mock settings data - in a real app, this would be stored in database
const defaultSettings = {
  general: {
    siteName: 'SaaS Blocks',
    siteDescription: 'Build beautiful SaaS applications with pre-built components',
    siteUrl: 'https://saasblocks.com',
    adminEmail: 'admin@saasblocks.com',
    timezone: 'UTC',
    language: 'en'
  },
  features: {
    userRegistration: true,
    emailVerification: true,
    socialLogin: true,
    blockComments: true,
    blockRatings: true,
    publicBlocks: true
  },
  email: {
    provider: 'smtp',
    smtpHost: 'smtp.gmail.com',
    smtpPort: '587',
    smtpUser: '',
    smtpPassword: '',
    fromEmail: 'noreply@saasblocks.com',
    fromName: 'SaaS Blocks'
  },
  security: {
    sessionTimeout: 1440, // 24 hours in minutes
    maxLoginAttempts: 5,
    passwordMinLength: 8,
    requireStrongPassword: true,
    twoFactorAuth: false
  },
  storage: {
    provider: 'local',
    maxFileSize: 10, // MB
    allowedFileTypes: ['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp'],
    s3Bucket: '',
    s3Region: 'us-east-1',
    s3AccessKey: '',
    s3SecretKey: ''
  },
  notifications: {
    emailNotifications: true,
    newUserSignup: true,
    newBlockCreated: true,
    subscriptionEvents: true,
    systemAlerts: true
  }
}

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

    // In a real app, you would fetch settings from database
    // For now, return default settings
    return NextResponse.json(defaultSettings)
  } catch (error) {
    console.error('Settings GET error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
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

    const settings = await request.json()

    // Validate required fields
    if (!settings.general?.siteName || !settings.general?.adminEmail) {
      return NextResponse.json(
        { error: 'Site name and admin email are required' },
        { status: 400 }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(settings.general.adminEmail)) {
      return NextResponse.json(
        { error: 'Invalid admin email format' },
        { status: 400 }
      )
    }

    // Validate security settings
    if (settings.security?.passwordMinLength < 6) {
      return NextResponse.json(
        { error: 'Password minimum length must be at least 6 characters' },
        { status: 400 }
      )
    }

    if (settings.security?.sessionTimeout < 30) {
      return NextResponse.json(
        { error: 'Session timeout must be at least 30 minutes' },
        { status: 400 }
      )
    }

    // Validate storage settings
    if (settings.storage?.maxFileSize > 100) {
      return NextResponse.json(
        { error: 'Maximum file size cannot exceed 100MB' },
        { status: 400 }
      )
    }

    // In a real app, you would save settings to database
    // For now, just return success
    return NextResponse.json({ message: 'Settings updated successfully' })
  } catch (error) {
    console.error('Settings PUT error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}