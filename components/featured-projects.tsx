"use client"

import { motion } from 'framer-motion'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ExternalLink, Github, ArrowRight } from 'lucide-react'
import { Project } from '@/lib/data'

interface FeaturedProjectsProps {
  projects: Project[];
}

export function FeaturedProjects({ projects }: FeaturedProjectsProps) {
  return (
    <section className="py-16 md:py-24">
      <div className="container">
        <div className="text-center space-y-4 mb-16">
          <h2 className="text-3xl md:text-4xl font-bold">精选项目</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            展示我最近完成的一些项目，涵盖前端、后端和全栈开发
          </p>
        </div>
        
        {projects.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">暂无项目</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8 mb-12">
              {projects.map((project, index) => (
                <motion.div
                  key={project.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="h-full hover:shadow-lg transition-all duration-300 hover:-translate-y-1 group overflow-hidden">
                    <div className="aspect-video bg-gradient-to-br from-blue-500 to-purple-600 relative overflow-hidden">
                      {project.imageUrl ? (
                        <img
                          src={project.imageUrl}
                          alt={project.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-white text-4xl font-bold">
                          {project.title.charAt(0)}
                        </div>
                      )}
                      {project.featured && (
                        <div className="absolute top-4 right-4">
                          <span className="bg-yellow-500 text-yellow-900 px-2 py-1 rounded-md text-xs font-medium">
                            精选
                          </span>
                        </div>
                      )}
                    </div>
                    
                    <CardHeader>
                      <CardTitle className="group-hover:text-primary transition-colors">
                        {project.title}
                      </CardTitle>
                      <p className="text-muted-foreground text-sm line-clamp-2">
                        {project.description}
                      </p>
                    </CardHeader>
                    
                    <CardContent className="space-y-4">
                      <div className="flex flex-wrap gap-1">
                        {project.technologies.slice(0, 4).map((tech) => (
                          <span
                            key={tech}
                            className="px-2 py-1 bg-muted text-xs rounded-md"
                          >
                            {tech}
                          </span>
                        ))}
                        {project.technologies.length > 4 && (
                          <span className="px-2 py-1 bg-muted text-xs rounded-md">
                            +{project.technologies.length - 4}
                          </span>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {project.githubUrl && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => window.open(project.githubUrl, '_blank')}
                            className="flex-1"
                          >
                            <Github className="h-4 w-4 mr-1" />
                            源码
                          </Button>
                        )}
                        {project.liveUrl && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => window.open(project.liveUrl, '_blank')}
                            className="flex-1"
                          >
                            <ExternalLink className="h-4 w-4 mr-1" />
                            预览
                          </Button>
                        )}
                        <Link href={`/projects/${project.slug}`} className="flex-1">
                          <Button size="sm" className="w-full">
                            详情
                          </Button>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
            
            <div className="text-center">
              <Link href="/projects">
                <Button size="lg" className="group">
                  查看所有项目
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