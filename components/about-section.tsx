"use client";

import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Code, Database, Globe, Smartphone } from "lucide-react";

const skills = [
  {
    icon: Globe,
    title: "前端开发",
    description: "React, Next.js, TypeScript, Tailwind CSS",
    color: "text-blue-500",
  },
  {
    icon: Database,
    title: "后端开发",
    description: "Node.js, GraphQL, Prisma, MySQL",
    color: "text-green-500",
  },
  {
    icon: Code,
    title: "全栈开发",
    description: "端到端应用开发，API设计，数据库设计",
    color: "text-purple-500",
  },
  {
    icon: Smartphone,
    title: "移动优先",
    description: "响应式设计，PWA，移动端优化",
    color: "text-orange-500",
  },
];

export function AboutSection() {
  return (
    <section className="py-16 md:py-24">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center space-y-4 mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold">关于我</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            我是一名充满热情的开发者，专注于创建现代化的Web应用程序。
            拥有丰富的前端和后端开发经验，热爱学习新技术并将其应用到实际项目中。
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {skills.map((skill, index) => {
            const Icon = skill.icon;
            return (
              <motion.div
                key={skill.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="h-full hover:shadow-lg transition-shadow duration-300">
                  <CardContent className="p-6 text-center space-y-4">
                    <div
                      className={`inline-flex p-3 rounded-full bg-muted ${skill.color}`}
                    >
                      <Icon className="h-6 w-6" />
                    </div>
                    <h3 className="text-lg font-semibold">{skill.title}</h3>
                    <p className="text-sm text-muted-foreground">
                      {skill.description}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          viewport={{ once: true }}
          className="mt-16 text-center"
        >
          <Card className="max-w-4xl mx-auto">
            <CardContent className="p-8">
              <h3 className="text-2xl font-bold mb-6">技术栈</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div>
                  <h4 className="font-semibold mb-2 text-blue-600 dark:text-blue-400">
                    前端
                  </h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>Vue / React</li>
                    <li>TypeScript</li>
                    <li>Tailwind CSS</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2 text-green-600 dark:text-green-400">
                    后端
                  </h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>Node.js</li>
                    <li>GraphQL</li>
                    <li>NestJS</li>
                    <li>Prisma ORM</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2 text-purple-600 dark:text-purple-400">
                    数据库
                  </h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>MySQL</li>
                    <li>PostgreSQL</li>
                    <li>MongoDB</li>
                    <li>Redis</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2 text-orange-600 dark:text-orange-400">
                    工具
                  </h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>Docker</li>
                    <li>Vercel</li>
                    <li>Git</li>
                    <li>VS Code</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </section>
  );
}
