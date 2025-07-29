import { getPostBySlug, getAllPosts } from '@/lib/data';
import BlogPostClient from './blog-post-client';
import { notFound } from 'next/navigation';

interface BlogPostPageProps {
  params: Promise<{
    slug: string
  }>
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;
  
  // 在服务端获取文章数据
  const post = await getPostBySlug(slug);
  
  if (!post) {
    notFound();
  }
  
  // 获取相关文章（同分类的其他文章）
  const allPosts = getAllPosts();
  const relatedPosts = allPosts
    .filter(p => p.category === post.category && p.slug !== post.slug)
    .slice(0, 3);
  
  return (
    <BlogPostClient post={post} relatedPosts={relatedPosts} />
  );
}

// 生成静态路径
export async function generateStaticParams() {
  const posts = getAllPosts();
  
  return posts.map((post) => ({
    slug: post.slug,
  }));
}