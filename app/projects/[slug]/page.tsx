'use client'

import { useQuery } from '@apollo/client'
import { gql } from '@apollo/client'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { 
  ArrowLeft, 
  Github, 
  ExternalLink, 
  Star,
  Calendar,
  Code,
  Zap,
  Globe
} from 'lucide-react'

const GET_PROJECT = gql`
  query GetProject($slug: String!) {
    project(slug: $slug) {
      id
      title
      description
      content
      technologies
      githubUrl
      liveUrl
      imageUrl
      featured
      createdAt
    }
  }
`

const GET_RELATED_PROJECTS = gql`
  query GetRelatedProjects($technologies: [String!]!, $currentProjectId: String!) {
    projects(
      filter: { technologies: $technologies }
      take: 3
    ) {
      id
      title
      slug
      description
      technologies
      imageUrl
      featured
    }
  }
`

interface ProjectPageProps {
  params: {
    slug: string
  }
}

export default function ProjectPage({ params }: ProjectPageProps) {
  const { data, loading, error } = useQuery(GET_PROJECT, {
    variables: { slug: params.slug },
  })

  const { data: relatedData } = useQuery(GET_RELATED_PROJECTS, {
    variables: {
      technologies: data?.project?.technologies || [],
      currentProjectId: data?.project?.id || '',
    },
    skip: !data?.project?.technologies?.length,
  })

  const project = data?.project
  const relatedProjects = relatedData?.projects?.filter((p: any) => p.id !== project?.id) || []

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <div className="animate-pulse space-y-6">
              <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded w-1/4"></div>
              <div className="h-64 bg-slate-200 dark:bg-slate-700 rounded"></div>
              <div className="h-12 bg-slate-200 dark:bg-slate-700 rounded w-3/4"></div>
              <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded w-1/2"></div>
              <div className="space-y-3">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="h-4 bg-slate-200 dark:bg-slate-700 rounded"></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error || !project) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto text-center">
            <div className="text-6xl mb-4">🚀</div>
            <h1 className="text-2xl font-bold mb-4">项目未找到</h1>
            <p className="text-slate-600 dark:text-slate-400 mb-8">
              抱歉，您访问的项目不存在或已被删除。
            </p>
            <Link href="/projects">
              <Button>
                <ArrowLeft className="h-4 w-4 mr-2" />
                返回项目列表
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
            <Link href="/projects">
              <Button variant="ghost" className="hover:bg-slate-200 dark:hover:bg-slate-700">
                <ArrowLeft className="h-4 w-4 mr-2" />
                返回项目列表
              </Button>
            </Link>
          </motion.div>

          {/* 项目主体 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-slate-800 rounded-lg shadow-lg overflow-hidden"
          >
            {/* 项目图片 */}
            <div className="relative h-64 md:h-80 bg-gradient-to-br from-blue-500 to-purple-600 overflow-hidden">
              {project.imageUrl ? (
                <img
                  src={project.imageUrl}
                  alt={project.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-white">
                  <div className="text-center">
                    <div className="text-8xl font-bold mb-4">
                      {project.title.charAt(0)}
                    </div>
                    <div className="text-xl opacity-80">
                      {project.title}
                    </div>
                  </div>
                </div>
              )}
              {project.featured && (
                <div className="absolute top-4 right-4">
                  <Badge className="bg-yellow-500 text-yellow-900 border-yellow-400">
                    <Star className="h-4 w-4 mr-1 fill-current" />
                    精选项目
                  </Badge>
                </div>
              )}
            </div>

            <div className="p-8">
              {/* 项目标题和描述 */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.1 }}
                className="mb-6"
              >
                <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4">
                  {project.title}
                </h1>
                <p className="text-lg text-slate-600 dark:text-slate-300 leading-relaxed">
                  {project.description}
                </p>
              </motion.div>

              {/* 项目元信息 */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="flex flex-wrap items-center gap-4 text-sm text-slate-600 dark:text-slate-400 mb-6"
              >
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  创建于 {new Date(project.createdAt).toLocaleDateString('zh-CN', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </div>
                <div className="flex items-center gap-1">
                  <Code className="h-4 w-4" />
                  {project.technologies.length} 项技术
                </div>
              </motion.div>

              {/* 技术栈 */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="mb-6"
              >
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                  <Zap className="h-5 w-5" />
                  技术栈
                </h3>
                <div className="flex flex-wrap gap-2">
                  {project.technologies.map((tech: string) => (
                    <Badge
                      key={tech}
                      variant="secondary"
                      className="hover:bg-blue-100 dark:hover:bg-blue-900/20 transition-colors"
                    >
                      {tech}
                    </Badge>
                  ))}
                </div>
              </motion.div>

              {/* 操作按钮 */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="flex flex-wrap gap-3 mb-8 pb-6 border-b border-slate-200 dark:border-slate-700"
              >
                {project.githubUrl && (
                  <Button
                    onClick={() => window.open(project.githubUrl, '_blank')}
                    className="flex items-center gap-2"
                  >
                    <Github className="h-4 w-4" />
                    查看源码
                  </Button>
                )}
                {project.liveUrl && (
                  <Button
                    variant="outline"
                    onClick={() => window.open(project.liveUrl, '_blank')}
                    className="flex items-center gap-2"
                  >
                    <Globe className="h-4 w-4" />
                    在线预览
                  </Button>
                )}
                {project.liveUrl && (
                  <Button
                    variant="ghost"
                    onClick={() => window.open(project.liveUrl, '_blank')}
                    className="flex items-center gap-2"
                  >
                    <ExternalLink className="h-4 w-4" />
                    访问网站
                  </Button>
                )}
              </motion.div>

              {/* 项目详细内容 */}
              {project.content && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="mb-8"
                >
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
                    项目详情
                  </h3>
                  <div
                    className="prose prose-slate dark:prose-invert max-w-none
                      prose-headings:text-slate-900 dark:prose-headings:text-white
                      prose-p:text-slate-700 dark:prose-p:text-slate-300
                      prose-a:text-blue-600 dark:prose-a:text-blue-400
                      prose-strong:text-slate-900 dark:prose-strong:text-white
                      prose-code:text-pink-600 dark:prose-code:text-pink-400
                      prose-pre:bg-slate-900 dark:prose-pre:bg-slate-800
                      prose-blockquote:border-blue-500 dark:prose-blockquote:border-blue-400
                      prose-blockquote:text-slate-700 dark:prose-blockquote:text-slate-300"
                    dangerouslySetInnerHTML={{ __html: project.content }}
                  />
                </motion.div>
              )}
            </div>
          </motion.div>

          {/* 相关项目 */}
          {relatedProjects.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="mt-12"
            >
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">
                相关项目
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {relatedProjects.map((relatedProject: any, index: number) => (
                  <motion.div
                    key={relatedProject.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8 + index * 0.1 }}
                  >
                    <Link href={`/projects/${relatedProject.slug}`}>
                      <Card className="h-full hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer group overflow-hidden">
                        {/* 项目图片 */}
                        <div className="relative h-32 bg-gradient-to-br from-blue-500 to-purple-600 overflow-hidden">
                          {relatedProject.imageUrl ? (
                            <img
                              src={relatedProject.imageUrl}
                              alt={relatedProject.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-white text-2xl font-bold">
                              {relatedProject.title.charAt(0)}
                            </div>
                          )}
                          {relatedProject.featured && (
                            <div className="absolute top-2 right-2">
                              <Badge className="bg-yellow-500 text-yellow-900 border-yellow-400 text-xs">
                                <Star className="h-3 w-3 fill-current" />
                              </Badge>
                            </div>
                          )}
                        </div>
                        
                        <CardContent className="p-4">
                          <h3 className="font-semibold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors mb-2 line-clamp-1">
                            {relatedProject.title}
                          </h3>
                          <p className="text-sm text-slate-600 dark:text-slate-400 mb-3 line-clamp-2">
                            {relatedProject.description}
                          </p>
                          <div className="flex flex-wrap gap-1">
                            {relatedProject.technologies.slice(0, 3).map((tech: string) => (
                              <Badge key={tech} variant="secondary" className="text-xs">
                                {tech}
                              </Badge>
                            ))}
                            {relatedProject.technologies.length > 3 && (
                              <Badge variant="secondary" className="text-xs">
                                +{relatedProject.technologies.length - 3}
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