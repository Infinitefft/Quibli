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


  // 查询用户收藏的文章
  async getFavoritePosts(userId: number, page: number, limit: number) {
    const skip = (page - 1) * limit;

    // 1. 查询该用户收藏的文章关联数据
    const favoriteRelations = await this.prisma.userFavoritePost.findMany({
      where: {
        userId: userId,
      },
      skip,
      take: limit,
      include: {
        post: {
          include: {
            user: true, // 文章的作者信息
            tags: {
              include: {
                tag: true,
              },
            },
            _count: {
              select: {
                likes: true,
                favorites: true,
                comments: true,
              },
            },
          },
        },
      },
    });

    // 2. 结构化数据映射
    const postItems = favoriteRelations.map((relation) => {
      const post = relation.post;
      return {
        id: post.id,
        title: post.title,
        publishedAt: post.createAt?.toISOString() ?? '',
        totalLikes: post._count.likes,
        totalFavorites: post._count.favorites,
        totalComments: post._count.comments,
        user: {
          id: post.user?.id ?? '',
          phone: post.user?.phone ?? '',
          nickname: post.user?.nickname ?? '',
          avatar: post.user?.avatar ?? '',
        },
        content: post.content ?? '',
        tags: post.tags.map((postTag) => postTag.tag.name),
      };
    });

    // 3. 获取总数（用于前端分页计算）
    const total = await this.prisma.userFavoritePost.count({
      where: { userId },
    });

    return {
      postItems,
      total,
    };
  }


  // 查询用户收藏的问题
  async getFavoriteQuestions(userId: number, page: number, limit: number) {
    const skip = (page - 1) * limit;

    const favoriteRelations = await this.prisma.userFavoriteQuestion.findMany({
      where: { userId },
      skip,
      take: limit,
      include: {
        question: {
          include: {
            user: true,
            tags: {
              include: { tag: true },
            },
            _count: {
              select: {
                likes: true,
                favorites: true,
                comments: true,
              },
            },
          },
        },
      },
    });

    const questionItems = favoriteRelations.map((relation) => {
      const question = relation.question;
      return {
        id: question.id,
        title: question.title,
        publishedAt: question.createAt?.toISOString() ?? '',
        totalLikes: question._count.likes,
        totalFavorites: question._count.favorites,
        totalComments: question._count.comments,
        user: {
          id: question.user?.id ?? '',
          phone: question.user?.phone ?? '',
          nickname: question.user?.nickname ?? '',
          avatar: question.user?.avatar ?? '',
        },
        tags: question.tags.map((qTag) => qTag.tag.name),
      };
    });

    return { questionItems };
  }


  // 查询用户点赞的文章
  async getLikePosts(userId: number, page: number, limit: number) {
    const skip = (page - 1) * limit;

    const likeRelations = await this.prisma.userLikePost.findMany({
      where: { userId },
      skip,
      take: limit,
      include: {
        post: {
          include: {
            user: true,
            tags: {
              include: { tag: true },
            },
            _count: {
              select: {
                likes: true,
                favorites: true,
                comments: true,
              },
            },
          },
        },
      },
    });

    const postItems = likeRelations.map((relation) => {
      const post = relation.post;
      return {
        id: post.id,
        title: post.title,
        publishedAt: post.createAt?.toISOString() ?? '',
        totalLikes: post._count.likes,
        totalFavorites: post._count.favorites,
        totalComments: post._count.comments,
        user: {
          id: post.user?.id ?? '',
          phone: post.user?.phone ?? '',
          nickname: post.user?.nickname ?? '',
          avatar: post.user?.avatar ?? '',
        },
        content: post.content ?? '',
        tags: post.tags.map((pTag) => pTag.tag.name),
      };
    });

    return { postItems };
  }


  // 查询用户点赞的问题
  async getLikeQuestions(userId: number, page: number, limit: number) {
    const skip = (page - 1) * limit;

    const likeRelations = await this.prisma.userLikeQuestion.findMany({
      where: { userId },
      skip,
      take: limit,
      include: {
        question: {
          include: {
            user: true,
            tags: {
              include: { tag: true },
            },
            _count: {
              select: {
                likes: true,
                favorites: true,
                comments: true,
              },
            },
          },
        },
      },
    });

    const questionItems = likeRelations.map((relation) => {
      const question = relation.question;
      return {
        id: question.id,
        title: question.title,
        publishedAt: question.createAt?.toISOString() ?? '',
        totalLikes: question._count.likes,
        totalFavorites: question._count.favorites,
        totalComments: question._count.comments,
        user: {
          id: question.user?.id ?? '',
          phone: question.user?.phone ?? '',
          nickname: question.user?.nickname ?? '',
          avatar: question.user?.avatar ?? '',
        },
        tags: question.tags.map((qTag) => qTag.tag.name),
      };
    });

    return { questionItems };
  }
}