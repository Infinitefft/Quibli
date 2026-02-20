import {
  Injectable,
} from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service'
import { QuestionsQueryDto } from './dto/questions-query.dto';
import { CreateQuestionDto } from './dto/create-questions.dto';
import { AIService } from '../ai/ai.service';



@Injectable()
export class QuestionsService {
  constructor(
    private prisma: PrismaService,
    private aiService: AIService,
  ) {}
  
  async findAll(query: QuestionsQueryDto) {
    const { page = 1, limit = 10 } = query;
    const skip = (page - 1) * limit;

    const questions = await this.prisma.question.findMany({
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

    const questionItems = questions.map((question) => ({
      id: question.id,
      title: question.title,
      tags: question.tags.map((item) => item.tag.name),
      publishedAt: question.createAt?.toISOString() ?? '',
      totalAnswers: question._count.comments,
      totalLikes: question._count.likes,
      totalFavorites: question._count.favorites,
      user: {
        id: question.user?.id,
        phone: question.user?.phone ?? '',
        nickname: question.user?.nickname ?? '',
        avatar: question.user?.avatar ?? '',
      },
    }));

    return {
      questionItems,
    };
  }



  async publish(userId: number, createQuestionDto: CreateQuestionDto) {
    const { title, tags = [] } = createQuestionDto;

    // 1. 基础校验
    if (!title) {
      throw new Error('Title is required');
    }

    const normalizedTags = [...new Set(tags.map(t => t.trim()))].filter(Boolean);

    // 2. 创建提问记录
    const question = await this.prisma.question.create({
      data: {
        title,
        userId: Number(userId),
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

    // 3. 准备语义化文本：针对提问，重点在标题和标签
    const tagNames = question.tags.map((qt) => qt.tag.name).join(', ');
    // 提问没有正文，所以这里只组合标题和标签
    const textToEmbed = `提问标题: ${title}; 标签: ${tagNames || '无'}`;

    // 4. 异步生成向量并回填 (严格迁移你的 Post 逻辑)
    this.aiService.getEmbedding(textToEmbed).then(async (vector) => {
      // 注意：这里的表名要对应你数据库里的提问表名（通常是 questions）
      await this.prisma.$executeRaw`
        UPDATE questions 
        SET embedding = ${JSON.stringify(vector)}::vector 
        WHERE id = ${question.id}
      `;
      // console.log(`提问 ID: ${question.id} 向量回填成功`);
    }).catch((err) => {
      console.error('AI Embedding 失败 (Question):', err);
    });

    return question;
  }
}