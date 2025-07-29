"use client";

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Calendar, 
  Clock, 
  User, 
  ArrowLeft, 
  Share2, 
  Twitter, 
  Facebook, 
  Link as LinkIcon,
  Tag
} from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { Post } from '@/lib/data';
import MDXContent from '@/components/mdx-content';

interface BlogPostClientProps {
  post: Post;
  relatedPosts: Post[];
}

export default function BlogPostClient({ post, relatedPosts }: BlogPostClientProps) {
  const { toast } = useToast();

  const shareUrl = typeof window !== 'undefined' ? window.location.href : '';
  const shareTitle = post?.title || '';

  const handleShare = async (platform?: string) => {
    if (platform === 'twitter') {
      window.open(
        `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareTitle)}&url=${encodeURIComponent(shareUrl)}`,
        '_blank'
      );
    } else if (platform === 'facebook') {
      window.open(
        `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
        '_blank'
      );
    } else {
      // 复制链接
      try {
        await navigator.clipboard.writeText(shareUrl);
        toast({
          title: '链接已复制',
          description: '文章链接已复制到剪贴板',
        });
      } catch (err) {
        toast({
          title: '复制失败',
          description: '无法复制链接到剪贴板',
          variant: 'destructive',
        });
      }
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* 返回按钮 */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="mb-8"
          >
            <Link href="/blog">
              <Button variant="ghost" className="hover:bg-slate-200 dark:hover:bg-slate-700">
                <ArrowLeft className="h-4 w-4 mr-2" />
                返回博客列表
              </Button>
            </Link>
          </motion.div>

          {/* 文章头部 */}
          <motion.article
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-slate-800 rounded-lg shadow-lg overflow-hidden"
          >
            <div className="p-8">
              {/* 分类标签 */}
              {post.category && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.1 }}
                  className="mb-4"
                >
                  <Link href={`/blog?category=${post.category}`}>
                    <Badge className="hover:bg-blue-600 transition-colors cursor-pointer">
                      {post.category}
                    </Badge>
                  </Link>
                </motion.div>
              )}

              {/* 标题 */}
              <motion.h1
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-6 leading-tight"
              >
                {post.title}
              </motion.h1>

              {/* 文章元信息 */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="flex flex-wrap items-center gap-4 text-sm text-slate-600 dark:text-slate-400 mb-6"
              >
                <div className="flex items-center gap-1">
                  <User className="h-4 w-4" />
                  {post.author}
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  {formatDate(post.date)}
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  {post.readingTime} 分钟阅读
                </div>
              </motion.div>

              {/* 标签 */}
              {post.tags && post.tags.length > 0 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="flex items-center gap-2 mb-6"
                >
                  <Tag className="h-4 w-4 text-slate-500" />
                  <div className="flex flex-wrap gap-2">
                    {post.tags.map((tag) => (
                      <Link key={tag} href={`/blog?tag=${tag}`}>
                        <Badge
                          variant="outline"
                          className="hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                        >
                          {tag}
                        </Badge>
                      </Link>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* 分享按钮 */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="flex items-center gap-2 mb-8 pb-6 border-b border-slate-200 dark:border-slate-700"
              >
                <span className="text-sm text-slate-600 dark:text-slate-400 mr-2">分享文章：</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleShare('twitter')}
                  className="hover:bg-blue-50 hover:border-blue-300 dark:hover:bg-blue-900/20"
                >
                  <Twitter className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleShare('facebook')}
                  className="hover:bg-blue-50 hover:border-blue-300 dark:hover:bg-blue-900/20"
                >
                  <Facebook className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleShare()}
                  className="hover:bg-slate-50 hover:border-slate-300 dark:hover:bg-slate-700"
                >
                  <LinkIcon className="h-4 w-4" />
                </Button>
              </motion.div>

              {/* 文章内容 */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="prose prose-slate dark:prose-invert max-w-none
                  prose-headings:text-slate-900 dark:prose-headings:text-white
                  prose-p:text-slate-700 dark:prose-p:text-slate-300
                  prose-a:text-blue-600 dark:prose-a:text-blue-400
                  prose-strong:text-slate-900 dark:prose-strong:text-white
                  prose-code:text-pink-600 dark:prose-code:text-pink-400
                  prose-pre:bg-slate-900 dark:prose-pre:bg-slate-800
                  prose-blockquote:border-blue-500 dark:prose-blockquote:border-blue-400
                  prose-blockquote:text-slate-700 dark:prose-blockquote:text-slate-300"
              >
                <MDXContent content={post.content} />
              </motion.div>
            </div>
          </motion.article>

          {/* 相关文章 */}
          {relatedPosts.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="mt-12"
            >
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">
                相关文章
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {relatedPosts.map((relatedPost, index) => (
                  <motion.div
                    key={relatedPost.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.9 + index * 0.1 }}
                  >
                    <Link href={`/blog/${relatedPost.slug}`}>
                      <Card className="h-full hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer group">
                        <CardContent className="p-6">
                          <h3 className="font-semibold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors mb-2 line-clamp-2">
                            {relatedPost.title}
                          </h3>
                          <p className="text-sm text-slate-600 dark:text-slate-400 mb-3 line-clamp-3">
                            {relatedPost.excerpt}
                          </p>
                          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                            <Calendar className="h-3 w-3" />
                            {formatDate(relatedPost.date)}
                            {relatedPost.category && (
                              <Badge variant="secondary" className="text-xs">
                                {relatedPost.category}
                              </Badge>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}