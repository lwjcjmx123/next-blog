import { getAllProjects } from '@/lib/data';
import ProjectsClient from './projects-client';

export default async function ProjectsPage() {
  // 在服务端获取数据
  const projects = await getAllProjects();

  return (
    <ProjectsClient initialProjects={projects} />
  );
}