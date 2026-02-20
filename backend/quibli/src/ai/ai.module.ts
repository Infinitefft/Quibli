import { Module } from '@nestjs/common';
import { AIController } from './ai.controller';
import { AIService } from './ai.service';

@Module({
  controllers: [AIController],
  providers: [AIService],
  exports: [AIService],  // 导出 AIService，以便在 question、posts 模块使用 embedding 功能
})
export class AIModule {}