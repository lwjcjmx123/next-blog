import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import jwt from 'jsonwebtoken'

const prisma = new PrismaClient()

interface CategoryUpdateInput {
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

// GET /api/categories/[id] - 获取单个分类
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

    const category = await prisma.category.findUnique({
      where,
      include: {
        posts: {
          where: { published: true },
          orderBy: { publishedAt: 'desc' },
          include: {
            author: true,
            tags: true,
          },
        },
        _count: {
          select: {
            posts: true,
          },
        },
      },
    })

    if (!category) {
      return NextResponse.json(
        { error: '分类不存在' },
        { status: 404 }
      )
    }

    return NextResponse.json(category)
  } catch (error) {
    console.error('获取分类失败:', error)
    return NextResponse.json(
      { error: '获取分类失败' },
      { status: 500 }
    )
  }
}

// PUT /api/categories/[id] - 更新分类
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = verifyToken(request)
    requireAdmin(user)

    const { id } = params
    const input: CategoryUpdateInput = await request.json()

    const data: any = {}
    if (input.name !== undefined) data.name = input.name
    if (input.slug !== undefined) data.slug = input.slug
    if (input.description !== undefined) data.description = input.description

    const category = await prisma.category.update({
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

    return NextResponse.json(category)
  } catch (error) {
    console.error('更新分类失败:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : '更新分类失败' },
      { status: error instanceof Error && error.message === '未授权访问' ? 401 : 500 }
    )
  }
}

// DELETE /api/categories/[id] - 删除分类
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = verifyToken(request)
    requireAdmin(user)

    const { id } = params

    // 检查是否有文章使用此分类
    const postsCount = await prisma.post.count({
      where: { categoryId: id },
    })

    if (postsCount > 0) {
      return NextResponse.json(
        { error: '无法删除，该分类下还有文章' },
        { status: 400 }
      )
    }

    await prisma.category.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('删除分类失败:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : '删除分类失败' },
      { status: error instanceof Error && error.message === '未授权访问' ? 401 : 500 }
    )
  }
}