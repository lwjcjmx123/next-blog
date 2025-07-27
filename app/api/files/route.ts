import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import jwt from 'jsonwebtoken'
import { del } from '@vercel/blob'

const prisma = new PrismaClient()

// 验证用户身份
function verifyToken(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new Error('未授权访问')
  }

  const token = authHeader.substring(7)
  const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any
  return decoded
}

// 验证管理员权限
function requireAdmin(user: any) {
  if (!user || user.role !== 'ADMIN') {
    throw new Error('需要管理员权限')
  }
  return user
}

// GET /api/files - 获取文件列表
export async function GET(request: NextRequest) {
  try {
    const user = verifyToken(request)
    requireAdmin(user)

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const type = searchParams.get('type') // image, document, etc.
    const search = searchParams.get('search')

    const skip = (page - 1) * limit

    const where: any = {}
    
    if (type) {
      where.mimeType = {
        startsWith: type,
      }
    }

    if (search) {
      where.OR = [
        {
          filename: {
            contains: search,
            mode: 'insensitive',
          },
        },
        {
          originalName: {
            contains: search,
            mode: 'insensitive',
          },
        },
      ]
    }

    const [files, total] = await Promise.all([
      prisma.fileRecord.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        include: {
          uploadedBy: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      }),
      prisma.fileRecord.count({ where }),
    ])

    return NextResponse.json({
      files,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('获取文件列表失败:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : '获取文件列表失败' },
      { status: error instanceof Error && error.message === '未授权访问' ? 401 : 500 }
    )
  }
}

// DELETE /api/files - 批量删除文件
export async function DELETE(request: NextRequest) {
  try {
    const user = verifyToken(request)
    requireAdmin(user)

    const { fileIds }: { fileIds: string[] } = await request.json()

    if (!fileIds || !Array.isArray(fileIds) || fileIds.length === 0) {
      return NextResponse.json(
        { error: '请提供要删除的文件ID列表' },
        { status: 400 }
      )
    }

    // 获取文件信息
    const files = await prisma.fileRecord.findMany({
      where: {
        id: {
          in: fileIds,
        },
      },
    })

    if (files.length === 0) {
      return NextResponse.json(
        { error: '未找到要删除的文件' },
        { status: 404 }
      )
    }

    // 从 Vercel Blob 删除文件
    const deletePromises = files.map(async (file: any) => {
      try {
        await del(file.url)
      } catch (error) {
        console.error(`删除文件 ${file.filename} 失败:`, error)
        // 继续删除其他文件，不因为单个文件删除失败而中断
      }
    })

    await Promise.allSettled(deletePromises)

    // 从数据库删除记录
    await prisma.fileRecord.deleteMany({
      where: {
        id: {
          in: fileIds,
        },
      },
    })

    return NextResponse.json({
      success: true,
      deletedCount: files.length,
    })
  } catch (error) {
    console.error('删除文件失败:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : '删除文件失败' },
      { status: error instanceof Error && error.message === '未授权访问' ? 401 : 500 }
    )
  }
}