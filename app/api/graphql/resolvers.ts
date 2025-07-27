import { DateTimeResolver } from "graphql-scalars";
import { GraphQLUpload } from "graphql-upload-ts";
import { authResolvers } from "./resolvers/auth";
import { postResolvers } from "./resolvers/post";
import { categoryResolvers } from "./resolvers/category";
import { tagResolvers } from "./resolvers/tag";
import { projectResolvers } from "./resolvers/project";
import { resumeResolvers } from "./resolvers/resume";
import { uploadResolvers } from "./resolvers/upload";
import { Context } from "./context";

export const resolvers = {
  DateTime: DateTimeResolver,

  Query: {
    // 用户相关
    me: async (_: any, __: any, { user }: Context) => {
      if (!user) return null;
      return user;
    },

    // 博客相关
    ...postResolvers.Query,

    // 分类和标签
    ...categoryResolvers.Query,
    ...tagResolvers.Query,

    // 项目相关
    ...projectResolvers.Query,

    // 简历
    ...resumeResolvers.Query,

    // 文件上传
    ...uploadResolvers.Query,
  },

  Mutation: {
    // 认证
    ...authResolvers.Mutation,

    // 博客管理
    ...postResolvers.Mutation,

    // 分类管理
    ...categoryResolvers.Mutation,

    // 标签管理
    ...tagResolvers.Mutation,

    // 项目管理
    ...projectResolvers.Mutation,

    // 简历管理
    ...resumeResolvers.Mutation,

    // 文件上传
    ...uploadResolvers.Mutation,
  },

  // 类型解析器
  Post: {
    author: async (parent: any, _: any, { prisma }: Context) => {
      return await prisma.user.findUnique({
        where: { id: parent.authorId },
      });
    },
    category: async (parent: any, _: any, { prisma }: Context) => {
      if (!parent.categoryId) return null;
      return await prisma.category.findUnique({
        where: { id: parent.categoryId },
      });
    },
    tags: async (parent: any, _: any, { prisma }: Context) => {
      return await prisma.tag.findMany({
        where: {
          posts: {
            some: { id: parent.id },
          },
        },
      });
    },
  },

  User: {
    posts: async (parent: any, _: any, { prisma }: Context) => {
      return await prisma.post.findMany({
        where: { authorId: parent.id },
        orderBy: { createdAt: "desc" },
      });
    },
  },

  Category: {
    posts: async (parent: any, _: any, { prisma }: Context) => {
      return await prisma.post.findMany({
        where: { categoryId: parent.id },
        orderBy: { createdAt: "desc" },
      });
    },
    _count: async (parent: any, _: any, { prisma }: Context) => {
      const postsCount = await prisma.post.count({
        where: { categoryId: parent.id },
      });
      return { posts: postsCount };
    },
  },

  Tag: {
    posts: async (parent: any, _: any, { prisma }: Context) => {
      return await prisma.post.findMany({
        where: {
          tags: {
            some: { id: parent.id },
          },
        },
        orderBy: { createdAt: "desc" },
      });
    },
    _count: async (parent: any, _: any, { prisma }: Context) => {
      const postsCount = await prisma.post.count({
        where: {
          tags: {
            some: { id: parent.id },
          },
        },
      });
      return { posts: postsCount };
    },
  },

  Project: {
    technologies: (parent: any) => {
      try {
        return JSON.parse(parent.technologies);
      } catch {
        return [];
      }
    },
  },

  Upload: {
    uploadedBy: async (parent: any, _: any, { prisma }: Context) => {
      return await prisma.user.findUnique({
        where: { id: parent.uploadedById },
      });
    },
  },
};
