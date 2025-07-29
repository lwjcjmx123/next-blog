"use client"

import { motion } from 'framer-motion'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Calendar, Clock, ArrowRight } from 'lucide-react'
import { formatDate } from '@/lib/utils'
import { Post } from '@/lib/data'

interface LatestPostsProps {
  posts: Post[];
}

export function LatestPosts({ posts }: LatestPostsProps) {
  return (
    <section className="py-16 md:py-24 bg-muted/50">
      <div className="container">
        <div className="text-center space-y-4 mb-16">
          <h2 className="text-3xl md:text-4xl font-bold">最新文章</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            分享最新的技术见解和开发经验
          </p>
        </div>
        
        {posts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">暂无文章</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
              {posts.map((post, index) => (
                <motion.div
                  key={post.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="h-full hover:shadow-lg transition-all duration-300 hover:-translate-y-1 group">
                    <CardHeader>
                      <CardTitle className="group-hover:text-primary transition-colors line-clamp-2">
                        {post.title}
                      </CardTitle>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {formatDate(post.date)}
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {post.readingTime} 分钟
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground mb-4 line-clamp-3">
                        {post.excerpt}
                      </p>
                      <div className="flex items-center justify-between">
                        <div className="flex flex-wrap gap-1">
                          {post.tags?.slice(0, 2).map((tag) => (
                            <span
                              key={tag}
                              className="px-2 py-1 bg-muted text-xs rounded-md"
                            >
                              {tag}
                            </span>
                          ))}
                          {post.tags && post.tags.length > 2 && (
                            <span className="px-2 py-1 bg-muted text-xs rounded-md">
                              +{post.tags.length - 2}
                            </span>
                          )}
                        </div>
                        <Link href={`/blog/${post.slug}`}>
                          <Button variant="ghost" size="sm" className="group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                            阅读更多
                            <ArrowRight className="h-4 w-4 ml-1" />
                          </Button>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
            
            <div className="text-center">
              <Link href="/blog">
                <Button size="lg" className="group">
                  查看所有文章
                  <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </div>
          </>
        )}
      </div>
    </section>
  )
}