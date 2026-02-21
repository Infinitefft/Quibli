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
  async chat(
    @Body() chatDto: ChatDto,
    @Res() res: Response,
  ) {
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.setHeader('Transfer-Encoding', 'chunked');

    try {
      await this.aiService.chat(chatDto.messages, (token) => {
        res.write(token);
      });
      res.end();
    } catch (error) {
      console.error(error);
      res.status(500).end();
    }
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