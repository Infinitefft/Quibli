import {
  Injectable,
} from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service'
import { QuestionsQueryDto } from './dto/questions-query.dto';



@Injectable()
export class QuestionsService {
  constructor(private prisma: PrismaService) {}
  
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
}