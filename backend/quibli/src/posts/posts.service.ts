import {
  Injectable,
  NotFoundException,
} from '@nestjs/common'

import { PrismaService } from '../prisma/prisma.service'
import { PostsQueryDto } from './dto/posts-query.dto'
import { CreatePostDto } from './dto/create-post.dto'
import { AIService } from '../ai/ai.service'


@Injectable()
export class PostsService {
  constructor(
    private prisma: PrismaService,
    private aiService: AIService,
  ) {}

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

  // 用于展示文章详情
  async findOne(id: number) {
    const post = await this.prisma.post.findUnique({
      where: { id },
      include: {
        user: true,
        tags: { include: { tag: true } },
        _count: {
          select: {
            likes: true,
            favorites: true,
            comments: true,
          },
        },
      },
    });

    if (!post) throw new NotFoundException('Post not found');

    return {
      id: post.id,
      title: post.title,
      content: post.content ?? '',
      publishedAt: post.createAt?.toISOString() ?? '',
      totalLikes: post._count.likes,
      totalFavorites: post._count.favorites,
      totalComments: post._count.comments,
      user: {
        id: post.user?.id ?? '',
        nickname: post.user?.nickname ?? '',
        avatar: post.user?.avatar ?? '',
      },
      tags: post.tags.map((pt) => pt.tag.name),
    };
  }

  
  // 将文章的评论按楼层（一级评论）和回复（二级评论）格式化为树状结构
  async findComments(postId: number, page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;

    const comments = await this.prisma.comment.findMany({
      where: { 
        postId, 
        parentId: null // 只查一级评论（楼层）
      },
      skip,
      take: limit,
      orderBy: { createAt: 'desc' },
      include: {
        user: true,
        replies: {
          include: {
            user: true,
            // 如果你想知道这层回复是回复给谁的，
            // 因为是平铺，这里可以再关联一层 parent
            parent: { include: { user: true } } 
          },
          orderBy: { createAt: 'asc' }
        }
      }
    });

    return comments.map(c => ({
      id: c.id,
      content: c.content,
      createdAt: c.createAt,
      user: {
        id: c.user.id,
        nickname: c.user.nickname,
        avatar: c.user.avatar,
      },
      // 将楼层下的回复格式化
      replies: c.replies.map(r => ({
        id: r.id,
        content: r.content,
        user: {
          id: r.user.id,
          nickname: r.user.nickname,
          avatar: r.user.avatar
        },
        // 关键：用于显示 "A 回复 B"
        replyTo: r.parent?.user?.nickname || null 
      }))
    }));
  }


  // 发布文章
  async publish(userId: number, createPostDto: CreatePostDto) {
    const { title, content, tags = [] } = createPostDto;

    // 1. 检查 title 是否真的有值
    if (!title) {
      throw new Error('Title is required');
    }

    const normalizedTags = [...new Set(tags.map(t => t.trim()))].filter(Boolean);

    const post = await this.prisma.post.create({
      data: {
        title, // 确保这个变量不是 undefined
        content: content || '', 
        userId: Number(userId), // <--- 修复点：强制转成数字，解决 userId: "1" 的报错
        tags: {
          create: normalizedTags.map((tagName) => ({
            tag: {
              connectOrCreate: {
                where: { name: tagName },
                create: { name: tagName },
              },
            },
          })),
        },
      },
      include: {
        tags: { include: { tag: true } },
      },
    });

    // 3. 准备语义化文本：标题 + 标签 + 正文前500字
    const tagNames = post.tags.map((pt) => pt.tag.name).join(', ');
    const textToEmbed = `标题: ${title}; 标签: ${tagNames || '无'}; 正文: ${content?.slice(0, 500) ?? ''}`;

    // 4. 异步生成向量并回填 (Docker/pgvector 专用写法)
    this.aiService.getEmbedding(textToEmbed).then(async (vector) => {
      // 阿里向量是 [number, number, ...] 格式，需要转为 JSON 字符串再强转为 vector 类型
      await this.prisma.$executeRaw`
        UPDATE posts 
        SET embedding = ${JSON.stringify(vector)}::vector 
        WHERE id = ${post.id}
      `;
      // console.log(`文章 ID: ${post.id} 向量回填成功`);
    }).catch((err) => {
      console.log(err);
      // console.error('AI Embedding 失败:', err);
    });

    return post;
  }
}