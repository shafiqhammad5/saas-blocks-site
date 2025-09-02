import { Suspense } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { prisma } from '@/lib/prisma'
import { Plus, Search, Eye, Edit, Trash2, Calendar, User, Tag } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { formatDistanceToNow } from 'date-fns'

interface SearchParams {
  search?: string
  status?: string
  category?: string
  page?: string
}

interface BlogPost {
  id: string
  title: string
  excerpt: string | null
  content: string
  coverImage: string | null
  isPublished: boolean
  publishedAt: Date | null
  views: number
  readTime: number | null
  createdAt: Date
  updatedAt: Date
  author: {
    name: string | null
    email: string
    image: string | null
  }
  categories: {
    name: string
    slug: string
  }[]
  tags: {
    name: string
    slug: string
  }[]
}

interface BlogCategory {
  name: string
  slug: string
}

interface BlogPostsPageProps {
  searchParams: SearchParams
}

async function getBlogPosts(searchParams: SearchParams) {
  const page = parseInt(searchParams.page || '1')
  const limit = 10
  const skip = (page - 1) * limit

  const where: {
    OR?: {
      title?: { contains: string; mode: 'insensitive' }
      excerpt?: { contains: string; mode: 'insensitive' }
      content?: { contains: string; mode: 'insensitive' }
    }[]
    isPublished?: boolean
    categories?: {
      some: {
        slug: string
      }
    }
  } = {}

  if (searchParams.search) {
    where.OR = [
      { title: { contains: searchParams.search, mode: 'insensitive' } },
      { excerpt: { contains: searchParams.search, mode: 'insensitive' } },
      { content: { contains: searchParams.search, mode: 'insensitive' } }
    ]
  }

  if (searchParams.status) {
    where.isPublished = searchParams.status === 'published'
  }

  if (searchParams.category) {
    where.categories = {
      some: {
        slug: searchParams.category
      }
    }
  }

  const [posts, total, categories] = await Promise.all([
    prisma.blogPost.findMany({
      where,
      include: {
        author: {
          select: { name: true, email: true, image: true }
        },
        categories: {
          select: { name: true, slug: true }
        },
        tags: {
          select: { name: true, slug: true }
        }
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit
    }),
    prisma.blogPost.count({ where }),
    prisma.blogCategory.findMany({
      select: { name: true, slug: true },
      orderBy: { name: 'asc' }
    })
  ])

  return {
    posts,
    total,
    categories,
    currentPage: page,
    totalPages: Math.ceil(total / limit)
  }
}

function BlogPostsTable({ posts }: { posts: BlogPost[] }) {
  return (
    <div className="space-y-4">
      {posts.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-500 mb-4">
            <Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="text-lg font-medium">No blog posts found</p>
            <p className="text-sm">Create your first blog post to get started.</p>
          </div>
          <Link href="/admin/blog-posts/new">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Blog Post
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid gap-4">
          {posts.map((post) => (
            <Card key={post.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-3 mb-2">
                      {post.coverImage && (
                        <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                          <Image
                            src={post.coverImage}
                            alt={post.title}
                            fill
                            className="object-cover"
                            sizes="64px"
                          />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-semibold text-gray-900 truncate">
                          {post.title}
                        </h3>
                        {post.excerpt && (
                          <p className="text-sm text-gray-600 line-clamp-2 mt-1">
                            {post.excerpt}
                          </p>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <div className="flex items-center space-x-1">
                        <User className="h-4 w-4" />
                        <span>{post.author.name}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Calendar className="h-4 w-4" />
                        <span>{formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}</span>
                      </div>
                      {post.publishedAt && (
                        <div className="flex items-center space-x-1">
                          <Eye className="h-4 w-4" />
                          <span>{post.views} views</span>
                        </div>
                      )}
                      {post.readTime && (
                        <span>{post.readTime} min read</span>
                      )}
                    </div>
                    
                    <div className="flex items-center space-x-2 mt-3">
                      <Badge variant={post.isPublished ? 'default' : 'secondary'}>
                        {post.isPublished ? 'Published' : 'Draft'}
                      </Badge>
                      
                      {post.categories.map((category) => (
                        <Badge key={category.slug} variant="outline">
                          {category.name}
                        </Badge>
                      ))}
                      
                      {post.tags.slice(0, 2).map((tag) => (
                        <Badge key={tag.slug} variant="outline" className="text-xs">
                          <Tag className="h-3 w-3 mr-1" />
                          {tag.name}
                        </Badge>
                      ))}
                      
                      {post.tags.length > 2 && (
                        <Badge variant="outline" className="text-xs">
                          +{post.tags.length - 2} more
                        </Badge>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2 ml-4">
                    <Link href={`/admin/blog-posts/${post.id}/edit`}>
                      <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </Link>
                    <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

function Pagination({ currentPage, totalPages }: { currentPage: number; totalPages: number }) {
  if (totalPages <= 1) return null

  return (
    <div className="flex items-center justify-center space-x-2 mt-8">
      {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
        <Link key={page} href={`?page=${page}`}>
          <Button
            variant={page === currentPage ? 'default' : 'outline'}
            size="sm"
          >
            {page}
          </Button>
        </Link>
      ))}
    </div>
  )
}

export default async function BlogPostsPage({ searchParams }: BlogPostsPageProps) {
  const { posts, total, categories, currentPage, totalPages } = await getBlogPosts(searchParams)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Blog Posts</h1>
          <p className="text-gray-600 mt-1">
            Manage your blog posts and content
          </p>
        </div>
        <Link href="/admin/blog-posts/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            New Post
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Posts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Published</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {posts.filter(p => p.isPublished).length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Drafts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {posts.filter(p => !p.isPublished).length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Categories</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{categories.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search posts..."
                className="pl-10"
                defaultValue={searchParams.search}
              />
            </div>
            <Select defaultValue={searchParams.status}>
              <SelectTrigger>
                <SelectValue placeholder="All statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                <SelectItem value="published">Published</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
              </SelectContent>
            </Select>
            <Select defaultValue={searchParams.category}>
              <SelectTrigger>
                <SelectValue placeholder="All categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All categories</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category.slug} value={category.slug}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Posts Table */}
      <Card>
        <CardHeader>
          <CardTitle>Posts ({total})</CardTitle>
          <CardDescription>
            Manage and organize your blog posts
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Suspense fallback={<div>Loading posts...</div>}>
            <BlogPostsTable posts={posts} />
          </Suspense>
        </CardContent>
      </Card>

      <Pagination currentPage={currentPage} totalPages={totalPages} />
    </div>
  )
}