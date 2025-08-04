import { Hero } from "@/components/hero";
import { LatestPosts } from "@/components/latest-posts";
import { FeaturedProjects } from "@/components/featured-projects";
import { AboutSection } from "@/components/about-section";
import { HomeClientWrapper } from "@/components/home-client";
import { getAllPosts, getAllProjects } from "@/lib/data";

export default async function HomePage() {
  // 在服务端获取数据
  const allPosts = await getAllPosts();
  const allProjects = await getAllProjects();
  
  // 获取最新的3篇文章
  const latestPosts = allPosts
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 3);
  
  // 获取精选项目（前3个）
  const featuredProjects = allProjects
    .filter(project => project.featured)
    .slice(0, 3);

  return (
    <HomeClientWrapper>
      <div className="space-y-16">
        <Hero />
        <AboutSection />
        <LatestPosts posts={latestPosts} />
        <FeaturedProjects projects={featuredProjects} />
      </div>
    </HomeClientWrapper>
  );
}
