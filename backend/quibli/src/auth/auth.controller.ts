import { Controller } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';

import {
  Post,
  Body,
} from '@nestjs/common';



@Controller('auth')  // 根路由前缀
export class AuthController {
  // constructor 用来依赖注入
  // private 会自动在类里生成一个私有属性
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  // Body() 装饰器 用来获取前端发送的请求体中的数据
  login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }
}