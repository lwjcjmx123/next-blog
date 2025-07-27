'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { useRouter } from 'next/navigation'

interface User {
  id: string
  email: string
  name: string
  role: 'USER' | 'ADMIN'
}

interface AuthContextType {
  user: User | null
  token: string | null
  loading: boolean
  login: (token: string, refreshToken: string, user: User) => void
  logout: () => void
  refreshAuth: () => Promise<boolean>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

const TOKEN_KEY = 'auth_token'
const REFRESH_TOKEN_KEY = 'refresh_token'
const USER_KEY = 'auth_user'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  // 从本地存储恢复认证状态
  useEffect(() => {
    const savedToken = localStorage.getItem(TOKEN_KEY)
    const savedUser = localStorage.getItem(USER_KEY)
    
    if (savedToken && savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser)
        setToken(savedToken)
        setUser(parsedUser)
      } catch (error) {
        console.error('Failed to parse saved user data:', error)
        logout()
      }
    }
    
    setLoading(false)
  }, [])

  // 登录
  const login = (newToken: string, refreshToken: string, newUser: User) => {
    setToken(newToken)
    setUser(newUser)
    
    // 保存到本地存储
    localStorage.setItem(TOKEN_KEY, newToken)
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken)
    localStorage.setItem(USER_KEY, JSON.stringify(newUser))
  }

  // 登出
  const logout = () => {
    setToken(null)
    setUser(null)
    
    // 清除本地存储
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(REFRESH_TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
    
    // 如果当前在管理页面，跳转到登录页
    if (window.location.pathname.startsWith('/admin') && window.location.pathname !== '/admin/login') {
      router.push('/admin/login')
    }
  }

  // 刷新认证（使用 refresh token）
  const refreshAuth = async (): Promise<boolean> => {
    const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY)
    
    if (!refreshToken) {
      logout()
      return false
    }

    try {
      const response = await fetch('/api/auth/refresh', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refreshToken }),
      })

      if (response.ok) {
        const data = await response.json()
        login(data.token, data.refreshToken, data.user)
        return true
      } else {
        logout()
        return false
      }
    } catch (error) {
      console.error('Failed to refresh auth:', error)
      logout()
      return false
    }
  }

  // 检查 token 是否即将过期并自动刷新
  useEffect(() => {
    if (!token) return

    // 解析 JWT token 获取过期时间
    try {
      const payload = JSON.parse(atob(token.split('.')[1]))
      const expirationTime = payload.exp * 1000 // 转换为毫秒
      const currentTime = Date.now()
      const timeUntilExpiry = expirationTime - currentTime

      // 如果 token 在 5 分钟内过期，尝试刷新
      if (timeUntilExpiry < 5 * 60 * 1000 && timeUntilExpiry > 0) {
        refreshAuth()
      }

      // 设置定时器在 token 过期前 1 分钟刷新
      const refreshTimer = setTimeout(() => {
        refreshAuth()
      }, Math.max(timeUntilExpiry - 60 * 1000, 0))

      return () => clearTimeout(refreshTimer)
    } catch (error) {
      console.error('Failed to parse token:', error)
      logout()
    }
  }, [token])

  const value: AuthContextType = {
    user,
    token,
    loading,
    login,
    logout,
    refreshAuth,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

// 高阶组件：保护需要认证的页面
export function withAuth<P extends object>(Component: React.ComponentType<P>) {
  return function AuthenticatedComponent(props: P) {
    const { user, loading } = useAuth()
    const router = useRouter()

    useEffect(() => {
      if (!loading && !user) {
        router.push('/admin/login')
      }
    }, [user, loading, router])

    if (loading) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
        </div>
      )
    }

    if (!user) {
      return null
    }

    return <Component {...props} />
  }
}

// 高阶组件：保护需要管理员权限的页面
export function withAdminAuth<P extends object>(Component: React.ComponentType<P>) {
  return function AdminAuthenticatedComponent(props: P) {
    const { user, loading } = useAuth()
    const router = useRouter()

    useEffect(() => {
      if (!loading) {
        if (!user) {
          router.push('/admin/login')
        } else if (user.role !== 'ADMIN') {
          router.push('/')
        }
      }
    }, [user, loading, router])

    if (loading) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
        </div>
      )
    }

    if (!user || user.role !== 'ADMIN') {
      return null
    }

    return <Component {...props} />
  }
}