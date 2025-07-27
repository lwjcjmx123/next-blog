import { Context, requireAuth, requireAdmin } from '../context'

interface PostsArgs {
  filter?: {
    published?: boolean
    categoryId?: string
    tagIds?: string[]
    search?: string
  }
  skip?: number
  take?: number
  orderBy?: {
    createdAt?: 'asc' | 'desc'
    publishedAt?: 'asc' | 'desc'
    title?: 'asc' | 'desc'
  }
}

interface PostArgs {
  id?: string
  slug?: string
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

interface PostUpdateInput {
  title?: string
  slug?: string
  excerpt?: string
  content?: string
  published?: boolean
  categoryId?: string
  tagIds?: string[]
}

export const postResolvers = {
  Query: {
    posts: async (_: any, { filter, skip = 0, take = 10, orderBy }: PostsArgs, { prisma }: Context) => {
      const where: any = {}
      
      if (filter?.published !== undefined) {
        where.published = filter.published
      }
      
      if (filter?.categoryId) {
        where.categoryId = filter.categoryId
      }
      
      if (filter?.tagIds && filter.tagIds.length > 0) {
        where.tags = {
          some: {
            id: {
              in: filter.tagIds,
            },
          },
        }
      }
      
      if (filter?.search) {
        where.OR = [
          {
            title: {
              contains: filter.search,
            },
          },
          {
            excerpt: {
              contains: filter.search,
            },
          },
          {
            content: {
              contains: filter.search,
            },
          },
        ]
      }
      
      // 默认排序
      let order: any = { publishedAt: 'desc' }
      if (orderBy) {
        if (orderBy.createdAt) order = { createdAt: orderBy.createdAt }
        else if (orderBy.publishedAt) order = { publishedAt: orderBy.publishedAt }
        else if (orderBy.title) order = { title: orderBy.title }
      }

      return await prisma.post.findMany({
        where,
        skip,
        take,
        orderBy: order,
        include: {
          author: true,
          category: true,
          tags: true,
        },
      })
    },
    
    post: async (_: any, { id, slug }: PostArgs, { prisma }: Context) => {
      const where = id ? { id } : { slug }
      
      return await prisma.post.findUnique({
        where,
        include: {
          author: true,
          category: true,
          tags: true,
        },
      })
    },
    
    postsCount: async (_: any, { filter }: { filter?: PostsArgs['filter'] }, { prisma }: Context) => {
      const where: any = {}
      
      if (filter?.published !== undefined) {
        where.published = filter.published
      }
      
      if (filter?.categoryId) {
        where.categoryId = filter.categoryId
      }
      
      if (filter?.tagIds && filter.tagIds.length > 0) {
        where.tags = {
          some: {
            id: {
              in: filter.tagIds,
            },
          },
        }
      }
      
      if (filter?.search) {
        where.OR = [
          {
            title: {
              contains: filter.search,
            },
          },
          {
            excerpt: {
              contains: filter.search,
            },
          },
          {
            content: {
              contains: filter.search,
            },
          },
        ]
      }
      
      return await prisma.post.count({ where })
    },
  },
  
  Mutation: {
    createPost: async (_: any, { input }: { input: PostInput }, context: Context) => {
      const authUser = requireAdmin(context)
      const { prisma } = context
      
      const data: any = {
        title: input.title,
        slug: input.slug,
        excerpt: input.excerpt,
        content: input.content,
        published: input.published || false,
        authorId: authUser.id,
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
      
      return post
    },
    
    updatePost: async (_: any, { id, input }: { id: string; input: PostUpdateInput }, context: Context) => {
      requireAdmin(context)
      const { prisma } = context
      
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
      
      return await prisma.post.update({
        where: { id },
        data,
        include: {
          author: true,
          category: true,
          tags: true,
        },
      })
    },
    
    deletePost: async (_: any, { id }: { id: string }, context: Context) => {
      requireAdmin(context)
      const { prisma } = context
      
      await prisma.post.delete({
        where: { id },
      })
      
      return true
    },
  },
}