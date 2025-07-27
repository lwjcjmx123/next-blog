import { NextRequest, NextResponse } from "next/server";
import { ApolloServer } from "@apollo/server";
import { startServerAndCreateNextHandler } from "@as-integrations/next";
import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";
import { typeDefs } from "./schema";
import { resolvers } from "./resolvers";
import { Context } from "./context";

const prisma = new PrismaClient();

// 创建 Apollo Server
const server = new ApolloServer({
  typeDefs,
  resolvers,
  introspection: process.env.NODE_ENV !== "production",
  includeStacktraceInErrorResponses: process.env.NODE_ENV !== "production",
});

// 创建上下文函数
async function createContext(req: NextRequest): Promise<Context> {
  let user;

  try {
    const token = req.headers.get("authorization")?.replace("Bearer ", "");

    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;

      // 验证用户是否存在
      const dbUser = await prisma.user.findUnique({
        where: { id: decoded.userId },
        select: { id: true, email: true, role: true },
      });

      if (dbUser) {
        user = dbUser;
      }
    }
  } catch (error) {
    // Token无效或过期，继续执行但不设置用户
    console.log("Token验证失败:", error);
  }

  return {
    prisma,
    user,
    req,
  };
}

// 创建 Next.js 处理器
const handler = startServerAndCreateNextHandler<NextRequest, Context>(server, {
  context: async (req) => createContext(req),
});

// 导出 HTTP 方法处理器
export async function GET(request: NextRequest) {
  return handler(request);
}

export async function POST(request: NextRequest) {
  return handler(request);
}

export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, PUT,DELETE,OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  });
}
