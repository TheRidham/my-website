import { useState, useCallback } from 'react';
import { httpsCallable } from 'firebase/functions';
import { functions } from '@/lib/firebase';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface UseAIChatOptions {
  functionName?: string;
  customSystemPrompt?: string;
  initialMessages?: Message[];
}

export const useAIChat = ({
  functionName = 'callOpenAI',
  customSystemPrompt,
  initialMessages = []
}: UseAIChatOptions = {}) => {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim()) return;

    const userMessage: Message = { role: 'user', content };
    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);
    setError(null);

    try {
      const chatWithAI = httpsCallable(functions, functionName);
      const result = await chatWithAI({
        systemPrompt: customSystemPrompt || "You are Jaiya, a helpful AI companion.",
        formattedMessages: [
          ...messages.map(m => ({
            role: m.role,
            text: m.content
          })),
          { role: 'user', text: content }
        ]
      });

      const data = result.data as { text: string };
      const assistantMessage: Message = { role: 'assistant', content: data.text };
      
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err: any) {
      console.error('AI Chat Error:', err);
      setError(err.message || 'Failed to get response from AI');
    } finally {
      setIsLoading(false);
    }
  }, [functionName, customSystemPrompt, messages]);

  const clearMessages = useCallback(() => {
    setMessages(initialMessages);
  }, [initialMessages]);

  return {
    messages,
    isLoading,
    error,
    sendMessage,
    clearMessages
  };
};
