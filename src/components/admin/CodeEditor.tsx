'use client'

import { useState, useEffect } from 'react'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Copy, Check, Maximize2, Minimize2 } from 'lucide-react'
import { toast } from 'sonner'

interface CodeEditorProps {
  value: string
  onChange: (value: string) => void
  language: 'html' | 'css' | 'javascript' | 'typescript' | 'jsx' | 'tsx'
  placeholder?: string
  label?: string
  className?: string
  minHeight?: string
  maxHeight?: string
}

export function CodeEditor({
  value,
  onChange,
  language,
  placeholder = '',
  label,
  className = '',
  minHeight = '200px',
  maxHeight = '500px'
}: CodeEditorProps) {
  const [copied, setCopied] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value)
      setCopied(true)
      toast.success('Code copied to clipboard')
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      toast.error('Failed to copy code')
    }
  }

  const getLanguageColor = (lang: string) => {
    const colors = {
      html: 'bg-orange-100 text-orange-800',
      css: 'bg-blue-100 text-blue-800',
      javascript: 'bg-yellow-100 text-yellow-800',
      typescript: 'bg-blue-100 text-blue-800',
      jsx: 'bg-cyan-100 text-cyan-800',
      tsx: 'bg-cyan-100 text-cyan-800'
    }
    return colors[lang as keyof typeof colors] || 'bg-gray-100 text-gray-800'
  }

  const getLanguageDisplay = (lang: string) => {
    const displays = {
      html: 'HTML',
      css: 'CSS',
      javascript: 'JavaScript',
      typescript: 'TypeScript',
      jsx: 'React JSX',
      tsx: 'React TSX'
    }
    return displays[lang as keyof typeof displays] || lang.toUpperCase()
  }

  return (
    <div className={`space-y-2 ${className}`}>
      {label && (
        <div className="flex items-center justify-between">
          <Label className="text-sm font-medium">{label}</Label>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className={getLanguageColor(language)}>
              {getLanguageDisplay(language)}
            </Badge>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleCopy}
              className="h-6 px-2"
            >
              {copied ? (
                <Check className="h-3 w-3" />
              ) : (
                <Copy className="h-3 w-3" />
              )}
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="h-6 px-2"
            >
              {isExpanded ? (
                <Minimize2 className="h-3 w-3" />
              ) : (
                <Maximize2 className="h-3 w-3" />
              )}
            </Button>
          </div>
        </div>
      )}
      
      <Card className="border-2 border-dashed border-gray-200 hover:border-gray-300 transition-colors">
        <CardContent className="p-0">
          <textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className={`
              w-full p-4 font-mono text-sm bg-gray-50 border-0 rounded-lg resize-none
              focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white
              placeholder:text-gray-400
              ${isExpanded ? 'min-h-[600px]' : ''}
            `}
            style={{
              minHeight: isExpanded ? '600px' : minHeight,
              maxHeight: isExpanded ? 'none' : maxHeight,
              fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Consolas, "Liberation Mono", Menlo, monospace'
            }}
            spellCheck={false}
          />
        </CardContent>
      </Card>
      
      {value && (
        <div className="text-xs text-gray-500 flex justify-between">
          <span>{value.split('\n').length} lines</span>
          <span>{value.length} characters</span>
        </div>
      )}
    </div>
  )
}

// Multi-language code editor for blocks
interface MultiCodeEditorProps {
  htmlCode: string
  cssCode: string
  jsCode: string
  reactCode: string
  vueCode: string
  onHtmlChange: (value: string) => void
  onCssChange: (value: string) => void
  onJsChange: (value: string) => void
  onReactChange: (value: string) => void
  onVueChange: (value: string) => void
  className?: string
}

export function MultiCodeEditor({
  htmlCode,
  cssCode,
  jsCode,
  reactCode,
  vueCode,
  onHtmlChange,
  onCssChange,
  onJsChange,
  onReactChange,
  onVueChange,
  className = ''
}: MultiCodeEditorProps) {
  return (
    <div className={`space-y-6 ${className}`}>
      <CodeEditor
        value={htmlCode}
        onChange={onHtmlChange}
        language="html"
        label="HTML Code"
        placeholder="Enter HTML code for the block..."
        minHeight="150px"
        maxHeight="400px"
      />
      
      <CodeEditor
        value={cssCode}
        onChange={onCssChange}
        language="css"
        label="CSS Code"
        placeholder="Enter CSS styles for the block..."
        minHeight="150px"
        maxHeight="400px"
      />
      
      <CodeEditor
        value={jsCode}
        onChange={onJsChange}
        language="javascript"
        label="JavaScript Code"
        placeholder="Enter JavaScript code for the block..."
        minHeight="150px"
        maxHeight="400px"
      />
      
      <CodeEditor
        value={reactCode}
        onChange={onReactChange}
        language="jsx"
        label="React Code"
        placeholder="Enter React component code..."
        minHeight="150px"
        maxHeight="400px"
      />
      
      <CodeEditor
        value={vueCode}
        onChange={onVueChange}
        language="tsx"
        label="Vue Code"
        placeholder="Enter Vue component code..."
        minHeight="150px"
        maxHeight="400px"
      />
    </div>
  )
}