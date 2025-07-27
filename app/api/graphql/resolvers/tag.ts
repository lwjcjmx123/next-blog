import { Context, requireAdmin } from '../context'

interface TagInput {
  name: string
  slug: string
}

interface TagUpdateInput {
  name?: string
  slug?: string
}

export const tagResolvers = {
  Query: {
    tags: async (_: any, __: any, { prisma }: Context) => {
      return await prisma.tag.findMany({
        orderBy: { name: 'asc' },
      })
    },
    
    tag: async (_: any, { id, slug }: { id?: string; slug?: string }, { prisma }: Context) => {
      const where = id ? { id } : { slug }
      return await prisma.tag.findUnique({ where })
    },
  },
  
  Mutation: {
    createTag: async (_: any, { input }: { input: TagInput }, context: Context) => {
      requireAdmin(context)
      const { prisma } = context
      
      return await prisma.tag.create({
        data: input,
      })
    },
    
    updateTag: async (_: any, { id, input }: { id: string; input: TagUpdateInput }, context: Context) => {
      requireAdmin(context)
      const { prisma } = context
      
      return await prisma.tag.update({
        where: { id },
        data: input,
      })
    },
    
    deleteTag: async (_: any, { id }: { id: string }, context: Context) => {
      requireAdmin(context)
      const { prisma } = context
      
      await prisma.tag.delete({
        where: { id },
      })
      
      return true
    },
  },
}