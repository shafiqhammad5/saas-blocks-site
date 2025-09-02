'use client'

import { useState, useEffect } from 'react'
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
import { X, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { RichTextEditor } from '@/components/admin/RichTextEditor'
import { MultiCodeEditor } from '@/components/admin/CodeEditor'
import { CloudinaryImageUpload } from '@/components/admin/CloudinaryImageUpload'

interface Block {
  id: string
  title: string
  slug: string
  description: string
  category: { name: string }
  difficulty: string
  isPublished: boolean
  isPremium: boolean
  metaTitle: string | null
  metaDescription: string | null
  tags: Array<{ name: string }>
  htmlCode: string | null
  cssCode: string | null
  jsCode: string | null
  reactCode: string | null
  vueCode: string | null
  dependencies: Array<{ name: string }>
  instructions: string | null
  demoUrl: string | null
  githubUrl: string | null
  image: string | null
}

export default function EditBlock({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingBlock, setIsLoadingBlock] = useState(true)
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
    githubUrl: '',
    image: ''
  })
  const [newTag, setNewTag] = useState('')
  const [newDependency, setNewDependency] = useState('')

  useEffect(() => {
    const fetchBlock = async () => {
      try {
        const response = await fetch(`/api/admin/blocks/${params.id}`)
        if (!response.ok) {
          throw new Error('Failed to fetch block')
        }
        const block: Block = await response.json()
        
        setFormData({
          title: block.title,
          slug: block.slug,
          description: block.description,
          category: block.category.name,
          difficulty: block.difficulty,
          isPublished: block.isPublished,
          isPremium: block.isPremium,
          metaTitle: block.metaTitle || '',
          metaDescription: block.metaDescription || '',
          tags: block.tags.map(tag => tag.name),
          htmlCode: block.htmlCode || '',
          cssCode: block.cssCode || '',
          jsCode: block.jsCode || '',
          reactCode: block.reactCode || '',
          vueCode: block.vueCode || '',
          dependencies: block.dependencies.map(dep => dep.name),
          instructions: block.instructions || '',
          demoUrl: block.demoUrl || '',
          githubUrl: block.githubUrl || '',
          image: block.image || ''
        })
      } catch (error) {
        console.error('Error fetching block:', error)
        toast.error('Failed to load block')
        router.push('/admin/blocks')
      } finally {
        setIsLoadingBlock(false)
      }
    }

    fetchBlock()
  }, [params.id, router])

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const response = await fetch(`/api/admin/blocks/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      })

      if (!response.ok) {
        throw new Error('Failed to update block')
      }

      toast.success('Block updated successfully!')
      router.push('/admin/blocks')
    } catch (error) {
      console.error('Error updating block:', error)
      toast.error('Failed to update block')
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoadingBlock) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Edit Block</h1>
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
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Brief description of the block"
                    rows={3}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="category">Category</Label>
                  <Input
                    id="category"
                    value={formData.category}
                    onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                    placeholder="Block category"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="difficulty">Difficulty</Label>
                  <Select
                    value={formData.difficulty}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, difficulty: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select difficulty" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="beginner">Beginner</SelectItem>
                      <SelectItem value="intermediate">Intermediate</SelectItem>
                      <SelectItem value="advanced">Advanced</SelectItem>
                    </SelectContent>
                  </Select>
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
                  onHtmlChange={(code) => setFormData(prev => ({ ...prev, htmlCode: code }))}
                  onCssChange={(code) => setFormData(prev => ({ ...prev, cssCode: code }))}
                  onJsChange={(code) => setFormData(prev => ({ ...prev, jsCode: code }))}
                  onReactChange={(code) => setFormData(prev => ({ ...prev, reactCode: code }))}
                  onVueChange={(code) => setFormData(prev => ({ ...prev, vueCode: code }))}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Instructions</CardTitle>
              </CardHeader>
              <CardContent>
                <RichTextEditor
                  content={formData.instructions}
                  onChange={(content) => setFormData(prev => ({ ...prev, instructions: content }))}
                  placeholder="Write implementation instructions here..."
                  minHeight="200px"
                  maxHeight="400px"
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
                  value={formData.image}
                  onChange={(url: string | null) => setFormData(prev => ({ ...prev, image: url || '' }))}
                  folder="blocks"
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
                    placeholder="Add dependency"
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addDependency())}
                  />
                  <Button type="button" onClick={addDependency} size="sm">
                    Add
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.dependencies.map((dependency) => (
                    <Badge key={dependency} variant="secondary" className="flex items-center gap-1">
                      {dependency}
                      <X
                        className="h-3 w-3 cursor-pointer"
                        onClick={() => removeDependency(dependency)}
                      />
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Links</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="demoUrl">Demo URL</Label>
                  <Input
                    id="demoUrl"
                    value={formData.demoUrl}
                    onChange={(e) => setFormData(prev => ({ ...prev, demoUrl: e.target.value }))}
                    placeholder="https://demo.example.com"
                    type="url"
                  />
                </div>

                <div>
                  <Label htmlFor="githubUrl">GitHub URL</Label>
                  <Input
                    id="githubUrl"
                    value={formData.githubUrl}
                    onChange={(e) => setFormData(prev => ({ ...prev, githubUrl: e.target.value }))}
                    placeholder="https://github.com/user/repo"
                    type="url"
                  />
                </div>
              </CardContent>
            </Card>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Updating...' : 'Update Block'}
            </Button>
          </div>
        </div>
      </form>
    </div>
  )
}