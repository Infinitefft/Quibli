import {
  Controller,
  Get,
  Post,
  Query,
  Body,
  UseGuards,
  Req,
  Param,
  ParseIntPipe,
} from '@nestjs/common';

import { QuestionsQueryDto } from './dto/questions-query.dto';
import { QuestionsService } from './questions.service';
import { CreateQuestionDto } from './dto/create-questions.dto';
// auth 模块
import { JwtAuthGuard } from '../auth/guard/jwt-auth.guard';


@Controller('questions')
export class QuestionsController {
  constructor (private readonly questionsService: QuestionsService) {
    
  }


  @Get()
  async getQuestions(@Query() query: QuestionsQueryDto) {
    return this.questionsService.findAll(query);
  }

  @Post('publish')
  @UseGuards(JwtAuthGuard)
  async publishQuestion(@Body() createQuestionDto: CreateQuestionDto, @Req() req) {
    const userId = req.user.id;
    return this.questionsService.publish(userId, createQuestionDto);
  }

  @Get(':id')
  async getQuestionDetail(@Param('id', ParseIntPipe) id: number) {
    return this.questionsService.findOne(id);
  }
}