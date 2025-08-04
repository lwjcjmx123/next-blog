'use client';

import { MDXRemote, MDXRemoteSerializeResult } from 'next-mdx-remote';
import { serialize } from 'next-mdx-remote/serialize';
import { useEffect, useState } from 'react';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import Twemoji from '@/components/ui/Twemoji';
import Mermaid from '@/components/ui/Mermaid';
import ArchitectureDiagram, { architectureConfigs } from '@/components/ui/ArchitectureDiagram';
import Image from 'next/image';

interface MDXContentProps {
  content: string;
}

const components = {
  h1: (props: any) => (
    <h1 className="text-4xl font-bold mb-6 text-gray-900 dark:text-white" {...props} />
  ),
  h2: (props: any) => (
    <h2 className="text-3xl font-semibold mb-4 mt-8 text-gray-900 dark:text-white" {...props} />
  ),
  h3: (props: any) => (
    <h3 className="text-2xl font-semibold mb-3 mt-6 text-gray-900 dark:text-white" {...props} />
  ),
  p: (props: any) => (
    <p className="mb-4 text-gray-700 dark:text-gray-300 leading-relaxed" {...props} />
  ),
  ul: (props: any) => (
    <ul className="mb-4 ml-6 list-disc text-gray-700 dark:text-gray-300" {...props} />
  ),
  ol: (props: any) => (
    <ol className="mb-4 ml-6 list-decimal text-gray-700 dark:text-gray-300" {...props} />
  ),
  li: (props: any) => (
    <li className="mb-1" {...props} />
  ),
  blockquote: (props: any) => (
    <blockquote className="border-l-4 border-blue-500 pl-4 my-4 italic text-gray-600 dark:text-gray-400" {...props} />
  ),
  code: (props: any) => {
    const { children, className, ...rest } = props;
    const match = /language-(\w+)/.exec(className || '');
    const language = match ? match[1] : '';
    
    // Handle Mermaid diagrams
    if (language === 'mermaid') {
      return <Mermaid chart={String(children).replace(/\n$/, '')} />;
    }
    
    if (className?.includes('language-')) {
      return (
        <SyntaxHighlighter
          style={oneDark as any}
          language={language}
          PreTag="div"
          className="rounded-lg !mt-0 !mb-4"
          customStyle={{
            margin: 0,
            borderRadius: '0.5rem',
            fontSize: '0.875rem',
          }}
        >
          {String(children).replace(/\n$/, '')}
        </SyntaxHighlighter>
      );
    }
    return (
      <code className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded text-sm text-gray-800 dark:text-gray-200" {...rest}>
        {children}
      </code>
    );
  },
  pre: (props: any) => (
    <pre className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4 overflow-x-auto mb-4" {...props} />
  ),
  a: (props: any) => (
    <a className="text-blue-600 dark:text-blue-400 hover:underline" {...props} />
  ),
  strong: (props: any) => (
    <strong className="font-semibold text-gray-900 dark:text-white" {...props} />
  ),
  em: (props: any) => (
    <em className="italic" {...props} />
  ),
  // 表格组件
  table: (props: any) => (
    <div className="overflow-x-auto mb-6">
      <table className="min-w-full border-collapse border border-gray-300 dark:border-gray-600" {...props} />
    </div>
  ),
  thead: (props: any) => (
    <thead className="bg-gray-50 dark:bg-gray-800" {...props} />
  ),
  tbody: (props: any) => (
    <tbody {...props} />
  ),
  tr: (props: any) => (
    <tr className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50" {...props} />
  ),
  th: (props: any) => (
    <th className="px-4 py-3 text-left font-semibold text-gray-900 dark:text-white border-r border-gray-300 dark:border-gray-600 last:border-r-0" {...props} />
  ),
  td: (props: any) => (
    <td className="px-4 py-3 text-gray-700 dark:text-gray-300 border-r border-gray-300 dark:border-gray-600 last:border-r-0" {...props} />
  ),
  // Image component with Next.js optimization
  img: (props: any) => {
    const { src, alt, width, height, ...rest } = props;
    
    // Handle external images or local images
    if (src?.startsWith('http') || src?.startsWith('https')) {
      return (
        <div className="my-6 text-center">
          <img
            src={src}
            alt={alt || ''}
            className="max-w-full h-auto rounded-lg shadow-md mx-auto"
            loading="lazy"
            {...rest}
          />
          {alt && (
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 italic">
              {alt}
            </p>
          )}
        </div>
      );
    }
    
    // For local images, use Next.js Image component
    return (
      <div className="my-6 text-center">
        <Image
          src={src}
          alt={alt || ''}
          width={width || 800}
          height={height || 600}
          className="max-w-full h-auto rounded-lg shadow-md mx-auto"
          {...rest}
        />
        {alt && (
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 italic">
            {alt}
          </p>
        )}
      </div>
    );
  },
  Twemoji,
  Mermaid,
  ArchitectureDiagram,
};

// 导出架构图配置供MDX文件使用
export { architectureConfigs };

export default function MDXContent({ content }: MDXContentProps) {
  const [mdxSource, setMdxSource] = useState<MDXRemoteSerializeResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const serializeContent = async () => {
      try {
        const serialized = await serialize(content, {
          mdxOptions: {
            remarkPlugins: [remarkGfm],
          },
        });
        setMdxSource(serialized);
      } catch (error) {
        console.error('Error serializing MDX content:', error);
      } finally {
        setIsLoading(false);
      }
    };

    serializeContent();
  }, [content]);

  if (isLoading) {
    return (
      <div className="animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
        <div className="h-4 bg-gray-200 rounded w-5/6 mb-4"></div>
      </div>
    );
  }

  if (!mdxSource) {
    return (
      <div className="text-red-500">
        Error loading content
      </div>
    );
  }

  return (
    <div className="prose prose-lg max-w-none dark:prose-invert">
      <MDXRemote {...mdxSource} components={components} />
    </div>
  );
}