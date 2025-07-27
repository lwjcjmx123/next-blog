import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import jwt from 'jsonwebtoken'

const prisma = new PrismaClient()

interface PostUpdateInput {
  title?: string
  slug?: string
  excerpt?: string
  content?: string
  published?: boolean
  categoryId?: string
  tagIds?: string[]
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

// GET /api/posts/[id] - 获取单个文章
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

    const post = await prisma.post.findUnique({
      where,
      include: {
        author: true,
        category: true,
        tags: true,
      },
    })

    if (!post) {
      return NextResponse.json(
        { error: '文章不存在' },
        { status: 404 }
      )
    }

    return NextResponse.json(post)
  } catch (error) {
    console.error('获取文章失败:', error)
    return NextResponse.json(
      { error: '获取文章失败' },
      { status: 500 }
    )
  }
}

// PUT /api/posts/[id] - 更新文章
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = verifyToken(request)
    requireAdmin(user)

    const { id } = params
    const input: PostUpdateInput = await request.json()

    const data: any = {}

    if (input.title !== undefined) data.title = input.title
    if (input.slug !== undefined) data.slug = input.slug
    if (input.excerpt !== undefined) data.excerpt = input.excerpt
    if (input.content !== undefined) data.content = input.content
    if (input.categoryId !== undefined) data.categoryId = input.categoryId

    if (input.published !== undefined) {
      data.published = input.published
      if (input.published) {
        const currentPost = await prisma.post.findUnique({ where: { id } })
        if (!currentPost?.publishedAt) {
          data.publishedAt = new Date()
        }
      }
    }

    // 更新标签关联
    if (input.tagIds !== undefined) {
      // 先断开所有标签连接
      await prisma.post.update({
        where: { id },
        data: {
          tags: {
            set: [],
          },
        },
      })

      // 重新连接标签
      if (input.tagIds.length > 0) {
        await prisma.post.update({
          where: { id },
          data: {
            tags: {
              connect: input.tagIds.map(tagId => ({ id: tagId })),
            },
          },
        })
      }
    }

    const post = await prisma.post.update({
      where: { id },
      data,
      include: {
        author: true,
        category: true,
        tags: true,
      },
    })

    return NextResponse.json(post)
  } catch (error) {
    console.error('更新文章失败:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : '更新文章失败' },
      { status: error instanceof Error && error.message === '未授权访问' ? 401 : 500 }
    )
  }
}

// DELETE /api/posts/[id] - 删除文章
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = verifyToken(request)
    requireAdmin(user)

    const { id } = params

    await prisma.post.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('删除文章失败:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : '删除文章失败' },
      { status: error instanceof Error && error.message === '未授权访问' ? 401 : 500 }
    )
  }
}