import { NextRequest, NextResponse } from 'next/server';
import { updateColumnHandle, getColumnById } from '@/lib/db';

// PATCH /api/columns/[id] - Update column handle
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();
    
    if (!body || typeof body.handle !== 'string') {
      return NextResponse.json(
        { error: 'Missing or invalid handle field' },
        { status: 400 }
      );
    }
    
    const handle = body.handle.trim() || null;
    
    updateColumnHandle(id, handle);
    
    const updatedColumn = getColumnById(id);
    
    return NextResponse.json({
      success: true,
      column: updatedColumn,
    });
    
  } catch (error) {
    console.error('Error updating column:', error);
    return NextResponse.json(
      { error: 'Failed to update column' },
      { status: 500 }
    );
  }
}

// GET /api/columns/[id] - Get column by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const column = getColumnById(id);
    
    if (!column) {
      return NextResponse.json(
        { error: 'Column not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(column);
    
  } catch (error) {
    console.error('Error fetching column:', error);
    return NextResponse.json(
      { error: 'Failed to fetch column' },
      { status: 500 }
    );
  }
}
