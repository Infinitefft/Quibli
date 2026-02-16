import { Injectable } from '@nestjs/common';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { ChatDto } from './dto/chat.dto';

@Injectable()
export class AIService {
  private genAI: GoogleGenerativeAI;

  constructor() {
    // Ensure you configure GEMINI_API_KEY in your environment variables
    this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
  }

  async Chat(dto: ChatDto) {
    const model = this.genAI.getGenerativeModel({ model: 'gemini-pro' });

    const chat = model.startChat({
      history: dto.history || [],
    });

    // sendMessageStream returns an object containing the stream
    const result = await chat.sendMessageStream(dto.messages);
    
    // Return the stream iterable to be handled by the controller
    return result.stream;
  }
}