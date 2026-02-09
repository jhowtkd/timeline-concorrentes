import { NextRequest, NextResponse } from 'next/server';

// This endpoint is for manual testing only
// It queues a request for ClawdBot to scrape a specific target

interface ForceUpdateRequest {
  target: string;
  depth?: number;
}

// Simple queue (in-memory for now, could be Redis in production)
const scrapeQueue: Array<{ target: string; depth: number; requestedAt: string }> = [];

export async function POST(request: NextRequest) {
  try {
    // Check API key
    const authHeader = request.headers.get('authorization');
    const expectedKey = process.env.CLAUDBOT_API_KEY;
    
    if (!expectedKey) {
      return NextResponse.json(
        { error: 'Server not configured: CLAUDBOT_API_KEY not set' },
        { status: 500 }
      );
    }
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Missing or invalid Authorization header' },
        { status: 401 }
      );
    }
    
    const apiKey = authHeader.slice(7);
    
    if (apiKey !== expectedKey) {
      return NextResponse.json(
        { error: 'Invalid API key' },
        { status: 401 }
      );
    }
    
    // Parse request
    const body: ForceUpdateRequest = await request.json();
    
    if (!body.target) {
      return NextResponse.json(
        { error: 'Missing required field: target' },
        { status: 400 }
      );
    }
    
    // Validate target URL or handle
    const target = body.target;
    const depth = Math.min(body.depth || 20, 50); // Max 50 posts
    
    // Add to queue
    const job = {
      target,
      depth,
      requestedAt: new Date().toISOString(),
    };
    
    scrapeQueue.push(job);
    
    // In a real implementation, this would:
    // 1. Send a webhook to ClawdBot
    // 2. Or queue in a message broker (Redis, SQS, etc.)
    // 3. ClawdBot would then process and POST to /api/ingest
    
    return NextResponse.json({
      success: true,
      message: 'Scrape request queued',
      job,
      queuePosition: scrapeQueue.length,
      note: 'ClawdBot should check this queue and process the request',
    });
    
  } catch (error) {
    console.error('Force update error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: String(error) },
      { status: 500 }
    );
  }
}

// Get queue status
export async function GET() {
  return NextResponse.json({
    queueLength: scrapeQueue.length,
    recentJobs: scrapeQueue.slice(-5),
  });
}
