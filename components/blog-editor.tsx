'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
// import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ImageUpload } from '@/components/ui/image-upload'
import { Eye, Edit, Image as ImageIcon } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import remarkBreaks from 'remark-breaks'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism'

interface BlogEditorProps {
  initialTitle?: string
  initialContent?: string
  onSave?: (title: string, content: string) => void
  className?: string
}

export function BlogEditor({
  initialTitle = '',
  initialContent = '',
  onSave,
  className = ''
}: BlogEditorProps) {
  const [title, setTitle] = useState(initialTitle)
  const [content, setContent] = useState(initialContent)
  const [activeTab, setActiveTab] = useState('edit')

  const handleImageUpload = (url: string) => {
    // 在光标位置插入图片 Markdown 语法
    const imageMarkdown = `\n![图片描述](${url})\n`
    setContent(prev => prev + imageMarkdown)
  }

  const handleSave = () => {
    if (onSave) {
      onSave(title, content)
    }
  }

  const insertMarkdown = (syntax: string, placeholder: string = '') => {
    const textarea = document.querySelector('textarea') as HTMLTextAreaElement
    if (!textarea) return

    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const selectedText = content.substring(start, end)
    const replacement = selectedText || placeholder
    
    let newText = ''
    if (syntax === 'link') {
      newText = `[${replacement || '链接文本'}](url)`
    } else if (syntax === 'image') {
      newText = `![${replacement || '图片描述'}](图片URL)`
    } else if (syntax === 'code') {
      newText = `\`\`\`\n${replacement || '代码'}\n\`\`\``
    } else {
      newText = `${syntax}${replacement}${syntax}`
    }

    const newContent = content.substring(0, start) + newText + content.substring(end)
    setContent(newContent)
    
    // 重新聚焦并设置光标位置
    setTimeout(() => {
      textarea.focus()
      const newCursorPos = start + newText.length
      textarea.setSelectionRange(newCursorPos, newCursorPos)
    }, 0)
  }

  return (
    <div className={className}>
      <Card>
        <CardHeader>
          <CardTitle>博客编辑器</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* 标题输入 */}
          <div>
            <Label htmlFor="title">文章标题</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="输入文章标题..."
              className="mt-2"
            />
          </div>

          {/* 图片上传区域 */}
          <div>
            <Label className="mb-3 block">图片上传</Label>
            <ImageUpload
              onUpload={handleImageUpload}
              folder="blog-images"
              maxSize={5}
              accept="image/*"
              multiple={true}
            />
          </div>

          {/* 内容编辑区域 */}
          <div>
            <Label className="mb-3 block">文章内容</Label>
            
            <div className="border rounded-lg">
              <div className="flex border-b">
                <button
                  type="button"
                  onClick={() => setActiveTab('edit')}
                  className={`flex items-center gap-2 px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === 'edit'
                      ? 'border-blue-500 text-blue-600 bg-blue-50'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Edit className="h-4 w-4" />
                  编辑
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('preview')}
                  className={`flex items-center gap-2 px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === 'preview'
                      ? 'border-blue-500 text-blue-600 bg-blue-50'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Eye className="h-4 w-4" />
                  预览
                </button>
              </div>
              
              {activeTab === 'edit' && (
                <div className="p-4 space-y-4">
                {/* Markdown 工具栏 */}
                <div className="flex flex-wrap gap-2 p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => insertMarkdown('**', '粗体文本')}
                  >
                    <strong>B</strong>
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => insertMarkdown('*', '斜体文本')}
                  >
                    <em>I</em>
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => insertMarkdown('# ', '标题')}
                  >
                    H1
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => insertMarkdown('## ', '副标题')}
                  >
                    H2
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => insertMarkdown('link')}
                  >
                    链接
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => insertMarkdown('image')}
                  >
                    <ImageIcon className="h-4 w-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => insertMarkdown('code')}
                  >
                    代码
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => insertMarkdown('> ', '引用文本')}
                  >
                    引用
                  </Button>
                </div>
                
                {/* 文本编辑区 */}
                <Textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder={`开始写作...

支持 Markdown 语法：
- **粗体** 或 *斜体*
- # 标题
- [链接](URL)
- ![图片](URL)
- \`\`\`代码块\`\`\`
- > 引用`}
                  className="min-h-[400px] font-mono"
                /></div>
              )}
              
              {activeTab === 'preview' && (
                <Card>
                  <CardContent className="p-6">
                    {title && (
                      <h1 className="text-3xl font-bold mb-6 text-slate-900 dark:text-white">
                        {title}
                      </h1>
                    )}
                    
                    {content ? (
                      <div className="prose prose-slate dark:prose-invert max-w-none
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
                                  className="rounded-lg"
                                >
                                  {String(children).replace(/\n$/, '')}
                                </SyntaxHighlighter>
                              ) : (
                                <code className={className} {...props}>
                                  {children}
                                </code>
                              )
                            },
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
                            table({ children }) {
                              return (
                                <div className="overflow-x-auto">
                                  <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
                                    {children}
                                  </table>
                                </div>
                              )
                            }
                          }}
                        >
                          {content}
                        </ReactMarkdown>
                      </div>
                    ) : (
                      <p className="text-slate-500 dark:text-slate-400 italic">
                        开始写作以查看预览...
                      </p>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>
          </div>

          {/* 保存按钮 */}
          <div className="flex justify-end">
            <Button onClick={handleSave} disabled={!title.trim() || !content.trim()}>
              保存文章
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}