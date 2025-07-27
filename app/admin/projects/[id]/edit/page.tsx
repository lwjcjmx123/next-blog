"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useQuery, useMutation } from "@apollo/client";
import { gql } from "@apollo/client";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Save,
  Eye,
  ArrowLeft,
  Briefcase,
  ExternalLink,
  Github,
  Star,
  X,
  Plus,
} from "lucide-react";
import { useAuth } from "@/lib/auth";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { tomorrow } from "react-syntax-highlighter/dist/esm/styles/prism";

const GET_PROJECT = gql`
  query GetProject($id: String!) {
    project(id: $id) {
      id
      title
      slug
      description
      content
      technologies
      githubUrl
      liveUrl
      imageUrl
      featured
      published
    }
  }
`;

const UPDATE_PROJECT = gql`
  mutation UpdateProject($id: String!, $input: ProjectUpdateInput!) {
    updateProject(id: $id, input: $input) {
      id
      slug
    }
  }
`;

export default function EditProjectPage() {
  const { user } = useAuth();
  const router = useRouter();
  const params = useParams();
  const projectId = params.id as string;
  const [isPreview, setIsPreview] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    description: "",
    content: "",
    technologies: [] as string[],
    githubUrl: "",
    liveUrl: "",
    imageUrl: "",
    featured: false,
    published: false,
  });
  const [newTech, setNewTech] = useState("");

  const { data: projectData, loading: projectLoading } = useQuery(GET_PROJECT, {
    variables: { id: projectId },
    onCompleted: (data) => {
      if (data.project) {
        setFormData({
          title: data.project.title,
          slug: data.project.slug,
          description: data.project.description,
          content: data.project.content || "",
          technologies: data.project.technologies || [],
          githubUrl: data.project.githubUrl || "",
          liveUrl: data.project.liveUrl || "",
          imageUrl: data.project.imageUrl || "",
          featured: data.project.featured,
          published: data.project.published,
        });
      }
    },
  });

  const [updateProject, { loading: updating }] = useMutation(UPDATE_PROJECT);

  useEffect(() => {
    if (!user || user.role !== "ADMIN") {
      router.push("/admin/login");
    }
  }, [user, router]);

  const handleSubmit = async (e: React.FormEvent, publish?: boolean) => {
    e.preventDefault();
    
    if (!formData.title || !formData.description) {
      alert("请填写标题和描述");
      return;
    }

    try {
      await updateProject({
        variables: {
          id: projectId,
          input: {
            ...formData,
            published: publish !== undefined ? publish : formData.published,
            content: formData.content || undefined,
            githubUrl: formData.githubUrl || undefined,
            liveUrl: formData.liveUrl || undefined,
            imageUrl: formData.imageUrl || undefined,
          },
        },
      });
      
      router.push("/admin/projects");
    } catch (error) {
      console.error("更新项目失败:", error);
      alert("更新项目失败");
    }
  };

  const handleAddTechnology = () => {
    if (newTech.trim() && !formData.technologies.includes(newTech.trim())) {
      setFormData(prev => ({
        ...prev,
        technologies: [...prev.technologies, newTech.trim()],
      }));
      setNewTech("");
    }
  };

  const handleRemoveTechnology = (tech: string) => {
    setFormData(prev => ({
      ...prev,
      technologies: prev.technologies.filter(t => t !== tech),
    }));
  };

  if (!user || user.role !== "ADMIN") {
    return null;
  }

  if (projectLoading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!projectData?.project) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">项目不存在</h1>
          <Button onClick={() => router.push("/admin/projects")}>返回项目列表</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <div className="container mx-auto px-4 py-8">
        {/* 页面标题 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-4 mb-4">
            <Button variant="outline" onClick={() => router.back()}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              返回
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
                编辑项目
              </h1>
              <p className="text-slate-600 dark:text-slate-400 mt-2">
                编辑项目: {projectData.project.title}
              </p>
            </div>
          </div>
        </motion.div>

        <form onSubmit={(e) => handleSubmit(e)} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* 主要内容 */}
            <div className="lg:col-span-2 space-y-6">
              {/* 基本信息 */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Briefcase className="h-5 w-5" />
                      基本信息
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="title">项目标题 *</Label>
                      <Input
                        id="title"
                        value={formData.title}
                        onChange={(e) =>
                          setFormData(prev => ({ ...prev, title: e.target.value }))
                        }
                        placeholder="输入项目标题"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="slug">URL别名</Label>
                      <Input
                        id="slug"
                        value={formData.slug}
                        onChange={(e) =>
                          setFormData(prev => ({ ...prev, slug: e.target.value }))
                        }
                        placeholder="url-slug"
                      />
                    </div>
                    <div>
                      <Label htmlFor="description">项目描述 *</Label>
                      <Textarea
                        id="description"
                        value={formData.description}
                        onChange={(e) =>
                          setFormData(prev => ({ ...prev, description: e.target.value }))
                        }
                        placeholder="简要描述项目"
                        rows={3}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="imageUrl">项目图片URL</Label>
                      <Input
                        id="imageUrl"
                        value={formData.imageUrl}
                        onChange={(e) =>
                          setFormData(prev => ({ ...prev, imageUrl: e.target.value }))
                        }
                        placeholder="https://example.com/image.jpg"
                      />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* 详细内容 */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle>详细内容</CardTitle>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setIsPreview(!isPreview)}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        {isPreview ? "编辑" : "预览"}
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {isPreview ? (
                      <div className="prose prose-slate dark:prose-invert max-w-none min-h-[400px] p-4 border rounded-md">
                        <ReactMarkdown
                          remarkPlugins={[remarkGfm]}
                          components={{
                            code({ node, inline, className, children, ...props }: any) {
                        const match = /language-(\w+)/.exec(className || "");
                        return !inline && match ? (
                          <SyntaxHighlighter
                            style={tomorrow as any}
                            language={match[1]}
                            PreTag="div"
                            {...props}
                          >
                            {String(children).replace(/\n$/, "")}
                          </SyntaxHighlighter>
                        ) : (
                          <code className={className} {...props}>
                            {children}
                          </code>
                        );
                      },
                          }}
                        >
                          {formData.content || "*暂无内容*"}
                        </ReactMarkdown>
                      </div>
                    ) : (
                      <Textarea
                        value={formData.content}
                        onChange={(e) =>
                          setFormData(prev => ({ ...prev, content: e.target.value }))
                        }
                        placeholder="使用 Markdown 格式编写项目详细介绍..."
                        rows={20}
                        className="font-mono"
                      />
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            {/* 侧边栏 */}
            <div className="space-y-6">
              {/* 发布设置 */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle>发布设置</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex gap-2">
                      <Button
                        type="submit"
                        disabled={updating}
                        className="flex-1"
                      >
                        <Save className="h-4 w-4 mr-2" />
                        保存
                      </Button>
                      {!formData.published && (
                        <Button
                          type="button"
                          onClick={(e) => handleSubmit(e, true)}
                          disabled={updating}
                          className="flex-1"
                        >
                          发布
                        </Button>
                      )}
                      {formData.published && (
                        <Button
                          type="button"
                          onClick={(e) => handleSubmit(e, false)}
                          disabled={updating}
                          variant="outline"
                          className="flex-1"
                        >
                          取消发布
                        </Button>
                      )}
                    </div>
                    <div className="text-sm text-slate-600 dark:text-slate-400">
                      状态: {formData.published ? "已发布" : "草稿"}
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="featured"
                        checked={formData.featured}
                        onChange={(e) =>
                          setFormData(prev => ({ ...prev, featured: e.target.checked }))
                        }
                        className="rounded"
                      />
                      <Label htmlFor="featured" className="flex items-center gap-1">
                        <Star className="h-4 w-4" />
                        设为精选项目
                      </Label>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* 技术栈 */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle>技术栈</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex gap-2">
                      <Input
                        value={newTech}
                        onChange={(e) => setNewTech(e.target.value)}
                        placeholder="添加技术"
                        onKeyPress={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            handleAddTechnology();
                          }
                        }}
                      />
                      <Button
                        type="button"
                        onClick={handleAddTechnology}
                        size="sm"
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {formData.technologies.map((tech, index) => (
                        <Badge
                          key={index}
                          variant="secondary"
                          className="cursor-pointer"
                          onClick={() => handleRemoveTechnology(tech)}
                        >
                          {tech}
                          <X className="h-3 w-3 ml-1" />
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* 链接 */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle>项目链接</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="githubUrl" className="flex items-center gap-1">
                        <Github className="h-4 w-4" />
                        GitHub 仓库
                      </Label>
                      <Input
                        id="githubUrl"
                        value={formData.githubUrl}
                        onChange={(e) =>
                          setFormData(prev => ({ ...prev, githubUrl: e.target.value }))
                        }
                        placeholder="https://github.com/username/repo"
                      />
                    </div>
                    <div>
                      <Label htmlFor="liveUrl" className="flex items-center gap-1">
                        <ExternalLink className="h-4 w-4" />
                        在线预览
                      </Label>
                      <Input
                        id="liveUrl"
                        value={formData.liveUrl}
                        onChange={(e) =>
                          setFormData(prev => ({ ...prev, liveUrl: e.target.value }))
                        }
                        placeholder="https://example.com"
                      />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}