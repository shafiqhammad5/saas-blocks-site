'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { 
  Plus, 
  Search, 
  MoreHorizontal, 
  Eye, 
  Edit, 
  Trash2, 
  Code, 
  Download, 
  Filter,
  CheckSquare,
  Square,
  Archive,
  Star,
  Copy,
  ExternalLink,
  Grid,
  List,
  SortAsc,
  SortDesc
} from 'lucide-react'
import { toast } from 'sonner'
import Image from 'next/image'

interface Block {
  id: string
  title: string
  slug: string
  description: string | null
  code: string
  preview: string | null
  isPro: boolean
  isPublished: boolean
  views: number
  likes: number
  categoryId: string
  authorId: string | null
  createdAt: string
  updatedAt: string
  category: {
    id: string
    name: string
    slug: string
    color: string | null
  }
  author: {
    name: string | null
    email: string
  } | null
  tags: {
    id: string
    name: string
    slug: string
  }[]
}

interface Category {
  id: string
  name: string
  slug: string
  color: string | null
}

type ViewMode = 'table' | 'grid'
type SortField = 'title' | 'createdAt' | 'views' | 'likes'
type SortOrder = 'asc' | 'desc'

export default function BlocksManagement() {
  const [blocks, setBlocks] = useState<Block[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [typeFilter, setTypeFilter] = useState('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalBlocks, setTotalBlocks] = useState(0)
  const [selectedBlocks, setSelectedBlocks] = useState<string[]>([])
  const [viewMode, setViewMode] = useState<ViewMode>('table')
  const [sortField, setSortField] = useState<SortField>('createdAt')
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc')
  const [previewBlock, setPreviewBlock] = useState<Block | null>(null)

  useEffect(() => {
    fetchCategories()
  }, [])

  useEffect(() => {
    fetchBlocks()
  }, [search, categoryFilter, statusFilter, typeFilter, currentPage, sortField, sortOrder])

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/admin/categories')
      if (response.ok) {
        const data = await response.json()
        setCategories(data.categories || [])
      }
    } catch (error) {
      console.error('Error fetching categories:', error)
    }
  }

  const fetchBlocks = async () => {
    setIsLoading(true)
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '12',
        sort: sortField,
        order: sortOrder,
        ...(search && { search }),
        ...(categoryFilter !== 'all' && { category: categoryFilter }),
        ...(statusFilter !== 'all' && { status: statusFilter }),
        ...(typeFilter !== 'all' && { type: typeFilter })
      })

      const response = await fetch(`/api/admin/blocks?${params}`)
      if (!response.ok) {
        throw new Error('Failed to fetch blocks')
      }

      const data = await response.json()
      setBlocks(data.blocks || [])
      setTotalPages(data.totalPages || 1)
      setTotalBlocks(data.total || 0)
    } catch (error) {
      console.error('Error fetching blocks:', error)
      toast.error('Failed to load blocks')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSelectAll = () => {
    if (selectedBlocks.length === blocks.length) {
      setSelectedBlocks([])
    } else {
      setSelectedBlocks(blocks.map(block => block.id))
    }
  }

  const handleSelectBlock = (blockId: string) => {
    setSelectedBlocks(prev => 
      prev.includes(blockId) 
        ? prev.filter(id => id !== blockId)
        : [...prev, blockId]
    )
  }

  const handleBulkAction = async (action: string) => {
    if (selectedBlocks.length === 0) {
      toast.error('Please select blocks first')
      return
    }

    const confirmMessage = {
      publish: 'publish selected blocks',
      unpublish: 'unpublish selected blocks',
      delete: 'delete selected blocks',
      archive: 'archive selected blocks'
    }[action]

    if (!confirm(`Are you sure you want to ${confirmMessage}?`)) {
      return
    }

    try {
      const response = await fetch('/api/admin/blocks/bulk', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          action,
          blockIds: selectedBlocks
        })
      })

      if (!response.ok) {
        throw new Error(`Failed to ${action} blocks`)
      }

      toast.success(`Successfully ${action}ed ${selectedBlocks.length} blocks`)
      setSelectedBlocks([])
      fetchBlocks()
    } catch (error) {
      console.error(`Error ${action}ing blocks:`, error)
      toast.error(`Failed to ${action} blocks`)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this block?')) {
      return
    }

    try {
      const response = await fetch(`/api/admin/blocks/${id}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        throw new Error('Failed to delete block')
      }

      toast.success('Block deleted successfully')
      fetchBlocks()
    } catch (error) {
      console.error('Error deleting block:', error)
      toast.error('Failed to delete block')
    }
  }

  const togglePublished = async (id: string, isPublished: boolean) => {
    try {
      const response = await fetch(`/api/admin/blocks/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ isPublished: !isPublished })
      })

      if (!response.ok) {
        throw new Error('Failed to update block')
      }

      toast.success(`Block ${!isPublished ? 'published' : 'unpublished'} successfully`)
      fetchBlocks()
    } catch (error) {
      console.error('Error updating block:', error)
      toast.error('Failed to update block')
    }
  }

  const duplicateBlock = async (id: string) => {
    try {
      const response = await fetch(`/api/admin/blocks/${id}/duplicate`, {
        method: 'POST'
      })

      if (!response.ok) {
        throw new Error('Failed to duplicate block')
      }

      toast.success('Block duplicated successfully')
      fetchBlocks()
    } catch (error) {
      console.error('Error duplicating block:', error)
      toast.error('Failed to duplicate block')
    }
  }

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortOrder('desc')
    }
  }

  const renderTableView = () => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-12">
            <Checkbox
              checked={selectedBlocks.length === blocks.length && blocks.length > 0}
              onCheckedChange={handleSelectAll}
            />
          </TableHead>
          <TableHead>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => handleSort('title')}
              className="h-auto p-0 font-semibold"
            >
              Title
              {sortField === 'title' && (
                sortOrder === 'asc' ? <SortAsc className="ml-1 h-4 w-4" /> : <SortDesc className="ml-1 h-4 w-4" />
              )}
            </Button>
          </TableHead>
          <TableHead>Category</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => handleSort('views')}
              className="h-auto p-0 font-semibold"
            >
              Stats
              {sortField === 'views' && (
                sortOrder === 'asc' ? <SortAsc className="ml-1 h-4 w-4" /> : <SortDesc className="ml-1 h-4 w-4" />
              )}
            </Button>
          </TableHead>
          <TableHead>Author</TableHead>
          <TableHead>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => handleSort('createdAt')}
              className="h-auto p-0 font-semibold"
            >
              Created
              {sortField === 'createdAt' && (
                sortOrder === 'asc' ? <SortAsc className="ml-1 h-4 w-4" /> : <SortDesc className="ml-1 h-4 w-4" />
              )}
            </Button>
          </TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {blocks.map((block) => (
          <TableRow key={block.id}>
            <TableCell>
              <Checkbox
                checked={selectedBlocks.includes(block.id)}
                onCheckedChange={() => handleSelectBlock(block.id)}
              />
            </TableCell>
            <TableCell>
              <div className="flex items-center space-x-3">
                {block.preview && (
                  <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                    <Image
                      src={block.preview}
                      alt={block.title}
                      fill
                      className="object-cover"
                      sizes="48px"
                    />
                  </div>
                )}
                <div>
                  <div className="font-medium">{block.title}</div>
                  <div className="text-sm text-gray-500 truncate max-w-[200px]">
                    {block.description}
                  </div>
                </div>
              </div>
            </TableCell>
            <TableCell>
              <Badge 
                variant="outline" 
                style={{ 
                  borderColor: block.category.color || '#3B82F6',
                  color: block.category.color || '#3B82F6'
                }}
              >
                {block.category.name}
              </Badge>
            </TableCell>
            <TableCell>
              <div className="flex gap-1">
                <Badge variant={block.isPublished ? 'default' : 'secondary'}>
                  {block.isPublished ? 'Published' : 'Draft'}
                </Badge>
                {block.isPro && (
                  <Badge variant="outline" className="text-yellow-600 border-yellow-600">
                    <Star className="h-3 w-3 mr-1" />
                    Pro
                  </Badge>
                )}
              </div>
            </TableCell>
            <TableCell>
              <div className="text-sm space-y-1">
                <div className="flex items-center gap-1">
                  <Eye className="h-3 w-3" />
                  {block.views.toLocaleString()}
                </div>
                <div className="flex items-center gap-1">
                  <Star className="h-3 w-3" />
                  {block.likes.toLocaleString()}
                </div>
              </div>
            </TableCell>
            <TableCell>
              <div className="text-sm">
                {block.author?.name || block.author?.email || 'System'}
              </div>
            </TableCell>
            <TableCell>
              <div className="text-sm">
                {new Date(block.createdAt).toLocaleDateString()}
              </div>
            </TableCell>
            <TableCell className="text-right">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="h-8 w-8 p-0">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setPreviewBlock(block)}>
                    <Eye className="mr-2 h-4 w-4" />
                    Preview
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href={`/blocks/${block.slug}`} target="_blank">
                      <ExternalLink className="mr-2 h-4 w-4" />
                      View Live
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href={`/admin/blocks/${block.id}/edit`}>
                      <Edit className="mr-2 h-4 w-4" />
                      Edit
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => duplicateBlock(block.id)}>
                    <Copy className="mr-2 h-4 w-4" />
                    Duplicate
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => togglePublished(block.id, block.isPublished)}
                  >
                    {block.isPublished ? (
                      <><Archive className="mr-2 h-4 w-4" />Unpublish</>
                    ) : (
                      <><CheckSquare className="mr-2 h-4 w-4" />Publish</>
                    )}
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => handleDelete(block.id)}
                    className="text-red-600"
                  >
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
  )

  const renderGridView = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {blocks.map((block) => (
        <Card key={block.id} className="hover:shadow-lg transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-start justify-between mb-3">
              <Checkbox
                checked={selectedBlocks.includes(block.id)}
                onCheckedChange={() => handleSelectBlock(block.id)}
              />
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setPreviewBlock(block)}>
                    <Eye className="mr-2 h-4 w-4" />
                    Preview
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href={`/admin/blocks/${block.id}/edit`}>
                      <Edit className="mr-2 h-4 w-4" />
                      Edit
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => duplicateBlock(block.id)}>
                    <Copy className="mr-2 h-4 w-4" />
                    Duplicate
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleDelete(block.id)} className="text-red-600">
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            
            {block.preview && (
              <div className="relative w-full h-32 rounded-lg overflow-hidden bg-gray-100 mb-3">
                <Image
                  src={block.preview}
                  alt={block.title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                />
              </div>
            )}
            
            <h3 className="font-semibold text-sm mb-1 line-clamp-1">{block.title}</h3>
            <p className="text-xs text-gray-600 mb-3 line-clamp-2">{block.description}</p>
            
            <div className="flex items-center justify-between mb-3">
              <Badge 
                variant="outline" 
                className="text-xs"
                style={{ 
                  borderColor: block.category.color || '#3B82F6',
                  color: block.category.color || '#3B82F6'
                }}
              >
                {block.category.name}
              </Badge>
              <div className="flex gap-1">
                <Badge variant={block.isPublished ? 'default' : 'secondary'} className="text-xs">
                  {block.isPublished ? 'Published' : 'Draft'}
                </Badge>
                {block.isPro && (
                  <Badge variant="outline" className="text-xs text-yellow-600 border-yellow-600">
                    Pro
                  </Badge>
                )}
              </div>
            </div>
            
            <div className="flex items-center justify-between text-xs text-gray-500">
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1">
                  <Eye className="h-3 w-3" />
                  {block.views}
                </span>
                <span className="flex items-center gap-1">
                  <Star className="h-3 w-3" />
                  {block.likes}
                </span>
              </div>
              <span>{new Date(block.createdAt).toLocaleDateString()}</span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">SaaS Blocks</h1>
          <p className="text-gray-600 mt-1">
            Manage your component library with advanced filtering and bulk operations
          </p>
        </div>
        <Link href="/admin/blocks/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add New Block
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Blocks</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalBlocks}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Published</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {blocks.filter(b => b.isPublished).length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Pro Blocks</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {blocks.filter(b => b.isPro).length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Views</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {blocks.reduce((sum, b) => sum + b.views, 0).toLocaleString()}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Actions */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filters & Actions
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setViewMode(viewMode === 'table' ? 'grid' : 'table')}
              >
                {viewMode === 'table' ? <Grid className="h-4 w-4" /> : <List className="h-4 w-4" />}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Search and Filters */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search blocks..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="published">Published</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                </SelectContent>
              </Select>

              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="free">Free</SelectItem>
                  <SelectItem value="pro">Pro</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Bulk Actions */}
            {selectedBlocks.length > 0 && (
              <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg">
                <span className="text-sm font-medium">
                  {selectedBlocks.length} block{selectedBlocks.length > 1 ? 's' : ''} selected
                </span>
                <div className="flex gap-2 ml-auto">
                  <Button size="sm" onClick={() => handleBulkAction('publish')}>
                    <CheckSquare className="h-4 w-4 mr-1" />
                    Publish
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => handleBulkAction('unpublish')}>
                    <Archive className="h-4 w-4 mr-1" />
                    Unpublish
                  </Button>
                  <Button size="sm" variant="destructive" onClick={() => handleBulkAction('delete')}>
                    <Trash2 className="h-4 w-4 mr-1" />
                    Delete
                  </Button>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Blocks Display */}
      <Card>
        <CardHeader>
          <CardTitle>Blocks ({totalBlocks})</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-500">Loading blocks...</p>
            </div>
          ) : blocks.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <div className="mb-4">
                <Code className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium">No blocks found</p>
                <p className="text-sm">Create your first block or adjust your filters.</p>
              </div>
              <Link href="/admin/blocks/new">
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Block
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {viewMode === 'table' ? renderTableView() : renderGridView()}

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between pt-4">
                  <div className="text-sm text-gray-500">
                    Showing {((currentPage - 1) * 12) + 1} to {Math.min(currentPage * 12, totalBlocks)} of {totalBlocks} blocks
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                    >
                      Previous
                    </Button>
                    <div className="flex gap-1">
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        const page = currentPage <= 3 ? i + 1 : currentPage - 2 + i
                        if (page > totalPages) return null
                        return (
                          <Button
                            key={page}
                            variant={page === currentPage ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setCurrentPage(page)}
                          >
                            {page}
                          </Button>
                        )
                      })}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                      disabled={currentPage === totalPages}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Preview Dialog */}
      <Dialog open={!!previewBlock} onOpenChange={() => setPreviewBlock(null)}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{previewBlock?.title}</DialogTitle>
            <DialogDescription>
              {previewBlock?.description}
            </DialogDescription>
          </DialogHeader>
          {previewBlock && (
            <div className="space-y-4">
              {previewBlock.preview && (
                <div className="relative w-full h-64 rounded-lg overflow-hidden bg-gray-100">
                  <Image
                    src={previewBlock.preview}
                    alt={previewBlock.title}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 800px"
                  />
                </div>
              )}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium mb-2">Code Preview</h4>
                <pre className="text-sm bg-white p-3 rounded border overflow-x-auto">
                  <code>{previewBlock.code}</code>
                </pre>
              </div>
              <div className="flex items-center justify-between text-sm text-gray-500">
                <div className="flex items-center gap-4">
                  <span>Category: {previewBlock.category.name}</span>
                  <span>Views: {previewBlock.views}</span>
                  <span>Likes: {previewBlock.likes}</span>
                </div>
                <div className="flex gap-2">
                  <Link href={`/admin/blocks/${previewBlock.id}/edit`}>
                    <Button size="sm">
                      <Edit className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                  </Link>
                  <Link href={`/blocks/${previewBlock.slug}`} target="_blank">
                    <Button size="sm" variant="outline">
                      <ExternalLink className="h-4 w-4 mr-1" />
                      View Live
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}