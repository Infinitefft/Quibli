import { Injectable } from '@nestjs/common';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { Message } from './dto/chat.dto';

@Injectable()
export class AIService {
  private genAI: GoogleGenerativeAI;

  constructor() {
    // 从环境变量获取配置
    // 使用 ! 断言 process.env.GEMINI_API_KEY 不为 undefined
    this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
  }

  async chat(messages: Message[], onToken: (token: string) => void) {
    const model = this.genAI.getGenerativeModel(
      { model: "gemini-1.5-flash" },
      // 这里同样加上 !
      { baseUrl: process.env.GEMINI_BASE_URL! }
    );

    // 除去最后一条消息作为当前输入，其余作为历史
    const history = messages.slice(0, -1).map((msg) => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.content }],
    }));

    // 获取最后一条消息的内容
    const lastMessage = messages[messages.length - 1].content;

    const chatSession = model.startChat({
      history: history,
    });

    // 使用流式发送
    const result = await chatSession.sendMessageStream(lastMessage);

    // 迭代流并触发回调
    for await (const chunk of result.stream) {
      const chunkText = chunk.text();
      if (chunkText) {
        onToken(chunkText);
      }
    }
  }
}