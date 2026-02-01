import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Streaming chat endpoint - proxies to Firebase streamChatSSE function
 * Handles CORS by being same-origin, then forwards to Firebase server-to-server
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { messages, systemPrompt, functionName } = body;

    console.log('[API ROUTE] Received payload:', { functionName, messagesCount: messages?.length, hasSystemPrompt: !!systemPrompt });

    if (!messages || !systemPrompt) {
      return NextResponse.json(
        { error: 'Missing required fields: messages, systemPrompt' },
        { status: 400 }
      );
    }

    // Function routing map
    const FUNCTION_URLS: Record<string, string> = {
      streamChatSSE: 'https://asia-south1-jai-ai-30103.cloudfunctions.net/streamChatSSE',
      streamChatSSE_withMemory: 'https://asia-south1-jai-ai-30103.cloudfunctions.net/streamChatSSE_withMemory',
      streamChatSSE_testgpt: 'https://asia-south1-jai-ai-30103.cloudfunctions.net/streamChatSSE_testgpt',
      streamChatSSE_testgpt_noMemory: 'https://asia-south1-jai-ai-30103.cloudfunctions.net/streamChatSSE_testgpt_noMemory',
    };

    const functionUrl = FUNCTION_URLS[functionName] || FUNCTION_URLS.streamChatSSE_withMemory;

    const token = request.headers.get('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return NextResponse.json(
        { error: 'Sign in required' },
        { status: 401 }
      );
    }

    console.log('[API ROUTE] Proxying to Firebase', functionName, '...');

    // Set up timeout (60 seconds to match Firebase function timeout)
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 60000);

    // Call Firebase function with POST + JSON
    const response = await fetch(functionUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ messages, systemPrompt }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[API ROUTE] Firebase error:', response.status, errorText);
      return NextResponse.json(
        { error: `Firebase error: ${response.status} - ${errorText}` },
        { status: response.status }
      );
    }

    console.log('[API ROUTE] Streaming response from Firebase...');

    // Stream the response back to browser
    return new NextResponse(response.body, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (error: any) {
    console.error('[API ROUTE] Error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
