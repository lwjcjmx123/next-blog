"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@apollo/client";
import { gql } from "@apollo/client";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  FileText,
  FolderOpen,
  Tag,
  Briefcase,
  User,
  Upload,
  TrendingUp,
  Eye,
  Calendar,
  Plus,
  Settings,
  BarChart3,
} from "lucide-react";
import { useAuth } from "@/lib/auth";
import Link from "next/link";

const ADMIN_STATS = gql`
  query AdminStats {
    postsCount
    posts(take: 5, orderBy: { createdAt: desc }) {
      id
      title
      slug
      published
      createdAt
      author {
        name
      }
      category {
        name
      }
    }
    categories {
      id
      name
      _count {
        posts
      }
    }
    tags {
      id
      name
      _count {
        posts
      }
    }
    projectsCount
    projects(take: 3, orderBy: { createdAt: desc }) {
      id
      title
      slug
      featured
      createdAt
    }
    uploads(take: 5, orderBy: { createdAt: desc }) {
      id
      filename
      originalName
      size
      createdAt
    }
  }
`;

export default function AdminPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const { data, loading, error } = useQuery(ADMIN_STATS);

  useEffect(() => {
    if (!authLoading && (!user || user.role !== "ADMIN")) {
      router.push("/admin/login");
    }
  }, [user, authLoading, router]);

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded w-48"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div
                  key={i}
                  className="h-32 bg-slate-200 dark:bg-slate-700 rounded"
                ></div>
              ))}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {[...Array(4)].map((_, i) => (
                <div
                  key={i}
                  className="h-64 bg-slate-200 dark:bg-slate-700 rounded"
                ></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !user || user.role !== "ADMIN") {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">访问被拒绝</h1>
          <p className="text-slate-600 dark:text-slate-400 mb-4">
            您没有访问管理后台的权限
          </p>
          <Button onClick={() => router.push("/admin/login")}>重新登录</Button>
        </div>
      </div>
    );
  }

  const stats = {
    posts: data?.postsCount || 0,
    categories: data?.categories?.length || 0,
    tags: data?.tags?.length || 0,
    projects: data?.projectsCount || 0,
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <div className="container mx-auto px-4 py-8">
        {/* 页面标题 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
                管理后台
              </h1>
              <p className="text-slate-600 dark:text-slate-400 mt-2">
                欢迎回来，{user.name}！
              </p>
            </div>
            <div className="flex gap-2 mt-4 sm:mt-0">
              <Button variant="outline" asChild>
                <Link href="/">
                  <Eye className="h-4 w-4 mr-2" />
                  查看网站
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/admin/files">
                  <FolderOpen className="h-4 w-4 mr-2" />
                  文件管理
                </Link>
              </Button>
              <Button variant="outline">
                <Settings className="h-4 w-4 mr-2" />
                设置
              </Button>
            </div>
          </div>
        </motion.div>

        {/* 统计卡片 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        >
          <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm font-medium">文章总数</p>
                  <p className="text-3xl font-bold">{stats.posts}</p>
                </div>
                <FileText className="h-8 w-8 text-blue-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm font-medium">分类数量</p>
                  <p className="text-3xl font-bold">{stats.categories}</p>
                </div>
                <FolderOpen className="h-8 w-8 text-green-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm font-medium">
                    标签数量
                  </p>
                  <p className="text-3xl font-bold">{stats.tags}</p>
                </div>
                <Tag className="h-8 w-8 text-purple-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-100 text-sm font-medium">
                    项目数量
                  </p>
                  <p className="text-3xl font-bold">{stats.projects}</p>
                </div>
                <Briefcase className="h-8 w-8 text-orange-200" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* 最新文章 */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  最新文章
                </CardTitle>
                <Button size="sm" asChild>
                  <Link href="/admin/posts">
                    <Plus className="h-4 w-4 mr-2" />
                    新建文章
                  </Link>
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {data?.posts?.map((post: any) => (
                    <div
                      key={post.id}
                      className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-lg"
                    >
                      <div className="flex-1">
                        <h4 className="font-medium text-slate-900 dark:text-white truncate">
                          {post.title}
                        </h4>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-sm text-slate-600 dark:text-slate-400">
                            {post.author.name}
                          </span>
                          <span className="text-slate-400">•</span>
                          <span className="text-sm text-slate-600 dark:text-slate-400">
                            {new Date(post.createdAt).toLocaleDateString(
                              "zh-CN"
                            )}
                          </span>
                          {post.category && (
                            <>
                              <span className="text-slate-400">•</span>
                              <Badge variant="secondary" className="text-xs">
                                {post.category.name}
                              </Badge>
                            </>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge
                          variant={post.published ? "default" : "secondary"}
                        >
                          {post.published ? "已发布" : "草稿"}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* 最新项目 */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Briefcase className="h-5 w-5" />
                  最新项目
                </CardTitle>
                <Button size="sm" asChild>
                  <Link href="/admin/projects">
                    <Plus className="h-4 w-4 mr-2" />
                    新建项目
                  </Link>
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {data?.projects?.map((project: any) => (
                    <div
                      key={project.id}
                      className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-lg"
                    >
                      <div className="flex-1">
                        <h4 className="font-medium text-slate-900 dark:text-white truncate">
                          {project.title}
                        </h4>
                        <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                          {new Date(project.createdAt).toLocaleDateString(
                            "zh-CN"
                          )}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        {project.featured && (
                          <Badge className="bg-yellow-500 hover:bg-yellow-600">
                            精选
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* 分类统计 */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  分类统计
                </CardTitle>
                <Button size="sm" variant="outline" asChild>
                  <Link href="/admin/categories">管理分类</Link>
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {data?.categories?.map((category: any) => (
                    <div
                      key={category.id}
                      className="flex items-center justify-between"
                    >
                      <span className="text-slate-900 dark:text-white">
                        {category.name}
                      </span>
                      <Badge variant="outline">{category._count.posts} 篇文章</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* 最新上传 */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Upload className="h-5 w-5" />
                  最新上传
                </CardTitle>
                <Button size="sm" variant="outline" asChild>
                  <Link href="/admin/files">管理文件</Link>
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {data?.uploads?.map((upload: any) => (
                    <div
                      key={upload.id}
                      className="flex items-center justify-between"
                    >
                      <div className="flex-1">
                        <p className="text-sm font-medium text-slate-900 dark:text-white truncate">
                          {upload.originalName}
                        </p>
                        <p className="text-xs text-slate-600 dark:text-slate-400">
                          {new Date(upload.createdAt).toLocaleDateString(
                            "zh-CN"
                          )}
                        </p>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {formatFileSize(upload.size)}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* 快速操作 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mt-8"
        >
          <Card>
            <CardHeader>
              <CardTitle>快速操作</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Button variant="outline" className="h-20 flex-col" asChild>
                  <Link href="/admin/posts/new">
                    <FileText className="h-6 w-6 mb-2" />
                    写文章
                  </Link>
                </Button>
                <Button variant="outline" className="h-20 flex-col" asChild>
                  <Link href="/admin/projects/new">
                    <Briefcase className="h-6 w-6 mb-2" />
                    新项目
                  </Link>
                </Button>
                <Button variant="outline" className="h-20 flex-col" asChild>
                  <Link href="/admin/resume">
                    <User className="h-6 w-6 mb-2" />
                    编辑简历
                  </Link>
                </Button>
                <Button variant="outline" className="h-20 flex-col" asChild>
                  <Link href="/admin/files">
                    <Upload className="h-6 w-6 mb-2" />
                    文件管理
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
