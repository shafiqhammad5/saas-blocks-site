'use client'

import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { Upload, X, Image as ImageIcon } from 'lucide-react'
import { formatFileSize, validateImageDimensions } from '@/lib/client-utils'
import Image from 'next/image'

interface ImageUploadProps {
  value?: string | null
  onChange: (file: File | null, previewUrl?: string) => void
  onRemove?: () => void
  label?: string
  description?: string
  maxSize?: number // in MB
  allowedTypes?: string[]
  minWidth?: number
  minHeight?: number
  maxWidth?: number
  maxHeight?: number
  className?: string
  disabled?: boolean
  required?: boolean
}

export function ImageUpload({
  value,
  onChange,
  onRemove,
  label = 'Upload Image',
  description,
  maxSize = 5,
  allowedTypes = ['jpg', 'jpeg', 'png', 'gif', 'webp'],
  minWidth,
  minHeight,
  maxWidth,
  maxHeight,
  className = '',
  disabled = false,
  required = false
}: ImageUploadProps) {
  const [preview, setPreview] = useState<string | null>(value || null)
  const [dragActive, setDragActive] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isValidating, setIsValidating] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const validateFile = async (file: File): Promise<boolean> => {
    setError(null)
    setIsValidating(true)

    // Check file size
    if (file.size > maxSize * 1024 * 1024) {
      setError(`File size must be less than ${maxSize}MB`)
      setIsValidating(false)
      return false
    }

    // Check file type
    const fileExtension = file.name.split('.').pop()?.toLowerCase()
    if (!fileExtension || !allowedTypes.includes(fileExtension)) {
      setError(`File type not allowed. Allowed types: ${allowedTypes.join(', ')}`)
      setIsValidating(false)
      return false
    }

    // Validate image dimensions if specified
    if (minWidth || minHeight || maxWidth || maxHeight) {
      const validation = await validateImageDimensions(
        file,
        minWidth,
        minHeight,
        maxWidth,
        maxHeight
      )
      
      if (!validation.valid) {
        setError(validation.error || 'Invalid image dimensions')
        setIsValidating(false)
        return false
      }
    }

    setIsValidating(false)
    return true
  }

  const handleFileSelect = async (file: File) => {
    const isValid = await validateFile(file)
    if (!isValid) return

    const previewUrl = URL.createObjectURL(file)
    setPreview(previewUrl)
    onChange(file, previewUrl)
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
    if (!disabled) {
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
        <p className="text-sm text-gray-600">{description}</p>
      )}

      <Card className="overflow-hidden">
        <CardContent className="p-0">
          {preview ? (
            <div className="relative group">
              <div className="aspect-video relative bg-gray-100">
                <Image
                  src={preview}
                  alt="Preview"
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
              </div>
              
              {!disabled && (
                <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center space-x-2">
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={handleClick}
                    className="bg-white text-black hover:bg-gray-100"
                  >
                    <Upload className="h-4 w-4 mr-1" />
                    Change
                  </Button>
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
                ${disabled ? 'cursor-not-allowed opacity-50' : 'hover:border-gray-400'}
                ${error ? 'border-red-300 bg-red-50' : ''}
              `}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onClick={handleClick}
            >
              <div className="flex flex-col items-center space-y-2">
                <ImageIcon className="h-12 w-12 text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {dragActive ? 'Drop image here' : 'Click to upload or drag and drop'}
                  </p>
                  <p className="text-xs text-gray-500">
                    {allowedTypes.map(type => type.toUpperCase()).join(', ')} up to {maxSize}MB
                  </p>
                  {(minWidth || minHeight || maxWidth || maxHeight) && (
                    <p className="text-xs text-gray-500 mt-1">
                      {minWidth && minHeight && `Min: ${minWidth}x${minHeight}px`}
                      {maxWidth && maxHeight && ` Max: ${maxWidth}x${maxHeight}px`}
                    </p>
                  )}
                </div>
                {isValidating && (
                  <p className="text-xs text-blue-600">Validating image...</p>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}

      <Input
        ref={fileInputRef}
        type="file"
        accept={allowedTypes.map(type => `.${type}`).join(',')}
        onChange={handleInputChange}
        className="hidden"
        disabled={disabled}
      />
    </div>
  )
}

export default ImageUpload