import { NextRequest, NextResponse } from 'next/server';

// Railway API URL - uses environment variable with fallback
let RAILWAY_API = process.env.NEXT_PUBLIC_FINSIGHT_API || 'https://finsight-production-d5c1.up.railway.app';
// Ensure URL has protocol
if (!RAILWAY_API.startsWith('http://') && !RAILWAY_API.startsWith('https://')) {
  RAILWAY_API = `https://${RAILWAY_API}`;
}
// Remove trailing slash
RAILWAY_API = RAILWAY_API.replace(/\/$/, '');

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const path = searchParams.get('path') || '';
  
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30s timeout
    
    const url = `${RAILWAY_API}${path.startsWith('/') ? path : '/' + path}`;
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      signal: controller.signal,
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      return NextResponse.json(
        { error: `Backend returned ${response.status}` },
        { status: response.status }
      );
    }
    
    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error: any) {
    if (error.name === 'AbortError') {
      return NextResponse.json(
        { error: 'Request timeout - backend took too long to respond' },
        { status: 504 }
      );
    }
    return NextResponse.json(
      { error: `Failed to fetch from backend: ${error.message}` },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const path = searchParams.get('path') || '';
  const body = await request.json();
  
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 600000); // 10min timeout for long-running requests
    
    const url = `${RAILWAY_API}${path.startsWith('/') ? path : '/' + path}`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
      signal: controller.signal,
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      return NextResponse.json(
        { error: `Backend returned ${response.status}` },
        { status: response.status }
      );
    }
    
    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error: any) {
    if (error.name === 'AbortError') {
      return NextResponse.json(
        { error: 'Request timeout - backend took too long to respond' },
        { status: 504 }
      );
    }
    return NextResponse.json(
      { error: `Failed to fetch from backend: ${error.message}` },
      { status: 500 }
    );
  }
}

