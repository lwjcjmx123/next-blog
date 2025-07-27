import { NextRequest, NextResponse } from 'next/server'
import { put } from '@vercel/blob'
import { PrismaClient } from '@prisma/client'
import jwt from 'jsonwebtoken'

const prisma = new PrismaClient()

// 验证JWT token
function verifyToken(token: string) {
  try {
    return jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as any
  } catch {
    return null
  }
}

// 验证文件类型
function validateFileType(file: File): boolean {
  const allowedTypes = [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'image/svg+xml',
    'application/pdf',
    'text/plain',
    'text/markdown',
    'application/json',
    'video/mp4',
    'video/webm',
    'audio/mpeg',
    'audio/wav'
  ]
  
  return allowedTypes.includes(file.type)
}

// 生成文件名
function generateFileName(originalName: string): string {
  const timestamp = Date.now()
  const randomString = Math.random().toString(36).substring(2, 15)
  const extension = originalName.split('.').pop()
  return `${timestamp}-${randomString}.${extension}`
}

export async function POST(request: NextRequest) {
  try {
    // 验证用户身份
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: '未授权访问' }, { status: 401 })
    }

    const token = authHeader.substring(7)
    const user = verifyToken(token)
    if (!user) {
      return NextResponse.json({ error: '无效的访问令牌' }, { status: 401 })
    }

    // 解析表单数据
    const formData = await request.formData()
    const file = formData.get('file') as File
    const folder = formData.get('folder') as string || 'general'

    if (!file) {
      return NextResponse.json({ error: '未选择文件' }, { status: 400 })
    }

    // 验证文件类型
    if (!validateFileType(file)) {
      return NextResponse.json({ error: '不支持的文件类型' }, { status: 400 })
    }

    // 验证文件大小 (10MB限制)
    const maxSize = 10 * 1024 * 1024 // 10MB
    if (file.size > maxSize) {
      return NextResponse.json({ error: '文件大小不能超过10MB' }, { status: 400 })
    }

    // 生成唯一文件名
    const fileName = generateFileName(file.name)
    const filePath = `${folder}/${fileName}`

    // 上传到Vercel Blob
    const blob = await put(filePath, file, {
      access: 'public',
      addRandomSuffix: false
    })

    // 保存文件信息到数据库
    const upload = await prisma.upload.create({
      data: {
        filename: fileName,
        originalName: file.name,
        mimetype: file.type,
        encoding: 'binary',
        size: file.size,
        folder: folder,
        url: blob.url,
        uploadedById: user.id
      },
      include: {
        uploadedBy: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    })

    return NextResponse.json({
      success: true,
      file: upload
    })

  } catch (error) {
    console.error('文件上传失败:', error)
    return NextResponse.json(
      { error: '文件上传失败，请稍后重试' },
      { status: 500 }
    )
  }
}

// 处理文件删除
export async function DELETE(request: NextRequest) {
  try {
    // 验证用户身份
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: '未授权访问' }, { status: 401 })
    }

    const token = authHeader.substring(7)
    const user = verifyToken(token)
    if (!user) {
      return NextResponse.json({ error: '无效的访问令牌' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const fileId = searchParams.get('id')

    if (!fileId) {
      return NextResponse.json({ error: '缺少文件ID' }, { status: 400 })
    }

    // 查找文件记录
    const upload = await prisma.upload.findUnique({
      where: { id: fileId }
    })

    if (!upload) {
      return NextResponse.json({ error: '文件不存在' }, { status: 404 })
    }

    // 检查权限
    if (upload.uploadedById !== user.id && user.role !== 'ADMIN') {
      return NextResponse.json({ error: '没有权限删除此文件' }, { status: 403 })
    }

    // 从数据库删除记录
    await prisma.upload.delete({
      where: { id: fileId }
    })

    // 注意：Vercel Blob的文件删除需要在服务器端处理
    // 这里我们只删除数据库记录，实际的blob文件可以通过Vercel控制台管理

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('文件删除失败:', error)
    return NextResponse.json(
      { error: '文件删除失败，请稍后重试' },
      { status: 500 }
    )
  }
}