import {
  Injectable,
  BadRequestException,  // 错误处理
} from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { RegisterDto } from './dto/user-register.dto'
import * as bcrypt from 'bcrypt';



@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService){

  } 

  async register(registerDto: RegisterDto) {
    const { phone, password, nickname } = registerDto;
    const existingUser = await this.prisma.user.findUnique({
      where: {
        phone
      }
    });
    if (existingUser) {
      // 抛出异常
      // nest 企业级框架 捕获并返回给用户错误信息
      // node：弱类型，单线程，出错可能灾难性
      throw new BadRequestException("用户名已存在");
    }
    // 10：加密算法的强度
    const hashedPassword = await bcrypt.hash(password, 10);
    // console.log(hashedPassword, hashedPassword.length)
    const user = await this.prisma.user.create({
      data: {
        phone,
        password: hashedPassword,
        nickname
      },
      select: {
        id: true,
        phone: true,
        nickname: true,
      }
    })

    return user;
  }
}