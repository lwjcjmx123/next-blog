"use client";

import { useState, useEffect } from "react";
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
import { Post } from "@/lib/data";

const POSTS_PER_PAGE = 6;

interface BlogClientProps {
  initialPosts: Post[];
  initialCategories: string[];
  initialTags: string[];
}

export default function BlogClient({ 
  initialPosts, 
  initialCategories, 
  initialTags 
}: BlogClientProps) {
  const [posts, setPosts] = useState<Post[]>(initialPosts);
  const [allPosts] = useState<Post[]>(initialPosts);
  const [categories] = useState<string[]>(initialCategories);
  const [tags] = useState<string[]>(initialTags);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);

  // 筛选文章
  useEffect(() => {
    let filteredPosts = [...allPosts];

    // 搜索筛选
    if (searchTerm) {
      filteredPosts = filteredPosts.filter(
        (post) =>
          post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          post.excerpt.toLowerCase().includes(searchTerm.toLowerCase()) ||
          post.content.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // 分类筛选
    if (selectedCategory) {
      filteredPosts = filteredPosts.filter(
        (post) => post.category === selectedCategory
      );
    }

    // 标签筛选
    if (selectedTags.length > 0) {
      filteredPosts = filteredPosts.filter((post) =>
        selectedTags.some((tag) => post.tags.includes(tag))
      );
    }

    setPosts(filteredPosts);
    setCurrentPage(1);
  }, [allPosts, searchTerm, selectedCategory, selectedTags]);

  const totalPosts = posts.length;
  const totalPages = Math.ceil(totalPosts / POSTS_PER_PAGE);
  const startIndex = (currentPage - 1) * POSTS_PER_PAGE;
  const currentPosts = posts.slice(startIndex, startIndex + POSTS_PER_PAGE);

  const handleTagToggle = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleCategoryChange = (category: string | null) => {
    setSelectedCategory(category);
  };

  const handleSearch = (term: string) => {
    setSearchTerm(term);
  };

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedCategory(null);
    setSelectedTags([]);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("zh-CN", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
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
                      全部分类 ({allPosts.length})
                    </Button>
                    {categories.map((category) => {
                      const count = allPosts.filter(
                        (post) => post.category === category
                      ).length;
                      return (
                        <Button
                          key={category}
                          variant={
                            selectedCategory === category ? "default" : "ghost"
                          }
                          className="w-full justify-start"
                          onClick={() => handleCategoryChange(category)}
                        >
                          {category} ({count})
                        </Button>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              {/* 标签筛选 */}
              <Card>
                <CardHeader>
                  <CardTitle>标签</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {tags.map((tag) => (
                      <Badge
                        key={tag}
                        variant={
                          selectedTags.includes(tag) ? "default" : "outline"
                        }
                        className="cursor-pointer hover:bg-primary/80"
                        onClick={() => handleTagToggle(tag)}
                      >
                        {tag}
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
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-3"
          >
            {/* 文章列表 */}
            {currentPosts.length > 0 ? (
              <div className="grid grid-cols-1 gap-6 mb-8">
                {currentPosts.map((post, index) => (
                  <motion.div
                    key={post.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card className="h-full hover:shadow-lg transition-all duration-300 group">
                      <CardHeader>
                        <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 mb-2">
                          <Calendar className="h-4 w-4" />
                          {formatDate(post.date)}
                          <Badge variant="outline" className="ml-auto">
                            {post.category}
                          </Badge>
                        </div>
                        <CardTitle className="group-hover:text-blue-600 transition-colors">
                          <Link href={`/blog/${post.slug}`}>{post.title}</Link>
                        </CardTitle>
                        <CardDescription className="line-clamp-3">
                          {post.excerpt}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center justify-between">
                          <div className="flex flex-wrap gap-1">
                            {post.tags.slice(0, 3).map((tag) => (
                              <Badge
                                key={tag}
                                variant="secondary"
                                className="text-xs"
                              >
                                {tag}
                              </Badge>
                            ))}
                            {post.tags.length > 3 && (
                              <Badge variant="secondary" className="text-xs">
                                +{post.tags.length - 3}
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-1 text-sm text-slate-500">
                            <Clock className="h-4 w-4" />
                            <span>{post.author}</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">📝</div>
                <h3 className="text-xl font-semibold mb-2">没有找到文章</h3>
                <p className="text-slate-600 dark:text-slate-400 mb-4">
                  尝试调整搜索条件或清除筛选器
                </p>
                <Button onClick={clearFilters}>清除筛选</Button>
              </div>
            )}

            {/* 分页 */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2">
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
                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter(
                      (page) =>
                        page === 1 ||
                        page === totalPages ||
                        Math.abs(page - currentPage) <= 1
                    )
                    .map((page, index, array) => (
                      <div key={page} className="flex items-center">
                        {index > 0 && array[index - 1] !== page - 1 && (
                          <span className="px-2 text-slate-400">...</span>
                        )}
                        <Button
                          variant={currentPage === page ? "default" : "outline"}
                          size="sm"
                          onClick={() => setCurrentPage(page)}
                        >
                          {page}
                        </Button>
                      </div>
                    ))}
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
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}