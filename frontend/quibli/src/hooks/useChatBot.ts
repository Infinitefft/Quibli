import { useState, useCallback, useRef, useEffect } from 'react';

export interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

// --- Logic Hook (Unchanged) ---
export function useChatBot() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  // 使用 ref 维护一个会话 ID，确保一组对话使用同一个 ID
  const chatIdRef = useRef<string>(Math.random().toString(36).substring(7));

  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim()) return;

    const userMessage: Message = { role: 'user', content };
    const currentMessages = [...messages, userMessage];
    
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const response = await fetch('http://localhost:3001/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          id: chatIdRef.current, // 补全后端要求的 id 字段
          messages: currentMessages 
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Validation Error:', errorData);
        throw new Error('Network response was not ok');
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      
      setMessages(prev => [...prev, { role: 'assistant', content: '' }]);

      let accumulatedContent = '';

      while (true) {
        const { done, value } = await reader!.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        accumulatedContent += chunk;

        setMessages(prev => {
          const lastIndex = prev.length - 1;
          const updatedMessages = [...prev];
          updatedMessages[lastIndex] = {
            ...updatedMessages[lastIndex],
            content: accumulatedContent
          };
          return updatedMessages;
        });
      }
    } catch (error) {
      console.error('Chat error:', error);
    } finally {
      setIsLoading(false);
    }
  }, [messages]);

  return {
    messages,
    sendMessage,
    isLoading,
  };
}

// --- Responsive/UI Hooks ---

/**
 * Automatically scrolls to the bottom of a container when dependencies change.
 */
export function useAutoScroll(dependencies: any[]) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, dependencies);

  return scrollRef;
}