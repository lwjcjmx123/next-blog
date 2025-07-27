"use client";

import { useState } from "react";
import { useQuery, useMutation } from "@apollo/client";
import { gql } from "@apollo/client";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Briefcase,
  Plus,
  Edit,
  Trash2,
  Search,
  Eye,
  Calendar,
  ExternalLink,
  Github,
  Star,
} from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/lib/auth";
import { useRouter } from "next/navigation";

const GET_PROJECTS = gql`
  query GetProjects($filter: ProjectsFilter, $skip: Int, $take: Int, $orderBy: ProjectOrderBy) {
    projects(filter: $filter, skip: $skip, take: $take, orderBy: $orderBy) {
      id
      title
      slug
      description
      technologies
      githubUrl
      liveUrl
      imageUrl
      featured
      published
      createdAt
      updatedAt
    }
    projectsCount(filter: $filter)
  }
`;

const DELETE_PROJECT = gql`
  mutation DeleteProject($id: String!) {
    deleteProject(id: $id)
  }
`;

export default function ProjectsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [publishedFilter, setPublishedFilter] = useState<boolean | undefined>(undefined);
  const [featuredFilter, setFeaturedFilter] = useState<boolean | undefined>(undefined);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const { data, loading, error, refetch } = useQuery(GET_PROJECTS, {
    variables: {
      filter: {
        search: searchTerm || undefined,
        published: publishedFilter,
        featured: featuredFilter,
      },
      skip: (currentPage - 1) * pageSize,
      take: pageSize,
      orderBy: { createdAt: "desc" },
    },
  });

  const [deleteProject] = useMutation(DELETE_PROJECT, {
    onCompleted: () => {
      refetch();
    },
  });

  if (!user || user.role !== "ADMIN") {
    router.push("/admin/login");
    return null;
  }

  const handleDelete = async (id: string, title: string) => {
    if (confirm(`确定要删除项目 "${title}" 吗？`)) {
      try {
        await deleteProject({ variables: { id } });
      } catch (error) {
        console.error("删除项目失败:", error);
        alert("删除项目失败");
      }
    }
  };

  const totalPages = Math.ceil((data?.projectsCount || 0) / pageSize);

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
                项目管理
              </h1>
              <p className="text-slate-600 dark:text-slate-400 mt-2">
                管理您的项目作品
              </p>
            </div>
            <div className="flex gap-2 mt-4 sm:mt-0">
              <Button asChild>
                <Link href="/admin/projects/new">
                  <Plus className="h-4 w-4 mr-2" />
                  新建项目
                </Link>
              </Button>
            </div>
          </div>
        </motion.div>

        {/* 搜索和筛选 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6"
        >
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
                    <Input
                      placeholder="搜索项目标题或描述..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant={publishedFilter === undefined ? "default" : "outline"}
                    onClick={() => setPublishedFilter(undefined)}
                  >
                    全部
                  </Button>
                  <Button
                    variant={publishedFilter === true ? "default" : "outline"}
                    onClick={() => setPublishedFilter(true)}
                  >
                    已发布
                  </Button>
                  <Button
                    variant={publishedFilter === false ? "default" : "outline"}
                    onClick={() => setPublishedFilter(false)}
                  >
                    草稿
                  </Button>
                  <Button
                    variant={featuredFilter === true ? "default" : "outline"}
                    onClick={() => setFeaturedFilter(featuredFilter === true ? undefined : true)}
                  >
                    <Star className="h-4 w-4 mr-1" />
                    精选
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* 项目列表 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Briefcase className="h-5 w-5" />
                项目列表 ({data?.projectsCount || 0})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-4">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="animate-pulse">
                      <div className="h-32 bg-slate-200 dark:bg-slate-700 rounded"></div>
                    </div>
                  ))}
                </div>
              ) : error ? (
                <div className="text-center py-8">
                  <p className="text-red-500">加载失败: {error.message}</p>
                </div>
              ) : data?.projects?.length === 0 ? (
                <div className="text-center py-8">
                  <Briefcase className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                  <p className="text-slate-600 dark:text-slate-400">暂无项目</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {data?.projects?.map((project: any) => (
                    <div
                      key={project.id}
                      className="border border-slate-200 dark:border-slate-700 rounded-lg p-4 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                              {project.title}
                            </h3>
                            <div className="flex gap-1">
                              <Badge
                                variant={project.published ? "default" : "secondary"}
                              >
                                {project.published ? "已发布" : "草稿"}
                              </Badge>
                              {project.featured && (
                                <Badge className="bg-yellow-500 hover:bg-yellow-600">
                                  <Star className="h-3 w-3 mr-1" />
                                  精选
                                </Badge>
                              )}
                            </div>
                          </div>
                          <p className="text-slate-600 dark:text-slate-400 mb-3 line-clamp-2">
                            {project.description}
                          </p>
                          <div className="flex items-center gap-4 text-sm text-slate-500 dark:text-slate-400 mb-3">
                            <div className="flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              {new Date(project.createdAt).toLocaleDateString("zh-CN")}
                            </div>
                            {project.githubUrl && (
                              <div className="flex items-center gap-1">
                                <Github className="h-4 w-4" />
                                GitHub
                              </div>
                            )}
                            {project.liveUrl && (
                              <div className="flex items-center gap-1">
                                <ExternalLink className="h-4 w-4" />
                                在线预览
                              </div>
                            )}
                          </div>
                          {project.technologies?.length > 0 && (
                            <div className="flex flex-wrap gap-1">
                              {project.technologies.map((tech: string, index: number) => (
                                <Badge key={index} variant="outline" className="text-xs">
                                  {tech}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>
                        <div className="flex items-center gap-2 ml-4">
                          <Button size="sm" variant="outline" asChild>
                            <Link href={`/projects/${project.slug}`} target="_blank">
                              <Eye className="h-4 w-4" />
                            </Link>
                          </Button>
                          <Button size="sm" variant="outline" asChild>
                            <Link href={`/admin/projects/${project.id}/edit`}>
                              <Edit className="h-4 w-4" />
                            </Link>
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDelete(project.id, project.title)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* 分页 */}
              {totalPages > 1 && (
                <div className="flex justify-center gap-2 mt-6">
                  <Button
                    variant="outline"
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(currentPage - 1)}
                  >
                    上一页
                  </Button>
                  <span className="flex items-center px-4 text-sm text-slate-600 dark:text-slate-400">
                    {currentPage} / {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage(currentPage + 1)}
                  >
                    下一页
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}