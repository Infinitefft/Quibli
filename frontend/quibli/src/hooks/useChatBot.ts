import { useState, useCallback, useRef, useEffect } from 'react';
import { Subject, Subscription } from 'rxjs';
import { switchMap, tap, finalize } from 'rxjs/operators';
import { fetchChatStream } from '../api/chatApi';

export interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export function useChatBot() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const chatIdRef = useRef<string>(Math.random().toString(36).substring(7));

  // 1) 用户点发送时 next(messages)，驱动下面 pipe
  const request$ = useRef(new Subject<Message[]>());
  // 2) 保存订阅：卸载 / 停止生成 时要 unsubscribe
  const subscriptionRef = useRef<Subscription | null>(null);

  useEffect(() => {
    subscriptionRef.current = request$.current.pipe(
      // 3) 每次发起新一轮请求前：loading + 占位一条 assistant
      tap(() => {
        setIsLoading(true);
        setMessages((prev) => [...prev, { role: 'assistant', content: '' }]);
      }),
      // 4) 只保留「最后一次」请求：新 next 会取消上一轮 inner（触发 fetch abort）
      switchMap((currentMessages) =>
        // 5) inner 结束 / 报错 / 被取消 都要关 loading（外层 subscribe 的 complete 不会在 Subject 仍存活时因 inner 触发）
        fetchChatStream(chatIdRef.current, currentMessages).pipe(
          finalize(() => setIsLoading(false)),
        ),
      ),
    ).subscribe({
      // 6) 每收到一个 token：拼到最后一条 assistant
      next: (token) => {
        setMessages((prev) => {
          const lastIndex = prev.length - 1;
          const updated = [...prev];
          updated[lastIndex] = {
            ...updated[lastIndex],
            content: updated[lastIndex].content + token,
          };
          return updated;
        });
      },
      // 7) 网络或解析失败（loading 已由 finalize 处理）
      error: (err) => {
        console.error('Chat stream error:', err);
      },
    });

    return () => {
      // 8) 组件卸载：取消订阅 → chatApi 里 abort fetch
      subscriptionRef.current?.unsubscribe();
    };
  }, []);

  const sendMessage = useCallback((content: string) => {
    if (!content.trim() || isLoading) return;

    const userMessage: Message = { role: 'user', content };
    const newMessages = [...messages, userMessage];
    // 1) 先更新列表（用户消息已确定）
    setMessages(newMessages);
    // 2) 再推给 Subject → tap → switchMap → fetch SSE
    request$.current.next(newMessages);
  }, [messages, isLoading]);

  const stopGenerating = useCallback(() => {
    // 1) 断掉当前 inner，触发 fetch abort
    subscriptionRef.current?.unsubscribe();
    // 2) 立刻关 UI loading（finalize 也会跑，双保险）
    setIsLoading(false);
    // 3) 重新挂同一套 pipe，否则之后 next 无人监听
    subscriptionRef.current = request$.current.pipe(
      tap(() => {
        setIsLoading(true);
        setMessages((prev) => [...prev, { role: 'assistant', content: '' }]);
      }),
      switchMap((currentMessages) =>
        fetchChatStream(chatIdRef.current, currentMessages).pipe(
          finalize(() => setIsLoading(false)),
        ),
      ),
    ).subscribe({
      next: (token) => {
        setMessages((prev) => {
          const lastIndex = prev.length - 1;
          const updated = [...prev];
          updated[lastIndex] = {
            ...updated[lastIndex],
            content: updated[lastIndex].content + token,
          };
          return updated;
        });
      },
      error: (err) => {
        console.error('Chat stream error:', err);
      },
    });
  }, []);

  return {
    messages,
    setMessages,
    sendMessage,
    stopGenerating,
    isLoading,
  };
}

export function useAutoScroll(dependencies: any[]) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, dependencies);

  return scrollRef;
}