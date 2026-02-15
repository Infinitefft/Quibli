import {
  Injectable,
} from '@nestjs/common'

import { PrismaService } from '../prisma/prisma.service'
import { PostsQueryDto } from './dto/posts-query.dto'


@Injectable()
export class PostsService {
  constructor(private prisma: PrismaService) {}

  async findAll(query: PostsQueryDto) {
    const { page = 1, limit = 10 } = query;
    const skip = (((page || 1) - 1) * (limit || 10));

    const posts = await this.prisma.post.findMany({
      skip,
      take: limit,
      orderBy: {
        createAt: 'desc',
      },
      include: {
        user: true,
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
    });

    const postItems = posts.map((post) => ({
      id: post.id,
      title: post.title,
      // brief: post.content?.slice(0, 100) ?? '',
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
    }));

    return {
      postItems,
    };
  } 
}