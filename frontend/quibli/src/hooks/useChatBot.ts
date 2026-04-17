import { useState, useCallback, useRef, useEffect } from 'react';
import { Observable } from 'rxjs';
import { scan, tap, finalize } from 'rxjs/operators';

export interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export function useChatBot() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const chatIdRef = useRef<string>(Math.random().toString(36).substring(7));

  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim()) return;

    const userMessage: Message = { role: 'user', content };
    const currentMessages = [...messages, userMessage];
    
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      setMessages(prev => [...prev, { role: 'assistant', content: '' }]);

      // 1. 创建 RxJS Observable 来处理 SSE 流式数据
      // 最佳实践：将副作用（如 fetch 请求）放在 Observable 内部。
      // 这样做的好处是：只有当有人 subscribe（订阅）这个流时，fetch 请求才会真正发出；
      // 当有人 unsubscribe（取消订阅）时，我们可以利用 AbortController 自动中止请求。
      const stream$ = new Observable<string>((subscriber) => {
        // 创建一个中止控制器，用于在取消订阅时打断 fetch 请求
        const abortController = new AbortController();

        // 发起 HTTP 请求
        fetch('http://localhost:3001/api/ai/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            id: chatIdRef.current,
            messages: currentMessages 
          }),
          // 将中止信号绑定到这个请求上
          signal: abortController.signal
        }).then(async (response) => {
          // 检查 HTTP 状态码是否正常
          if (!response.ok) {
            throw new Error('Network response was not ok');
          }

          // 获取响应体的读取器，用于流式读取数据
          const reader = response.body?.getReader();
          // 创建文本解码器，将二进制的 Uint8Array 转换为字符串
          const decoder = new TextDecoder();
          // 创建一个缓冲区，用于暂存不完整的数据块
          let buffer = '';

          // 开启无限循环，不断从流中读取数据
          while (true) {
            // value 是读取到的二进制数据块（Uint8Array），done 表示流是否结束
            const { done, value } = await reader!.read();
            
            // 如果后端已经关闭了连接，跳出循环
            if (done) break;

            // 将二进制数据解码为字符串，{ stream: true } 表示这是一个连续的流，解码器会保留部分状态
            // 然后将新解码的字符串追加到缓冲区中
            buffer += decoder.decode(value, { stream: true });
            
            // SSE 协议规定，每条消息之间用两个换行符 (\n\n) 分隔
            // 我们按 \n\n 将缓冲区中的数据切分成多条完整的消息
            const lines = buffer.split('\n\n');
            
            // 关键点：最后一部分可能是不完整的（比如 JSON 字符串被截断了）
            // 所以我们把数组的最后一项弹出来（pop），重新放回缓冲区中，等待下一次读取拼接
            buffer = lines.pop() || '';

            // 遍历所有已经完整的消息行
            for (const line of lines) {
              // 处理后端发送的自定义结束事件
              if (line.startsWith('event: done')) {
                subscriber.complete(); // 通知订阅者流已结束
                return; // 退出函数
              }
              // 处理后端发送的自定义错误事件
              if (line.startsWith('event: error')) {
                subscriber.error(new Error('Server reported an error')); // 通知订阅者发生错误
                return; // 退出函数
              }
              // 处理标准的数据事件
              if (line.startsWith('data: ')) {
                // 截取 'data: ' 后面的实际内容
                const dataStr = line.slice(6);
                
                // 约定的结束标志
                if (dataStr === '[DONE]') {
                  subscriber.complete(); // 通知订阅者流已结束
                  return; // 退出函数
                }
                
                try {
                  // 尝试将字符串解析为 JSON 对象
                  const parsed = JSON.parse(dataStr);
                  // 如果解析成功且包含 token 字段
                  if (parsed.token) {
                    // 将这个 token 推送给订阅者（即触发下面的 next 回调）
                    subscriber.next(parsed.token); 
                  }
                } catch (e) {
                  // 忽略 JSON 解析错误。
                  // 虽然我们用了 buffer，但极端情况下仍可能出现解析失败，忽略即可，防止整个流崩溃
                }
              }
            }
          }
          // 当 while 循环正常结束（done 为 true）时，通知订阅者流已完成
          subscriber.complete();
        }).catch(err => {
          // 捕获 fetch 过程中的错误
          if (err.name === 'AbortError') {
            // 如果是我们主动取消订阅导致的 AbortError，只打印日志，不作为异常抛出
            console.log('Fetch aborted');
          } else {
            // 其他网络错误，通知订阅者
            subscriber.error(err);
          }
        });

        // 最佳实践：Observable 的清理函数
        // 当外部调用 subscription.unsubscribe() 时，这个函数会被执行
        // 此时我们调用 abort()，浏览器会立刻切断底层的 HTTP TCP 连接，节省资源
        return () => abortController.abort();
      });

      // 2. 订阅 Observable 并使用操作符处理数据
      stream$.subscribe({
        next: (token) => {
          setMessages(prev => {
            const lastIndex = prev.length - 1;
            const updatedMessages = [...prev];
            updatedMessages[lastIndex] = {
              ...updatedMessages[lastIndex],
              content: updatedMessages[lastIndex].content + token
            };
            return updatedMessages;
          });
        },
        error: (err) => {
          console.error('Chat stream error:', err);
          setIsLoading(false); // 发生错误时结束加载状态
        },
        complete: () => {
          setIsLoading(false); // 流结束时结束加载状态
        }
      });
    } catch (error) {
      console.error('Chat error:', error);
      setIsLoading(false);
    }
  }, [messages]);

  return {
    messages,
    setMessages, // 补全导出，解决 Chat.tsx 报错
    sendMessage,
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