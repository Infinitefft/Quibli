import {
  Controller,
  Post,
  Body,
  Get,
  Query,
} from '@nestjs/common'
import { UsersService } from './user.service';
import { RegisterDto } from './dto/user-register.dto';


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
}