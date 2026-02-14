import { 
  Injectable,
  UnauthorizedException,  // UnauthorizedException 是 NestJS 内置的一个异常类
} from '@nestjs/common';

import { LoginDto } from './dto/login.dto';
import { JwtService } from '@nestjs/jwt';
import bcrypt from 'bcrypt';
import {
  PrismaService,
} from '../prisma/prisma.service';



@Injectable()
export class AuthService {
  // constructor(
  //   private prisma: PrismaService,
  //   private jwtService: JwtService,
  // ) {}


  async login(loginDto: LoginDto) {
    // const { phone, password } = loginDto;
    // // 根据手机号查询数据库中的用户
    // const user = await this.prisma.user.findUnique({
    //   where: {
    //     phone,
    //   },
    // });
    // if(!user || !(await bcrypt.compare(password, user.password))) {
    //   throw new UnauthorizedException('用户名或密码错误')
    // }
  }
}