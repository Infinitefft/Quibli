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


  // 用户注册
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


  // 搜索用户
  async search(keyword: string, page: number = 1, limit: number = 10) {
    // 1. 计算跳过的条数
    // 公式：(当前页码 - 1) * 每页条数
    const skip = (page - 1) * limit;

    // 2. 并行执行：获取列表和获取总数（为了前端做分页器）
    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where: {
          OR: [
            {
              nickname: {
                contains: keyword,
                mode: 'insensitive',
              },
            },
            {
              phone: {
                contains: keyword,
              },
            },
          ],
        },
        select: {
          id: true,
          phone: true,
          nickname: true,
          avatar: true,
          _count: {
            select: {
              followedBy: true,
              following: true,
            }
          }
        },
        skip: skip,   // 跳过之前的条数
        take: limit, // 每次取多少条
        orderBy: {
          createAt: 'desc', // 按注册时间倒序，保证搜索结果顺序稳定
        }
      }),
      this.prisma.user.count({
        where: {
          OR: [
            { nickname: { contains: keyword, mode: 'insensitive' } },
            { phone: { contains: keyword } },
          ],
        },
      }),
    ]);

    // 3. 返回包含分页信息的标准结构
    return {
      data: users,
      meta: {
        total,
        page,
        lastPage: Math.ceil(total / limit),
      },
    };
  }
}