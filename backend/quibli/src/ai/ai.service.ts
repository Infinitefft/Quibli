import {
  Injectable,
} from '@nestjs/common';
import { Message } from './dto/chat.dto';
import { ChatDeepSeek } from '@langchain/deepseek'
import { SystemMessage, HumanMessage, AIMessage } from '@langchain/core/messages';


interface Post {
  title: string;
  category: string;
  embedding: number[];
}

export function convertToLangChainMessages(messages: Message[])
: (HumanMessage | AIMessage | SystemMessage)[] {
  return messages.map(msg => {
    switch(msg.role) {
      case 'user':
        return new HumanMessage(msg.content);
      case 'assistant':
        return new AIMessage(msg.content);
      case 'system':
        return new SystemMessage(msg.content);
      default:
        throw new Error(`Unsupported role: ${msg.role}`);
    }
  })
}

export function cosineSimilarity(v1: number[], v2: number[]): number {
    const dotProduct = v1.reduce((sum, val, i) => sum + val * v2[i], 0);
    const normV1 = Math.sqrt(v1.reduce((sum, val) => sum + val * val, 0));
    const normV2 = Math.sqrt(v2.reduce((sum, val) => sum + val * val, 0));
    return dotProduct / (normV1 * normV2);
}

@Injectable()
export class AIService {
  private chatModel: ChatDeepSeek;
  
  constructor() {
    this.chatModel = new ChatDeepSeek({
      configuration: {
        apiKey: process.env.DEEPSEEK_API_KEY,
        baseURL: process.env.DEEPSEEK_API_BASE_URL,
      },
      model: "deepseek-chat",
      temperature: 0.7,
      streaming: true,
    })
  }
  
  async chat(messages: Message[], onToken: (token: string) => void) {
    const langChainMessages = convertToLangChainMessages(messages);
    const stream = await this.chatModel.stream(langChainMessages);
    for await (const chunk of stream) {
      const content = chunk.content as string;
      if (content) {
        onToken(content);
      }
    }
  }
}