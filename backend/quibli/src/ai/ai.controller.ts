import {
  Controller
} from '@nestjs/common';
import { 
  Post,
  Body,
  Res,
  Get,
  Query,
} from '@nestjs/common';

import { ChatDto } from './dto/chat.dto';
// import { SearchDto } from './dto/search.dto';
import { AIService } from './ai.service';



@Controller('ai')
export class AIController {
  constructor(private readonly aiService: AIService){}


  @Post('chat')
  async chat(@Body() chatDto: ChatDto, @Res() res) {
    // console.log(chatDto);
    // return {
    //   chatDto
    // }
    // 流式输出
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');  // 每次 llm 都重新生成
    res.setHeader('Connection', 'keep-alive');

    try {
      const stream = await this.aiService.Chat(chatDto);
      
      for await (const chunk of stream) {
        const text = chunk.text();
        res.write(`data: ${JSON.stringify({ token: text })}\n\n`);
      }
      
      // await this.aiService.Chat(chatDto, (token: string) => {
      // })
      res.end();
    } catch (err) {
      console.error(err)
      res.status(500).end();
    }
  }
}