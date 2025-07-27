import { Context, requireAdmin } from "../context";

interface UploadsArgs {
  skip?: number;
  take?: number;
  folder?: string;
  orderBy?: {
    createdAt?: "asc" | "desc";
    filename?: "asc" | "desc";
    size?: "asc" | "desc";
  };
}

export const uploadResolvers = {
  Query: {
    uploads: async (
      _: any,
      { skip = 0, take = 20, folder, orderBy }: UploadsArgs,
      context: Context
    ) => {
      const { prisma } = context;

      if (!prisma) {
        throw new Error("Prisma client not found in context");
      }

      const where: any = {};

      if (folder) {
        where.folder = folder;
      }

      // 默认排序
      let order: any = { createdAt: "desc" };
      if (orderBy) {
        if (orderBy.createdAt) order = { createdAt: orderBy.createdAt };
        else if (orderBy.filename) order = { filename: orderBy.filename };
        else if (orderBy.size) order = { size: orderBy.size };
      }

      return await prisma.upload.findMany({
        where,
        skip,
        take,
        orderBy: order,
        include: {
          uploadedBy: {
            select: {
              id: true,
              email: true,
              name: true,
            },
          },
        },
      });
    },

    upload: async (_: any, { id }: { id: string }, { prisma }: Context) => {
      return await prisma.upload.findUnique({
        where: { id },
        include: {
          uploadedBy: {
            select: {
              id: true,
              email: true,
              name: true,
            },
          },
        },
      });
    },
  },

  Mutation: {
    uploadFile: async (
      _: any,
      { file, folder = "general" }: { file: any; folder?: string },
      context: Context
    ) => {
      const user = requireAdmin(context);
      const { prisma } = context;

      // 这里需要处理文件上传逻辑
      // 由于 GraphQL 文件上传在 Next.js 中比较复杂，这里先返回一个占位符
      throw new Error("文件上传功能需要通过 REST API 实现");
    },

    deleteUpload: async (_: any, { id }: { id: string }, context: Context) => {
      requireAdmin(context);
      const { prisma } = context;

      // 获取文件信息
      const file = await prisma.upload.findUnique({
        where: { id },
      });

      if (!file) {
        throw new Error("文件不存在");
      }

      // 删除数据库记录
      await prisma.upload.delete({
        where: { id },
      });

      // TODO: 删除实际文件
      // 这里需要根据文件路径删除实际的文件

      return true;
    },
  },
};
