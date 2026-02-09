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
    const { messages, systemPrompt, functionName, tools } = body;

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
      streamChatSSE_withMemory_tooltest: 'https://asia-south1-jai-ai-30103.cloudfunctions.net/streamChatSSE_withMemory_tooltest',
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
      body: JSON.stringify({
        messages,
        systemPrompt,
        ...(tools ? { tools } : {}),
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json(
        { error: `Firebase error: ${response.status} - ${errorText}` },
        { status: response.status }
      );
    }

    // Create a transform stream to log and forward the SSE stream
    const reader = response.body?.getReader();
    const encoder = new TextEncoder();
    const decoder = new TextDecoder();

    const transformStream = new ReadableStream({
      async start(controller) {
        try {
          let buffer = '';
          let chunkIndex = 0;

          while (true) {
            const { done, value } = await reader!.read();
            if (done) break;

            const text = decoder.decode(value, { stream: true });
            buffer += text;

            controller.enqueue(encoder.encode(text));
          }

          controller.close();
        } catch (error) {
          console.error('[API ROUTE] Transform stream error:', error);
          controller.error(error);
        }
      },
    });

    return new NextResponse(transformStream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (error: any) {
    // AbortError is expected when tool calls (MCQ) are received - not a real error
    if (error.name === 'AbortError') {
      console.log('[API ROUTE] Stream aborted (tool call received)');
      return new NextResponse(null, { status: 200 });
    }

    console.error('[API ROUTE] Error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
