import { useState, useRef, useCallback } from 'react';

export interface Message {
  id: string;
  role: 'user' | 'model';
  content: string;
  timestamp: number;
}

export function useChatBot() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim()) return;

    // 1. Add User Message immediately
    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content,
      timestamp: Date.now(),
    };
    
    setMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);

    // 2. Create placeholder for AI response
    const aiMsgId = (Date.now() + 1).toString();
    setMessages((prev) => [
      ...prev,
      { id: aiMsgId, role: 'model', content: '', timestamp: Date.now() },
    ]);

    try {
      abortControllerRef.current = new AbortController();
      
      // Adjust '/api/ai/chat' to match your actual backend controller route
      const response = await fetch('http://localhost:3001/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
            messages: content,
            // Map history for context if your backend supports it
            history: messages.map(m => ({
                role: m.role,
                parts: [{ text: m.content }]
            }))
        }),
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok || !response.body) {
        throw new Error('Network response was not ok');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let aiText = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        aiText += chunk;

        // Update the specific AI message with new chunk
        setMessages((prev) => 
          prev.map((msg) => 
            msg.id === aiMsgId ? { ...msg, content: aiText } : msg
          )
        );
      }
    } catch (error: any) {
      if (error.name !== 'AbortError') {
        console.error('Stream error:', error);
        setMessages((prev) => 
            prev.map((msg) => 
              msg.id === aiMsgId ? { ...msg, content: msg.content + '\n[Error generating response]' } : msg
            )
          );
      }
    } finally {
      setIsLoading(false);
      abortControllerRef.current = null;
    }
  }, [messages]);

  const stopGeneration = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      setIsLoading(false);
    }
  }, []);

  return {
    messages,
    isLoading,
    sendMessage,
    stopGeneration
  };
}