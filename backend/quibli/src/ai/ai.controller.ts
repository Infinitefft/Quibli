import {
  Controller,
  Post,
  Body,
  Res,
} from '@nestjs/common';

import type { Response } from 'express';
import { ChatDto } from './dto/chat.dto';
import { AIService } from './ai.service';

@Controller('ai')
export class AIController {
  constructor(private readonly aiService: AIService) {}

  @Post('chat')
  async chat(
    @Body() chatDto: ChatDto,
    @Res() res: Response,
  ) {
    // SSE headers
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    try {
      const stream = await this.aiService.streamChat(chatDto);
      // 正常写 SSE
    } catch (error) {
      console.error('Gemini error:', error);
      console.error('Gemini error message:', error?.message);
      console.error('Gemini error stack:', error?.stack);

      res.status(500).write(
        `data: ${JSON.stringify({
          error: error?.message || 'AI generation failed',
        })}\n\n`,
      );
      res.end();
    }

    res.end();
  }
}
