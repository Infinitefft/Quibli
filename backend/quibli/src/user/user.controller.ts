import {
  Controller,
  Post,
  Body,
  Get,
  Query,
  Req,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common'
import { UsersService } from './user.service';
import { RegisterDto } from './dto/user-register.dto';
import { JwtAuthGuard } from '../auth/guard/jwt-auth.guard';


@Controller('user')
export class UsersController {
  constructor(private readonly usersService: UsersService){}

  @Post('/register')
  async register(@Body() registerDto: RegisterDto) {
    // console.log(registerDto);
    return this.usersService.register(registerDto)
  }

  @Get('search')
  async searchUsers(
    @Query('keyword') keyword: string,
    @Query('page') page: string,  // 接收字符串
    @Query('limit') limit: string // 接收字符串
  ) {
    return this.usersService.search(
      keyword, 
      parseInt(page) || 1, 
      parseInt(limit) || 10
    );
  }


  @Post('follow')
  @UseGuards(JwtAuthGuard)
  async followUser(@Body('targetFollowId') targetFollowId: number, @Req() req) {
    // 严格检查：如果没登录，req.user 是不存在的
    if (!req.user || !req.user.id) {
      throw new UnauthorizedException('请先登录');
    }
    
    const userId = req.user.id;
    // 确保 targetFollowId 是数字，Axios 传过来有时会变字符串
    return this.usersService.follow(userId, Number(targetFollowId));
  }


  @Post('like-post')
  @UseGuards(JwtAuthGuard)
  async likePost(@Body('postId') postId: number, @Req() req) {
    const userId = req.user.id;
    return this.usersService.toggleLikePost(userId, postId);
  }

  // 2. 点赞问题
  @Post('like-question')
  @UseGuards(JwtAuthGuard)
  async likeQuestion(@Body('questionId') questionId: number, @Req() req) {
    const userId = req.user.id;
    return this.usersService.toggleLikeQuestion(userId, questionId);
  }

  // 3. 收藏文章
  @Post('favorite-post')
  @UseGuards(JwtAuthGuard)
  async favoritePost(@Body('postId') postId: number, @Req() req) {
    const userId = req.user.id;
    return this.usersService.toggleFavoritePost(userId, postId);
  }

  // 4. 收藏问题
  @Post('favorite-question')
  @UseGuards(JwtAuthGuard)
  async favoriteQuestion(@Body('questionId') questionId: number, @Req() req) {
    const userId = req.user.id;
    return this.usersService.toggleFavoriteQuestion(userId, questionId);
  }


  // 获取收藏的文章
  @Get('getFavoritePosts')
  async getFavoritePosts(
    @Query('userId') userId: string,
    @Query('page') page: string,
    @Query('limit') limit: string
  ) {
    return this.usersService.getFavoritePosts(
      parseInt(userId),
      parseInt(page) || 1,
      parseInt(limit) || 10
    );
  }

  // 获取收藏的问题
  @Get('getFavoriteQuestions')
  async getFavoriteQuestions(
    @Query('userId') userId: string,
    @Query('page') page: string,
    @Query('limit') limit: string
  ) {
    return this.usersService.getFavoriteQuestions(
      parseInt(userId),
      parseInt(page) || 1,
      parseInt(limit) || 10
    );
  }

  // 获取点赞的文章
  @Get('getLikePosts')
  async getLikePosts(
    @Query('userId') userId: string,
    @Query('page') page: string,
    @Query('limit') limit: string
  ) {
    return this.usersService.getLikePosts(
      parseInt(userId),
      parseInt(page) || 1,
      parseInt(limit) || 10
    );
  }

  // 获取点赞的问题
  @Get('getLikeQuestions')
  async getLikeQuestions(
    @Query('userId') userId: string,
    @Query('page') page: string,
    @Query('limit') limit: string
  ) {
    return this.usersService.getLikeQuestions(
      parseInt(userId),
      parseInt(page) || 1,
      parseInt(limit) || 10
    );
  }
}