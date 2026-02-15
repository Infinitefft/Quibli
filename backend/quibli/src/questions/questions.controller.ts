import {
  Controller, 
  Query,
  Get,
  Post,
} from '@nestjs/common';

import { QuestionsQueryDto } from './dto/questions-query.dto';
import { QuestionsService } from './questions.service';


@Controller('questions')
export class QuestionsController {
  constructor (private readonly questionsService: QuestionsService) {
    
  }


  @Get()
  async getQuestions(@Query() query: QuestionsQueryDto) {
    return this.questionsService.findAll(query);
  }
}