import { Context, requireAdmin } from '../context'

interface ProjectsArgs {
  filter?: {
    published?: boolean
    featured?: boolean
    search?: string
    technologies?: string[]
  }
  skip?: number
  take?: number
  orderBy?: {
    createdAt?: 'asc' | 'desc'
    title?: 'asc' | 'desc'
    featured?: 'asc' | 'desc'
  }
}

interface ProjectInput {
  title: string
  slug: string
  description: string
  content?: string
  technologies: string[]
  githubUrl?: string
  liveUrl?: string
  imageUrl?: string
  featured?: boolean
  published?: boolean
}

interface ProjectUpdateInput {
  title?: string
  slug?: string
  description?: string
  content?: string
  technologies?: string[]
  githubUrl?: string
  liveUrl?: string
  imageUrl?: string
  featured?: boolean
  published?: boolean
}

export const projectResolvers = {
  Query: {
    projects: async (_: any, { filter, skip = 0, take = 10, orderBy }: ProjectsArgs, { prisma }: Context) => {
      const where: any = {}
      
      if (filter?.published !== undefined) {
        where.published = filter.published
      }
      
      if (filter?.featured !== undefined) {
        where.featured = filter.featured
      }
      
      if (filter?.search) {
        where.OR = [
          {
            title: {
              contains: filter.search,
            },
          },
          {
            description: {
              contains: filter.search,
            },
          },
        ]
      }
      
      // 默认排序
      let order: any = { createdAt: 'desc' }
      if (orderBy) {
        if (orderBy.createdAt) order = { createdAt: orderBy.createdAt }
        else if (orderBy.title) order = { title: orderBy.title }
        else if (orderBy.featured) order = { featured: orderBy.featured }
      }

      return await prisma.project.findMany({
        where,
        skip,
        take,
        orderBy: order,
      })
    },
    
    project: async (_: any, { id, slug }: { id?: string; slug?: string }, { prisma }: Context) => {
      const where = id ? { id } : { slug }
      return await prisma.project.findUnique({ where })
    },
    
    projectsCount: async (_: any, { filter }: { filter?: ProjectsArgs['filter'] }, { prisma }: Context) => {
      const where: any = {}
      
      if (filter?.published !== undefined) {
        where.published = filter.published
      }
      
      if (filter?.featured !== undefined) {
        where.featured = filter.featured
      }
      
      if (filter?.search) {
        where.OR = [
          {
            title: {
              contains: filter.search,
            },
          },
          {
            description: {
              contains: filter.search,
            },
          },
        ]
      }
      
      return await prisma.project.count({ where })
    },
  },
  
  Mutation: {
    createProject: async (_: any, { input }: { input: ProjectInput }, context: Context) => {
      requireAdmin(context)
      const { prisma } = context
      
      return await prisma.project.create({
        data: {
          ...input,
          technologies: JSON.stringify(input.technologies),
        },
      })
    },
    
    updateProject: async (_: any, { id, input }: { id: string; input: ProjectUpdateInput }, context: Context) => {
      requireAdmin(context)
      const { prisma } = context
      
      const data: any = { ...input }
      if (input.technologies) {
        data.technologies = JSON.stringify(input.technologies)
      }
      
      return await prisma.project.update({
        where: { id },
        data,
      })
    },
    
    deleteProject: async (_: any, { id }: { id: string }, context: Context) => {
      requireAdmin(context)
      const { prisma } = context
      
      await prisma.project.delete({
        where: { id },
      })
      
      return true
    },
  },
}