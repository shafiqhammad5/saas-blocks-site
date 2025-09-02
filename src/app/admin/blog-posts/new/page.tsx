'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { ImageUpload } from '@/components/admin/ImageUpload'
import { RichTextEditor } from '@/components/admin/RichTextEditor'
import { ArrowLeft, Save, Eye, Plus, X } from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'

interface Category {
  id: string
  name: string
  slug: string
}

interface Tag {
  id: string
  name: string
  slug: string
}

interface BlogPostForm {
  title: string
  slug: string
  excerpt: string
  content: string
  coverImage: string
  isPublished: boolean
  publishedAt: string
  readTime: number
  categories: string[]
  tags: string[]
}

const initialForm: BlogPostForm = {
  title: '',
  slug: '',
  excerpt: '',
  content: '',
  coverImage: '',
  isPublished: false,
  publishedAt: '',
  readTime: 0,
  categories: [],
  tags: []
}

export default function NewBlogPostPage() {
  const router = useRouter()
  const [form, setForm] = useState<BlogPostForm>(initialForm)
  const [isLoading, setIsLoading] = useState(false)
  const [categories, setCategories] = useState<Category[]>([])
  const [tags, setTags] = useState<Tag[]>([])
  const [newTag, setNewTag] = useState('')

  // Generate slug from title
  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9 -]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim()
  }

  const handleTitleChange = (title: string) => {
    setForm(prev => ({
      ...prev,
      title,
      slug: generateSlug(title)
    }))
  }

  const handleAddTag = () => {
    if (newTag.trim() && !form.tags.includes(newTag.trim())) {
      setForm(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }))
      setNewTag('')
    }
  }

  const handleRemoveTag = (tagToRemove: string) => {
    setForm(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }))
  }

  const handleSubmit = async (e: React.FormEvent, isDraft = false) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const response = await fetch('/api/admin/blog-posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...form,
          isPublished: isDraft ? false : form.isPublished
        })
      })

      if (!response.ok) {
        throw new Error('Failed to create blog post')
      }

      const result = await response.json()
      toast.success(isDraft ? 'Draft saved successfully!' : 'Blog post created successfully!')
      router.push('/admin/blog-posts')
    } catch (error) {
      console.error('Error creating blog post:', error)
      toast.error('Failed to create blog post')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link href="/admin/blog-posts">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">New Blog Post</h1>
            <p className="text-gray-600 mt-1">
              Create a new blog post with rich content
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            onClick={(e) => handleSubmit(e, true)}
            disabled={isLoading}
          >
            <Save className="h-4 w-4 mr-2" />
            Save Draft
          </Button>
          <Button
            onClick={(e) => handleSubmit(e)}
            disabled={isLoading}
          >
            <Eye className="h-4 w-4 mr-2" />
            {form.isPublished ? 'Publish' : 'Save'}
          </Button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>
                Enter the basic details of your blog post
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  value={form.title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  placeholder="Enter blog post title"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="slug">Slug</Label>
                <Input
                  id="slug"
                  value={form.slug}
                  onChange={(e) => setForm(prev => ({ ...prev, slug: e.target.value }))}
                  placeholder="blog-post-slug"
                />
              </div>
              
              <div>
                <Label htmlFor="excerpt">Excerpt</Label>
                <Textarea
                  id="excerpt"
                  value={form.excerpt}
                  onChange={(e) => setForm(prev => ({ ...prev, excerpt: e.target.value }))}
                  placeholder="Brief description of the blog post"
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Content */}
          <Card>
            <CardHeader>
              <CardTitle>Content</CardTitle>
              <CardDescription>
                Write your blog post content
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div>
                <Label htmlFor="content">Content *</Label>
                <RichTextEditor
                  content={form.content}
                  onChange={(content) => setForm(prev => ({ ...prev, content }))}
                  placeholder="Write your blog post content here..."
                  minHeight="300px"
                  maxHeight="600px"
                  className="mt-2"
                />
                <p className="text-sm text-gray-500 mt-2">
                  Rich text editor with formatting tools, images, links, and more
                </p>
              </div>
            </CardContent>
          </Card>


        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Publishing Options */}
          <Card>
            <CardHeader>
              <CardTitle>Publishing</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="isPublished">Published</Label>
                <Switch
                  id="isPublished"
                  checked={form.isPublished}
                  onCheckedChange={(checked) => setForm(prev => ({ ...prev, isPublished: checked }))}
                />
              </div>
              
              {form.isPublished && (
                <div>
                  <Label htmlFor="publishedAt">Publish Date</Label>
                  <Input
                    id="publishedAt"
                    type="datetime-local"
                    value={form.publishedAt}
                    onChange={(e) => setForm(prev => ({ ...prev, publishedAt: e.target.value }))}
                  />
                </div>
              )}
              
              <div>
                <Label htmlFor="readTime">Read Time (minutes)</Label>
                <Input
                  id="readTime"
                  type="number"
                  value={form.readTime}
                  onChange={(e) => setForm(prev => ({ ...prev, readTime: parseInt(e.target.value) || 0 }))}
                  placeholder="5"
                  min="0"
                />
              </div>
            </CardContent>
          </Card>

          {/* Cover Image */}
          <Card>
            <CardHeader>
              <CardTitle>Cover Image</CardTitle>
            </CardHeader>
            <CardContent>
              <ImageUpload
                value={form.coverImage}
                onChange={(file, previewUrl) => setForm(prev => ({ ...prev, coverImage: previewUrl || '' }))}
                onRemove={() => setForm(prev => ({ ...prev, coverImage: '' }))}
              />
            </CardContent>
          </Card>

          {/* Categories */}
          <Card>
            <CardHeader>
              <CardTitle>Categories</CardTitle>
            </CardHeader>
            <CardContent>
              <Select
                value={form.categories[0] || ''}
                onValueChange={(value) => setForm(prev => ({ ...prev, categories: [value] }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="technology">Technology</SelectItem>
                  <SelectItem value="design">Design</SelectItem>
                  <SelectItem value="business">Business</SelectItem>
                  <SelectItem value="tutorial">Tutorial</SelectItem>
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          {/* Tags */}
          <Card>
            <CardHeader>
              <CardTitle>Tags</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex space-x-2">
                <Input
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  placeholder="Add tag"
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleAddTag}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="flex flex-wrap gap-2">
                {form.tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                    {tag}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="ml-1 hover:text-red-500"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </form>
    </div>
  )
}