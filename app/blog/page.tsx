import { getAllPosts, getAllCategories, getAllTags } from "@/lib/data";
import BlogClient from "./blog-client";

export default function BlogPage() {
  // 在服务端获取数据
  const posts = getAllPosts();
  const categories = getAllCategories();
  const tags = getAllTags();

  return (
    <BlogClient 
      initialPosts={posts}
      initialCategories={categories}
      initialTags={tags}
    />
  );
}
