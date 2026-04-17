import { Observable } from 'rxjs';
import type { Message } from '@/hooks/useChatBot';

/** POST 聊天接口，响应体为 SSE；返回「token 字符串」流（需订阅后才发请求） */
export function fetchChatStream(chatId: string, messages: Message[]): Observable<string> {
  return new Observable<string>((subscriber) => {
    // 1) 用于取消 fetch（与 RxJS unsubscribe 联动）
    const abortController = new AbortController();

    // 2) 发起请求；body 与后端 ChatDto 对齐
    fetch('http://localhost:3001/api/ai/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: chatId, messages }),
      signal: abortController.signal,
    })
      .then(async (response) => {
        // 3) HTTP 层失败则走 catch → subscriber.error
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }

        // 4) 取可读流，按块读 SSE 原始字节
        const reader = response.body?.getReader();
        const decoder = new TextDecoder();
        // 5) 行缓冲：TCP 可能把半行拆在两包，不能立刻 JSON.parse
        let buffer = '';

        while (true) {
          const { done, value } = await reader!.read();
          // 6) 流结束：跳出循环，后面 complete
          if (done) break;

          // 7) 二进制 → 文本；stream:true 保留多字节字符边界
          buffer += decoder.decode(value, { stream: true });

          // 8) Nest SSE 常见按行输出；用 \n 切完整行
          const lines = buffer.split('\n');
          // 9) 最后一项可能缺换行，留到下次 read 再拼
          buffer = lines.pop() || '';

          for (const line of lines) {
            // 10) 只处理标准 data 行（忽略空行、id: 等扩展字段）
            if (!line.startsWith('data: ')) continue;

            const dataStr = line.slice(6);
            try {
              const parsed = JSON.parse(dataStr);
              // 11) 与后端 MessageEvent.data 形状一致：{ token }
              if (parsed.token) {
                subscriber.next(parsed.token);
              }
            } catch {
              // 12) 半行 JSON：等下一轮 buffer 补齐
            }
          }
        }
        // 13) 正常读完 HTTP body
        subscriber.complete();
      })
      .catch((err) => {
        // 14) 主动 abort：视为正常结束，不 error
        if (err?.name === 'AbortError') {
          subscriber.complete();
          return;
        }
        subscriber.error(err);
      });

    // 15) Observable 被 unsubscribe：中止 fetch，触发上面 AbortError 分支
    return () => abortController.abort();
  });
}
