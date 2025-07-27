import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { Context } from '../context'

interface LoginArgs {
  email: string
  password: string
}

interface RefreshTokenArgs {
  refreshToken: string
}

function generateTokens(userId: string) {
  const token = jwt.sign(
    { userId },
    process.env.JWT_SECRET!,
    { expiresIn: '7d' }
  )
  
  const refreshToken = jwt.sign(
    { userId },
    process.env.JWT_REFRESH_SECRET!,
    { expiresIn: '30d' }
  )
  
  return { token, refreshToken }
}

export const authResolvers = {
  Mutation: {
    login: async (_: any, { email, password }: LoginArgs, { prisma }: Context) => {
      // 查找用户
      const user = await prisma.user.findUnique({
        where: { email },
      })
      
      if (!user) {
        throw new Error('用户不存在')
      }
      
      // 验证密码
      const isValid = await bcrypt.compare(password, user.password)
      if (!isValid) {
        throw new Error('密码错误')
      }
      
      // 生成令牌
      const { token, refreshToken } = generateTokens(user.id)
      
      return {
        token,
        refreshToken,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        },
      }
    },
    
    refreshToken: async (_: any, { refreshToken }: RefreshTokenArgs, { prisma }: Context) => {
      try {
        // 验证刷新令牌
        const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET!) as any
        
        // 查找用户
        const user = await prisma.user.findUnique({
          where: { id: decoded.userId },
        })
        
        if (!user) {
          throw new Error('用户不存在')
        }
        
        // 生成新令牌
        const tokens = generateTokens(user.id)
        
        return {
          ...tokens,
          user: {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
          },
        }
      } catch (error) {
        throw new Error('刷新令牌无效或已过期')
      }
    },
  },
}