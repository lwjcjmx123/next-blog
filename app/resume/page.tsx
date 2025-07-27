"use client";

import { useQuery } from "@apollo/client";
import { gql } from "@apollo/client";
import { motion } from "framer-motion";
import ReactMarkdown from "react-markdown";
import remarkBreaks from "remark-breaks";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Mail,
  Phone,
  MapPin,
  Globe,
  Github,
  Linkedin,
  Download,
  Calendar,
  Building,
  GraduationCap,
  Award,
  Languages,
  Code,
  Briefcase,
  User,
} from "lucide-react";

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

export default function ResumePage() {
  const { data, loading, error } = useQuery(GET_RESUME);

  const resume = data?.resume;

  const handleDownload = async () => {
    try {
      // 动态导入库以减少初始包大小
      const html2canvas = (await import("html2canvas")).default;
      const jsPDF = (await import("jspdf")).jsPDF;

      // 获取简历内容元素
      const resumeElement = document.getElementById("resume-content");
      if (!resumeElement) {
        console.error("Resume content element not found");
        return;
      }

      // 临时隐藏下载按钮和其他不需要的元素
      const elementsToHide = document.querySelectorAll(
        '[class*="print:hidden"]'
      );
      elementsToHide.forEach((el) => {
        (el as HTMLElement).style.display = "none";
      });

      // 设置canvas选项以获得更好的质量
      const canvas = await html2canvas(resumeElement, {
        scale: 2, // 提高分辨率
        useCORS: true,
        allowTaint: true,
        backgroundColor: "#ffffff",
        width: resumeElement.scrollWidth,
        height: resumeElement.scrollHeight,
        scrollX: 0,
        scrollY: 0,
        x: 0,
        y: 0,
      });

      // 恢复隐藏的元素
      elementsToHide.forEach((el) => {
        (el as HTMLElement).style.display = "";
      });

      // 创建PDF
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      // 计算图片在PDF中的尺寸，减少边距
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;

      // 设置边距（单位：mm）
      const margin = 10;
      const availableWidth = pdfWidth - 2 * margin;
      const availableHeight = pdfHeight - 2 * margin;

      const ratio = Math.min(
        availableWidth / imgWidth,
        availableHeight / imgHeight
      );
      const scaledWidth = imgWidth * ratio;
      const scaledHeight = imgHeight * ratio;

      // 居中显示
      const imgX = (pdfWidth - scaledWidth) / 2;
      const imgY = margin;

      // 如果内容高度超过一页，需要分页处理
      if (scaledHeight > pdfHeight) {
        // 分页处理
        let position = 0;
        const pageHeight = pdfHeight;

        while (position < scaledHeight) {
          if (position > 0) {
            pdf.addPage();
          }

          pdf.addImage(
            imgData,
            "PNG",
            imgX,
            imgY - position,
            scaledWidth,
            scaledHeight
          );

          position += availableHeight;
        }
      } else {
        // 单页处理
        pdf.addImage(imgData, "PNG", imgX, imgY, scaledWidth, scaledHeight);
      }

      // 下载PDF - 使用指定的文件名格式
      const currentDate = new Date().toISOString().split("T")[0];
      const fileName = `刘文俊-web前端-${currentDate}.pdf`;
      pdf.save(fileName);
    } catch (error) {
      console.error("PDF生成失败:", error);
      // 如果PDF生成失败，回退到打印功能
      window.print();
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <div className="animate-pulse space-y-6">
              <div className="h-32 bg-slate-200 dark:bg-slate-700 rounded"></div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2 space-y-4">
                  {[...Array(4)].map((_, i) => (
                    <div
                      key={i}
                      className="h-48 bg-slate-200 dark:bg-slate-700 rounded"
                    ></div>
                  ))}
                </div>
                <div className="space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <div
                      key={i}
                      className="h-32 bg-slate-200 dark:bg-slate-700 rounded"
                    ></div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !resume) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto text-center">
            <div className="text-6xl mb-4">📄</div>
            <h1 className="text-2xl font-bold mb-4">简历暂未发布</h1>
            <p className="text-slate-600 dark:text-slate-400">
              简历内容正在准备中，请稍后再来查看。
            </p>
          </div>
        </div>
      </div>
    );
  }

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
          {/* 页面标题和下载按钮 */}
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
            {/* <Button
              onClick={handleDownload}
              className="flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              下载 PDF
            </Button> */}
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
                        {personalInfo.name || "姓名"}
                      </h1>
                      <p className="text-xl text-blue-600 dark:text-blue-400 mb-4">
                        {personalInfo.title || "职位"}
                      </p>

                      {/* 联系方式 */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-slate-600 dark:text-slate-400">
                        {personalInfo.email && (
                          <div className="flex items-center gap-2">
                            <Mail className="h-4 w-4" />
                            <a
                              href={`mailto:${personalInfo.email}`}
                              className="hover:text-blue-600"
                            >
                              {personalInfo.email}
                            </a>
                          </div>
                        )}
                        {personalInfo.phone && (
                          <div className="flex items-center gap-2">
                            <Phone className="h-4 w-4" />
                            <a
                              href={`tel:${personalInfo.phone}`}
                              className="hover:text-blue-600"
                            >
                              {personalInfo.phone}
                            </a>
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
