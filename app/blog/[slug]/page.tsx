'use client'

import { useQuery } from '@apollo/client'
import { gql } from '@apollo/client'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
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
} from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import remarkBreaks from 'remark-breaks'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism'

const GET_POST = gql`
  query GetPost($slug: String!) {
    post(slug: $slug) {
      id
      title
      content
      excerpt
      publishedAt
      author {
        name
        email
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
  }
`

const GET_RELATED_POSTS = gql`
  query GetRelatedPosts($categoryId: String!) {
    posts(
      filter: { published: true, categoryId: $categoryId }
      take: 5
    ) {
      id
      title
      slug
      excerpt
      publishedAt
      category {
        name
      }
    }
  }
`

interface BlogPostPageProps {
  params: {
    slug: string
  }
}

export default function BlogPostPage({ params }: BlogPostPageProps) {
  const { toast } = useToast()
  
  const { data, loading, error } = useQuery(GET_POST, {
    variables: { slug: params.slug },
  })

  const { data: relatedData } = useQuery(GET_RELATED_POSTS, {
    variables: {
      categoryId: data?.post?.category?.id,
    },
    skip: !data?.post?.category?.id,
  })

  const post = data?.post
  const relatedPosts = relatedData?.posts?.filter((p: any) => p.id !== post?.id).slice(0, 3) || []

  const shareUrl = typeof window !== 'undefined' ? window.location.href : ''
  const shareTitle = post?.title || ''

  const handleShare = async (platform?: string) => {
    if (platform === 'twitter') {
      window.open(
        `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareTitle)}&url=${encodeURIComponent(shareUrl)}`,
        '_blank'
      )
    } else if (platform === 'facebook') {
      window.open(
        `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
        '_blank'
      )
    } else {
      // 复制链接
      try {
        await navigator.clipboard.writeText(shareUrl)
        toast({
          title: '链接已复制',
          description: '文章链接已复制到剪贴板',
        })
      } catch (err) {
        toast({
          title: '复制失败',
          description: '无法复制链接到剪贴板',
          variant: 'destructive',
        })
      }
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <div className="animate-pulse space-y-6">
              <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded w-1/4"></div>
              <div className="h-12 bg-slate-200 dark:bg-slate-700 rounded w-3/4"></div>
              <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded w-1/2"></div>
              <div className="space-y-3">
                {[...Array(10)].map((_, i) => (
                  <div key={i} className="h-4 bg-slate-200 dark:bg-slate-700 rounded"></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error || !post) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto text-center">
            <div className="text-6xl mb-4">😕</div>
            <h1 className="text-2xl font-bold mb-4">文章未找到</h1>
            <p className="text-slate-600 dark:text-slate-400 mb-8">
              抱歉，您访问的文章不存在或已被删除。
            </p>
            <Link href="/blog">
              <Button>
                <ArrowLeft className="h-4 w-4 mr-2" />
                返回博客列表
              </Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

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
                  <Link href={`/blog?category=${post.category.slug}`}>
                    <Badge className="hover:bg-blue-600 transition-colors cursor-pointer">
                      {post.category.name}
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
                  {post.author.name}
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  {new Date(post.publishedAt).toLocaleDateString('zh-CN', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </div>
                {post.readingTime && (
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {post.readingTime} 分钟阅读
                  </div>
                )}
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
                    {post.tags.map((tag: any) => (
                      <Link key={tag.id} href={`/blog?tag=${tag.slug}`}>
                        <Badge
                          variant="outline"
                          className="hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                          style={{
                            borderColor: tag.color,
                            color: tag.color,
                          }}
                        >
                          {tag.name}
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
                <ReactMarkdown
                  remarkPlugins={[remarkGfm, remarkBreaks]}
                  components={{
                     code({ className, children, ...props }: any) {
                       const match = /language-(\w+)/.exec(className || '')
                       const isInline = !match
                       return !isInline ? (
                         <SyntaxHighlighter
                           style={oneDark as any}
                           language={match[1]}
                           PreTag="div"
                           className="rounded-md"
                         >
                           {String(children).replace(/\n$/, '')}
                         </SyntaxHighlighter>
                       ) : (
                         <code className={className} {...props}>
                           {children}
                         </code>
                       )
                     },
                    // 自定义链接组件，支持内部链接
                    a({ href, children, ...props }) {
                      if (href?.startsWith('/')) {
                        return (
                          <Link href={href} className="text-blue-600 dark:text-blue-400 hover:underline">
                            {children}
                          </Link>
                        )
                      }
                      return (
                        <a
                          href={href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 dark:text-blue-400 hover:underline"
                          {...props}
                        >
                          {children}
                        </a>
                      )
                    },
                    // 自定义图片组件，支持响应式
                    img({ src, alt, ...props }) {
                      return (
                        <img
                          src={src}
                          alt={alt}
                          className="rounded-lg shadow-md max-w-full h-auto"
                          loading="lazy"
                          {...props}
                        />
                      )
                    },
                    // 自定义表格样式
                    table({ children, ...props }) {
                      return (
                        <div className="overflow-x-auto">
                          <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700" {...props}>
                            {children}
                          </table>
                        </div>
                      )
                    },
                    th({ children, ...props }) {
                      return (
                        <th className="px-6 py-3 bg-slate-50 dark:bg-slate-800 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider" {...props}>
                          {children}
                        </th>
                      )
                    },
                    td({ children, ...props }) {
                      return (
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900 dark:text-slate-300" {...props}>
                          {children}
                        </td>
                      )
                    }
                  }}
                >
                  {post.content}
                </ReactMarkdown>
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
                {relatedPosts.map((relatedPost: any, index: number) => (
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
                            {new Date(relatedPost.publishedAt).toLocaleDateString('zh-CN')}
                            {relatedPost.category && (
                              <Badge variant="secondary" className="text-xs">
                                {relatedPost.category.name}
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
  )
}