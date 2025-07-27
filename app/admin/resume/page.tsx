"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation } from "@apollo/client";
import { gql } from "@apollo/client";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Save,
  Eye,
  User,
  Briefcase,
  GraduationCap,
  Award,
  Languages,
  FileText,
  Target,
  Plus,
  Trash2,
  X,
} from "lucide-react";
import { useAuth } from "@/lib/auth";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { tomorrow } from "react-syntax-highlighter/dist/esm/styles/prism";

const GET_RESUME = gql`
  query GetResume {
    resume {
      id
      data
      createdAt
      updatedAt
    }
  }
`;

const CREATE_RESUME = gql`
  mutation CreateResume($input: ResumeInput!) {
    createResume(input: $input) {
      id
    }
  }
`;

const UPDATE_RESUME = gql`
  mutation UpdateResume($data: String!) {
    updateResume(data: $data) {
      id
    }
  }
`;

export default function ResumePage() {
  const { user } = useAuth();
  const router = useRouter();
  const [isPreview, setIsPreview] = useState(false);
  const [formData, setFormData] = useState({
    personalInfo: {
      name: "",
      email: "",
      phone: "",
      location: "",
      website: "",
      github: "",
      linkedin: ""
    },
    summary: "",
    experience: [] as Array<{
      company: string;
      position: string;
      duration: string;
      description: string;
    }>,
    education: [] as Array<{
      school: string;
      degree: string;
      duration: string;
      description: string;
    }>,
    skills: [] as Array<{
      category: string;
      items: string[];
    }>,
    projects: [] as Array<{
      name: string;
      technologies: string;
      url: string;
      description: string;
    }>,
    certifications: [] as Array<{
      name: string;
      issuer: string;
      date: string;
    }>,
    languages: [] as Array<{
      name: string;
      level: string;
    }>
  });

  const { data: resumeData, loading } = useQuery(GET_RESUME, {
    onCompleted: (data) => {
      if (data.resume) {
        try {
          const resumeJson = JSON.parse(data.resume.data);
          
          // 解析个人信息
          let personalInfo = {
            name: "",
            email: "",
            phone: "",
            location: "",
            website: "",
            github: "",
            linkedin: ""
          };
          
          if (typeof resumeJson.personalInfo === 'object' && resumeJson.personalInfo) {
            personalInfo = { ...personalInfo, ...resumeJson.personalInfo };
          } else if (typeof resumeJson.personalInfo === 'string' && resumeJson.personalInfo) {
            try {
              const parsed = JSON.parse(resumeJson.personalInfo);
              personalInfo = { ...personalInfo, ...parsed };
            } catch {
              // 如果是纯文本，尝试解析为name
              personalInfo.name = resumeJson.personalInfo;
            }
          }
          
          setFormData({
            personalInfo,
            summary: resumeJson.summary || "",
            experience: Array.isArray(resumeJson.experience) ? resumeJson.experience : 
              (resumeJson.experience ? [{ company: "", position: "", duration: "", description: resumeJson.experience }] : []),
            education: Array.isArray(resumeJson.education) ? resumeJson.education : 
              (resumeJson.education ? [{ school: "", degree: "", duration: "", description: resumeJson.education }] : []),
            skills: (() => {
              // 处理数组格式的技能数据
              if (Array.isArray(resumeJson.skills)) {
                return resumeJson.skills.filter((skill: any) => {
                  return skill && typeof skill === 'object' && skill.category && Array.isArray(skill.items);
                }).map((skill: any) => ({
                  category: skill.category,
                  items: skill.items.filter((item: any) => item && String(item).trim())
                }));
              }
              
              return [];
            })(),
            projects: Array.isArray(resumeJson.projects) ? resumeJson.projects : 
              (resumeJson.projects ? [{ name: "", description: resumeJson.projects, technologies: "", url: "" }] : []),
            certifications: Array.isArray(resumeJson.certifications) ? resumeJson.certifications : 
              (resumeJson.certifications ? [{ name: resumeJson.certifications, issuer: "", date: "" }] : []),
            languages: Array.isArray(resumeJson.languages) ? resumeJson.languages : 
              (resumeJson.languages ? resumeJson.languages.split(',').map((l: string) => ({ name: l.trim(), level: "" })) : [])
          });
        } catch (error) {
          console.error("解析简历数据失败:", error);
        }
      }
    },
  });

  const [createResume, { loading: creating }] = useMutation(CREATE_RESUME);
  const [updateResume, { loading: updating }] = useMutation(UPDATE_RESUME);

  useEffect(() => {
    if (!user || user.role !== "ADMIN") {
      router.push("/admin/login");
    }
  }, [user, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // 构建保存的数据结构（技能数据已经是正确的分类格式）
    const dataToSave = {
      ...formData
    };
    
    const resumeJson = JSON.stringify(dataToSave);

    try {
      if (resumeData?.resume) {
        await updateResume({ variables: { data: resumeJson } });
      } else {
        await createResume({ variables: { input: JSON.parse(resumeJson) } });
      }
      alert("简历保存成功！");
    } catch (error) {
      console.error("保存简历失败:", error);
      alert("保存简历失败");
    }
  };

  const generateMarkdownPreview = () => {
    let markdown = "";
    
    // 个人信息
    if (formData.personalInfo && Object.values(formData.personalInfo).some(v => v)) {
      markdown += `# ${formData.personalInfo.name || '姓名'}\n\n`;
      if (formData.personalInfo.email) markdown += `📧 ${formData.personalInfo.email}\n\n`;
      if (formData.personalInfo.phone) markdown += `📱 ${formData.personalInfo.phone}\n\n`;
      if (formData.personalInfo.location) markdown += `📍 ${formData.personalInfo.location}\n\n`;
      if (formData.personalInfo.website) markdown += `🌐 ${formData.personalInfo.website}\n\n`;
      if (formData.personalInfo.github) markdown += `💻 GitHub: ${formData.personalInfo.github}\n\n`;
      if (formData.personalInfo.linkedin) markdown += `💼 LinkedIn: ${formData.personalInfo.linkedin}\n\n`;
    }
    
    // 个人简介
    if (formData.summary) {
      markdown += `## 个人简介\n\n${formData.summary}\n\n`;
    }
    
    // 工作经历
    if (formData.experience.length > 0) {
      markdown += `## 工作经历\n\n`;
      formData.experience.forEach(exp => {
        if (exp.company || exp.position) {
          markdown += `### ${exp.position || '职位'} - ${exp.company || '公司'}\n`;
          if (exp.duration) markdown += `**时间:** ${exp.duration}\n\n`;
          if (exp.description) markdown += `${exp.description}\n\n`;
        }
      });
    }
    
    // 教育背景
    if (formData.education.length > 0) {
      markdown += `## 教育背景\n\n`;
      formData.education.forEach(edu => {
        if (edu.school || edu.degree) {
          markdown += `### ${edu.degree || '学位'} - ${edu.school || '学校'}\n`;
          if (edu.duration) markdown += `**时间:** ${edu.duration}\n\n`;
          if (edu.description) markdown += `${edu.description}\n\n`;
        }
      });
    }
    
    // 技能专长
    if (formData.skills && formData.skills.length > 0) {
      const validSkills = formData.skills.filter(skill => skill && skill.category && skill.category.trim() && skill.items && skill.items.length > 0);
      if (validSkills.length > 0) {
        markdown += `## 技能专长\n\n`;
        validSkills.forEach(skillGroup => {
          markdown += `### ${skillGroup.category.trim()}\n\n`;
          const validItems = skillGroup.items.filter(item => item && item.trim());
          if (validItems.length > 0) {
            validItems.forEach(item => {
              markdown += `- ${item.trim()}\n`;
            });
            markdown += `\n`;
          }
        });
      }
    }
    
    // 项目经历
    if (formData.projects.length > 0) {
      markdown += `## 项目经历\n\n`;
      formData.projects.forEach(project => {
        if (project.name) {
          markdown += `### ${project.name}\n`;
          if (project.technologies) markdown += `**技术栈:** ${project.technologies}\n\n`;
          if (project.url) markdown += `**项目链接:** ${project.url}\n\n`;
          if (project.description) markdown += `${project.description}\n\n`;
        }
      });
    }
    
    // 证书认证
    if (formData.certifications.length > 0) {
      markdown += `## 证书认证\n\n`;
      formData.certifications.forEach(cert => {
        if (cert.name) {
          markdown += `- **${cert.name}**`;
          if (cert.issuer) markdown += ` - ${cert.issuer}`;
          if (cert.date) markdown += ` (${cert.date})`;
          markdown += `\n`;
        }
      });
      markdown += `\n`;
    }
    
    // 语言能力
    if (formData.languages.length > 0) {
      markdown += `## 语言能力\n\n`;
      formData.languages.forEach(lang => {
        if (lang.name) {
          markdown += `- **${lang.name}**`;
          if (lang.level) markdown += ` (${lang.level})`;
          markdown += `\n`;
        }
      });
      markdown += `\n`;
    }
    
    return markdown || "*暂无内容*";
  };

  if (!user || user.role !== "ADMIN") {
    return null;
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
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
                简历管理
              </h1>
              <p className="text-slate-600 dark:text-slate-400 mt-2">
                编辑和管理您的个人简历
              </p>
            </div>
            <div className="flex gap-2 mt-4 sm:mt-0">
              <Button
                variant="outline"
                onClick={() => setIsPreview(!isPreview)}
              >
                <Eye className="h-4 w-4 mr-2" />
                {isPreview ? "编辑" : "预览"}
              </Button>
              <Button asChild>
                <a href="/resume" target="_blank">
                  <FileText className="h-4 w-4 mr-2" />
                  查看简历页面
                </a>
              </Button>
            </div>
          </div>
        </motion.div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
          </div>
        ) : isPreview ? (
          /* 预览模式 */
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>简历预览</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose prose-slate dark:prose-invert max-w-none">
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
                    {generateMarkdownPreview()}
                  </ReactMarkdown>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ) : (
          /* 编辑模式 */
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="columns-1 lg:columns-2 gap-6 space-y-6">
              {/* 个人信息 */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
className="break-inside-avoid"
              >
                <Card className="h-fit">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <User className="h-5 w-5" />
                      个人信息
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="name">姓名</Label>
                        <Input
                          id="name"
                          value={formData.personalInfo.name}
                          onChange={(e) => setFormData(prev => ({
                            ...prev,
                            personalInfo: { ...prev.personalInfo, name: e.target.value }
                          }))}
                          placeholder="请输入姓名"
                        />
                      </div>
                      <div>
                        <Label htmlFor="email">邮箱</Label>
                        <Input
                          id="email"
                          type="email"
                          value={formData.personalInfo.email}
                          onChange={(e) => setFormData(prev => ({
                            ...prev,
                            personalInfo: { ...prev.personalInfo, email: e.target.value }
                          }))}
                          placeholder="请输入邮箱"
                        />
                      </div>
                      <div>
                        <Label htmlFor="phone">电话</Label>
                        <Input
                          id="phone"
                          value={formData.personalInfo.phone}
                          onChange={(e) => setFormData(prev => ({
                            ...prev,
                            personalInfo: { ...prev.personalInfo, phone: e.target.value }
                          }))}
                          placeholder="请输入电话"
                        />
                      </div>
                      <div>
                        <Label htmlFor="location">地址</Label>
                        <Input
                          id="location"
                          value={formData.personalInfo.location}
                          onChange={(e) => setFormData(prev => ({
                            ...prev,
                            personalInfo: { ...prev.personalInfo, location: e.target.value }
                          }))}
                          placeholder="请输入地址"
                        />
                      </div>
                      <div>
                        <Label htmlFor="website">个人网站</Label>
                        <Input
                          id="website"
                          value={formData.personalInfo.website}
                          onChange={(e) => setFormData(prev => ({
                            ...prev,
                            personalInfo: { ...prev.personalInfo, website: e.target.value }
                          }))}
                          placeholder="请输入个人网站"
                        />
                      </div>
                      <div>
                        <Label htmlFor="github">GitHub</Label>
                        <Input
                          id="github"
                          value={formData.personalInfo.github}
                          onChange={(e) => setFormData(prev => ({
                            ...prev,
                            personalInfo: { ...prev.personalInfo, github: e.target.value }
                          }))}
                          placeholder="请输入GitHub链接"
                        />
                      </div>
                      <div>
                        <Label htmlFor="linkedin">LinkedIn</Label>
                        <Input
                          id="linkedin"
                          value={formData.personalInfo.linkedin}
                          onChange={(e) => setFormData(prev => ({
                            ...prev,
                            personalInfo: { ...prev.personalInfo, linkedin: e.target.value }
                          }))}
                          placeholder="请输入LinkedIn链接"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* 个人简介 */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="break-inside-avoid mb-6"
              >
                <Card className="h-fit">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Target className="h-5 w-5" />
                      个人简介
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Textarea
                      value={formData.summary}
                      onChange={(e) =>
                        setFormData(prev => ({ ...prev, summary: e.target.value }))
                      }
                      placeholder="简要介绍您的职业背景、技能特长和职业目标（支持 Markdown 格式）"
                      rows={6}
                      className="font-mono"
                    />
                  </CardContent>
                </Card>
              </motion.div>

              {/* 工作经历 */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="break-inside-avoid mb-6"
              >
                <Card className="h-fit">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Briefcase className="h-5 w-5" />
                      工作经历
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setFormData(prev => ({
                          ...prev,
                          experience: [...prev.experience, { company: '', position: '', duration: '', description: '' }]
                        }))}
                        className="ml-auto"
                      >
                        添加经历
                      </Button>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {formData.experience.map((exp, index) => (
                      <div key={index} className="border border-gray-200 p-4 rounded-lg bg-gray-50">
                        <div className="flex justify-between items-start mb-3">
                          <span className="text-sm font-medium text-gray-600">经历 {index + 1}</span>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => setFormData(prev => ({
                              ...prev,
                              experience: prev.experience.filter((_, i) => i !== index)
                            }))}
                            className="text-red-600 hover:text-red-800"
                          >
                            删除
                          </Button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                          <div>
                            <Label>公司</Label>
                            <Input
                              value={exp.company}
                              onChange={(e) => setFormData(prev => ({
                                ...prev,
                                experience: prev.experience.map((item, i) => 
                                  i === index ? { ...item, company: e.target.value } : item
                                )
                              }))}
                              placeholder="请输入公司名称"
                            />
                          </div>
                          <div>
                            <Label>职位</Label>
                            <Input
                              value={exp.position}
                              onChange={(e) => setFormData(prev => ({
                                ...prev,
                                experience: prev.experience.map((item, i) => 
                                  i === index ? { ...item, position: e.target.value } : item
                                )
                              }))}
                              placeholder="请输入职位"
                            />
                          </div>
                        </div>
                        <div className="mb-3">
                          <Label>时间</Label>
                          <Input
                            value={exp.duration}
                            onChange={(e) => setFormData(prev => ({
                              ...prev,
                              experience: prev.experience.map((item, i) => 
                                i === index ? { ...item, duration: e.target.value } : item
                              )
                            }))}
                            placeholder="例如：2020.01 - 2023.12"
                          />
                        </div>
                        <div>
                          <Label>工作描述</Label>
                          <Textarea
                            value={exp.description}
                            onChange={(e) => setFormData(prev => ({
                              ...prev,
                              experience: prev.experience.map((item, i) => 
                                i === index ? { ...item, description: e.target.value } : item
                              )
                            }))}
                            rows={3}
                            placeholder="请输入工作描述..."
                          />
                        </div>
                      </div>
                    ))}
                    {formData.experience.length === 0 && (
                      <div className="text-center py-8 text-gray-500">
                        暂无工作经历，点击上方"添加经历"按钮开始添加
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>

              {/* 教育背景 */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="break-inside-avoid mb-6"
              >
                <Card className="h-fit">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <GraduationCap className="h-5 w-5" />
                      教育背景
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setFormData(prev => ({
                          ...prev,
                          education: [...prev.education, { school: '', degree: '', duration: '', description: '' }]
                        }))}
                        className="ml-auto"
                      >
                        添加教育经历
                      </Button>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {formData.education.map((edu, index) => (
                      <div key={index} className="border border-gray-200 p-4 rounded-lg bg-gray-50">
                        <div className="flex justify-between items-start mb-3">
                          <span className="text-sm font-medium text-gray-600">教育经历 {index + 1}</span>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => setFormData(prev => ({
                              ...prev,
                              education: prev.education.filter((_, i) => i !== index)
                            }))}
                            className="text-red-600 hover:text-red-800"
                          >
                            删除
                          </Button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                          <div>
                            <Label>学校</Label>
                            <Input
                              value={edu.school}
                              onChange={(e) => setFormData(prev => ({
                                ...prev,
                                education: prev.education.map((item, i) => 
                                  i === index ? { ...item, school: e.target.value } : item
                                )
                              }))}
                              placeholder="请输入学校名称"
                            />
                          </div>
                          <div>
                            <Label>学位/专业</Label>
                            <Input
                              value={edu.degree}
                              onChange={(e) => setFormData(prev => ({
                                ...prev,
                                education: prev.education.map((item, i) => 
                                  i === index ? { ...item, degree: e.target.value } : item
                                )
                              }))}
                              placeholder="请输入学位或专业"
                            />
                          </div>
                        </div>
                        <div className="mb-3">
                          <Label>时间</Label>
                          <Input
                            value={edu.duration}
                            onChange={(e) => setFormData(prev => ({
                              ...prev,
                              education: prev.education.map((item, i) => 
                                i === index ? { ...item, duration: e.target.value } : item
                              )
                            }))}
                            placeholder="例如：2016.09 - 2020.06"
                          />
                        </div>
                        <div>
                          <Label>描述</Label>
                          <Textarea
                            value={edu.description}
                            onChange={(e) => setFormData(prev => ({
                              ...prev,
                              education: prev.education.map((item, i) => 
                                i === index ? { ...item, description: e.target.value } : item
                              )
                            }))}
                            rows={2}
                            placeholder="请输入相关描述..."
                          />
                        </div>
                      </div>
                    ))}
                    {formData.education.length === 0 && (
                      <div className="text-center py-8 text-gray-500">
                        暂无教育经历，点击上方"添加教育经历"按钮开始添加
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>

              {/* 技能专长 */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="break-inside-avoid mb-6"
              >
                <Card className="h-fit">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Award className="h-5 w-5" />
                      技能专长
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setFormData(prev => ({
                          ...prev,
                          skills: [...prev.skills, { category: '', items: [''] }]
                        }))}
                        className="ml-auto"
                      >
                        添加技能分类
                      </Button>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {formData.skills && formData.skills.length > 0 ? formData.skills.map((skillGroup, groupIndex) => (
                      <div key={groupIndex} className="border border-gray-200 p-4 rounded-lg bg-gray-50">
                        <div className="flex justify-between items-start mb-3">
                          <span className="text-sm font-medium text-gray-600">技能分类 {groupIndex + 1}</span>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => setFormData(prev => ({
                              ...prev,
                              skills: prev.skills.filter((_, i) => i !== groupIndex)
                            }))}
                            className="text-red-600 hover:text-red-800"
                          >
                            删除
                          </Button>
                        </div>
                        <div className="space-y-3">
                          <div>
                            <Label>分类名称</Label>
                            <Input
                              value={skillGroup?.category || ''}
                              onChange={(e) => setFormData(prev => ({
                                ...prev,
                                skills: prev.skills.map((item, i) => 
                                  i === groupIndex ? { ...item, category: e.target.value } : item
                                )
                              }))}
                              placeholder="例如：编程语言、框架、工具等"
                            />
                          </div>
                          <div>
                            <Label>技能标签</Label>
                            <div className="space-y-2">
                              <div className="flex flex-wrap gap-2">
                                {(skillGroup?.items || []).map((item, itemIndex) => (
                                  <div key={itemIndex} className="flex items-center gap-1 bg-blue-50 border border-blue-200 rounded-md px-2 py-1">
                                    <Input
                                      value={item}
                                      onChange={(e) => setFormData(prev => ({
                                        ...prev,
                                        skills: prev.skills.map((group, i) => 
                                          i === groupIndex ? {
                                            ...group,
                                            items: group.items.map((itm, j) => j === itemIndex ? e.target.value : itm)
                                          } : group
                                        )
                                      }))}
                                      className="border-0 bg-transparent p-0 h-auto text-sm min-w-[60px] w-auto"
                                      style={{ width: `${Math.max(item.length * 8 + 20, 60)}px` }}
                                      placeholder="技能名称"
                                    />
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="sm"
                                      className="h-4 w-4 p-0 hover:bg-red-100"
                                      onClick={() => setFormData(prev => ({
                                        ...prev,
                                        skills: prev.skills.map((group, i) => 
                                          i === groupIndex ? {
                                            ...group,
                                            items: group.items.filter((_, j) => j !== itemIndex)
                                          } : group
                                        )
                                      }))}
                                    >
                                      ×
                                    </Button>
                                  </div>
                                ))}
                              </div>
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => setFormData(prev => ({
                                  ...prev,
                                  skills: prev.skills.map((group, i) => 
                                    i === groupIndex ? {
                                      ...group,
                                      items: [...group.items, '']
                                    } : group
                                  )
                                }))}
                                className="text-xs"
                              >
                                + 添加技能标签
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    )) : (
                      <div className="text-center py-8 text-gray-500">
                        暂无技能信息，点击上方"添加技能分类"按钮开始添加
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>

              {/* 项目经历 */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="break-inside-avoid mb-6"
              >
                <Card className="h-fit">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Briefcase className="h-5 w-5" />
                      项目经历
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setFormData(prev => ({
                          ...prev,
                          projects: [...prev.projects, { name: '', technologies: '', url: '', description: '' }]
                        }))}
                        className="ml-auto"
                      >
                        添加项目
                      </Button>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {formData.projects.map((project, index) => (
                      <div key={index} className="border border-gray-200 p-4 rounded-lg bg-gray-50">
                        <div className="flex justify-between items-start mb-3">
                          <span className="text-sm font-medium text-gray-600">项目 {index + 1}</span>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => setFormData(prev => ({
                              ...prev,
                              projects: prev.projects.filter((_, i) => i !== index)
                            }))}
                            className="text-red-600 hover:text-red-800"
                          >
                            删除
                          </Button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                          <div>
                            <Label>项目名称</Label>
                            <Input
                              value={project.name}
                              onChange={(e) => setFormData(prev => ({
                                ...prev,
                                projects: prev.projects.map((item, i) => 
                                  i === index ? { ...item, name: e.target.value } : item
                                )
                              }))}
                              placeholder="请输入项目名称"
                            />
                          </div>
                          <div>
                            <Label>技术栈</Label>
                            <Input
                              value={project.technologies}
                              onChange={(e) => setFormData(prev => ({
                                ...prev,
                                projects: prev.projects.map((item, i) => 
                                  i === index ? { ...item, technologies: e.target.value } : item
                                )
                              }))}
                              placeholder="例如：React, Node.js, MongoDB"
                            />
                          </div>
                        </div>
                        <div className="mb-3">
                          <Label>项目链接</Label>
                          <Input
                            value={project.url}
                            onChange={(e) => setFormData(prev => ({
                              ...prev,
                              projects: prev.projects.map((item, i) => 
                                i === index ? { ...item, url: e.target.value } : item
                              )
                            }))}
                            placeholder="请输入项目链接（可选）"
                          />
                        </div>
                        <div>
                          <Label>项目描述</Label>
                          <Textarea
                            value={project.description}
                            onChange={(e) => setFormData(prev => ({
                              ...prev,
                              projects: prev.projects.map((item, i) => 
                                i === index ? { ...item, description: e.target.value } : item
                              )
                            }))}
                            rows={3}
                            placeholder="请输入项目描述..."
                          />
                        </div>
                      </div>
                    ))}
                    {formData.projects.length === 0 && (
                      <div className="text-center py-8 text-gray-500">
                        暂无项目经历，点击上方"添加项目"按钮开始添加
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            <div className="columns-1 lg:columns-2 gap-6 space-y-6">
              {/* 证书认证 */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
                className="break-inside-avoid mb-6"
              >
                <Card className="h-fit">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Award className="h-5 w-5" />
                      证书认证
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setFormData(prev => ({
                          ...prev,
                          certifications: [...prev.certifications, { name: '', issuer: '', date: '' }]
                        }))}
                        className="ml-auto"
                      >
                        添加证书
                      </Button>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {formData.certifications.map((cert, index) => (
                      <div key={index} className="border border-gray-200 p-3 rounded-lg bg-gray-50">
                        <div className="flex justify-between items-start mb-3">
                          <span className="text-sm font-medium text-gray-600">证书 {index + 1}</span>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => setFormData(prev => ({
                              ...prev,
                              certifications: prev.certifications.filter((_, i) => i !== index)
                            }))}
                            className="text-red-600 hover:text-red-800"
                          >
                            删除
                          </Button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                          <div>
                            <Label>证书名称</Label>
                            <Input
                              value={cert.name}
                              onChange={(e) => setFormData(prev => ({
                                ...prev,
                                certifications: prev.certifications.map((item, i) => 
                                  i === index ? { ...item, name: e.target.value } : item
                                )
                              }))}
                              placeholder="请输入证书名称"
                            />
                          </div>
                          <div>
                            <Label>颁发机构</Label>
                            <Input
                              value={cert.issuer}
                              onChange={(e) => setFormData(prev => ({
                                ...prev,
                                certifications: prev.certifications.map((item, i) => 
                                  i === index ? { ...item, issuer: e.target.value } : item
                                )
                              }))}
                              placeholder="请输入颁发机构"
                            />
                          </div>
                          <div>
                            <Label>获得时间</Label>
                            <Input
                              value={cert.date}
                              onChange={(e) => setFormData(prev => ({
                                ...prev,
                                certifications: prev.certifications.map((item, i) => 
                                  i === index ? { ...item, date: e.target.value } : item
                                )
                              }))}
                              placeholder="例如：2023.06"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                    {formData.certifications.length === 0 && (
                      <div className="text-center py-6 text-gray-500">
                        暂无证书认证，点击上方"添加证书"按钮开始添加
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>

              {/* 语言能力 */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
                className="break-inside-avoid mb-6"
              >
                <Card className="h-fit">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Languages className="h-5 w-5" />
                      语言能力
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setFormData(prev => ({
                          ...prev,
                          languages: [...prev.languages, { name: '', level: '' }]
                        }))}
                        className="ml-auto"
                      >
                        添加语言
                      </Button>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {formData.languages.map((lang, index) => (
                      <div key={index} className="border border-gray-200 p-3 rounded-lg bg-gray-50">
                        <div className="flex justify-between items-start mb-3">
                          <span className="text-sm font-medium text-gray-600">语言 {index + 1}</span>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => setFormData(prev => ({
                              ...prev,
                              languages: prev.languages.filter((_, i) => i !== index)
                            }))}
                            className="text-red-600 hover:text-red-800"
                          >
                            删除
                          </Button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div>
                            <Label>语言</Label>
                            <Input
                              value={lang.name}
                              onChange={(e) => setFormData(prev => ({
                                ...prev,
                                languages: prev.languages.map((item, i) => 
                                  i === index ? { ...item, name: e.target.value } : item
                                )
                              }))}
                              placeholder="例如：英语、日语"
                            />
                          </div>
                          <div>
                            <Label>水平</Label>
                            <Input
                              value={lang.level}
                              onChange={(e) => setFormData(prev => ({
                                ...prev,
                                languages: prev.languages.map((item, i) => 
                                  i === index ? { ...item, level: e.target.value } : item
                                )
                              }))}
                              placeholder="例如：流利、母语、基础"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                    {formData.languages.length === 0 && (
                      <div className="text-center py-6 text-gray-500">
                        暂无语言信息，点击上方"添加语言"按钮开始添加
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            {/* 保存按钮 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9 }}
              className="flex justify-center"
            >
              <Button
                type="submit"
                disabled={creating || updating}
                className="px-8"
              >
                <Save className="h-4 w-4 mr-2" />
                {creating || updating ? "保存中..." : "保存简历"}
              </Button>
            </motion.div>
          </form>
        )}
      </div>
    </div>
  );
}