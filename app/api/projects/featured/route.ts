import { NextResponse } from 'next/server'
import { getFeaturedProjects } from '@/lib/data'

export async function GET() {
  try {
    const projects = await getFeaturedProjects()
    return NextResponse.json(projects)
  } catch (error) {
    console.error('Error fetching featured projects:', error)
    return NextResponse.json(
      { error: 'Failed to fetch featured projects' },
      { status: 500 }
    )
  }
}