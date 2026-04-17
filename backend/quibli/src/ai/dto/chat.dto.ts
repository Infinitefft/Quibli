// POST /ai/chat 的请求体；响应为 SSE（见 ai.controller @Sse）
import {
  IsString,
  IsArray,
  ValidateNested,
  IsNotEmpty,
} from 'class-validator';
import { Type } from 'class-transformer';

export class Message {
  @IsString()
  @IsNotEmpty()
  role: string;

  @IsString()
  @IsNotEmpty()
  content: string;
}

export class ChatDto {
  // 会话 id（前端生成；可与日志/后续会话存储关联）
  @IsString()
  @IsNotEmpty()
  id: string;

  // 当前完整上下文（含本轮用户句）；服务端据此 stream
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => Message)
  messages: Message[];
}