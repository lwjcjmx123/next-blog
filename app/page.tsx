import { Hero } from "@/components/hero";
import { LatestPosts } from "@/components/latest-posts";
import { FeaturedProjects } from "@/components/featured-projects";
import { AboutSection } from "@/components/about-section";

export default function HomePage() {
  return (
    <div className="space-y-16">
      <Hero />
      <AboutSection />
      <LatestPosts />
      <FeaturedProjects />
    </div>
  );
}
