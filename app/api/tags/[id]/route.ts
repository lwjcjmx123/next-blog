import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import jwt from 'jsonwebtoken'

const prisma = new PrismaClient()

interface TagUpdateInput {
  name?: string
  slug?: string
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

// GET /api/tags/[id] - 获取单个标签
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const { searchParams } = new URL(request.url)
    const slug = searchParams.get('slug')

    // 支持通过 ID 或 slug 查询
    const where = slug ? { slug } : { id }

    const tag = await prisma.tag.findUnique({
      where,
      include: {
        posts: {
          where: { published: true },
          orderBy: { publishedAt: 'desc' },
          include: {
            author: true,
            category: true,
          },
        },
        _count: {
          select: {
            posts: true,
          },
        },
      },
    })

    if (!tag) {
      return NextResponse.json(
        { error: '标签不存在' },
        { status: 404 }
      )
    }

    return NextResponse.json(tag)
  } catch (error) {
    console.error('获取标签失败:', error)
    return NextResponse.json(
      { error: '获取标签失败' },
      { status: 500 }
    )
  }
}

// PUT /api/tags/[id] - 更新标签
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = verifyToken(request)
    requireAdmin(user)

    const { id } = params
    const input: TagUpdateInput = await request.json()

    const data: any = {}
    if (input.name !== undefined) data.name = input.name
    if (input.slug !== undefined) data.slug = input.slug
    if (input.description !== undefined) data.description = input.description

    const tag = await prisma.tag.update({
      where: { id },
      data,
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
    console.error('更新标签失败:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : '更新标签失败' },
      { status: error instanceof Error && error.message === '未授权访问' ? 401 : 500 }
    )
  }
}

// DELETE /api/tags/[id] - 删除标签
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = verifyToken(request)
    requireAdmin(user)

    const { id } = params

    // 检查是否有文章使用此标签
    const postsCount = await prisma.post.count({
      where: {
        tags: {
          some: {
            id: id,
          },
        },
      },
    })

    if (postsCount > 0) {
      return NextResponse.json(
        { error: '无法删除，该标签下还有文章' },
        { status: 400 }
      )
    }

    await prisma.tag.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('删除标签失败:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : '删除标签失败' },
      { status: error instanceof Error && error.message === '未授权访问' ? 401 : 500 }
    )
  }
}