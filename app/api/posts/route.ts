import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import jwt from 'jsonwebtoken'

const prisma = new PrismaClient()

interface PostsQuery {
  published?: string
  categoryId?: string
  tagIds?: string
  search?: string
  skip?: string
  take?: string
  orderBy?: string
}

interface PostInput {
  title: string
  slug: string
  excerpt?: string
  content: string
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

// GET /api/posts - 获取文章列表
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query: PostsQuery = Object.fromEntries(searchParams.entries())

    const where: any = {}
    
    if (query.published !== undefined) {
      where.published = query.published === 'true'
    }
    
    if (query.categoryId) {
      where.categoryId = query.categoryId
    }
    
    if (query.tagIds) {
      const tagIds = query.tagIds.split(',')
      where.tags = {
        some: {
          id: {
            in: tagIds,
          },
        },
      }
    }
    
    if (query.search) {
      where.OR = [
        {
          title: {
            contains: query.search,
          },
        },
        {
          excerpt: {
            contains: query.search,
          },
        },
        {
          content: {
            contains: query.search,
          },
        },
      ]
    }

    // 排序
    let orderBy: any = { publishedAt: 'desc' }
    if (query.orderBy) {
      const [field, direction] = query.orderBy.split(':')
      orderBy = { [field]: direction || 'desc' }
    }

    const skip = parseInt(query.skip || '0')
    const take = parseInt(query.take || '10')

    const posts = await prisma.post.findMany({
      where,
      skip,
      take,
      orderBy,
      include: {
        author: true,
        category: true,
        tags: true,
      },
    })

    const total = await prisma.post.count({ where })

    return NextResponse.json({
      posts,
      total,
      skip,
      take,
    })
  } catch (error) {
    console.error('获取文章列表失败:', error)
    return NextResponse.json(
      { error: '获取文章列表失败' },
      { status: 500 }
    )
  }
}

// POST /api/posts - 创建文章
export async function POST(request: NextRequest) {
  try {
    const user = verifyToken(request)
    requireAdmin(user)

    const input: PostInput = await request.json()

    const data: any = {
      title: input.title,
      slug: input.slug,
      excerpt: input.excerpt,
      content: input.content,
      published: input.published || false,
      authorId: user.userId,
    }

    if (input.categoryId) {
      data.categoryId = input.categoryId
    }

    if (data.published) {
      data.publishedAt = new Date()
    }

    const post = await prisma.post.create({
      data,
      include: {
        author: true,
        category: true,
        tags: true,
      },
    })

    // 连接标签
    if (input.tagIds && input.tagIds.length > 0) {
      await prisma.post.update({
        where: { id: post.id },
        data: {
          tags: {
            connect: input.tagIds.map(id => ({ id })),
          },
        },
      })
    }

    return NextResponse.json(post)
  } catch (error) {
    console.error('创建文章失败:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : '创建文章失败' },
      { status: error instanceof Error && error.message === '未授权访问' ? 401 : 500 }
    )
  }
}