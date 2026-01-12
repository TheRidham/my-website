import { useState, useCallback, useEffect, useRef } from 'react';
import { httpsCallable } from 'firebase/functions';
import { functions } from '@/lib/firebase';
import { usePrompts } from '@/providers/PromptsProvider';
import { streamChatWithSSE, fallbackToCallable } from '@/lib/sse-client';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp?: string;
  _isStreaming?: boolean;
  _streamingId?: string;
}

interface useChatAIOptions {
  functionName?: string;
  systemPrompt?: string;
  initialMessages?: Message[];
  appendGeneralPrompt?: boolean;
  isJaiya?: boolean;
}

const DEFAULT_MESSAGES: Message[] = [];

export const useChatAI = ({
  functionName = 'callOpenAI',
  systemPrompt = "You are Super AI, a helpful AI companion.",
  initialMessages = DEFAULT_MESSAGES,
  appendGeneralPrompt = true,
  isJaiya = false
}: useChatAIOptions = {}) => {
  const { generalPrompt } = usePrompts();
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [isLoading, setIsLoading] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const lastRequestIdRef = useRef<number>(0);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Reset messages when systemPrompt changes
  useEffect(() => {
    setMessages(initialMessages);
    // Invalidate any active request
    lastRequestIdRef.current += 1;
    setIsLoading(false);
    setIsStreaming(false);
    // Abort any ongoing streaming
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
  }, [systemPrompt, initialMessages]);

  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim()) return;

    const userMessage: Message = { role: 'user', content };
    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);
    setError(null);
    
    const requestId = ++lastRequestIdRef.current;
    const combinedPrompt = (systemPrompt && appendGeneralPrompt)
      ? `${systemPrompt}\n\n${generalPrompt?.prompt || ''}` 
      : (systemPrompt || generalPrompt?.prompt || '');

    try {
      const chatWithAI = httpsCallable(functions, functionName);
      const result = await chatWithAI({
        systemPrompt: combinedPrompt,
        formattedMessages: [
          ...messages.map(m => ({
            role: m.role,
            text: m.content
          })),
          { role: 'user', text: content }
        ]
      });

      // Check if this is still the latest request
      if (requestId !== lastRequestIdRef.current) {
        console.warn('useChatAI: Request ID:', requestId, 'was invalidated. Ignoring response.');
        return;
      }

      const data = result.data as { text: string };
      const rawText = data.text;
      
      // Split by ||| and filter out empty strings
      const parts = rawText.split('|||').map(p => p.trim()).filter(p => p.length > 0);
      
      const newAssistantMessages = parts.map(part => ({
        role: 'assistant' as const,
        content: part
      }));
      
      setMessages((prev) => [...prev, ...newAssistantMessages]);
      return rawText;
    } catch (err: any) {
      if (requestId !== lastRequestIdRef.current) return;
      console.error('AI Chat Error:', err);
      setError(err.message || 'Failed to get response from AI');
      return null;
    } finally {
      if (requestId === lastRequestIdRef.current) {
        setIsLoading(false);
      }
    }
  }, [functionName, systemPrompt, messages]);

  const sendMessageStream = useCallback(async (content: string) => {
    if (!content.trim()) return;

    const userMessage: Message = { role: 'user', content };
    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);
    setIsStreaming(true);
    setError(null);

    const requestId = ++lastRequestIdRef.current;
    const combinedPrompt = (systemPrompt && appendGeneralPrompt)
      ? `${systemPrompt}\n\n${generalPrompt?.prompt || ''}`
      : (systemPrompt || generalPrompt?.prompt || '');

    // Create streaming message ID
    const streamingId = `streaming-${Date.now()}`;
    let streamingMessageAdded = false;

    // Abort any previous streaming
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }

    try {
      // Format messages for the API
      const formattedMessages = [
        ...messages.map(m => ({
          role: m.role,
          content: m.content
        })),
        { role: 'user', content }
      ];

      await streamChatWithSSE(
        formattedMessages,
        combinedPrompt,
        {
          onChunk: (chunk) => {
            // Check if this is still the latest request
            if (requestId !== lastRequestIdRef.current) {
              console.warn('sendMessageStream: Request ID:', requestId, 'was invalidated. Ignoring chunk.');
              return;
            }

            // Hide loading indicator on first chunk for non-Jaiya chats
            // For Jaiya, keep loading visible until completion
            if (!streamingMessageAdded && !isJaiya) {
              setIsLoading(false);
            }

            // Add streaming message on first chunk
            if (!streamingMessageAdded) {
              setMessages((prev) => [
                ...prev,
                {
                  role: 'assistant',
                  content: chunk.fullResponse,
                  _isStreaming: true,
                  _streamingId: streamingId
                }
              ]);
              streamingMessageAdded = true;
            } else {
              // Update existing streaming message
              setMessages((prev) =>
                prev.map((msg) =>
                  msg._streamingId === streamingId
                    ? { ...msg, content: chunk.fullResponse }
                    : msg
                )
              );
            }
          },
          onComplete: (fullResponse) => {
            // Check if this is still the latest request
            if (requestId !== lastRequestIdRef.current) {
              console.warn('sendMessageStream: Request ID:', requestId, 'was invalidated. Ignoring completion.');
              return;
            }

            // Remove streaming message and split by |||
            const parts = fullResponse.split('|||').map(p => p.trim()).filter(p => p.length > 0);
            const newAssistantMessages = parts.map(part => ({
              role: 'assistant' as const,
              content: part
            }));

            setMessages((prev) => [
              // Remove the streaming message
              ...prev.filter(msg => msg._streamingId !== streamingId),
              // Add the split messages
              ...newAssistantMessages
            ]);

            setIsStreaming(false);
            setIsLoading(false);
          },
          onError: (error) => {
            // Check if this is still the latest request
            if (requestId !== lastRequestIdRef.current) {
              console.warn('sendMessageStream: Request ID:', requestId, 'was invalidated. Ignoring error.');
              return;
            }

            console.error('sendMessageStream: Streaming error:', error);
            // Remove streaming message if it was added
            setMessages((prev) => prev.filter(msg => msg._streamingId !== streamingId));
            setIsStreaming(false);
            setError(error.error || 'Streaming failed');

            // Fallback to non-streaming
            console.log('sendMessageStream: Falling back to non-streaming API');
            fallbackToCallable(formattedMessages, combinedPrompt, functionName)
              .then((rawText) => {
                if (requestId !== lastRequestIdRef.current) return;

                const parts = rawText.split('|||').map(p => p.trim()).filter(p => p.length > 0);
                const newAssistantMessages = parts.map(part => ({
                  role: 'assistant' as const,
                  content: part
                }));

                setMessages((prev) => [...prev, ...newAssistantMessages]);
                setIsLoading(false);
                setError(null);
              })
              .catch((err) => {
                if (requestId !== lastRequestIdRef.current) return;
                console.error('sendMessageStream: Fallback also failed:', err);
                setError(err.message || 'Failed to get response from AI');
                setIsLoading(false);
              });
          }
        }
      );

      return null; // Return null for consistency with sendMessage
    } catch (err: any) {
      if (requestId !== lastRequestIdRef.current) return;

      console.error('sendMessageStream: Error:', err);
      // Remove streaming message if it was added
      setMessages((prev) => prev.filter(msg => msg._streamingId !== streamingId));
      setIsStreaming(false);
      setError(err.message || 'Failed to stream response');

      // Fallback to non-streaming
      const formattedMessages = [
        ...messages.map(m => ({
          role: m.role,
          content: m.content
        })),
        { role: 'user', content }
      ];

      try {
        const rawText = await fallbackToCallable(formattedMessages, combinedPrompt, functionName);
        if (requestId !== lastRequestIdRef.current) return;

        const parts = rawText.split('|||').map(p => p.trim()).filter(p => p.length > 0);
        const newAssistantMessages = parts.map(part => ({
          role: 'assistant' as const,
          content: part
        }));

        setMessages((prev) => [...prev, ...newAssistantMessages]);
        setError(null);
      } catch (fallbackErr: any) {
        if (requestId !== lastRequestIdRef.current) return;
        setError(fallbackErr.message || 'Failed to get response from AI');
      } finally {
        setIsLoading(false);
      }

      return null;
    }
  }, [systemPrompt, messages, appendGeneralPrompt, generalPrompt, functionName, isJaiya]);

  const clearMessages = useCallback(() => {
    setMessages(initialMessages);
    lastRequestIdRef.current += 1;
    setIsLoading(false);
    setIsStreaming(false);
    // Abort any ongoing streaming
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
  }, [initialMessages]);

  return {
    messages,
    isLoading,
    isStreaming,
    error,
    sendMessage,
    sendMessageStream,
    clearMessages,
    setMessages
  };
};
