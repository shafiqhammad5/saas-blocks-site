/**
 * Client-safe utility functions that can be used in browser environments
 */

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

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
      
      // Check minimum dimensions
      if (minWidth && width < minWidth) {
        resolve({
          valid: false,
          error: `Image width must be at least ${minWidth}px (current: ${width}px)`,
          dimensions: { width, height }
        })
        return
      }
      
      if (minHeight && height < minHeight) {
        resolve({
          valid: false,
          error: `Image height must be at least ${minHeight}px (current: ${height}px)`,
          dimensions: { width, height }
        })
        return
      }
      
      // Check maximum dimensions
      if (maxWidth && width > maxWidth) {
        resolve({
          valid: false,
          error: `Image width must not exceed ${maxWidth}px (current: ${width}px)`,
          dimensions: { width, height }
        })
        return
      }
      
      if (maxHeight && height > maxHeight) {
        resolve({
          valid: false,
          error: `Image height must not exceed ${maxHeight}px (current: ${height}px)`,
          dimensions: { width, height }
        })
        return
      }
      
      resolve({
        valid: true,
        dimensions: { width, height }
      })
    }
    
    img.onerror = () => {
      URL.revokeObjectURL(url)
      resolve({
        valid: false,
        error: 'Invalid image file'
      })
    }
    
    img.src = url
  })
}