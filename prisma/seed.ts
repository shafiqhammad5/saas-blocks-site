import { PrismaClient, UserRole } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seeding...')

  // Create or update admin user
  const adminEmail = 'shafiqhammad5@gmail.com'
  const adminPassword = 'Admin123!@#' // Strong default password

  // Check if admin user already exists
  const existingAdmin = await prisma.user.findUnique({
    where: { email: adminEmail }
  })

  if (existingAdmin) {
    // Update existing user to admin role
    const updatedAdmin = await prisma.user.update({
      where: { email: adminEmail },
      data: {
        role: UserRole.ADMIN,
        name: 'Shafiq Hammad (Admin)'
      }
    })
    console.log(`✅ Updated existing user to admin: ${updatedAdmin.email}`)
  } else {
    // Create new admin user
    const hashedPassword = await bcrypt.hash(adminPassword, 12)
    
    const newAdmin = await prisma.user.create({
      data: {
        email: adminEmail,
        name: 'Shafiq Hammad (Admin)',
        password: hashedPassword,
        role: UserRole.ADMIN,
        emailVerified: new Date() // Mark as verified
      }
    })
    console.log(`✅ Created new admin user: ${newAdmin.email}`)
    console.log(`🔑 Default admin password: ${adminPassword}`)
    console.log('⚠️  Please change the password after first login!')
  }

  // Create some sample regular users for testing
  const sampleUsers = [
    {
      email: 'user1@example.com',
      name: 'John Doe',
      role: UserRole.USER
    },
    {
      email: 'user2@example.com', 
      name: 'Jane Smith',
      role: UserRole.USER
    }
  ]

  for (const userData of sampleUsers) {
    const existingUser = await prisma.user.findUnique({
      where: { email: userData.email }
    })

    if (!existingUser) {
      const hashedPassword = await bcrypt.hash('User123!', 12)
      
      await prisma.user.create({
        data: {
          ...userData,
          password: hashedPassword,
          emailVerified: new Date()
        }
      })
      console.log(`✅ Created sample user: ${userData.email}`)
    }
  }

  // Create sample categories
  const categories = [
    {
      name: 'Navigation',
      slug: 'navigation',
      description: 'Navigation components and menus',
      color: '#3B82F6'
    },
    {
      name: 'Forms',
      slug: 'forms',
      description: 'Form components and inputs',
      color: '#10B981'
    },
    {
      name: 'Cards',
      slug: 'cards',
      description: 'Card layouts and designs',
      color: '#F59E0B'
    }
  ]

  for (const categoryData of categories) {
    const existingCategory = await prisma.category.findUnique({
      where: { slug: categoryData.slug }
    })

    if (!existingCategory) {
      await prisma.category.create({
        data: categoryData
      })
      console.log(`✅ Created category: ${categoryData.name}`)
    }
  }

  // Create sample blocks
  const adminUser = await prisma.user.findUnique({
    where: { email: adminEmail }
  })

  const navigationCategory = await prisma.category.findUnique({
    where: { slug: 'navigation' }
  })

  const formsCategory = await prisma.category.findUnique({
    where: { slug: 'forms' }
  })

  if (adminUser && navigationCategory && formsCategory) {
    const sampleBlocks = [
      {
        title: 'Simple Navigation Bar',
        slug: 'simple-nav-bar',
        description: 'A clean and responsive navigation bar component',
        code: `<nav className="bg-white shadow-lg">\n  <div className="max-w-7xl mx-auto px-4">\n    <div className="flex justify-between h-16">\n      <div className="flex items-center">\n        <span className="text-xl font-bold">Logo</span>\n      </div>\n      <div className="flex items-center space-x-4">\n        <a href="#" className="text-gray-700 hover:text-blue-600">Home</a>\n        <a href="#" className="text-gray-700 hover:text-blue-600">About</a>\n        <a href="#" className="text-gray-700 hover:text-blue-600">Contact</a>\n      </div>\n    </div>\n  </div>\n</nav>`,
        categoryId: navigationCategory.id,
        authorId: adminUser.id,
        isPro: false,
        isPublished: true
      },
      {
        title: 'Contact Form',
        slug: 'contact-form',
        description: 'A beautiful contact form with validation',
        code: `<form className="max-w-md mx-auto bg-white p-6 rounded-lg shadow-md">\n  <div className="mb-4">\n    <label className="block text-gray-700 text-sm font-bold mb-2">\n      Name\n    </label>\n    <input className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-blue-500" type="text" />\n  </div>\n  <div className="mb-4">\n    <label className="block text-gray-700 text-sm font-bold mb-2">\n      Email\n    </label>\n    <input className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-blue-500" type="email" />\n  </div>\n  <div className="mb-6">\n    <label className="block text-gray-700 text-sm font-bold mb-2">\n      Message\n    </label>\n    <textarea className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-blue-500" rows="4"></textarea>\n  </div>\n  <button className="w-full bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600" type="submit">\n    Send Message\n  </button>\n</form>`,
        categoryId: formsCategory.id,
        authorId: adminUser.id,
        isPro: true,
        isPublished: true
      }
    ]

    for (const blockData of sampleBlocks) {
      const existingBlock = await prisma.block.findUnique({
        where: { slug: blockData.slug }
      })

      if (!existingBlock) {
        await prisma.block.create({
          data: blockData
        })
        console.log(`✅ Created block: ${blockData.title}`)
      }
    }
  }

  console.log('🎉 Database seeding completed!')
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })