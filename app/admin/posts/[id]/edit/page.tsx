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
  FileText,
  Tag,
  FolderOpen,
  X,
} from "lucide-react";
import { useAuth } from "@/lib/auth";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { tomorrow } from "react-syntax-highlighter/dist/esm/styles/prism";

const GET_POST = gql`
  query GetPost($id: String!) {
    post(id: $id) {
      id
      title
      slug
      excerpt
      content
      published
      category {
        id
        name
      }
      tags {
        id
        name
      }
    }
  }
`;

const GET_CATEGORIES_AND_TAGS = gql`
  query GetCategoriesAndTags {
    categories {
      id
      name
    }
    tags {
      id
      name
    }
  }
`;

const UPDATE_POST = gql`
  mutation UpdatePost($id: String!, $input: PostUpdateInput!) {
    updatePost(id: $id, input: $input) {
      id
      slug
    }
  }
`;

export default function EditPostPage() {
  const { user } = useAuth();
  const router = useRouter();
  const params = useParams();
  const postId = params.id as string;
  const [isPreview, setIsPreview] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    excerpt: "",
    content: "",
    published: false,
    categoryId: "",
    tagIds: [] as string[],
  });

  const { data: postData, loading: postLoading } = useQuery(GET_POST, {
    variables: { id: postId },
    onCompleted: (data) => {
      if (data.post) {
        setFormData({
          title: data.post.title,
          slug: data.post.slug,
          excerpt: data.post.excerpt || "",
          content: data.post.content,
          published: data.post.published,
          categoryId: data.post.category?.id || "",
          tagIds: data.post.tags?.map((tag: any) => tag.id) || [],
        });
      }
    },
  });

  const { data: categoriesAndTags } = useQuery(GET_CATEGORIES_AND_TAGS);
  const [updatePost, { loading: updating }] = useMutation(UPDATE_POST);

  useEffect(() => {
    if (!user || user.role !== "ADMIN") {
      router.push("/admin/login");
    }
  }, [user, router]);

  const handleSubmit = async (e: React.FormEvent, publish?: boolean) => {
    e.preventDefault();
    
    if (!formData.title || !formData.content) {
      alert("请填写标题和内容");
      return;
    }

    try {
      await updatePost({
        variables: {
          id: postId,
          input: {
            ...formData,
            published: publish !== undefined ? publish : formData.published,
            categoryId: formData.categoryId || undefined,
            tagIds: formData.tagIds.length > 0 ? formData.tagIds : undefined,
          },
        },
      });
      
      router.push("/admin/posts");
    } catch (error) {
      console.error("更新文章失败:", error);
      alert("更新文章失败");
    }
  };

  const handleTagToggle = (tagId: string) => {
    setFormData(prev => ({
      ...prev,
      tagIds: prev.tagIds.includes(tagId)
        ? prev.tagIds.filter(id => id !== tagId)
        : [...prev.tagIds, tagId],
    }));
  };

  if (!user || user.role !== "ADMIN") {
    return null;
  }

  if (postLoading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!postData?.post) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">文章不存在</h1>
          <Button onClick={() => router.push("/admin/posts")}>返回文章列表</Button>
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
                编辑文章
              </h1>
              <p className="text-slate-600 dark:text-slate-400 mt-2">
                编辑文章: {postData.post.title}
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
                      <FileText className="h-5 w-5" />
                      基本信息
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="title">标题 *</Label>
                      <Input
                        id="title"
                        value={formData.title}
                        onChange={(e) =>
                          setFormData(prev => ({ ...prev, title: e.target.value }))
                        }
                        placeholder="输入文章标题"
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
                      <Label htmlFor="excerpt">摘要</Label>
                      <Textarea
                        id="excerpt"
                        value={formData.excerpt}
                        onChange={(e) =>
                          setFormData(prev => ({ ...prev, excerpt: e.target.value }))
                        }
                        placeholder="文章摘要（可选）"
                        rows={3}
                      />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* 内容编辑 */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle>内容</CardTitle>
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
                        placeholder="使用 Markdown 格式编写文章内容..."
                        rows={20}
                        className="font-mono"
                        required
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
                  </CardContent>
                </Card>
              </motion.div>

              {/* 分类 */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FolderOpen className="h-5 w-5" />
                      分类
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <select
                      value={formData.categoryId}
                      onChange={(e) =>
                        setFormData(prev => ({ ...prev, categoryId: e.target.value }))
                      }
                      className="w-full p-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-800"
                    >
                      <option value="">选择分类</option>
                      {categoriesAndTags?.categories?.map((category: any) => (
                        <option key={category.id} value={category.id}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                  </CardContent>
                </Card>
              </motion.div>

              {/* 标签 */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Tag className="h-5 w-5" />
                      标签
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex flex-wrap gap-2">
                      {categoriesAndTags?.tags?.map((tag: any) => (
                        <Badge
                          key={tag.id}
                          variant={formData.tagIds.includes(tag.id) ? "default" : "outline"}
                          className="cursor-pointer"
                          onClick={() => handleTagToggle(tag.id)}
                        >
                          {tag.name}
                          {formData.tagIds.includes(tag.id) && (
                            <X className="h-3 w-3 ml-1" />
                          )}
                        </Badge>
                      ))}
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