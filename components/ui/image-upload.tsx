'use client'

import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { Upload, X, Image, Loader2 } from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'

interface ImageUploadProps {
  onUpload?: (url: string) => void
  folder?: string
  maxSize?: number // in MB
  accept?: string
  multiple?: boolean
  className?: string
}

interface UploadedFile {
  id: string
  url: string
  originalName: string
  size: number
}

export function ImageUpload({
  onUpload,
  folder = 'images',
  maxSize = 10,
  accept = 'image/*',
  multiple = false,
  className = ''
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([])
  const [dragOver, setDragOver] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  const validateFile = (file: File): string | null => {
    // 检查文件大小
    if (file.size > maxSize * 1024 * 1024) {
      return `文件大小不能超过 ${maxSize}MB`
    }

    // 检查文件类型
    if (accept === 'image/*' && !file.type.startsWith('image/')) {
      return '只能上传图片文件'
    }

    return null
  }

  const uploadFile = async (file: File): Promise<UploadedFile | null> => {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('folder', folder)

    const token = localStorage.getItem('auth_token')
    const response = await fetch('/api/upload', {
      method: 'POST',
      headers: {
        Authorization: token ? `Bearer ${token}` : ''
      },
      body: formData
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || '上传失败')
    }

    const result = await response.json()
    return {
      id: result.file.id,
      url: result.file.url,
      originalName: result.file.originalName,
      size: result.file.size
    }
  }

  const handleFileSelect = async (files: FileList | null) => {
    if (!files || files.length === 0) return

    const filesToUpload = Array.from(files)
    
    // 验证文件
    for (const file of filesToUpload) {
      const error = validateFile(file)
      if (error) {
        toast({
          title: '文件验证失败',
          description: `${file.name}: ${error}`,
          variant: 'destructive'
        })
        return
      }
    }

    setUploading(true)
    try {
      const uploadPromises = filesToUpload.map(uploadFile)
      const results = await Promise.all(uploadPromises)
      
      const successfulUploads = results.filter((result): result is UploadedFile => result !== null)
      
      setUploadedFiles(prev => [...prev, ...successfulUploads])
      
      // 如果有回调函数，调用它
      if (onUpload && successfulUploads.length > 0) {
        successfulUploads.forEach(file => onUpload(file.url))
      }
      
      toast({
        title: '上传成功',
        description: `成功上传 ${successfulUploads.length} 个文件`
      })
      
    } catch (error) {
      console.error('上传失败:', error)
      toast({
        title: '上传失败',
        description: error instanceof Error ? error.message : '未知错误',
        variant: 'destructive'
      })
    } finally {
      setUploading(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    handleFileSelect(e.dataTransfer.files)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
  }

  const removeFile = (id: string) => {
    setUploadedFiles(prev => prev.filter(file => file.id !== id))
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  return (
    <div className={className}>
      <Card>
        <CardContent className="p-6">
          {/* 上传区域 */}
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              dragOver
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                : 'border-slate-300 dark:border-slate-600 hover:border-slate-400 dark:hover:border-slate-500'
            }`}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
          >
            <div className="flex flex-col items-center gap-4">
              {uploading ? (
                <Loader2 className="h-12 w-12 text-blue-500 animate-spin" />
              ) : (
                <Upload className="h-12 w-12 text-slate-400" />
              )}
              
              <div>
                <p className="text-lg font-medium text-slate-900 dark:text-white mb-2">
                  {uploading ? '上传中...' : '拖拽文件到此处或点击选择'}
                </p>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  支持 {accept === 'image/*' ? '图片' : '文件'} 格式，最大 {maxSize}MB
                </p>
              </div>
              
              <Button
                type="button"
                variant="outline"
                disabled={uploading}
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="h-4 w-4 mr-2" />
                选择文件
              </Button>
            </div>
          </div>

          {/* 隐藏的文件输入 */}
          <Input
            ref={fileInputRef}
            type="file"
            accept={accept}
            multiple={multiple}
            className="hidden"
            onChange={(e) => handleFileSelect(e.target.files)}
          />

          {/* 已上传文件列表 */}
          {uploadedFiles.length > 0 && (
            <div className="mt-6">
              <Label className="text-sm font-medium mb-3 block">
                已上传文件 ({uploadedFiles.length})
              </Label>
              <div className="space-y-2">
                {uploadedFiles.map((file) => (
                  <div
                    key={file.id}
                    className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-lg"
                  >
                    {file.url.match(/\.(jpg|jpeg|png|gif|webp|svg)$/i) ? (
                      <img
                        src={file.url}
                        alt={file.originalName}
                        className="w-12 h-12 object-cover rounded"
                      />
                    ) : (
                      <div className="w-12 h-12 bg-slate-200 dark:bg-slate-700 rounded flex items-center justify-center">
                        <Image className="h-6 w-6 text-slate-400" />
                      </div>
                    )}
                    
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-900 dark:text-white truncate">
                        {file.originalName}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {formatFileSize(file.size)}
                      </p>
                    </div>
                    
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => navigator.clipboard.writeText(file.url)}
                      className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
                    >
                      复制链接
                    </Button>
                    
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFile(file.id)}
                      className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}