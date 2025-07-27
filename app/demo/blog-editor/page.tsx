'use client'

import { BlogEditor } from '@/components/blog-editor'
import { useToast } from '@/hooks/use-toast'

export default function BlogEditorDemo() {
  const { toast } = useToast()

  const handleSave = (title: string, content: string) => {
    // 这里可以调用 API 保存文章
    console.log('保存文章:', { title, content })
    
    toast({
      title: '保存成功',
      description: `文章 "${title}" 已保存`,
    })
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            博客编辑器演示
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            这是一个集成了 Vercel Blob 图片上传功能的 Markdown 博客编辑器
          </p>
        </div>
        
        <BlogEditor
          initialTitle="我的第一篇博客"
          initialContent={`# 欢迎使用博客编辑器

这是一个功能强大的 Markdown 编辑器，支持：

## 主要功能

- **实时预览**：编辑和预览模式切换
- **图片上传**：拖拽或点击上传图片到 Vercel Blob
- **Markdown 语法**：完整支持 Markdown 语法
- **代码高亮**：支持多种编程语言的语法高亮
- **响应式设计**：适配各种屏幕尺寸

## 代码示例

\`\`\`javascript
function hello() {
  console.log('Hello, World!');
}
\`\`\`

## 表格支持

| 功能 | 状态 | 描述 |
|------|------|------|
| 图片上传 | ✅ | 支持拖拽上传到 Vercel Blob |
| 代码高亮 | ✅ | 支持多种编程语言 |
| 实时预览 | ✅ | 编辑和预览模式切换 |

## 引用

> 这是一个引用示例。你可以使用引用来突出重要信息。

开始创作你的内容吧！`}
          onSave={handleSave}
          className="w-full"
        />
      </div>
    </div>
  )
}