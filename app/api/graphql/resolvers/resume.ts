import { Context, requireAdmin } from '../context'

interface ResumeInput {
  personalInfo: string
  summary: string
  experience: string
  education: string
  skills: string
  projects: string
  certifications?: string
  languages?: string
}

export const resumeResolvers = {
  Query: {
    resume: async (_: any, __: any, { prisma }: Context) => {
      return await prisma.resume.findFirst({
        orderBy: { createdAt: 'desc' },
      })
    },
    
    resumes: async (_: any, { skip = 0, take = 10 }: { skip?: number; take?: number }, { prisma }: Context) => {
      return await prisma.resume.findMany({
        skip,
        take,
        orderBy: { createdAt: 'desc' },
      })
    },
  },
  
  Mutation: {
    createResume: async (_: any, { input }: { input: ResumeInput }, context: Context) => {
      requireAdmin(context)
      const { prisma } = context
      
      const data = JSON.stringify(input)
      
      return await prisma.resume.create({
        data: { data },
      })
    },
    
    updateResume: async (_: any, { data }: { data: string }, context: Context) => {
      requireAdmin(context)
      const { prisma } = context
      
      // 获取最新的简历记录
      const latestResume = await prisma.resume.findFirst({
        orderBy: { createdAt: 'desc' },
      })
      
      if (latestResume) {
        return await prisma.resume.update({
          where: { id: latestResume.id },
          data: { data },
        })
      } else {
        return await prisma.resume.create({
          data: { data },
        })
      }
    },
    
    deleteResume: async (_: any, { id }: { id: string }, context: Context) => {
      requireAdmin(context)
      const { prisma } = context
      
      await prisma.resume.delete({
        where: { id },
      })
      
      return true
    },
  },
}