import { auth } from '@/lib/firebase';

/**
 * StreamChunk represents a single chunk of the streaming response
 */
export interface StreamChunk {
  content: string;
  fullResponse: string;
}

/**
 * StreamError represents an error during streaming
 */
export interface StreamError {
  error: string;
  code: string;
}

/**
 * Event handlers for SSE streaming lifecycle
 */
export interface StreamingEventHandler {
  onChunk?: (chunk: StreamChunk) => void;
  onComplete?: (fullResponse: string) => void;
  onError?: (error: StreamError) => void;
}

/**
 * Configuration options for streaming
 */
export interface StreamingOptions {
  enabled?: boolean;
  timeout?: number; // in milliseconds
  functionName?: string; // Backend function name to call
}

/**
 * Stream chat responses using Server-Sent Events (SSE)
 *
 * This is a web-compatible implementation using fetch with ReadableStream.
 * Native EventSource doesn't support custom headers (Authorization), so we use fetch.
 * It connects to the existing Firebase streamchatSSE function used by the Android app.
 *
 * @param messages - Array of chat messages with role and content
 * @param systemPrompt - System prompt for the AI
 * @param handlers - Event handlers for stream lifecycle
 * @param options - Configuration options
 */
export async function streamChatWithSSE(
  messages: Array<{ role: string; content: string }>,
  systemPrompt: string,
  handlers: StreamingEventHandler,
  options: StreamingOptions = {}
): Promise<void> {
  const { enabled = true, timeout = 30000 } = options;

  if (!enabled) {
    throw new Error('Streaming is disabled');
  }

  const currentUser = auth.currentUser;
  if (!currentUser) {
    handlers.onError?.({ error: 'User not authenticated', code: 'no_auth' });
    throw new Error('User not authenticated');
  }

  let timeoutId: NodeJS.Timeout | null = null;
  const abortController = new AbortController();

  // Get Firebase ID token
  const idToken = await currentUser.getIdToken();
  console.log('[SSE CLIENT] Auth token acquired');

  // Prepare payload
  const payload = {
    messages,
    systemPrompt,
    functionName: options.functionName || 'streamChatSSE_withMemory',
  };

  console.log('[SSE CLIENT] Using function:', payload.functionName, 'for', options.functionName || 'default');

  // Call Next.js API route (same-origin, no CORS issues)
  const functionUrl = `/api/chat/stream`;
  console.log('[SSE CLIENT] Connecting to API route...');

  // Return a promise that resolves when streaming completes
  return new Promise<void>((resolve, reject) => {
      // Set up timeout protection
      timeoutId = setTimeout(() => {
        console.error('[SSE CLIENT] Connection timeout');
        abortController.abort();
        const timeoutError: StreamError = { error: 'Stream timeout', code: 'timeout' };
        handlers.onError?.(timeoutError);
        reject(new Error(timeoutError.error));
      }, timeout);

      // Wrap the fetch in an async IIFE
      (async () => {
        try {
          console.log('[SSE CLIENT] Initiating POST request...');
          // Use fetch with ReadableStream to handle SSE
          const response = await fetch(functionUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${idToken}`,
              'Accept': 'text/event-stream',
              'Cache-Control': 'no-cache',
            },
            body: JSON.stringify(payload),
            signal: abortController.signal,
          });

          console.log('[SSE CLIENT] Response received:', response.status, response.statusText);

          if (!response.ok) {
            const errorText = await response.text();
            console.error('[SSE CLIENT] HTTP error:', response.status, response.statusText, errorText);
            const error = new Error(`HTTP ${response.status}: ${response.statusText} - ${errorText}`);
            throw error;
          }

          if (timeoutId) {
            clearTimeout(timeoutId);
            timeoutId = null;
          }

          console.log('[SSE CLIENT] Connection opened');

          // Read the stream
          const reader = response.body?.getReader();
          if (!reader) {
            throw new Error('No response body');
          }

          const decoder = new TextDecoder();
          let buffer = '';

          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });

            // Process SSE events line by line
            const lines = buffer.split('\n');
            buffer = lines.pop() || '';

            let currentEvent = '';
            let currentData = '';

            for (const line of lines) {
              if (line.startsWith('event: ')) {
                currentEvent = line.slice(7).trim();
              } else if (line.startsWith('data: ')) {
                currentData = line.slice(6).trim();
              } else if (line === '') {
                // Empty line marks the end of an event
                if (currentEvent && currentData) {
                  try {
                    const data = JSON.parse(currentData);

                    switch (currentEvent) {
                      case 'chunk':
                        console.log('[SSE CLIENT] Chunk received:', data.content?.length || 0, 'chars');
                        handlers.onChunk?.(data as StreamChunk);
                        break;

                      case 'done':
                        console.log('[SSE CLIENT] Stream complete, total chunks:', data.chunks);
                        handlers.onComplete?.(data.fullResponse);
                        abortController.abort();
                        resolve(); // Resolve the promise successfully
                        return; // Exit the IIFE

                      case 'error':
                        console.error('[SSE CLIENT] Error event:', data);
                        const errorData = data as StreamError;
                        // Ensure error has proper message
                        const errorMessage = errorData.error || errorData.code || 'Unknown streaming error';
                        handlers.onError?.({ error: errorMessage, code: errorData.code || 'unknown' });
                        abortController.abort();
                        reject(new Error(errorMessage)); // Reject the promise
                        return; // Exit the IIFE
                    }
                  } catch (parseError) {
                    console.error('[SSE CLIENT] Failed to parse SSE data:', parseError, currentData);
                  }

                  // Reset for next event
                  currentEvent = '';
                  currentData = '';
                }
              }
            }
          }

          // If we get here, stream ended normally without explicit done event
          console.log('[SSE CLIENT] Stream ended normally');
          resolve();

        } catch (error: any) {
          // Abort the fetch if still active
          abortController.abort();

          // Check if this was an abort (timeout or manual)
          if (error.name === 'AbortError') {
            console.log('[SSE CLIENT] Stream aborted');
            resolve(); // Resolve on abort (not an error)
            return;
          }

          console.error('[SSE CLIENT] Fetch error:', error);
          const errorMessage = error?.message || error?.toString() || 'Connection failed';
          handlers.onError?.({ error: errorMessage, code: 'fetch_error' });
          reject(new Error(errorMessage));
        } finally {
          // Cleanup timeout
          if (timeoutId) {
            clearTimeout(timeoutId);
            timeoutId = null;
          }
        }
      })();
    });
}

/**
 * Fallback to non-streaming Firebase callable function
 * This maintains compatibility with existing code
 */
export async function fallbackToCallable(
  messages: Array<{ role: string; content: string }>,
  systemPrompt: string,
  functionName: string = 'callOpenAI'
): Promise<string> {
  const { httpsCallable } = await import('firebase/functions');
  const { functions } = await import('@/lib/firebase');

  const chatWithAI = httpsCallable(functions, functionName);
  const result = await chatWithAI({
    systemPrompt,
    formattedMessages: messages,
  });

  const data = result.data as { text: string };
  return data.text;
}
