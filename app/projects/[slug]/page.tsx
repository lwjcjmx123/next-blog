import { notFound } from 'next/navigation';
import { getProjectBySlug, getAllProjects } from '@/lib/data';
import ProjectDetailClient from './project-detail-client';

interface ProjectPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateStaticParams() {
  const projects = await getAllProjects();
  return projects.map((project) => ({
    slug: project.slug,
  }));
}

export default async function ProjectPage({ params }: ProjectPageProps) {
  const { slug } = await params;
  const project = await getProjectBySlug(slug);
  
  if (!project) {
    notFound();
  }

  // 获取相关项目（基于技术栈相似度）
  const allProjects = await getAllProjects();
  const relatedProjects = allProjects
    .filter(p => p.slug !== project.slug && 
      p.technologies.some(tech => project.technologies.includes(tech)))
    .slice(0, 3);
  
  // 如果相关项目不足3个，用其他项目补充
  if (relatedProjects.length < 3) {
    const otherProjects = allProjects
      .filter(p => p.slug !== project.slug && 
        !p.technologies.some(tech => project.technologies.includes(tech)))
      .slice(0, 3 - relatedProjects.length);
    relatedProjects.push(...otherProjects);
  }

  return (
    <ProjectDetailClient 
      project={project} 
      relatedProjects={relatedProjects}
    />
  );
}