'use client'

import React, { useState, useEffect } from 'react'
import { gql, useQuery, useMutation } from '@apollo/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ImageUpload } from '@/components/ui/image-upload'
import { useToast } from '@/hooks/use-toast'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Upload,
  Search,
  Filter,
  Download,
  Trash2,
  Eye,
  Copy,
  Image as ImageIcon,
  File,
  FileText,
  Video,
} from 'lucide-react'

const GET_UPLOADS = gql`
  query GetUploads($skip: Int, $take: Int, $folder: String, $orderBy: UploadOrderBy) {
    uploads(skip: $skip, take: $take, folder: $folder, orderBy: $orderBy) {
      id
      filename
      originalName
      url
      size
      mimetype
      createdAt
      uploadedBy {
        id
        name
        email
      }
    }
  }
`

const DELETE_UPLOAD = gql`
  mutation DeleteUpload($id: String!) {
    deleteUpload(id: $id)
  }
`

interface FileRecord {
  id: string
  filename: string
  originalName: string
  url: string
  size: number
  mimetype: string
  createdAt: string
  uploadedBy: {
    id: string
    name: string
    email: string
  }
}

export function FileManager() {
  const [selectedFiles, setSelectedFiles] = useState<string[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [typeFilter, setTypeFilter] = useState('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [showUploadDialog, setShowUploadDialog] = useState(false)
  const { toast } = useToast()

  const pageSize = 20
  const skip = (currentPage - 1) * pageSize

  // GraphQL 查询
  const { data, loading, refetch } = useQuery(GET_UPLOADS, {
    variables: {
      skip,
      take: pageSize,
      orderBy: { createdAt: 'desc' },
    },
    errorPolicy: 'all',
  })

  const [deleteUpload] = useMutation(DELETE_UPLOAD, {
    onCompleted: () => {
      toast({
        title: '成功',
        description: '文件删除成功',
      })
      refetch()
    },
    onError: (error) => {
      toast({
        title: '错误',
        description: '删除文件失败',
        variant: 'destructive',
      })
    },
  })

  const files = data?.uploads || []

  // 删除选中的文件
  const deleteSelectedFiles = async () => {
    if (selectedFiles.length === 0) {
      toast({
        title: '提示',
        description: '请选择要删除的文件',
        variant: 'destructive',
      })
      return
    }

    try {
      // 逐个删除文件
      for (const fileId of selectedFiles) {
        await deleteUpload({ variables: { id: fileId } })
      }

      toast({
        title: '成功',
        description: `已删除 ${selectedFiles.length} 个文件`,
      })

      setSelectedFiles([])
    } catch (error) {
      toast({
        title: '错误',
        description: '删除文件失败',
        variant: 'destructive',
      })
    }
  }

  // 复制文件链接
  const copyFileUrl = (url: string) => {
    navigator.clipboard.writeText(url)
    toast({
      title: '成功',
      description: '文件链接已复制到剪贴板',
    })
  }

  // 复制文件链接
  const copyFileLink = (file: FileRecord) => {
    const link = `${window.location.origin}/uploads/${file.filename}`
    navigator.clipboard.writeText(link)
    toast({
      title: '成功',
      description: '文件链接已复制到剪贴板',
    })
  }

  // 格式化文件大小
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  // 获取文件图标
  const getFileIcon = (mimetype: string) => {
    if (mimetype.startsWith('image/')) {
      return <ImageIcon className="h-4 w-4" />
    } else if (mimetype.startsWith('video/')) {
      return <Video className="h-4 w-4" />
    } else if (mimetype.includes('text') || mimetype.includes('document')) {
      return <FileText className="h-4 w-4" />
    }
    return <File className="h-4 w-4" />
  }

  // 处理文件选择
  const handleFileSelect = (fileId: string, checked: boolean) => {
    if (checked) {
      setSelectedFiles([...selectedFiles, fileId])
    } else {
      setSelectedFiles(selectedFiles.filter(id => id !== fileId))
    }
  }

  // 全选/取消全选
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedFiles(files.map(file => file.id))
    } else {
      setSelectedFiles([])
    }
  }

  // 上传成功回调
  const handleUploadSuccess = () => {
    setShowUploadDialog(false)
    refetch()
  }

  useEffect(() => {
    refetch()
  }, [currentPage, searchTerm, typeFilter, refetch])

  return (
    <div className="space-y-6">
      {/* 工具栏 */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
          <div className="flex items-center gap-2">
            <Search className="h-4 w-4 text-gray-500" />
            <Input
              placeholder="搜索文件..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-64"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-gray-500" />
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="w-32 px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="all">全部</option>
              <option value="image">图片</option>
              <option value="video">视频</option>
              <option value="text">文档</option>
            </select>
          </div>
        </div>
        
        <div className="flex gap-2">
          {selectedFiles.length > 0 && (
            <Button
              variant="destructive"
              size="sm"
              onClick={deleteSelectedFiles}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              删除选中 ({selectedFiles.length})
            </Button>
          )}
          
          {showUploadDialog && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold">上传文件</h2>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowUploadDialog(false)}
                  >
                    ×
                  </Button>
                </div>
                <ImageUpload
                   onUpload={() => handleUploadSuccess()}
                   multiple={true}
                   maxSize={50}
                 />
              </div>
            </div>
          )}
          <Button onClick={() => setShowUploadDialog(true)}>
            <Upload className="h-4 w-4 mr-2" />
            上传文件
          </Button>
        </div>
      </div>

      {/* 文件列表 */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
              <CardTitle>文件列表</CardTitle>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={selectedFiles.length === files.length && files.length > 0}
                  onChange={(e) => handleSelectAll(e.target.checked)}
                  className="rounded"
                />
                <span className="text-sm text-gray-500">全选</span>
              </div>
            </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
              <p className="mt-2 text-gray-500">加载中...</p>
            </div>
          ) : files.length === 0 ? (
            <div className="text-center py-8">
              <File className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">暂无文件</p>
            </div>
          ) : (
            <div className="space-y-2">
              {files.map((file: FileRecord) => (
                <div
                  key={file.id}
                  className="flex items-center gap-4 p-4 border rounded-lg hover:bg-gray-50"
                >
                  <input
                    type="checkbox"
                    checked={selectedFiles.includes(file.id)}
                    onChange={(e) => handleFileSelect(file.id, e.target.checked)}
                    className="rounded"
                  />
                  
                  <div className="flex items-center gap-3 flex-1">
                    {file.mimetype.startsWith('image/') ? (
                      <img
                        src={file.url}
                        alt={file.originalName}
                        className="h-12 w-12 object-cover rounded"
                      />
                    ) : (
                      <div className="h-12 w-12 bg-gray-100 rounded flex items-center justify-center">
                        {getFileIcon(file.mimetype)}
                      </div>
                    )}
                    
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{file.originalName}</p>
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <span>{formatFileSize(file.size)}</span>
                        <Badge variant="secondary">{file.mimetype}</Badge>
                        <span>by {file.uploadedBy.name}</span>
                        <span>{new Date(file.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => window.open(file.url, '_blank')}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyFileUrl(file.url)}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleFileSelect(file.id, !selectedFiles.includes(file.id))}
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* 分页 */}
      {files.length === pageSize && (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(currentPage - 1)}
          >
            上一页
          </Button>
          <span className="text-sm text-gray-500">
            第 {currentPage} 页
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={files.length < pageSize}
            onClick={() => setCurrentPage(currentPage + 1)}
          >
            下一页
          </Button>
        </div>
      )}
    </div>
  )
}