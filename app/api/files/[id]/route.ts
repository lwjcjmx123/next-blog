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

// GET /api/files/[id] - 获取单个文件信息
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = verifyToken(request)
    requireAdmin(user)

    const { id } = params

    const file = await prisma.fileRecord.findUnique({
      where: { id },
      include: {
        uploadedBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    })

    if (!file) {
      return NextResponse.json(
        { error: '文件不存在' },
        { status: 404 }
      )
    }

    return NextResponse.json(file)
  } catch (error) {
    console.error('获取文件信息失败:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : '获取文件信息失败' },
      { status: error instanceof Error && error.message === '未授权访问' ? 401 : 500 }
    )
  }
}

// DELETE /api/files/[id] - 删除单个文件
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = verifyToken(request)
    requireAdmin(user)

    const { id } = params

    // 获取文件信息
    const file = await prisma.fileRecord.findUnique({
      where: { id },
    })

    if (!file) {
      return NextResponse.json(
        { error: '文件不存在' },
        { status: 404 }
      )
    }

    // 从 Vercel Blob 删除文件
    try {
      await del(file.url)
    } catch (error) {
      console.error(`删除文件 ${file.filename} 失败:`, error)
      // 即使 Blob 删除失败，也继续删除数据库记录
    }

    // 从数据库删除记录
    await prisma.fileRecord.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('删除文件失败:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : '删除文件失败' },
      { status: error instanceof Error && error.message === '未授权访问' ? 401 : 500 }
    )
  }
}