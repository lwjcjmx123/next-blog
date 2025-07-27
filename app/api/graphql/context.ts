import { PrismaClient } from '@prisma/client'
import { NextRequest } from 'next/server'

export interface Context {
  prisma: PrismaClient
  user?: {
    id: string
    email: string
    role: string
  }
  req: NextRequest
}

// 权限检查辅助函数
export function requireAuth(context: Context) {
  if (!context.user) {
    throw new Error('需要登录')
  }
  return context.user
}

export function requireAdmin(context: Context) {
  const user = requireAuth(context)
  if (user.role !== 'ADMIN') {
    throw new Error('需要管理员权限')
  }
  return user
}