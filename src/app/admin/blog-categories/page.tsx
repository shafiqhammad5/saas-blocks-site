import { Suspense } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { prisma } from '@/lib/prisma'
import { Plus, Search, Edit, Trash2, Calendar, FileText } from 'lucide-react'
import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'

interface SearchParams {
  search?: string
  page?: string
}

interface BlogCategoriesPageProps {
  searchParams: SearchParams
}

interface BlogCategory {
  id: string
  name: string
  slug: string
  description: string | null
  createdAt: Date
  _count: {
    posts: number
  }
}

async function getBlogCategories(searchParams: SearchParams) {
  const page = parseInt(searchParams.page || '1')
  const limit = 20
  const skip = (page - 1) * limit

  const where: {
    OR?: {
      name?: { contains: string; mode: 'insensitive' }
      description?: { contains: string; mode: 'insensitive' }
    }[]
  } = {}

  if (searchParams.search) {
    where.OR = [
      { name: { contains: searchParams.search, mode: 'insensitive' } },
      { description: { contains: searchParams.search, mode: 'insensitive' } }
    ]
  }

  const [categories, total] = await Promise.all([
    prisma.blogCategory.findMany({
      where,
      include: {
        _count: {
          select: { posts: true }
        }
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit
    }),
    prisma.blogCategory.count({ where })
  ])

  return {
    categories,
    total,
    currentPage: page,
    totalPages: Math.ceil(total / limit)
  }
}

function CategoriesTable({ categories }: { categories: BlogCategory[] }) {
  return (
    <div className="space-y-4">
      {categories.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-500 mb-4">
            <Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="text-lg font-medium">No categories found</p>
            <p className="text-sm">Create your first blog category to get started.</p>
          </div>
          <Link href="/admin/blog-categories/new">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Category
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid gap-4">
          {categories.map((category) => (
            <Card key={category.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-3 mb-2">
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {category.name}
                        </h3>
                        <p className="text-sm text-gray-600 mt-1">
                          /{category.slug}
                        </p>
                        {category.description && (
                          <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                            {category.description}
                          </p>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-4 text-sm text-gray-500 mt-3">
                      <div className="flex items-center space-x-1">
                        <FileText className="h-4 w-4" />
                        <span>{category._count.posts} posts</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Calendar className="h-4 w-4" />
                        <span>Created {formatDistanceToNow(new Date(category.createdAt), { addSuffix: true })}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2 mt-3">
                      <Badge variant={category._count.posts > 0 ? 'default' : 'secondary'}>
                        {category._count.posts > 0 ? 'Active' : 'Empty'}
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2 ml-4">
                    <Link href={`/admin/blog-categories/${category.id}/edit`}>
                      <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </Link>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="text-red-600 hover:text-red-700"
                      disabled={category._count.posts > 0}
                    >
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

export default async function BlogCategoriesPage({ searchParams }: BlogCategoriesPageProps) {
  const { categories, total, currentPage, totalPages } = await getBlogCategories(searchParams)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Blog Categories</h1>
          <p className="text-gray-600 mt-1">
            Organize your blog posts with categories
          </p>
        </div>
        <Link href="/admin/blog-categories/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            New Category
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Categories</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Active Categories</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {categories.filter(c => c._count.posts > 0).length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Empty Categories</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {categories.filter(c => c._count.posts === 0).length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card>
        <CardHeader>
          <CardTitle>Search Categories</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search categories..."
              className="pl-10"
              defaultValue={searchParams.search}
            />
          </div>
        </CardContent>
      </Card>

      {/* Categories Table */}
      <Card>
        <CardHeader>
          <CardTitle>Categories ({total})</CardTitle>
          <CardDescription>
            Manage and organize your blog categories
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Suspense fallback={<div>Loading categories...</div>}>
            <CategoriesTable categories={categories} />
          </Suspense>
        </CardContent>
      </Card>

      <Pagination currentPage={currentPage} totalPages={totalPages} />
    </div>
  )
}