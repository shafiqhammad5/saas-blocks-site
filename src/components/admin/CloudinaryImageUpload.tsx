'use client'

import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { Upload, X, Image as ImageIcon, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import Image from 'next/image'

interface CloudinaryImageUploadProps {
  value?: string | null
  onChange: (url: string | null, publicId?: string) => void
  onRemove?: () => void
  label?: string
  description?: string
  maxSize?: number // in MB
  allowedTypes?: string[]
  folder?: string // Cloudinary folder
  className?: string
  disabled?: boolean
  required?: boolean
}

export function CloudinaryImageUpload({
  value,
  onChange,
  onRemove,
  label = 'Upload Image',
  description,
  maxSize = 5,
  allowedTypes = ['jpg', 'jpeg', 'png', 'gif', 'webp'],
  folder = 'saasblocks',
  className = '',
  disabled = false,
  required = false
}: CloudinaryImageUploadProps) {
  const [preview, setPreview] = useState<string | null>(value || null)
  const [dragActive, setDragActive] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const validateFile = (file: File): boolean => {
    setError(null)

    // Check file size
    if (file.size > maxSize * 1024 * 1024) {
      setError(`File size must be less than ${maxSize}MB`)
      return false
    }

    // Check file type
    const fileExtension = file.name.split('.').pop()?.toLowerCase()
    if (!fileExtension || !allowedTypes.includes(fileExtension)) {
      setError(`File type not allowed. Allowed types: ${allowedTypes.join(', ')}`)
      return false
    }

    return true
  }

  const uploadToCloudinary = async (file: File) => {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('folder', folder)

    const response = await fetch('/api/admin/upload', {
      method: 'POST',
      body: formData
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || 'Upload failed')
    }

    return response.json()
  }

  const handleFileSelect = async (file: File) => {
    if (!validateFile(file)) return

    setIsUploading(true)
    setError(null)

    try {
      // Create local preview immediately
      const localPreview = URL.createObjectURL(file)
      setPreview(localPreview)

      // Upload to Cloudinary
      const result = await uploadToCloudinary(file)
      
      if (result.success) {
        setPreview(result.url)
        onChange(result.url, result.publicId)
        toast.success('Image uploaded successfully!')
        
        // Clean up local preview
        URL.revokeObjectURL(localPreview)
      } else {
        throw new Error(result.error || 'Upload failed')
      }
    } catch (error) {
      console.error('Upload error:', error)
      setError(error instanceof Error ? error.message : 'Upload failed')
      setPreview(null)
      toast.error('Failed to upload image')
    } finally {
      setIsUploading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleFileSelect(file)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragActive(false)
    
    const file = e.dataTransfer.files?.[0]
    if (file) {
      handleFileSelect(file)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setDragActive(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setDragActive(false)
  }

  const handleRemove = () => {
    setPreview(null)
    setError(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
    onChange(null)
    onRemove?.()
  }

  const handleClick = () => {
    if (!disabled && !isUploading) {
      fileInputRef.current?.click()
    }
  }

  return (
    <div className={`space-y-2 ${className}`}>
      {label && (
        <Label className="text-sm font-medium">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </Label>
      )}
      
      {description && (
        <p className="text-sm text-gray-500">{description}</p>
      )}

      <Card className="overflow-hidden">
        <CardContent className="p-0">
          <Input
            ref={fileInputRef}
            type="file"
            accept={allowedTypes.map(type => `.${type}`).join(',')}
            onChange={handleInputChange}
            className="hidden"
            disabled={disabled || isUploading}
          />

          {error && (
            <div className="p-4 bg-red-50 border-b border-red-200">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {preview ? (
            <div className="relative">
              <div className="aspect-video relative bg-gray-100">
                <Image
                  src={preview}
                  alt="Preview"
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
                {isUploading && (
                  <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                    <div className="flex items-center space-x-2 text-white">
                      <Loader2 className="h-5 w-5 animate-spin" />
                      <span className="text-sm">Uploading...</span>
                    </div>
                  </div>
                )}
              </div>
              {!isUploading && (
                <div className="absolute top-2 right-2">
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    onClick={handleRemove}
                  >
                    <X className="h-4 w-4 mr-1" />
                    Remove
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <div
              className={`
                border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
                ${dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300'}
                ${disabled || isUploading ? 'cursor-not-allowed opacity-50' : 'hover:border-gray-400'}
                ${error ? 'border-red-300 bg-red-50' : ''}
              `}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onClick={handleClick}
            >
              <div className="flex flex-col items-center space-y-2">
                {isUploading ? (
                  <>
                    <Loader2 className="h-12 w-12 text-blue-500 animate-spin" />
                    <p className="text-sm font-medium text-gray-900">Uploading...</p>
                  </>
                ) : (
                  <>
                    <ImageIcon className="h-12 w-12 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {dragActive ? 'Drop image here' : 'Click to upload or drag and drop'}
                      </p>
                      <p className="text-xs text-gray-500">
                        {allowedTypes.map(type => type.toUpperCase()).join(', ')} up to {maxSize}MB
                      </p>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default CloudinaryImageUpload