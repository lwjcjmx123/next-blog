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
  Github,
  ExternalLink,
  Star,
  Filter,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Project } from "@/lib/data";

const PROJECTS_PER_PAGE = 6;

// 预定义的技术栈选项
const TECH_OPTIONS = [
  "React",
  "Next.js",
  "Vue.js",
  "Angular",
  "TypeScript",
  "JavaScript",
  "Node.js",
  "Express",
  "Nest.js",
  "Python",
  "Django",
  "FastAPI",
  "MySQL",
  "PostgreSQL",
  "MongoDB",
  "Redis",
  "GraphQL",
  "REST API",
  "Docker",
  "AWS",
  "Vercel",
  "Tailwind CSS",
  "Sass",
  "Styled Components",
];

interface ProjectsClientProps {
  initialProjects: Project[];
}

export default function ProjectsClient({
  initialProjects,
}: ProjectsClientProps) {
  const [projects] = useState<Project[]>(initialProjects);
  const [filteredProjects, setFilteredProjects] =
    useState<Project[]>(initialProjects);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTechs, setSelectedTechs] = useState<string[]>([]);
  const [showFeaturedOnly, setShowFeaturedOnly] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [showTechFilter, setShowTechFilter] = useState(false);

  // 筛选项目
  useEffect(() => {
    let filtered = projects;

    // 搜索筛选
    if (searchTerm) {
      filtered = filtered.filter(
        (project) =>
          project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          project.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // 技术栈筛选
    if (selectedTechs.length > 0) {
      filtered = filtered.filter((project) =>
        selectedTechs.some((tech) => project.technologies.includes(tech))
      );
    }

    // 精选筛选
    if (showFeaturedOnly) {
      filtered = filtered.filter((project) => project.featured);
    }

    setFilteredProjects(filtered);
    setCurrentPage(1);
  }, [projects, searchTerm, selectedTechs, showFeaturedOnly]);

  const totalProjects = filteredProjects.length;
  const totalPages = Math.ceil(totalProjects / PROJECTS_PER_PAGE);
  const startIndex = (currentPage - 1) * PROJECTS_PER_PAGE;
  const endIndex = startIndex + PROJECTS_PER_PAGE;
  const currentProjects = filteredProjects.slice(startIndex, endIndex);

  const handleTechToggle = (tech: string) => {
    setSelectedTechs((prev) =>
      prev.includes(tech) ? prev.filter((t) => t !== tech) : [...prev, tech]
    );
  };

  const handleSearch = (term: string) => {
    setSearchTerm(term);
  };

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedTechs([]);
    setShowFeaturedOnly(false);
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
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">
            项目展示
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
            探索我的技术项目，从前端应用到全栈解决方案
          </p>
        </motion.div>

        {/* 筛选器 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="h-5 w-5" />
                筛选项目
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* 搜索和精选切换 */}
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                      placeholder="搜索项目标题、描述..."
                      value={searchTerm}
                      onChange={(e) => handleSearch(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant={showFeaturedOnly ? "default" : "outline"}
                    onClick={() => setShowFeaturedOnly(!showFeaturedOnly)}
                    className="flex items-center gap-2"
                  >
                    <Star
                      className={`h-4 w-4 ${
                        showFeaturedOnly ? "fill-current" : ""
                      }`}
                    />
                    精选项目
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setShowTechFilter(!showTechFilter)}
                  >
                    技术筛选
                  </Button>
                </div>
              </div>

              {/* 技术栈筛选 */}
              {showTechFilter && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="border-t pt-4"
                >
                  <h4 className="text-sm font-medium mb-3">技术栈</h4>
                  <div className="flex flex-wrap gap-2">
                    {TECH_OPTIONS.map((tech) => (
                      <Badge
                        key={tech}
                        variant={
                          selectedTechs.includes(tech) ? "default" : "secondary"
                        }
                        className="cursor-pointer hover:scale-105 transition-transform"
                        onClick={() => handleTechToggle(tech)}
                      >
                        {tech}
                      </Badge>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* 已选择的筛选条件 */}
              {(searchTerm || selectedTechs.length > 0 || showFeaturedOnly) && (
                <div className="flex flex-wrap items-center gap-2 pt-2 border-t">
                  <span className="text-sm text-slate-600 dark:text-slate-400">
                    当前筛选：
                  </span>
                  {searchTerm && (
                    <Badge variant="outline">搜索: {searchTerm}</Badge>
                  )}
                  {showFeaturedOnly && (
                    <Badge variant="outline">精选项目</Badge>
                  )}
                  {selectedTechs.map((tech) => (
                    <Badge key={tech} variant="outline">
                      {tech}
                    </Badge>
                  ))}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearFilters}
                    className="text-xs"
                  >
                    清除所有
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* 项目列表 */}
        {currentProjects.length > 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {currentProjects.map((project, index) => (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="h-full hover:shadow-lg transition-all duration-300 hover:-translate-y-1 group overflow-hidden">
                  {/* 项目图片 */}
                  <div className="relative h-48 bg-gradient-to-br from-blue-500 to-purple-600 overflow-hidden">
                    {project.imageUrl ? (
                      <img
                        src={project.imageUrl}
                        alt={project.title}
                        className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300 bg-white"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-white text-6xl font-bold cursor-pointer">
                        {project.title.charAt(0)}
                      </div>
                    )}
                    {project.featured && (
                      <div className="absolute top-3 right-3">
                        <Badge className="bg-yellow-500 text-yellow-900 border-yellow-400">
                          <Star className="h-3 w-3 mr-1 fill-current" />
                          精选
                        </Badge>
                      </div>
                    )}
                  </div>

                  <CardHeader>
                    <Link href={`/projects/${project.slug}`}>
                      <CardTitle className="group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors cursor-pointer">
                        {project.title}
                      </CardTitle>
                    </Link>
                    <CardDescription className="line-clamp-2">
                      {project.description}
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="flex-1 flex flex-col">
                    {/* 技术栈 */}
                    <div className="flex flex-wrap gap-1 mb-4">
                      {project.technologies.slice(0, 4).map((tech) => (
                        <Badge
                          key={tech}
                          variant="secondary"
                          className="text-xs"
                        >
                          {tech}
                        </Badge>
                      ))}
                      {project.technologies.length > 4 && (
                        <Badge variant="secondary" className="text-xs">
                          +{project.technologies.length - 4}
                        </Badge>
                      )}
                    </div>

                    {/* 操作按钮 */}
                    <div className="flex gap-2 mt-auto">
                      {project.githubUrl && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1"
                          onClick={() =>
                            window.open(project.githubUrl, "_blank")
                          }
                        >
                          <Github className="h-4 w-4 mr-2" />
                          源码
                        </Button>
                      )}
                      {project.liveUrl && (
                        <Button
                          size="sm"
                          className="flex-1"
                          onClick={() => window.open(project.liveUrl, "_blank")}
                        >
                          <ExternalLink className="h-4 w-4 mr-2" />
                          预览
                        </Button>
                      )}
                      <Link href={`/projects/${project.slug}`}>
                        <Button variant="ghost" size="sm">
                          详情
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <div className="text-6xl mb-4">🚀</div>
            <h3 className="text-xl font-semibold mb-2">暂无项目</h3>
            <p className="text-slate-600 dark:text-slate-400">
              {searchTerm || selectedTechs.length > 0 || showFeaturedOnly
                ? "没有找到符合条件的项目，请尝试调整筛选条件"
                : "还没有添加任何项目"}
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
              onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
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
  );
}
