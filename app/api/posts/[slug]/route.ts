import { NextResponse } from 'next/server';
import { getPostBySlug } from '@/lib/data';

interface RouteParams {
  params: {
    slug: string;
  }
}

export async function GET(request: Request, { params }: RouteParams) {
  try {
    const post = await getPostBySlug(params.slug);
    
    if (!post) {
      return NextResponse.json(
        { error: 'Post not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(post);
  } catch (error) {
    console.error('Error fetching post:', error);
    return NextResponse.json(
      { error: 'Failed to fetch post' },
      { status: 500 }
    );
  }
}