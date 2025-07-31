import fs from "fs";
import path from "path";
import matter from "gray-matter";

const postsDirectory = path.join(process.cwd(), "data/posts");
const projectsDirectory = path.join(process.cwd(), "data/projects");
const resumeDirectory = path.join(process.cwd(), "data/resume");

export interface Post {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  date: string;
  published: boolean;
  category: string;
  tags: string[];
  author: string;
  content: string;
  readingTime: number;
}

export interface Project {
  id: string;
  title: string;
  slug: string;
  description: string;
  content: string;
  technologies: string[];
  githubUrl?: string;
  liveUrl?: string;
  imageUrl?: string;
  featured: boolean;
  published: boolean;
  createdAt: string;
}

export interface Resume {
  personalInfo: {
    name: string;
    title: string;
    email: string;
    phone: string;
    location: string;
    website?: string;
    github?: string;
    linkedin?: string;
  };
  summary: string;
  experience: Array<{
    company: string;
    position: string;
    startDate: string;
    endDate: string;
    location: string;
    responsibilities: string[];
  }>;
  education: Array<{
    school: string;
    degree: string;
    startDate: string;
    endDate: string;
    location: string;
    description: string;
  }>;
  skills: {
    frontend: string[];
    backend: string[];
    database: string[];
    tools: string[];
    cloud: string[];
  };
  projects: Array<{
    name: string;
    description: string;
    technologies: string[];
    url?: string;
  }>;
  certifications: Array<{
    name: string;
    issuer: string;
    date: string;
    url?: string;
  }>;
  languages: Array<{
    language: string;
    level: string;
  }>;
}

// 获取所有博客文章
export function getAllPosts(): Post[] {
  try {
    const fileNames = fs.readdirSync(postsDirectory);
    const allPostsData = fileNames
      .filter((fileName) => fileName.endsWith(".mdx"))
      .map((fileName) => {
        const id = fileName.replace(/\.mdx$/, "");
        const fullPath = path.join(postsDirectory, fileName);
        const fileContents = fs.readFileSync(fullPath, "utf8");
        const { data, content } = matter(fileContents);

        return {
          id,
          content,
          ...data,
        } as Post;
      })
      .filter((post) => post.published)
      .sort((a, b) => (a.date < b.date ? 1 : -1));
    return allPostsData;
  } catch (error) {
    console.error("Error reading posts:", error);
    return [];
  }
}

// 根据 slug 获取单篇文章
export function getPostBySlug(slug: string): Post | null {
  try {
    const posts = getAllPosts();
    return posts.find((post) => post.slug === slug) || null;
  } catch (error) {
    console.error("Error getting post by slug:", error);
    return null;
  }
}

// 获取所有项目
export function getAllProjects(): Project[] {
  try {
    // 首先尝试从 MDX 文件读取
    const mdxProjects = getAllProjectsFromMDX();
    if (mdxProjects.length > 0) {
      return mdxProjects;
    }
    
    // 如果没有 MDX 文件，则从 JSON 文件读取
    const filePath = path.join(projectsDirectory, "projects.json");
    const fileContents = fs.readFileSync(filePath, "utf8");
    const projects = JSON.parse(fileContents) as Project[];

    return projects
      .filter((project) => project.published)
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
  } catch (error) {
    console.error("Error reading projects:", error);
    return [];
  }
}

// 从 MDX 文件读取所有项目
function getAllProjectsFromMDX(): Project[] {
  try {
    const files = fs.readdirSync(projectsDirectory);
    const mdxFiles = files.filter((file) => file.endsWith('.mdx'));
    
    if (mdxFiles.length === 0) {
      return [];
    }
    
    const projects: Project[] = mdxFiles.map((file) => {
      const filePath = path.join(projectsDirectory, file);
      const fileContents = fs.readFileSync(filePath, "utf8");
      const { data, content } = matter(fileContents);
      
      const slug = data.slug || file.replace('.mdx', '');
      
      return {
        id: slug,
        title: data.title,
        slug: slug,
        description: data.description,
        content: content,
        technologies: data.technologies || [],
        githubUrl: data.githubUrl,
        liveUrl: data.liveUrl,
        imageUrl: data.imageUrl,
        featured: data.featured || false,
        published: data.published !== false,
        createdAt: data.createdAt,
      };
    });
    
    return projects
      .filter((project) => project.published)
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
  } catch (error) {
    console.error("Error reading MDX projects:", error);
    return [];
  }
}

// 根据 slug 获取单个项目
export function getProjectBySlug(slug: string): Project | null {
  try {
    // 首先尝试从 MDX 文件读取
    const mdxProject = getProjectFromMDX(slug);
    if (mdxProject) {
      return mdxProject;
    }
    
    // 如果没有对应的 MDX 文件，则从 JSON 数据中查找
    const projects = getAllProjects();
    return projects.find((project) => project.slug === slug) || null;
  } catch (error) {
    console.error("Error getting project by slug:", error);
    return null;
  }
}

// 从 MDX 文件读取单个项目
function getProjectFromMDX(slug: string): Project | null {
  try {
    const filePath = path.join(projectsDirectory, `${slug}.mdx`);
    
    if (!fs.existsSync(filePath)) {
      return null;
    }
    
    const fileContents = fs.readFileSync(filePath, "utf8");
    const { data, content } = matter(fileContents);
    
    return {
      id: data.slug || slug,
      title: data.title,
      slug: data.slug,
      description: data.description,
      content: content,
      technologies: data.technologies || [],
      githubUrl: data.githubUrl,
      liveUrl: data.liveUrl,
      imageUrl: data.imageUrl,
      featured: data.featured || false,
      published: data.published !== false,
      createdAt: data.createdAt,
    };
  } catch (error) {
    console.error("Error reading MDX project:", error);
    return null;
  }
}

// 获取精选项目
export function getFeaturedProjects(): Project[] {
  try {
    const projects = getAllProjects();
    return projects.filter((project) => project.featured);
  } catch (error) {
    console.error("Error getting featured projects:", error);
    return [];
  }
}

// 获取简历数据
export function getResume(): {
  id: string;
  data: string;
  updatedAt: string;
} | null {
  try {
    const filePath = path.join(resumeDirectory, "resume.json");
    const fileContents = fs.readFileSync(filePath, "utf8");
    const resumeData = JSON.parse(fileContents) as Resume;

    // 获取文件修改时间
    const stats = fs.statSync(filePath);

    return {
      id: "1",
      data: JSON.stringify(resumeData),
      updatedAt: stats.mtime.toISOString(),
    };
  } catch (error) {
    console.error("Error reading resume:", error);
    return null;
  }
}

// 获取最新文章
export function getLatestPosts(limit: number = 3): Post[] {
  try {
    const posts = getAllPosts();
    return posts.slice(0, limit);
  } catch (error) {
    console.error("Error getting latest posts:", error);
    return [];
  }
}

// 获取所有分类
export function getAllCategories(): string[] {
  try {
    const posts = getAllPosts();
    const categoriesSet = new Set(posts.map((post) => post.category));
    const categories = Array.from(categoriesSet);
    return categories.sort();
  } catch (error) {
    console.error("Error getting categories:", error);
    return [];
  }
}

// 获取所有标签
export function getAllTags(): string[] {
  try {
    const posts = getAllPosts();
    const tagsSet = new Set(posts.flatMap((post) => post.tags));
    const tags = Array.from(tagsSet);
    return tags.sort();
  } catch (error) {
    console.error("Error getting tags:", error);
    return [];
  }
}

// 根据分类筛选文章
export function getPostsByCategory(category: string): Post[] {
  try {
    const posts = getAllPosts();
    return posts.filter((post) => post.category === category);
  } catch (error) {
    console.error("Error getting posts by category:", error);
    return [];
  }
}

// 根据标签筛选文章
export function getPostsByTag(tag: string): Post[] {
  try {
    const posts = getAllPosts();
    return posts.filter((post) => post.tags.includes(tag));
  } catch (error) {
    console.error("Error getting posts by tag:", error);
    return [];
  }
}
