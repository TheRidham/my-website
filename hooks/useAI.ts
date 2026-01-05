import { useState, useCallback, useEffect, useRef } from 'react';
import { httpsCallable } from 'firebase/functions';
import { functions } from '@/lib/firebase';
import { usePrompts } from '@/providers/PromptsProvider';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface useChatAIOptions {
  functionName?: string;
  systemPrompt?: string;
  initialMessages?: Message[];
  appendGeneralPrompt?: boolean;
}

const DEFAULT_MESSAGES: Message[] = [];

export const useChatAI = ({
  functionName = 'callOpenAI',
  systemPrompt = "You are Jaiya, a helpful AI companion.",
  initialMessages = DEFAULT_MESSAGES,
  appendGeneralPrompt = true
}: useChatAIOptions = {}) => {
  const { generalPrompt } = usePrompts();
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const lastRequestIdRef = useRef<number>(0);

  // Reset messages when systemPrompt changes
  useEffect(() => {
    setMessages(initialMessages);
    // Invalidate any active request
    lastRequestIdRef.current += 1;
    setIsLoading(false);
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

  const clearMessages = useCallback(() => {
    setMessages(initialMessages);
    lastRequestIdRef.current += 1;
    setIsLoading(false);
  }, [initialMessages]);

  return {
    messages,
    isLoading,
    error,
    sendMessage,
    clearMessages
  };
};
