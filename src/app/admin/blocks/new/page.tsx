'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { X, Upload } from 'lucide-react'
import { toast } from 'sonner'
import { RichTextEditor } from '@/components/admin/RichTextEditor'
import { MultiCodeEditor } from '@/components/admin/CodeEditor'
import { CloudinaryImageUpload } from '@/components/admin/CloudinaryImageUpload'

export default function NewBlock() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    description: '',
    category: '',
    difficulty: 'beginner',
    isPublished: false,
    isPremium: false,
    metaTitle: '',
    metaDescription: '',
    tags: [] as string[],
    htmlCode: '',
    cssCode: '',
    jsCode: '',
    reactCode: '',
    vueCode: '',
    dependencies: [] as string[],
    instructions: '',
    demoUrl: '',
    githubUrl: ''
  })
  const [newTag, setNewTag] = useState('')
  const [newDependency, setNewDependency] = useState('')
  const [previewImageUrl, setPreviewImageUrl] = useState<string | null>(null)
  const [previewImagePublicId, setPreviewImagePublicId] = useState<string | null>(null)

  const categories = [
    'authentication',
    'dashboard',
    'forms',
    'navigation',
    'ui-components',
    'data-display',
    'charts',
    'tables',
    'modals',
    'cards',
    'buttons',
    'inputs'
  ]

  const difficulties = ['beginner', 'intermediate', 'advanced']

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9 -]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim()
  }

  const handleTitleChange = (title: string) => {
    setFormData(prev => ({
      ...prev,
      title,
      slug: generateSlug(title)
    }))
  }

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }))
      setNewTag('')
    }
  }

  const removeTag = (tag: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(t => t !== tag)
    }))
  }

  const addDependency = () => {
    if (newDependency.trim() && !formData.dependencies.includes(newDependency.trim())) {
      setFormData(prev => ({
        ...prev,
        dependencies: [...prev.dependencies, newDependency.trim()]
      }))
      setNewDependency('')
    }
  }

  const removeDependency = (dependency: string) => {
    setFormData(prev => ({
      ...prev,
      dependencies: prev.dependencies.filter(d => d !== dependency)
    }))
  }

  const handleImageUpload = (url: string, publicId: string) => {
    setPreviewImageUrl(url)
    setPreviewImagePublicId(publicId)
  }

  const handleImageRemove = () => {
    setPreviewImageUrl(null)
    setPreviewImagePublicId(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // Prepare data for submission
      const submitData = {
        ...formData,
        previewImage: previewImageUrl,
        previewImagePublicId: previewImagePublicId
      }

      const response = await fetch('/api/admin/blocks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(submitData)
      })

      if (!response.ok) {
        throw new Error('Failed to create block')
      }

      toast.success('Block created successfully!')
      router.push('/admin/blocks')
    } catch (error) {
      console.error('Error creating block:', error)
      toast.error('Failed to create block')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Create New SaaS Block</h1>
        <Button variant="outline" onClick={() => router.back()}>
          Cancel
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => handleTitleChange(e.target.value)}
                    placeholder="Enter block title"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="slug">Slug</Label>
                  <Input
                    id="slug"
                    value={formData.slug}
                    onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                    placeholder="block-slug"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="description">Description</Label>
                  <RichTextEditor
                    content={formData.description}
                    onChange={(content) => setFormData(prev => ({ ...prev, description: content }))}
                    placeholder="Brief description of the block"
                    minHeight="120px"
                    maxHeight="300px"
                    className="mt-2"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="category">Category</Label>
                    <Select value={formData.category} onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((cat) => (
                          <SelectItem key={cat} value={cat}>
                            {cat.charAt(0).toUpperCase() + cat.slice(1).replace('-', ' ')}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="difficulty">Difficulty</Label>
                    <Select value={formData.difficulty} onValueChange={(value) => setFormData(prev => ({ ...prev, difficulty: value }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {difficulties.map((diff) => (
                          <SelectItem key={diff} value={diff}>
                            {diff.charAt(0).toUpperCase() + diff.slice(1)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="instructions">Installation Instructions</Label>
                  <RichTextEditor
                    content={formData.instructions}
                    onChange={(content) => setFormData(prev => ({ ...prev, instructions: content }))}
                    placeholder="Step-by-step installation and usage instructions"
                    minHeight="150px"
                    maxHeight="400px"
                    className="mt-2"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="demoUrl">Demo URL</Label>
                    <Input
                      id="demoUrl"
                      value={formData.demoUrl}
                      onChange={(e) => setFormData(prev => ({ ...prev, demoUrl: e.target.value }))}
                      placeholder="https://demo.example.com"
                    />
                  </div>

                  <div>
                    <Label htmlFor="githubUrl">GitHub URL</Label>
                    <Input
                      id="githubUrl"
                      value={formData.githubUrl}
                      onChange={(e) => setFormData(prev => ({ ...prev, githubUrl: e.target.value }))}
                      placeholder="https://github.com/user/repo"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Code</CardTitle>
              </CardHeader>
              <CardContent>
                <MultiCodeEditor
                  htmlCode={formData.htmlCode}
                  cssCode={formData.cssCode}
                  jsCode={formData.jsCode}
                  reactCode={formData.reactCode}
                  vueCode={formData.vueCode}
                  onHtmlChange={(value) => setFormData(prev => ({ ...prev, htmlCode: value }))}
                  onCssChange={(value) => setFormData(prev => ({ ...prev, cssCode: value }))}
                  onJsChange={(value) => setFormData(prev => ({ ...prev, jsCode: value }))}
                  onReactChange={(value) => setFormData(prev => ({ ...prev, reactCode: value }))}
                  onVueChange={(value) => setFormData(prev => ({ ...prev, vueCode: value }))}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>SEO Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="metaTitle">Meta Title</Label>
                  <Input
                    id="metaTitle"
                    value={formData.metaTitle}
                    onChange={(e) => setFormData(prev => ({ ...prev, metaTitle: e.target.value }))}
                    placeholder="SEO title for search engines"
                  />
                </div>

                <div>
                  <Label htmlFor="metaDescription">Meta Description</Label>
                  <Textarea
                    id="metaDescription"
                    value={formData.metaDescription}
                    onChange={(e) => setFormData(prev => ({ ...prev, metaDescription: e.target.value }))}
                    placeholder="SEO description for search engines"
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Publish Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="isPublished">Published</Label>
                  <Switch
                    id="isPublished"
                    checked={formData.isPublished}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isPublished: checked }))}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="isPremium">Premium</Label>
                  <Switch
                    id="isPremium"
                    checked={formData.isPremium}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isPremium: checked }))}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Preview Image</CardTitle>
              </CardHeader>
              <CardContent>
                <CloudinaryImageUpload
                  value={previewImageUrl}
                  onChange={(url, publicId) => {
                    if (url) {
                      handleImageUpload(url, publicId || '')
                    } else {
                      handleImageRemove()
                    }
                  }}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Tags</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    placeholder="Add tag"
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                  />
                  <Button type="button" onClick={addTag} size="sm">
                    Add
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                      {tag}
                      <X
                        className="h-3 w-3 cursor-pointer"
                        onClick={() => removeTag(tag)}
                      />
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Dependencies</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    value={newDependency}
                    onChange={(e) => setNewDependency(e.target.value)}
                    placeholder="e.g., react, tailwindcss"
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addDependency())}
                  />
                  <Button type="button" onClick={addDependency} size="sm">
                    Add
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.dependencies.map((dep) => (
                    <Badge key={dep} variant="outline" className="flex items-center gap-1">
                      {dep}
                      <X
                        className="h-3 w-3 cursor-pointer"
                        onClick={() => removeDependency(dep)}
                      />
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Creating...' : 'Create Block'}
            </Button>
          </div>
        </div>
      </form>
    </div>
  )
}