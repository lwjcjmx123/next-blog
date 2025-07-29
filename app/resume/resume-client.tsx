"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import ReactMarkdown from "react-markdown";
import remarkBreaks from "remark-breaks";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Globe,
  Github,
  Linkedin,
  Briefcase,
  Code,
  GraduationCap,
  Award,
  Languages,
  Calendar,
  Building,
  Eye,
  EyeOff,
  Copy,
  Check,
} from "lucide-react";

// Base64 编码/解码组件
interface ProtectedTextProps {
  text: string;
  className?: string;
  href?: string;
}

function ProtectedText({ text, className, href }: ProtectedTextProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [decodedText, setDecodedText] = useState("");
  const [copied, setCopied] = useState(false);

  // Base64 编码文本
  const encodedText = btoa(encodeURIComponent(text));

  useEffect(() => {
    if (isVisible && !decodedText) {
      try {
        const decoded = decodeURIComponent(atob(encodedText));
        setDecodedText(decoded);
      } catch (error) {
        console.error("解码失败:", error);
        setDecodedText(text);
      }
    }
  }, [isVisible, encodedText, text, decodedText]);

  const displayText = isVisible ? decodedText : "***";

  const handleCopy = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(decodedText || text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("复制失败:", error);
    }
  };

  const toggleVisibility = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsVisible(!isVisible);
  };

  const content = (
    <div className="flex items-center gap-2">
      {href ? (
        <a
          href={isVisible ? href : "#"}
          className={className}
          onClick={isVisible ? undefined : (e) => e.preventDefault()}
        >
          {displayText}
        </a>
      ) : (
        <span className={className}>{displayText}</span>
      )}
      <button
        onClick={toggleVisibility}
        className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors"
        title={isVisible ? "隐藏信息" : "显示信息"}
      >
        {isVisible ? (
          <EyeOff className="h-3 w-3 text-gray-500" />
        ) : (
          <Eye className="h-3 w-3 text-gray-500" />
        )}
      </button>
      {isVisible && (
        <button
          onClick={handleCopy}
          className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors"
          title="复制信息"
        >
          {copied ? (
            <Check className="h-3 w-3 text-green-500" />
          ) : (
            <Copy className="h-3 w-3 text-gray-500" />
          )}
        </button>
      )}
    </div>
  );

  return content;
}

interface Resume {
  id: string;
  data: string;
  updatedAt: string;
}

interface ResumeClientProps {
  resume: Resume;
}

export default function ResumeClient({ resume }: ResumeClientProps) {
  let resumeData: any = {};
  try {
    resumeData = JSON.parse(resume.data || "{}");
  } catch (error) {
    console.error("Failed to parse resume data:", error);
  }

  const personalInfo = resumeData?.personalInfo || {};
  const experience = resumeData?.experience || [];
  const education = resumeData?.education || [];
  const skills = resumeData?.skills || [];
  const projects = resumeData?.projects || [];
  const certifications = resumeData?.certifications || [];
  const languages = resumeData?.languages || [];
  const summary = resumeData?.summary || "";

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 print:bg-white">
      <div className="container mx-auto px-4 py-8 print:px-0 print:py-0">
        <div className="max-w-4xl mx-auto">
          {/* 页面标题 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-between items-center mb-8 print:hidden"
          >
            <div>
              <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                在线简历
              </h1>
              <p className="text-slate-600 dark:text-slate-300 mt-2">
                最后更新：
                {new Date(resume.updatedAt).toLocaleDateString("zh-CN")}
              </p>
            </div>
          </motion.div>

          {/* 简历内容开始 */}
          <div id="resume-content">
            {/* 个人信息头部 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card className="mb-8 print:shadow-none print:border-0">
                <CardContent className="p-8">
                  <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
                    {/* 头像 */}
                    <div className="w-32 h-32 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-4xl font-bold flex-shrink-0">
                      {personalInfo.avatar ? (
                        <img
                          src={personalInfo.avatar}
                          alt={personalInfo.name}
                          className="w-full h-full rounded-full object-cover"
                        />
                      ) : (
                        <User className="h-16 w-16" />
                      )}
                    </div>

                    {/* 基本信息 */}
                    <div className="flex-1 text-center md:text-left">
                      <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-2">
                        {personalInfo.name ? (
                          <ProtectedText
                            text={personalInfo.name}
                            className=""
                          />
                        ) : (
                          "姓名"
                        )}
                      </h1>
                      <p className="text-xl text-blue-600 dark:text-blue-400 mb-4">
                        {personalInfo.title || "职位"}
                      </p>

                      {/* 联系方式 */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-slate-600 dark:text-slate-400">
                        {personalInfo.email && (
                          <div className="flex items-center gap-2">
                            <Mail className="h-4 w-4 flex-shrink-0" />
                            <ProtectedText
                              text={personalInfo.email}
                              href={`mailto:${personalInfo.email}`}
                              className="hover:text-blue-600"
                            />
                          </div>
                        )}
                        {personalInfo.phone && (
                          <div className="flex items-center gap-2">
                            <Phone className="h-4 w-4 flex-shrink-0" />
                            <ProtectedText
                              text={personalInfo.phone}
                              href={`tel:${personalInfo.phone}`}
                              className="hover:text-blue-600"
                            />
                          </div>
                        )}
                        {personalInfo.location && (
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4" />
                            <span>{personalInfo.location}</span>
                          </div>
                        )}
                        {personalInfo.website && (
                          <div className="flex items-center gap-2">
                            <Globe className="h-4 w-4" />
                            <a
                              href={personalInfo.website}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="hover:text-blue-600"
                            >
                              个人网站
                            </a>
                          </div>
                        )}
                        {personalInfo.github && (
                          <div className="flex items-center gap-2">
                            <Github className="h-4 w-4" />
                            <a
                              href={personalInfo.github}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="hover:text-blue-600"
                            >
                              GitHub
                            </a>
                          </div>
                        )}
                        {personalInfo.linkedin && (
                          <div className="flex items-center gap-2">
                            <Linkedin className="h-4 w-4" />
                            <a
                              href={personalInfo.linkedin}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="hover:text-blue-600"
                            >
                              LinkedIn
                            </a>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* 主要内容 */}
              <div className="lg:col-span-2 space-y-8">
                {/* 个人简介 */}
                {summary && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    <Card className="print:shadow-none print:border-0">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <User className="h-5 w-5" />
                          个人简介
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                          {summary}
                        </p>
                      </CardContent>
                    </Card>
                  </motion.div>
                )}

                {/* 工作经历 */}
                {experience.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    <Card className="print:shadow-none print:border-0">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Briefcase className="h-5 w-5" />
                          工作经历
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        {experience.map((exp: any, index: number) => (
                          <div
                            key={index}
                            className="border-l-2 border-blue-500 pl-4 pb-4 last:pb-0"
                          >
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-2">
                              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                                {exp.position}
                              </h3>
                              <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                                <Calendar className="h-4 w-4" />
                                {exp.startDate} - {exp.endDate || "至今"}
                              </div>
                            </div>
                            <div className="flex items-center gap-2 mb-3">
                              <Building className="h-4 w-4 text-slate-500" />
                              <span className="text-blue-600 dark:text-blue-400 font-medium">
                                {exp.company}
                              </span>
                              {exp.location && (
                                <>
                                  <span className="text-slate-400">•</span>
                                  <span className="text-slate-600 dark:text-slate-400">
                                    {exp.location}
                                  </span>
                                </>
                              )}
                            </div>
                            {exp.description && (
                              <div className="mb-3 prose prose-sm max-w-none prose-slate dark:prose-invert prose-p:text-slate-700 dark:prose-p:text-slate-300 prose-strong:text-slate-900 dark:prose-strong:text-white prose-ul:text-slate-700 dark:prose-ul:text-slate-300">
                                <ReactMarkdown remarkPlugins={[remarkBreaks]}>
                                  {exp.description}
                                </ReactMarkdown>
                              </div>
                            )}
                            {exp.achievements &&
                              exp.achievements.length > 0 && (
                                <ul className="list-disc list-inside space-y-1 text-slate-700 dark:text-slate-300">
                                  {exp.achievements.map(
                                    (achievement: string, i: number) => (
                                      <li key={i}>{achievement}</li>
                                    )
                                  )}
                                </ul>
                              )}
                            {exp.technologies &&
                              exp.technologies.length > 0 && (
                                <div className="flex flex-wrap gap-1 mt-3">
                                  {exp.technologies.map((tech: string) => (
                                    <Badge
                                      key={tech}
                                      variant="secondary"
                                      className="text-xs"
                                    >
                                      {tech}
                                    </Badge>
                                  ))}
                                </div>
                              )}
                          </div>
                        ))}
                      </CardContent>
                    </Card>
                  </motion.div>
                )}

                {/* 项目经历 */}
                {projects.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                  >
                    <Card className="print:shadow-none print:border-0">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Code className="h-5 w-5" />
                          项目经历
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        {projects.map((project: any, index: number) => (
                          <div
                            key={index}
                            className="border-l-2 border-purple-500 pl-4 pb-4 last:pb-0"
                          >
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-2">
                              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                                {project.name}
                              </h3>
                              <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                                <Calendar className="h-4 w-4" />
                                {project.startDate} -{" "}
                                {project.endDate || "至今"}
                              </div>
                            </div>
                            {project.role && (
                              <p className="text-purple-600 dark:text-purple-400 font-medium mb-2">
                                {project.role}
                              </p>
                            )}
                            {project.description && (
                              <div className="mb-3 prose prose-sm max-w-none prose-slate dark:prose-invert prose-p:text-slate-700 dark:prose-p:text-slate-300 prose-strong:text-slate-900 dark:prose-strong:text-white prose-ul:text-slate-700 dark:prose-ul:text-slate-300">
                                <ReactMarkdown remarkPlugins={[remarkBreaks]}>
                                  {project.description}
                                </ReactMarkdown>
                              </div>
                            )}
                            {project.achievements &&
                              project.achievements.length > 0 && (
                                <ul className="list-disc list-inside space-y-1 text-slate-700 dark:text-slate-300 mb-3">
                                  {project.achievements.map(
                                    (achievement: string, i: number) => (
                                      <li key={i}>{achievement}</li>
                                    )
                                  )}
                                </ul>
                              )}
                            {project.technologies &&
                              project.technologies.length > 0 && (
                                <div className="flex flex-wrap gap-1">
                                  {project.technologies.map((tech: string) => (
                                    <Badge
                                      key={tech}
                                      variant="outline"
                                      className="text-xs"
                                    >
                                      {tech}
                                    </Badge>
                                  ))}
                                </div>
                              )}
                          </div>
                        ))}
                      </CardContent>
                    </Card>
                  </motion.div>
                )}
              </div>

              {/* 侧边栏 */}
              <div className="space-y-8">
                {/* 技能 */}
                {skills.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 }}
                  >
                    <Card className="print:shadow-none print:border-0">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Code className="h-5 w-5" />
                          技能
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {skills.map((skillGroup: any, index: number) => (
                          <div key={index}>
                            <h4 className="font-medium text-slate-900 dark:text-white mb-2">
                              {skillGroup.category || skillGroup.name || "技能"}
                            </h4>
                            <div className="flex flex-wrap gap-1">
                              {(
                                skillGroup.items || [
                                  skillGroup.name || skillGroup,
                                ]
                              )
                                .filter(Boolean)
                                .map((skill: string, skillIndex: number) => (
                                  <Badge
                                    key={`${skill}-${skillIndex}`}
                                    variant="secondary"
                                    className="text-xs"
                                  >
                                    {skill}
                                  </Badge>
                                ))}
                            </div>
                          </div>
                        ))}
                      </CardContent>
                    </Card>
                  </motion.div>
                )}

                {/* 教育背景 */}
                {education.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.6 }}
                  >
                    <Card className="print:shadow-none print:border-0">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <GraduationCap className="h-5 w-5" />
                          教育背景
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {education.map((edu: any, index: number) => (
                          <div key={index}>
                            <h4 className="font-medium text-slate-900 dark:text-white">
                              {edu.degree}
                            </h4>
                            <p className="text-blue-600 dark:text-blue-400 text-sm">
                              {edu.school}
                            </p>
                            <p className="text-slate-600 dark:text-slate-400 text-sm">
                              {edu.startDate} - {edu.endDate}
                            </p>
                            {edu.gpa && (
                              <p className="text-slate-600 dark:text-slate-400 text-sm">
                                GPA: {edu.gpa}
                              </p>
                            )}
                          </div>
                        ))}
                      </CardContent>
                    </Card>
                  </motion.div>
                )}

                {/* 证书 */}
                {certifications.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.7 }}
                  >
                    <Card className="print:shadow-none print:border-0">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Award className="h-5 w-5" />
                          证书
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        {certifications.map((cert: any, index: number) => (
                          <div key={index}>
                            <h4 className="font-medium text-slate-900 dark:text-white text-sm">
                              {cert.name}
                            </h4>
                            <p className="text-blue-600 dark:text-blue-400 text-sm">
                              {cert.issuer}
                            </p>
                            <p className="text-slate-600 dark:text-slate-400 text-xs">
                              {cert.date}
                            </p>
                          </div>
                        ))}
                      </CardContent>
                    </Card>
                  </motion.div>
                )}

                {/* 语言 */}
                {languages.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.8 }}
                  >
                    <Card className="print:shadow-none print:border-0">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Languages className="h-5 w-5" />
                          语言能力
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        {languages.map((lang: any, index: number) => (
                          <div key={index}>
                            <h4 className="font-medium text-slate-900 dark:text-white text-sm">
                              {lang.name || lang.language}
                            </h4>
                            <p className="text-slate-600 dark:text-slate-400 text-sm">
                              {lang.level}
                            </p>
                          </div>
                        ))}
                      </CardContent>
                    </Card>
                  </motion.div>
                )}
              </div>
            </div>
            {/* 简历内容结束 */}
          </div>
        </div>
      </div>
    </div>
  );
}