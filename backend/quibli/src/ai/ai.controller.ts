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
      await this.aiService.chat(chatDto.messages, (token: string) => {
        res.write(`0:${JSON.stringify(token)}\n`)
      })
      res.end();
    } catch (err) {
      console.error(err)
      res.status(500).end();
    }
  
  }

}