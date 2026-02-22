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


  // 用户关注别的用户
  async follow(currentUserId: any, targetUserId: any) {
    // 强制转为数字，解决 "1" 导致的 Prisma 校验失败
    const followerId = parseInt(currentUserId);
    const followingId = parseInt(targetUserId);

    // 校验转换结果，防止出现 NaN
    if (isNaN(followerId) || isNaN(followingId)) {
      throw new Error("Invalid User ID provided");
    }

    if (followerId === followingId) {
      throw new Error("You cannot follow yourself");
    }

    // 检查目标用户是否存在
    const targetUser = await this.prisma.user.findUnique({
      where: { id: followingId }
    });
    
    if (!targetUser) {
      throw new Error("Target user not found");
    }

    // 查找并切换关注状态
    const existingFollow = await this.prisma.follow.findUnique({
      where: {
        followerId_followingId: {
          followerId: followerId,
          followingId: followingId,
        },
      },
    });

    if (existingFollow) {
      await this.prisma.follow.delete({
        where: {
          followerId_followingId: {
            followerId: followerId,
            followingId: followingId,
          },
        },
      });
      return { followed: false };
    } else {
      await this.prisma.follow.create({
        data: {
          followerId: followerId,
          followingId: followingId,
        },
      });
      return { followed: true };
    }
  }


  // 切换文章点赞
  async toggleLikePost(currentUserId: any, postId: any) {
    const userId = parseInt(currentUserId);
    const targetPostId = parseInt(postId);

    // 1. 查找是否存在记录
    const existing = await this.prisma.userLikePost.findUnique({
      where: { userId_postId: { userId, postId: targetPostId } }
    });

    // 2. 逻辑切换
    if (existing) {
      await this.prisma.userLikePost.delete({
        where: { userId_postId: { userId, postId: targetPostId } }
      });
      return { status: false };
    } else {
      await this.prisma.userLikePost.create({
        data: { userId, postId: targetPostId }
      });
      return { status: true };
    }
  }

  // 切换问题点赞
  async toggleLikeQuestion(currentUserId: any, questionId: any) {
    const userId = parseInt(currentUserId);
    const qId = parseInt(questionId);

    const existing = await this.prisma.userLikeQuestion.findUnique({
      where: { userId_questionId: { userId, questionId: qId } }
    });

    if (existing) {
      await this.prisma.userLikeQuestion.delete({
        where: { userId_questionId: { userId, questionId: qId } }
      });
      return { status: false };
    } else {
      await this.prisma.userLikeQuestion.create({
        data: { userId, questionId: qId }
      });
      return { status: true };
    }
  }

  // 切换文章收藏
  async toggleFavoritePost(currentUserId: any, postId: any) {
    const userId = parseInt(currentUserId);
    const targetPostId = parseInt(postId);

    const existing = await this.prisma.userFavoritePost.findUnique({
      where: { userId_postId: { userId, postId: targetPostId } }
    });

    if (existing) {
      await this.prisma.userFavoritePost.delete({
        where: { userId_postId: { userId, postId: targetPostId } }
      });
      return { status: false };
    } else {
      await this.prisma.userFavoritePost.create({
        data: { userId, postId: targetPostId }
      });
      return { status: true };
    }
  }

  // 切换问题收藏
  async toggleFavoriteQuestion(currentUserId: any, questionId: any) {
    const userId = parseInt(currentUserId);
    const qId = parseInt(questionId);

    const existing = await this.prisma.userFavoriteQuestion.findUnique({
      where: { userId_questionId: { userId, questionId: qId } }
    });

    if (existing) {
      await this.prisma.userFavoriteQuestion.delete({
        where: { userId_questionId: { userId, questionId: qId } }
      });
      return { status: false };
    } else {
      await this.prisma.userFavoriteQuestion.create({
        data: { userId, questionId: qId }
      });
      return { status: true };
    }
  }
}