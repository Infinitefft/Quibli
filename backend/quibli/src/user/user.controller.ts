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
}