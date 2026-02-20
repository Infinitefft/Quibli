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

import { PostsService } from './posts.service'
import { PostsQueryDto } from './dto/posts-query.dto'
// auth 模块
import { JwtAuthGuard } from '../auth/guard/jwt-auth.guard';
import { CreatePostDto } from './dto/create-post.dto';


@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {

  }

  @Get()
  async getPosts(@Query() query: PostsQueryDto) {
    // console.log(query)
    return this.postsService.findAll(query);
  }


  @Post('publish')
  @UseGuards(JwtAuthGuard)   // 路由守卫
  async publish(@Body() createPostDto: CreatePostDto, @Req() req) {
    // console.log('Body:', createPostDto);
    // console.log('User ID from Token:', req.user.id);
    const userId = req.user.id;  // 验证通过，它会调用你 JwtStrategy 里的 validate(payload) 方法。
    // 这个方法的返回值，会被 Passport 自动挂载到 req.user 上。
    return this.postsService.publish(userId, createPostDto);
  }

  @Get(':id')
  async getPostDetail(@Param('id', ParseIntPipe) id: number) {
    return this.postsService.findOne(id);
  }

  @Get(':id/comments')
  async getPostComments(@Param('id', ParseIntPipe) id: number, @Query() query: PostsQueryDto) {
    return this.postsService.findComments(id, query.page, query.limit);
  }
}