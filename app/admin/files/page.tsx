'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { gql, useQuery } from '@apollo/client'
import { FileManager } from '@/components/admin/file-manager'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'

const ME_QUERY = gql`
  query Me {
    me {
      id
      email
      role
    }
  }
`

interface User {
  id: string
  email: string
  role: string
}

export default function AdminFilesPage() {
  const router = useRouter()
  const { data, loading, error } = useQuery(ME_QUERY, {
    errorPolicy: 'all',
    onError: () => {
      // 如果查询失败，重定向到登录页面
      router.push('/admin/login')
    },
  })

  useEffect(() => {
    if (!loading && (!data?.me || data.me.role !== 'ADMIN')) {
      router.push('/admin/login')
    }
  }, [data, loading, router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  if (!data?.me || data.me.role !== 'ADMIN') {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 页面头部 */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push('/admin')}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              返回管理后台
            </Button>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">文件管理</h1>
          <p className="text-gray-600 mt-2">
            管理您的文件和媒体资源，支持图片、文档等多种格式的上传和管理。
          </p>
        </div>

        {/* 文件管理器 */}
        <FileManager />
      </div>
    </div>
  )
}