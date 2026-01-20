import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Normal chat endpoint - non-streaming
 * Takes messages and systemPrompt, returns complete response
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { messages, systemPrompt } = body;

    if (!messages || !systemPrompt) {
      return NextResponse.json(
        { error: 'Missing required fields: messages, systemPrompt' },
        { status: 400 }
      );
    }

    const token = request.headers.get('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return NextResponse.json(
        { error: 'Sign in required' },
        { status: 401 }
      );
    }

    console.log('[API ROUTE] Making non-streaming chat request to Firebase...');

    // Call Firebase function with POST + JSON
    const response = await fetch(
      `https://asia-south1-jai-ai-30103.cloudfunctions.net/callOpenAI`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ messages, systemPrompt }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[API ROUTE] Firebase error:', response.status, errorText);
      return NextResponse.json(
        { error: `Firebase error: ${response.status} - ${errorText}` },
        { status: response.status }
      );
    }

    const responseText = await response.text();
    console.log('[API ROUTE] Firebase response received');

    return NextResponse.json(
      { message: responseText },
      { status: 200 }
    );
  } catch (error) {
    console.error('[API ROUTE] Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
