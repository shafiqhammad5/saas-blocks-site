import { writeFile, mkdir, unlink } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'
import { v4 as uuidv4 } from 'uuid'

export interface UploadOptions {
  maxSize?: number // in bytes, default 5MB
  allowedTypes?: string[] // allowed file extensions
  directory?: string // subdirectory under /public/uploads/
}

export interface UploadResult {
  success: boolean
  filePath?: string // relative path from /public/
  error?: string
}

const DEFAULT_OPTIONS: UploadOptions = {
  maxSize: 5 * 1024 * 1024, // 5MB
  allowedTypes: ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'],
  directory: 'general'
}

/**
 * Upload a file to the public/uploads directory
 */
export async function uploadFile(
  file: File,
  options: UploadOptions = {}
): Promise<UploadResult> {
  const opts = { ...DEFAULT_OPTIONS, ...options }

  try {
    // Validate file size
    if (file.size > opts.maxSize!) {
      return {
        success: false,
        error: `File size exceeds ${Math.round(opts.maxSize! / 1024 / 1024)}MB limit`
      }
    }

    // Validate file type
    const fileExtension = file.name.split('.').pop()?.toLowerCase()
    if (!fileExtension || !opts.allowedTypes!.includes(fileExtension)) {
      return {
        success: false,
        error: `File type not allowed. Allowed types: ${opts.allowedTypes!.join(', ')}`
      }
    }

    // Create upload directory
    const uploadsDir = join(process.cwd(), 'public', 'uploads', opts.directory!)
    await mkdir(uploadsDir, { recursive: true })

    // Generate unique filename
    const fileName = `${uuidv4()}.${fileExtension}`
    const filePath = join(uploadsDir, fileName)
    
    // Convert file to buffer and save
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    await writeFile(filePath, buffer)

    return {
      success: true,
      filePath: `/uploads/${opts.directory}/${fileName}`
    }
  } catch (error) {
    console.error('Upload error:', error)
    return {
      success: false,
      error: 'Failed to upload file'
    }
  }
}

/**
 * Delete a file from the uploads directory
 */
export async function deleteFile(filePath: string): Promise<boolean> {
  try {
    const fullPath = join(process.cwd(), 'public', filePath)
    if (existsSync(fullPath)) {
      await unlink(fullPath)
      return true
    }
    return false
  } catch (error) {
    console.error('Delete error:', error)
    return false
  }
}

/**
 * Get file URL for display
 */
export function getFileUrl(filePath: string | null): string | null {
  if (!filePath) return null
  return filePath.startsWith('/') ? filePath : `/${filePath}`
}

/**
 * Validate image dimensions (client-side)
 */
export function validateImageDimensions(
  file: File,
  minWidth?: number,
  minHeight?: number,
  maxWidth?: number,
  maxHeight?: number
): Promise<{ valid: boolean; error?: string; dimensions?: { width: number; height: number } }> {
  return new Promise((resolve) => {
    const img = new Image()
    const url = URL.createObjectURL(file)
    
    img.onload = () => {
      URL.revokeObjectURL(url)
      
      const { width, height } = img
      
      if (minWidth && width < minWidth) {
        resolve({ valid: false, error: `Image width must be at least ${minWidth}px` })
        return
      }
      
      if (minHeight && height < minHeight) {
        resolve({ valid: false, error: `Image height must be at least ${minHeight}px` })
        return
      }
      
      if (maxWidth && width > maxWidth) {
        resolve({ valid: false, error: `Image width must not exceed ${maxWidth}px` })
        return
      }
      
      if (maxHeight && height > maxHeight) {
        resolve({ valid: false, error: `Image height must not exceed ${maxHeight}px` })
        return
      }
      
      resolve({ valid: true, dimensions: { width, height } })
    }
    
    img.onerror = () => {
      URL.revokeObjectURL(url)
      resolve({ valid: false, error: 'Invalid image file' })
    }
    
    img.src = url
  })
}

/**
 * Format file size for display
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

/**
 * Create upload directories for different content types
 */
export async function initializeUploadDirectories(): Promise<void> {
  const directories = [
    'blocks',
    'blog',
    'users',
    'general',
    'categories'
  ]
  
  for (const dir of directories) {
    const fullPath = join(process.cwd(), 'public', 'uploads', dir)
    await mkdir(fullPath, { recursive: true })
  }
}