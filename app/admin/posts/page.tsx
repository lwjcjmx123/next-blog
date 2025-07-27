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
  FileText,
  Plus,
  Edit,
  Trash2,
  Search,
  Eye,
  Calendar,
  User,
  Tag,
} from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/lib/auth";
import { useRouter } from "next/navigation";

const GET_POSTS = gql`
  query GetPosts($filter: PostsFilter, $skip: Int, $take: Int, $orderBy: PostOrderBy) {
    posts(filter: $filter, skip: $skip, take: $take, orderBy: $orderBy) {
      id
      title
      slug
      excerpt
      published
      publishedAt
      createdAt
      updatedAt
      author {
        id
        name
      }
      category {
        id
        name
      }
      tags {
        id
        name
      }
    }
    postsCount(filter: $filter)
  }
`;

const DELETE_POST = gql`
  mutation DeletePost($id: String!) {
    deletePost(id: $id)
  }
`;

export default function PostsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [publishedFilter, setPublishedFilter] = useState<boolean | undefined>(undefined);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const { data, loading, error, refetch } = useQuery(GET_POSTS, {
    variables: {
      filter: {
        search: searchTerm || undefined,
        published: publishedFilter,
      },
      skip: (currentPage - 1) * pageSize,
      take: pageSize,
      orderBy: { createdAt: "desc" },
    },
  });

  const [deletePost] = useMutation(DELETE_POST, {
    onCompleted: () => {
      refetch();
    },
  });

  if (!user || user.role !== "ADMIN") {
    router.push("/admin/login");
    return null;
  }

  const handleDelete = async (id: string, title: string) => {
    if (confirm(`确定要删除文章 "${title}" 吗？`)) {
      try {
        await deletePost({ variables: { id } });
      } catch (error) {
        console.error("删除文章失败:", error);
        alert("删除文章失败");
      }
    }
  };

  const totalPages = Math.ceil((data?.postsCount || 0) / pageSize);

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
                文章管理
              </h1>
              <p className="text-slate-600 dark:text-slate-400 mt-2">
                管理您的博客文章
              </p>
            </div>
            <div className="flex gap-2 mt-4 sm:mt-0">
              <Button asChild>
                <Link href="/admin/posts/new">
                  <Plus className="h-4 w-4 mr-2" />
                  新建文章
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
                      placeholder="搜索文章标题或内容..."
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
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* 文章列表 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                文章列表 ({data?.postsCount || 0})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-4">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="animate-pulse">
                      <div className="h-20 bg-slate-200 dark:bg-slate-700 rounded"></div>
                    </div>
                  ))}
                </div>
              ) : error ? (
                <div className="text-center py-8">
                  <p className="text-red-500">加载失败: {error.message}</p>
                </div>
              ) : data?.posts?.length === 0 ? (
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                  <p className="text-slate-600 dark:text-slate-400">暂无文章</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {data?.posts?.map((post: any) => (
                    <div
                      key={post.id}
                      className="border border-slate-200 dark:border-slate-700 rounded-lg p-4 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                              {post.title}
                            </h3>
                            <Badge
                              variant={post.published ? "default" : "secondary"}
                            >
                              {post.published ? "已发布" : "草稿"}
                            </Badge>
                          </div>
                          {post.excerpt && (
                            <p className="text-slate-600 dark:text-slate-400 mb-3 line-clamp-2">
                              {post.excerpt}
                            </p>
                          )}
                          <div className="flex items-center gap-4 text-sm text-slate-500 dark:text-slate-400">
                            <div className="flex items-center gap-1">
                              <User className="h-4 w-4" />
                              {post.author.name}
                            </div>
                            <div className="flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              {new Date(post.createdAt).toLocaleDateString("zh-CN")}
                            </div>
                            {post.category && (
                              <div className="flex items-center gap-1">
                                <Tag className="h-4 w-4" />
                                {post.category.name}
                              </div>
                            )}
                          </div>
                          {post.tags?.length > 0 && (
                            <div className="flex gap-1 mt-2">
                              {post.tags.map((tag: any) => (
                                <Badge key={tag.id} variant="outline" className="text-xs">
                                  {tag.name}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>
                        <div className="flex items-center gap-2 ml-4">
                          <Button size="sm" variant="outline" asChild>
                            <Link href={`/blog/${post.slug}`} target="_blank">
                              <Eye className="h-4 w-4" />
                            </Link>
                          </Button>
                          <Button size="sm" variant="outline" asChild>
                            <Link href={`/admin/posts/${post.id}/edit`}>
                              <Edit className="h-4 w-4" />
                            </Link>
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDelete(post.id, post.title)}
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