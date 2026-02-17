import { Injectable } from '@nestjs/common';
import { GoogleGenAI } from '@google/genai';
import { HttpsProxyAgent } from 'https-proxy-agent';
import { ChatDto } from './dto/chat.dto';

@Injectable()
export class AIService {
  private ai: GoogleGenAI;

  constructor() {
    // 强制走本地代理 7890
    const proxyAgent = new HttpsProxyAgent('http://127.0.0.1:7890');

    this.ai = new GoogleGenAI({
      apiKey: process.env.GOOGLE_API_KEY!,
      fetch: (url: any, options: any) => {
        return fetch(url, {
          ...options,
          dispatcher: proxyAgent, // 关键：让 undici 走代理
        });
      },
    });
  }

  async streamChat(chatDto: ChatDto) {
    const lastUserMessage =
      chatDto.messages[chatDto.messages.length - 1]?.content ?? '';

    if (!lastUserMessage) {
      throw new Error('Message content is empty');
    }

    // 直接返回流
    const stream = await this.ai.models.generateContentStream({
      model: 'gemini-2.5-flash',
      contents: lastUserMessage,
    });

    return stream;
  }
}
