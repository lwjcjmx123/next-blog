"use client"

import { ApolloProvider } from '@apollo/client'
import client from '@/lib/apollo-client'

interface ApolloWrapperProps {
  children: React.ReactNode
}

export function ApolloWrapper({ children }: ApolloWrapperProps) {
  return (
    <ApolloProvider client={client}>
      {children}
    </ApolloProvider>
  )
}