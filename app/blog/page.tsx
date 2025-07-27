"use client";

import { useState } from "react";
import { useQuery } from "@apollo/client";
import { gql } from "@apollo/client";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Search,
  Calendar,
  Clock,
  Tag,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

const GET_POSTS = gql`
  query GetPosts($filter: PostsFilter, $skip: Int, $take: Int) {
    posts(filter: $filter, skip: $skip, take: $take) {
      id
      title
      slug
      excerpt
      publishedAt
      content
      author {
        name
      }
      category {
        id
        name
        slug
      }
      tags {
        id
        name
        slug
      }
    }
    postsCount(filter: $filter)
  }
`;

const GET_CATEGORIES = gql`
  query GetCategories {
    categories {
      id
      name
      slug
    }
  }
`;

const GET_TAGS = gql`
  query GetTags {
    tags {
      id
      name
      slug
    }
  }
`;

const POSTS_PER_PAGE = 6;

export default function BlogPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);

  const { data: postsData, loading: postsLoading } = useQuery(GET_POSTS, {
    variables: {
      filter: {
        published: true,
        search: searchTerm || undefined,
        categoryId: selectedCategory || undefined,
        tagIds: selectedTags.length > 0 ? selectedTags : undefined,
      },
      skip: (currentPage - 1) * POSTS_PER_PAGE,
      take: POSTS_PER_PAGE,
    },
  });

  const { data: categoriesData } = useQuery(GET_CATEGORIES);
  const { data: tagsData } = useQuery(GET_TAGS);

  const posts = postsData?.posts || [];
  const totalPosts = postsData?.postsCount || 0;
  const totalPages = Math.ceil(totalPosts / POSTS_PER_PAGE);
  const categories = categoriesData?.categories || [];
  const tags = tagsData?.tags || [];

  const handleTagToggle = (tagId: string) => {
    setSelectedTags((prev) =>
      prev.includes(tagId)
        ? prev.filter((id) => id !== tagId)
        : [...prev, tagId]
    );
    setCurrentPage(1);
  };

  const handleCategoryChange = (categoryId: string | null) => {
    setSelectedCategory(categoryId);
    setCurrentPage(1);
  };

  const handleSearch = (term: string) => {
    setSearchTerm(term);
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedCategory(null);
    setSelectedTags([]);
    setCurrentPage(1);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="container mx-auto px-4 py-8">
        {/* 页面标题 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
            技术博客
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
            分享前端开发、后端技术、全栈开发的经验与思考
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* 侧边栏 - 筛选器 */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-1"
          >
            <div className="sticky top-8 space-y-6">
              {/* 搜索 */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Search className="h-5 w-5" />
                    搜索文章
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Input
                    placeholder="搜索标题、内容..."
                    value={searchTerm}
                    onChange={(e) => handleSearch(e.target.value)}
                    className="w-full"
                  />
                </CardContent>
              </Card>

              {/* 分类筛选 */}
              <Card>
                <CardHeader>
                  <CardTitle>分类</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <Button
                      variant={selectedCategory === null ? "default" : "ghost"}
                      className="w-full justify-start"
                      onClick={() => handleCategoryChange(null)}
                    >
                      全部分类 ({totalPosts})
                    </Button>
                    {categories.map((category: any) => (
                      <Button
                        key={category.id}
                        variant={
                          selectedCategory === category.id ? "default" : "ghost"
                        }
                        className="w-full justify-start"
                        onClick={() => handleCategoryChange(category.id)}
                      >
                        {category.name} ({category._count})
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* 标签筛选 */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Tag className="h-5 w-5" />
                    标签
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {tags.map((tag: any) => (
                      <Badge
                        key={tag.id}
                        variant={
                          selectedTags.includes(tag.id)
                            ? "default"
                            : "secondary"
                        }
                        className="cursor-pointer hover:scale-105 transition-transform"
                        style={{
                          backgroundColor:
                            selectedTags.includes(tag.id) && tag.color
                              ? tag.color
                              : undefined,
                        }}
                        onClick={() => handleTagToggle(tag.id)}
                      >
                        {tag.name} ({tag._count})
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* 清除筛选 */}
              {(searchTerm || selectedCategory || selectedTags.length > 0) && (
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={clearFilters}
                >
                  清除所有筛选
                </Button>
              )}
            </div>
          </motion.div>

          {/* 主内容区 */}
          <div className="lg:col-span-3">
            {/* 文章列表 */}
            {postsLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[...Array(6)].map((_, i) => (
                  <Card key={i} className="animate-pulse">
                    <CardHeader>
                      <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-3/4"></div>
                      <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-1/2"></div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded"></div>
                        <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-5/6"></div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : posts.length > 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="grid grid-cols-1 md:grid-cols-2 gap-6"
              >
                {posts.map((post: any, index: number) => (
                  <motion.div
                    key={post.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Link href={`/blog/${post.slug}`}>
                      <Card className="h-full hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer group">
                        <CardHeader>
                          <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 mb-2">
                            <Calendar className="h-4 w-4" />
                            {new Date(post.publishedAt).toLocaleDateString(
                              "zh-CN"
                            )}
                            {post.readingTime && (
                              <>
                                <Clock className="h-4 w-4 ml-2" />
                                {post.readingTime} 分钟阅读
                              </>
                            )}
                          </div>
                          <CardTitle className="group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                            {post.title}
                          </CardTitle>
                          {post.category && (
                            <Badge variant="secondary" className="w-fit">
                              {post.category.name}
                            </Badge>
                          )}
                        </CardHeader>
                        <CardContent>
                          <CardDescription className="mb-4 line-clamp-3">
                            {post.excerpt}
                          </CardDescription>
                          {post.tags && post.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1">
                              {post.tags.map((tag: any) => (
                                <Badge
                                  key={tag.id}
                                  variant="outline"
                                  className="text-xs"
                                  style={{
                                    borderColor: tag.color,
                                    color: tag.color,
                                  }}
                                >
                                  {tag.name}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    </Link>
                  </motion.div>
                ))}
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-12"
              >
                <div className="text-6xl mb-4">📝</div>
                <h3 className="text-xl font-semibold mb-2">暂无文章</h3>
                <p className="text-slate-600 dark:text-slate-400">
                  {searchTerm || selectedCategory || selectedTags.length > 0
                    ? "没有找到符合条件的文章，请尝试调整筛选条件"
                    : "还没有发布任何文章"}
                </p>
              </motion.div>
            )}

            {/* 分页 */}
            {totalPages > 1 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex justify-center items-center gap-2 mt-8"
              >
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(1, prev - 1))
                  }
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                  上一页
                </Button>

                <div className="flex items-center gap-1">
                  {[...Array(totalPages)].map((_, i) => {
                    const page = i + 1;
                    if (
                      page === 1 ||
                      page === totalPages ||
                      (page >= currentPage - 1 && page <= currentPage + 1)
                    ) {
                      return (
                        <Button
                          key={page}
                          variant={currentPage === page ? "default" : "outline"}
                          size="sm"
                          onClick={() => setCurrentPage(page)}
                        >
                          {page}
                        </Button>
                      );
                    } else if (
                      page === currentPage - 2 ||
                      page === currentPage + 2
                    ) {
                      return (
                        <span key={page} className="px-2">
                          ...
                        </span>
                      );
                    }
                    return null;
                  })}
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                  }
                  disabled={currentPage === totalPages}
                >
                  下一页
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
