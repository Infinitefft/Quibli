import { IsArray, IsString } from 'class-validator';

export class MessageDto {
  @IsString()
  role: 'user' | 'assistant';

  @IsString()
  content: string;
}

export class ChatDto {
  @IsArray()
  messages: MessageDto[];
}
