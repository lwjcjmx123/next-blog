import { config } from "dotenv";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

// 加载环境变量
config();

const prisma = new PrismaClient();

async function main() {
  console.log("开始数据库种子...");

  // 创建管理员用户
  const hashedPassword = await bcrypt.hash("admin123", 12);
  const admin = await prisma.user.upsert({
    where: { email: "admin@example.com" },
    update: {},
    create: {
      email: "admin@example.com",
      password: hashedPassword,
      name: "管理员",
      role: "ADMIN",
    },
  });

  console.log("创建管理员用户:", admin);

  // 创建分类
  const categories = await Promise.all([
    prisma.category.upsert({
      where: { slug: "frontend" },
      update: {},
      create: {
        name: "前端开发",
        slug: "frontend",
        description: "前端技术相关文章",
      },
    }),
    prisma.category.upsert({
      where: { slug: "backend" },
      update: {},
      create: {
        name: "后端开发",
        slug: "backend",
        description: "后端技术相关文章",
      },
    }),
    prisma.category.upsert({
      where: { slug: "fullstack" },
      update: {},
      create: {
        name: "全栈开发",
        slug: "fullstack",
        description: "全栈开发相关文章",
      },
    }),
  ]);

  console.log("创建分类:", categories);

  // 创建标签
  const tags = await Promise.all([
    prisma.tag.upsert({
      where: { slug: "nextjs" },
      update: {},
      create: { name: "Next.js", slug: "nextjs" },
    }),
    prisma.tag.upsert({
      where: { slug: "react" },
      update: {},
      create: { name: "React", slug: "react" },
    }),
    prisma.tag.upsert({
      where: { slug: "typescript" },
      update: {},
      create: { name: "TypeScript", slug: "typescript" },
    }),
    prisma.tag.upsert({
      where: { slug: "graphql" },
      update: {},
      create: { name: "GraphQL", slug: "graphql" },
    }),
    prisma.tag.upsert({
      where: { slug: "nodejs" },
      update: {},
      create: { name: "Node.js", slug: "nodejs" },
    }),
  ]);

  console.log("创建标签:", tags);

  // 创建示例博客文章
  const posts = await Promise.all([
    prisma.post.upsert({
      where: { slug: "nextjs-14-features" },
      update: {},
      create: {
        title: "Next.js 14 新特性详解",
        slug: "nextjs-14-features",
        excerpt:
          "深入了解Next.js 14带来的新功能，包括App Router的改进、服务器组件的优化等。",
        content: `# Next.js 14 新特性详解

Next.js 14 带来了许多令人兴奋的新功能和改进。本文将详细介绍这些新特性。

## App Router 改进

App Router 在 Next.js 14 中得到了进一步的优化...

## 服务器组件优化

服务器组件的性能得到了显著提升...

## 总结

Next.js 14 是一个重要的版本更新，为开发者带来了更好的开发体验。`,
        published: true,
        publishedAt: new Date("2024-01-15"),
        authorId: admin.id,
        categoryId: categories[0].id,
        tags: {
          connect: [{ id: tags[0].id }, { id: tags[1].id }],
        },
      },
    }),
    prisma.post.upsert({
      where: { slug: "graphql-vs-rest" },
      update: {},
      create: {
        title: "GraphQL与REST API的选择指南",
        slug: "graphql-vs-rest",
        excerpt:
          "比较GraphQL和REST API的优缺点，帮助你在项目中做出正确的技术选择。",
        content: `# GraphQL与REST API的选择指南

在现代Web开发中，API设计是一个重要的决策。本文将比较GraphQL和REST API的优缺点。

## REST API

REST API 是一种成熟的架构风格...

## GraphQL

GraphQL 提供了更灵活的数据查询方式...

## 如何选择

选择GraphQL还是REST取决于你的具体需求...`,
        published: true,
        publishedAt: new Date("2024-01-10"),
        authorId: admin.id,
        categoryId: categories[1].id,
        tags: {
          connect: [{ id: tags[3].id }, { id: tags[4].id }],
        },
      },
    }),
  ]);

  console.log("创建博客文章:", posts);

  // 创建示例项目
  const projects = await Promise.all([
    prisma.project.upsert({
      where: { slug: "ecommerce-platform" },
      update: {},
      create: {
        title: "E-commerce Platform",
        slug: "ecommerce-platform",
        description:
          "基于Next.js和Stripe的全栈电商平台，支持商品管理、订单处理、支付集成等功能。",
        content: "这是一个完整的电商平台项目...",
        technologies: JSON.stringify([
          "Next.js",
          "TypeScript",
          "Prisma",
          "Stripe",
          "Tailwind CSS",
        ]),
        githubUrl: "https://github.com/example/ecommerce",
        liveUrl: "https://ecommerce-demo.vercel.app",
        featured: true,
        published: true,
      },
    }),
    prisma.project.upsert({
      where: { slug: "task-management-app" },
      update: {},
      create: {
        title: "Task Management App",
        slug: "task-management-app",
        description:
          "团队协作任务管理应用，具有实时同步、文件上传、评论系统等功能。",
        content: "这是一个团队协作工具...",
        technologies: JSON.stringify([
          "React",
          "Node.js",
          "Socket.io",
          "MongoDB",
          "Material-UI",
        ]),
        githubUrl: "https://github.com/example/task-manager",
        liveUrl: "https://task-manager-demo.vercel.app",
        featured: true,
        published: true,
      },
    }),
  ]);

  console.log("创建项目:", projects);

  // 创建简历数据
  const resumeData = {
    personalInfo: {
      name: "刘文俊",
      title: "前端开发工程师",
      email: "lwjcjmx123@gmail.com",
      phone: "18070495893",
      gender: "男",
      birthYear: 1994,
      summary:
        "拥有8年前端开发经验，专注于现代Web技术栈和低代码平台建设，具备丰富的团队管理和项目架构经验。",
    },
    experience: [
      {
        company: "蔚来汽车",
        position: "低代码前端组",
        startDate: "2022-08",
        endDate: "2025-03",
        description: `负责低代码平台的研发与优化，支持业务团队快速构建Web应用。

• 开发多数据源接入，除本地数据源外支持外部数据源，还支持API导入字段生成数据源，提升数据配置效率
• 实现版本锁及编辑锁机制，确保多人协作场景下数据一致性和编辑安全性
• 开发配套自定义组件脚手架，简化组件开发流程`,
      },
      {
        company: "美团",
        position: "联名卡前端组",
        startDate: "2019-10",
        endDate: "2022-07",
        description: `带领小组负责联名卡B端前端研发，覆盖线下合伙人、行员上门激活及电话销售等业务。

• 负责B端业务稳定性建设，完善监控告警策略及日志埋点
• 实现线上问题5分钟发现、10分钟定位、半小时内解决
• 全年无S9以上问题`,
      },
      {
        company: "上海拾米信息技术有限公司",
        position: "前端开发工程师",
        startDate: "2018-07",
        endDate: "2019-09",
        description: `带领小组负责美鹰证券App前端研发。

• 推动前端技术栈从 AngularJS + Gulp 向 Vue + TypeScript 演进
• 负责前端工程化建设，打通 GitLab + Jenkins + Sentry + 钉钉
• 打造完善的工作流，涵盖开发、持续集成、部署及监控`,
      },
      {
        company: "上海甄汇信息科技有限公司",
        position: "前端开发工程师",
        startDate: "2016-04",
        endDate: "2018-06",
        description: `负责汇联易微信端、钉钉端及 Hybrid App 页面开发。

• 负责多平台 SDK 对接，实现一套代码多端复用，覆盖微信、钉钉及 Hybrid App
• 负责项目性能优化，优化资源文件体积、减少 HTTP 请求、DNS 预解析、首屏预渲染、静态资源预加载等
• 将首页打开时间从 3.8s 优化至 1.3s，资源文件体积减少 3MB，用户留存率提升 30%`,
      },
    ],
    education: [
      {
        school: "南昌大学",
        degree: "电子商务学士",
        startDate: "2012-09",
        endDate: "2016-06",
        description: "本科学历，主修电子商务专业",
      },
    ],
    skills: [
      { category: "Web开发", items: ["HTML", "CSS", "JavaScript"] },
      { category: "前端框架", items: ["Vue", "React", "AngularJS"] },
      { category: "开发语言", items: ["TypeScript", "Node.js", "Python"] },
      { category: "数据库", items: ["MySQL"] },
      {
        category: "版本管理与工具",
        items: ["Git", "Jenkins", "Docker", "Nginx", "Sentry"],
      },
      {
        category: "项目相关",
        items: ["性能优化", "性能监控", "错误监控", "业务埋点"],
      },
    ],
    projects: [
      {
        name: "联名卡中后台微前端建设",
        role: "技术负责人",
        description: `解决中后台系统超40个，存在巨石项目臃肿、技术栈不统一、同质化页面多、启动成本高及维护效率低等问题。

**目标：**
• 提升开发效率，拆分巨石项目，统一技术栈
• 降低开发成本，快速复制同质化页面
• 提升数据安全，收敛权限

**行动：**
• 微前端工程体系建设：制定开发规范，提供标准化文档指引，开发脚手架
• 低代码搭建：建设低代码物料库，将低代码能力封装为子应用
• 权限管理中心：基于RBAC模型实现权限精细化管理

**业绩：**
• 微前端平台推广至其他团队，接入7个空间站、60+子应用
• 子应用开发上线时间平均减少0.5人日
• 低代码上线后，产品运营自主搭建140+页面，平均节省1人日/页面`,
        technologies: ["微前端", "低代码", "RBAC权限模型"],
      },
      {
        name: "联名卡合伙人系统",
        role: "负责人",
        description: `联名卡线上申卡依赖美团场景导流，线下用户触达能力有限，启动合伙人项目建设线下推广团队。

**行动：**
• 基于配置化思路将系统页面组件化，角色页面配置通过JSON云端动态下发，实时渲染
• 开发物料搭建系统，提供文字、图片、二维码等原子组件，支持产品动态搭建物料

**业绩：**
• 系统支持商户、银行行员、地推销售、优选团长等渠道
• 新银行上线平均耗时1小时
• 物料搭建系统上线后，8家银行生产300+海报物料，平均节省0.5人日/物料`,
        technologies: ["Vue", "配置化开发", "组件化"],
      },
    ],
    certifications: [],
    languages: [{ name: "英文", level: "良好读写能力，熟练阅读技术文档" }],
  };

  const resume = await prisma.resume.upsert({
    where: { id: "default" },
    update: { data: JSON.stringify(resumeData) },
    create: {
      id: "default",
      data: JSON.stringify(resumeData),
    },
  });

  console.log("创建简历数据:", resume);

  console.log("数据库种子完成!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
