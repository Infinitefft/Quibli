import { Module } from '@nestjs/common';
import { QuestionsController } from './questions.controller';
import { QuestionsService } from './questions.service';
import { AIModule } from '../ai/ai.module';




@Module({
  imports: [ AIModule, ],
  controllers: [QuestionsController],
  providers: [QuestionsService],
})
export class QuestionsModule {
  
}