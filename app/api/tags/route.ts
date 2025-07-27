import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import jwt from 'jsonwebtoken'

const prisma = new PrismaClient()

interface TagInput {
  name: string
  slug: string
  description?: string
}

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

// GET /api/tags - 获取标签列表
export async function GET() {
  try {
    const tags = await prisma.tag.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: {
            posts: true,
          },
        },
      },
    })

    return NextResponse.json(tags)
  } catch (error) {
    console.error('获取标签列表失败:', error)
    return NextResponse.json(
      { error: '获取标签列表失败' },
      { status: 500 }
    )
  }
}

// POST /api/tags - 创建标签
export async function POST(request: NextRequest) {
  try {
    const user = verifyToken(request)
    requireAdmin(user)

    const input: TagInput = await request.json()

    const tag = await prisma.tag.create({
      data: {
        name: input.name,
        slug: input.slug,
        description: input.description,
      },
      include: {
        _count: {
          select: {
            posts: true,
          },
        },
      },
    })

    return NextResponse.json(tag)
  } catch (error) {
    console.error('创建标签失败:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : '创建标签失败' },
      { status: error instanceof Error && error.message === '未授权访问' ? 401 : 500 }
    )
  }
}