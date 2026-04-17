import {
  Controller,
  Post,
  Body,
  Res,
  Get,
  Query,
} from '@nestjs/common';
import type { Response } from 'express';
import { ChatDto } from './dto/chat.dto';
import { AIService } from './ai.service';

@Controller('ai')
export class AIController {
  constructor(private readonly aiService: AIService) {}

  @Post('chat')
  chat(
    @Body() chatDto: ChatDto,
    @Res() res: Response,
  ) {
    // 最佳实践：设置 SSE (Server-Sent Events) 必需的响应头
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    // 订阅 AI 服务的 Observable
    this.aiService.chat(chatDto.messages).subscribe({
      next: (token) => {
        // SSE 格式：以 data: 开头，以 \n\n 结尾。为了安全，通常将内容 JSON 序列化
        res.write(`data: ${JSON.stringify({ token })}\n\n`);
      },
      error: (error) => {
        console.error('Chat stream error:', error);
        res.write(`event: error\ndata: ${JSON.stringify({ message: 'Internal Server Error' })}\n\n`);
        res.end(); // 发生错误时结束响应
      },
      complete: () => {
        // 发送结束事件
        res.write(`event: done\ndata: [DONE]\n\n`);
        res.end(); // 流结束时关闭连接
      }
    });
  }

  @Get('avatar')
  async avatar(@Query('nickname') nickname: string) {
    return this.aiService.avatar(nickname);
  }

  @Get('getSearchSuggestions')
  async getSuggestions(@Query('keyword') keyword: string) {
    // 简单的参数校验，如果 keyword 为空直接返回空数组
    if (!keyword) {
      return [];
    }
    return this.aiService.getSuggestions(keyword);
  }

  @Get('search')
  async search(
    @Query('keyword') keyword: string,
    @Query('type') type: 'post' | 'question' = 'post',
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
  ) {
    // console.log("keyword, type, page, limit:", keyword, type, page, limit);
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const res = await this.aiService.search(keyword, type, pageNum, limitNum);
    // console.log(res);
    return res;
  }
}