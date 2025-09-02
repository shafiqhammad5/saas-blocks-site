import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { prisma } from '@/lib/prisma'
import { FileText, Plus, Search, MoreHorizontal, Edit, Trash2, Eye } from 'lucide-react'
import Link from 'next/link'

interface SearchParams {
  search?: string
  status?: string
  page?: string
}

export default async function BlogsPage({
  searchParams,
}: {
  searchParams: SearchParams
}) {
  const search = searchParams.search || ''
  const status = searchParams.status || 'all'
  const page = parseInt(searchParams.page || '1')
  const limit = 10
  const offset = (page - 1) * limit

  // Build where clause
  const where: {
    OR?: Array<{
      title?: { contains: string; mode: 'insensitive' }
      excerpt?: { contains: string; mode: 'insensitive' }
      author?: { name: { contains: string; mode: 'insensitive' } }
    }>
    isPublished?: boolean
  } = {}
  
  if (search) {
    where.OR = [
      { title: { contains: search, mode: 'insensitive' } },
      { excerpt: { contains: search, mode: 'insensitive' } },
      { author: { name: { contains: search, mode: 'insensitive' } } }
    ]
  }
  
  if (status === 'published') {
    where.isPublished = true
  } else if (status === 'draft') {
    where.isPublished = false
  }

  // Fetch blogs with pagination
  const [blogs, totalCount] = await Promise.all([
    prisma.blogPost.findMany({
      where,
      include: {
        author: {
          select: { name: true, email: true }
        },
        categories: {
          select: { name: true }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset
    }),
    prisma.blogPost.count({ where })
  ])

  const totalPages = Math.ceil(totalCount / limit)

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Blog Posts
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Manage your blog posts and content
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/blogs/new">
            <Plus className="h-4 w-4 mr-2" />
            New Blog Post
          </Link>
        </Button>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
          <CardDescription>
            Search and filter blog posts
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search blog posts..."
                  defaultValue={search}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant={status === 'all' ? 'default' : 'outline'} size="sm" asChild>
                <Link href="/admin/blogs?status=all">
                  All ({totalCount})
                </Link>
              </Button>
              <Button variant={status === 'published' ? 'default' : 'outline'} size="sm" asChild>
                <Link href="/admin/blogs?status=published">
                  Published
                </Link>
              </Button>
              <Button variant={status === 'draft' ? 'default' : 'outline'} size="sm" asChild>
                <Link href="/admin/blogs?status=draft">
                  Drafts
                </Link>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Blog Posts Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <FileText className="h-5 w-5 mr-2" />
            Blog Posts ({totalCount})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {blogs.length > 0 ? (
            <div className="space-y-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Author</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Categories</TableHead>
                    <TableHead>Views</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {blogs.map((blog) => (
                    <TableRow key={blog.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium text-gray-900 dark:text-white">
                            {blog.title}
                          </div>
                          {blog.excerpt && (
                            <div className="text-sm text-gray-500 dark:text-gray-400 truncate max-w-xs">
                              {blog.excerpt}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div className="font-medium">
                            {blog.author?.name || 'Unknown'}
                          </div>
                          <div className="text-gray-500">
                            {blog.author?.email}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={blog.isPublished ? 'default' : 'secondary'}>
                          {blog.isPublished ? 'Published' : 'Draft'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {blog.categories.slice(0, 2).map((category) => (
                            <Badge key={category.name} variant="outline" className="text-xs">
                              {category.name}
                            </Badge>
                          ))}
                          {blog.categories.length > 2 && (
                            <Badge variant="outline" className="text-xs">
                              +{blog.categories.length - 2}
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center text-sm text-gray-500">
                          <Eye className="h-4 w-4 mr-1" />
                          {blog.views}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm text-gray-500">
                          {new Date(blog.createdAt).toLocaleDateString()}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <span className="sr-only">Open menu</span>
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem asChild>
                              <Link href={`/blog/${blog.slug}`} target="_blank">
                                <Eye className="mr-2 h-4 w-4" />
                                View Post
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                              <Link href={`/admin/blogs/${blog.id}`}>
                                <Edit className="mr-2 h-4 w-4" />
                                Edit
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-red-600">
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-500">
                    Showing {offset + 1} to {Math.min(offset + limit, totalCount)} of {totalCount} results
                  </div>
                  <div className="flex gap-2">
                    {page > 1 && (
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/admin/blogs?page=${page - 1}&search=${search}&status=${status}`}>
                          Previous
                        </Link>
                      </Button>
                    )}
                    {page < totalPages && (
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/admin/blogs?page=${page + 1}&search=${search}&status=${status}`}>
                          Next
                        </Link>
                      </Button>
                    )}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                No blog posts found
              </h3>
              <p className="text-gray-500 dark:text-gray-400 mb-4">
                {search ? 'Try adjusting your search criteria.' : 'Get started by creating your first blog post.'}
              </p>
              <Button asChild>
                <Link href="/admin/blogs/new">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Blog Post
                </Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}