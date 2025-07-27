import { Context, requireAdmin } from '../context'

interface CategoryInput {
  name: string
  slug: string
  description?: string
}

interface CategoryUpdateInput {
  name?: string
  slug?: string
  description?: string
}

export const categoryResolvers = {
  Query: {
    categories: async (_: any, __: any, { prisma }: Context) => {
      return await prisma.category.findMany({
        orderBy: { name: 'asc' },
      })
    },
    
    category: async (_: any, { id, slug }: { id?: string; slug?: string }, { prisma }: Context) => {
      const where = id ? { id } : { slug }
      return await prisma.category.findUnique({ where })
    },
  },
  
  Mutation: {
    createCategory: async (_: any, { input }: { input: CategoryInput }, context: Context) => {
      requireAdmin(context)
      const { prisma } = context
      
      return await prisma.category.create({
        data: input,
      })
    },
    
    updateCategory: async (_: any, { id, input }: { id: string; input: CategoryUpdateInput }, context: Context) => {
      requireAdmin(context)
      const { prisma } = context
      
      return await prisma.category.update({
        where: { id },
        data: input,
      })
    },
    
    deleteCategory: async (_: any, { id }: { id: string }, context: Context) => {
      requireAdmin(context)
      const { prisma } = context
      
      await prisma.category.delete({
        where: { id },
      })
      
      return true
    },
  },
}