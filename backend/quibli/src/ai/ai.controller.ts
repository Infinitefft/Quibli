import {
  Controller,
  Post,
  Body,
  Get,
  Query,
  Sse,
  MessageEvent,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ChatDto } from './dto/chat.dto';
import { AIService } from './ai.service';

@Controller('ai')
export class AIController {
  constructor(private readonly aiService: AIService) {}

  // SSE 聊天：客户端 POST JSON，响应为 text/event-stream（由 @Sse 自动写头、收尾）
  @Post('chat')
  @Sse()
  chat(@Body() chatDto: ChatDto): Observable<MessageEvent> {
    // 1) 从 DTO 取 messages，交给 Service 得到「字符串 token 流」
    return this.aiService.chat(chatDto.messages).pipe(
      // 2) 每个 token 包成 MessageEvent；Nest 会写成 SSE 的 data: 行
      // 3) 前端按行读 body，JSON.parse(data) 后取 .token
      map(
        (token) =>
          ({
            data: { token },
          }) as MessageEvent,
      ),
    );
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