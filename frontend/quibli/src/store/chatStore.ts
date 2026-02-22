import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

// 定义消息类型，与 useChatBot 保持一致
interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

interface ChatState {
  storedMessages: Message[];
  setStoredMessages: (messages: Message[]) => void;
  clearStoredMessages: () => void;
}

export const useChatStore = create<ChatState>()(
  persist(
    (set) => ({
      storedMessages: [],
      
      // 严格迁移逻辑
      setStoredMessages: (messages: Message[]) => set({ 
        storedMessages: messages 
      }),

      clearStoredMessages: () => set({ 
        storedMessages: [] 
      }),
    }),
    {
      name: 'qlib-chat-history',
      storage: createJSONStorage(() => localStorage),
    }
  )
);