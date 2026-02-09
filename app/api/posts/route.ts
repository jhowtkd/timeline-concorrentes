import { NextRequest, NextResponse } from 'next/server';
import { getPostsByBoard, getPostsByColumn } from '@/lib/db';

// GET /api/posts?boardId=xxx&columnId=yyy
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const boardId = searchParams.get('boardId');
    const columnId = searchParams.get('columnId');
    const limit = parseInt(searchParams.get('limit') || '50');
    
    if (columnId) {
      const posts = getPostsByColumn(columnId, limit);
      return NextResponse.json(posts);
    }
    
    if (boardId) {
      const posts = getPostsByBoard(boardId, limit);
      return NextResponse.json(posts);
    }
    
    return NextResponse.json(
      { error: 'Missing required parameter: boardId or columnId' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Error fetching posts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch posts' },
      { status: 500 }
    );
  }
}
