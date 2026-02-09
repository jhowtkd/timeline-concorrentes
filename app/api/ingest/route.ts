import { NextRequest, NextResponse } from 'next/server';
import { ingestClawdBotData } from '@/lib/db';
import { ClawdBotPayload } from '@/lib/types';

// Rate limiting (simple in-memory store)
const rateLimit = new Map<string, number>();
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute

function checkRateLimit(apiKey: string): boolean {
  const now = Date.now();
  const lastRequest = rateLimit.get(apiKey);
  
  if (lastRequest && now - lastRequest < RATE_LIMIT_WINDOW) {
    return false;
  }
  
  rateLimit.set(apiKey, now);
  return true;
}

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
    
    // Rate limiting
    if (!checkRateLimit(apiKey)) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Max 1 request per minute.' },
        { status: 429 }
      );
    }
    
    // Parse payload
    const payload: ClawdBotPayload = await request.json();
    
    // Validate required fields
    if (!payload.batchId || !payload.scrapedAt || !payload.source || !payload.posts) {
      return NextResponse.json(
        { error: 'Missing required fields: batchId, scrapedAt, source, posts' },
        { status: 400 }
      );
    }
    
    // Check for duplicate batch (idempotency)
    const batchId = request.headers.get('x-batch-id') || payload.batchId;
    
    // Ingest data
    const result = ingestClawdBotData(payload);
    
    return NextResponse.json({
      success: true,
      batchId,
      processed: {
        platform: payload.source.platform,
        handle: payload.source.handle,
        postsReceived: payload.posts.length,
        postsInserted: result.inserted,
        postsUpdated: result.updated,
      },
      errors: result.errors.length > 0 ? result.errors : undefined,
    });
    
  } catch (error) {
    console.error('Ingest error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: String(error) },
      { status: 500 }
    );
  }
}

// Health check endpoint
export async function GET() {
  return NextResponse.json({
    status: 'ok',
    service: 'clawd-ingest-api',
    version: '1.0.0',
  });
}
