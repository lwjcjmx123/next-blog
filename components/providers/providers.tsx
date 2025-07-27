'use client'

import { ThemeProvider } from 'next-themes'
import { ApolloProviderWrapper } from './apollo-provider'
import { AuthProvider } from '@/lib/auth'
import { Toaster } from '@/components/ui/toaster'

interface ProvidersProps {
  children: React.ReactNode
}

export function Providers({ children }: ProvidersProps) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <ApolloProviderWrapper>
        <AuthProvider>
          {children}
          <Toaster />
        </AuthProvider>
      </ApolloProviderWrapper>
    </ThemeProvider>
  )
}