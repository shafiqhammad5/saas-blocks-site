import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { prisma } from '@/lib/prisma'
import { FileText, Blocks, Users, Eye, TrendingUp, Calendar } from 'lucide-react'
import Link from 'next/link'

export default async function AdminDashboard() {
  // Fetch dashboard statistics
  const [blogCount, blockCount, userCount, publishedBlogs, publishedBlocks] = await Promise.all([
    prisma.blogPost.count(),
    prisma.block.count(),
    prisma.user.count(),
    prisma.blogPost.count({ where: { isPublished: true } }),
    prisma.block.count({ where: { isPublished: true } })
  ])

  // Recent activity
  const recentBlogs = await prisma.blogPost.findMany({
    take: 5,
    orderBy: { createdAt: 'desc' },
    include: {
      author: {
        select: { name: true, email: true }
      }
    }
  })

  const recentBlocks = await prisma.block.findMany({
    take: 5,
    orderBy: { createdAt: 'desc' },
    include: {
      category: {
        select: { name: true }
      },
      author: {
        select: { name: true, email: true }
      }
    }
  })

  const stats = [
    {
      title: 'Total Blog Posts',
      value: blogCount,
      description: `${publishedBlogs} published`,
      icon: FileText,
      href: '/admin/blogs',
      color: 'text-blue-600'
    },
    {
      title: 'Total Blocks',
      value: blockCount,
      description: `${publishedBlocks} published`,
      icon: Blocks,
      href: '/admin/blocks',
      color: 'text-green-600'
    },
    {
      title: 'Total Users',
      value: userCount,
      description: 'Registered users',
      icon: Users,
      href: '/admin/users',
      color: 'text-purple-600'
    },
    {
      title: 'Total Views',
      value: '12.5K',
      description: '+20.1% from last month',
      icon: Eye,
      href: '/admin/analytics',
      color: 'text-orange-600'
    }
  ]

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Dashboard Overview
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Welcome back! Here&apos;s what&apos;s happening with your SaaSBlocks platform.
          </p>
        </div>
        <div className="flex space-x-3">
          <Button asChild>
            <Link href="/admin/blogs/new">
              <FileText className="h-4 w-4 mr-2" />
              New Blog Post
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/admin/blocks/new">
              <Blocks className="h-4 w-4 mr-2" />
              New Block
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <Card key={stat.title} className="hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  {stat.title}
                </CardTitle>
                <Icon className={`h-5 w-5 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stat.value}
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                  {stat.description}
                </p>
                <Button asChild variant="ghost" size="sm" className="mt-3 p-0 h-auto">
                  <Link href={stat.href} className="text-blue-600 hover:text-blue-800">
                    View details →
                  </Link>
                </Button>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Blog Posts */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <FileText className="h-5 w-5 mr-2" />
              Recent Blog Posts
            </CardTitle>
            <CardDescription>
              Latest blog posts created or updated
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentBlogs.length > 0 ? (
                recentBlogs.map((blog) => (
                  <div key={blog.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900 dark:text-white truncate">
                        {blog.title}
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        By {blog.author?.name || blog.author?.email}
                      </p>
                      <div className="flex items-center mt-1 space-x-2">
                        <Badge variant={blog.isPublished ? 'default' : 'secondary'}>
                          {blog.isPublished ? 'Published' : 'Draft'}
                        </Badge>
                        <span className="text-xs text-gray-500">
                          {new Date(blog.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <Button asChild variant="ghost" size="sm">
                      <Link href={`/admin/blogs/${blog.id}`}>
                        Edit
                      </Link>
                    </Button>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 dark:text-gray-400 text-center py-4">
                  No blog posts yet. Create your first one!
                </p>
              )}
            </div>
            <Button asChild variant="outline" className="w-full mt-4">
              <Link href="/admin/blogs">
                View All Blog Posts
              </Link>
            </Button>
          </CardContent>
        </Card>

        {/* Recent Blocks */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Blocks className="h-5 w-5 mr-2" />
              Recent Blocks
            </CardTitle>
            <CardDescription>
              Latest SaaS blocks created or updated
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentBlocks.length > 0 ? (
                recentBlocks.map((block) => (
                  <div key={block.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900 dark:text-white truncate">
                        {block.title}
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {block.category.name} • {block.author?.name || 'System'}
                      </p>
                      <div className="flex items-center mt-1 space-x-2">
                        <Badge variant={block.isPublished ? 'default' : 'secondary'}>
                          {block.isPublished ? 'Published' : 'Draft'}
                        </Badge>
                        {block.isPro && (
                          <Badge variant="outline">Pro</Badge>
                        )}
                        <span className="text-xs text-gray-500">
                          {new Date(block.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <Button asChild variant="ghost" size="sm">
                      <Link href={`/admin/blocks/${block.id}`}>
                        Edit
                      </Link>
                    </Button>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 dark:text-gray-400 text-center py-4">
                  No blocks yet. Create your first one!
                </p>
              )}
            </div>
            <Button asChild variant="outline" className="w-full mt-4">
              <Link href="/admin/blocks">
                View All Blocks
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <TrendingUp className="h-5 w-5 mr-2" />
            Quick Actions
          </CardTitle>
          <CardDescription>
            Common administrative tasks
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button asChild variant="outline" className="h-auto p-4 flex flex-col items-center space-y-2">
              <Link href="/admin/blogs/categories">
                <FileText className="h-6 w-6" />
                <span>Manage Blog Categories</span>
              </Link>
            </Button>
            <Button asChild variant="outline" className="h-auto p-4 flex flex-col items-center space-y-2">
              <Link href="/admin/blocks/categories">
                <Blocks className="h-6 w-6" />
                <span>Manage Block Categories</span>
              </Link>
            </Button>
            <Button asChild variant="outline" className="h-auto p-4 flex flex-col items-center space-y-2">
              <Link href="/admin/analytics">
                <TrendingUp className="h-6 w-6" />
                <span>View Analytics</span>
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}