import {
  Injectable,
} from '@nestjs/common';
import { Message } from './dto/chat.dto';
import { PrismaService } from '../prisma/prisma.service'
import { ChatDeepSeek } from '@langchain/deepseek'
import { SystemMessage, HumanMessage, AIMessage } from '@langchain/core/messages';


export function convertToLangChainMessages(messages: Message[])
  : (HumanMessage | AIMessage | SystemMessage)[] {
  return messages.map(msg => {
    switch (msg.role) {
      case 'user':
        return new HumanMessage(msg.content);
      case 'assistant':
        return new AIMessage(msg.content);
      case 'system':
        return new SystemMessage(msg.content);
      default:
        throw new Error(`Unsupported role: ${msg.role}`);
    }
  })
}


@Injectable()
export class AIService {
  private chatModel: ChatDeepSeek;

  constructor(private prisma: PrismaService) {
    this.chatModel = new ChatDeepSeek({
      configuration: {
        apiKey: process.env.DEEPSEEK_API_KEY,
        baseURL: process.env.DEEPSEEK_API_BASE_URL,
      },
      model: "deepseek-chat",
      temperature: 0.7,
      streaming: true,
    })
  }

  async chat(messages: Message[], onToken: (token: string) => void) {
    const langChainMessages = convertToLangChainMessages(messages);
    const stream = await this.chatModel.stream(langChainMessages);
    for await (const chunk of stream) {
      const content = chunk.content as string;
      if (content) {
        onToken(content);
      }
    }
  }

  // 生成头像
  async avatar(nickname: string) {
    const prompt = `你是一位头像设计师，请你根据用户的姓名${nickname}，设计一个专业的头像，风格卡通、时尚且好看。`;
    
    try {
      // 1. 提交绘图任务到通义万相
      const response = await fetch('https://dashscope.aliyuncs.com/api/v1/services/aigc/text2image/image-synthesis', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.DASHSCOPE_API_KEY}`,
          'Content-Type': 'application/json',
          'X-DashScope-Async': 'enable'
        },
        body: JSON.stringify({
          model: 'wanx-v1',
          input: { prompt },
          parameters: { 
            n: 1, 
            size: '1024*1024' 
          }
        })
      });

      const submitResult: any = await response.json();
      const taskId = submitResult.output?.task_id;

      if (!taskId) {
        throw new Error(`Failed to submit task: ${submitResult.message || 'Unknown error'}`);
      }

      // 2. 带限制保护的轮询
      const imgUrl = await this.pollTaskResult(taskId);
      console.log(imgUrl);
      return imgUrl;
    } catch (error) {
      console.error("生成头像失败", error);
      throw error;
    }
  }

  // 轮询检查任务状态
  private async pollTaskResult(taskId: string): Promise<string> {
    const checkUrl = `https://dashscope.aliyuncs.com/api/v1/tasks/${taskId}`;
    const headers = { 'Authorization': `Bearer ${process.env.DASHSCOPE_API_KEY}` };
    
    const MAX_ATTEMPTS = 30; // 最大尝试 30 次
    const INTERVAL = 2000;  // 每次间隔 2 秒
    let attempts = 0;

    while (attempts < MAX_ATTEMPTS) {
      attempts++;
      
      const res = await fetch(checkUrl, { headers });
      const statusResult: any = await res.json();
      
      // 容错处理：如果接口报错但没拿到 output
      if (!statusResult.output) {
        throw new Error('Invalid response from DashScope API');
      }

      const status = statusResult.output.task_status;

      if (status === 'SUCCEEDED') {
        // 成功：返回第一张图片的 URL
        return statusResult.output.results[0].url;
      } 
      
      if (status === 'FAILED' || status === 'UNKNOWN') {
        // 失败：抛出 API 返回的具体错误信息
        throw new Error(`Image generation failed: ${statusResult.output.message || 'Internal error'}`);
      }

      // 还在处理中，等待后重试
      await new Promise(resolve => setTimeout(resolve, INTERVAL));
    }

    // 超过 60 秒（30次 * 2秒）仍未完成，强制断开
    throw new Error('Image generation timed out after 60 seconds');
  }



  // embedding
  /**
   * 将文本转换为 1536 维向量
   * 适配：阿里云 Text-Embedding-V4
   */
  async getEmbedding(text: string): Promise<number[]> {
    const response = await fetch('https://dashscope.aliyuncs.com/compatible-mode/v1/embeddings', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.DASHSCOPE_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'text-embedding-v2',
        input: text
      })
    });

    const result: any = await response.json();
    if (!result.data || !result.data[0].embedding) {
      throw new Error(`Embedding failed: ${result.message || 'Unknown error'}`);
    }
    return result.data[0].embedding;
  }


  // 搜素建议
  async getSuggestions(keyword: string) {
    if (!keyword || keyword.trim().length < 2) return [];

    try {
      const vector = await this.getEmbedding(keyword);
      const vectorString = JSON.stringify(vector);

      // 1. 语义检索：合并 posts 和 questions，按距离全局排序
      const results: any[] = await this.prisma.$queryRaw`
        SELECT title
        FROM (
          SELECT title, (embedding <=> ${vectorString}::vector) as distance 
          FROM posts 
          WHERE embedding IS NOT NULL
          UNION ALL
          SELECT title, (embedding <=> ${vectorString}::vector) as distance 
          FROM questions 
          WHERE embedding IS NOT NULL
        ) AS combined_results
        GROUP BY title
        ORDER BY MIN(distance) ASC
        LIMIT 7
      `;

      // 2. 仅返回去重后的标题字符串数组
      return results.map(item => item.title);
    } catch (error) {
      console.error("获取搜索建议失败", error);
      return [];
    }
  }


  // 语义化搜索文章和问题
  async search(keyword: string, type: 'post' | 'question' = 'post', page: number = 1, limit: number = 10) {
  if (!keyword || keyword.trim().length === 0) {
    return type === 'post' ? { postItems: [] } : { questionItems: [] };
  }

  const vector = await this.getEmbedding(keyword);
  const vectorString = JSON.stringify(vector);
  const skip = (page - 1) * limit;

  if (type === 'post') {
    const posts: any[] = await this.prisma.$queryRaw`
      SELECT 
        p.id, p.title, p.content, p."createAt",
        u.id AS "userId", u.phone AS "userPhone", u.nickname AS "userNickname", u.avatar AS "userAvatar",
        (SELECT COUNT(*)::int FROM "PostLike" WHERE "postId" = p.id) AS "totalLikes",
        (SELECT COUNT(*)::int FROM "PostFavorite" WHERE "postId" = p.id) AS "totalFavorites",
        (SELECT COUNT(*)::int FROM "PostComment" WHERE "postId" = p.id) AS "totalComments",
        ARRAY(
          SELECT t.name 
          FROM "Tag" t 
          JOIN "_PostToTag" pt ON pt."B" = t.id 
          WHERE pt."A" = p.id
        ) AS tags
      FROM posts p
      LEFT JOIN users u ON p."userId" = u.id
      WHERE p.embedding IS NOT NULL
      ORDER BY p.embedding <=> ${vectorString}::vector ASC
      LIMIT ${limit} OFFSET ${skip}
    `;

    const postItems = posts.map((post) => ({
      id: post.id,
      title: post.title,
      publishedAt: post.createAt?.toISOString() ?? '',
      totalLikes: post.totalLikes,
      totalFavorites: post.totalFavorites,
      totalComments: post.totalComments,
      user: {
        id: post.userId ?? '',
        phone: post.userPhone ?? '',
        nickname: post.userNickname ?? '',
        avatar: post.userAvatar ?? '',
      },
      content: post.content ?? '',
      tags: post.tags,
    }));

    return { postItems };
  } else {
    const questions: any[] = await this.prisma.$queryRaw`
      SELECT 
        q.id, q.title, q."createAt",
        u.id AS "userId", u.phone AS "userPhone", u.nickname AS "userNickname", u.avatar AS "userAvatar",
        (SELECT COUNT(*)::int FROM "QuestionLike" WHERE "questionId" = q.id) AS "totalLikes",
        (SELECT COUNT(*)::int FROM "QuestionFavorite" WHERE "questionId" = q.id) AS "totalFavorites",
        (SELECT COUNT(*)::int FROM "QuestionComment" WHERE "questionId" = q.id) AS "totalAnswers",
        ARRAY(
          SELECT t.name 
          FROM "Tag" t 
          JOIN "_QuestionToTag" qt ON qt."B" = t.id 
          WHERE qt."A" = q.id
        ) AS tags
      FROM questions q
      LEFT JOIN users u ON q."userId" = u.id
      WHERE q.embedding IS NOT NULL
      ORDER BY q.embedding <=> ${vectorString}::vector ASC
      LIMIT ${limit} OFFSET ${skip}
    `;

    const questionItems = questions.map((question) => ({
      id: question.id,
      title: question.title,
      tags: question.tags,
      publishedAt: question.createAt?.toISOString() ?? '',
      totalAnswers: question.totalAnswers,
      totalLikes: question.totalLikes,
      totalFavorites: question.totalFavorites,
      user: {
        id: question.userId ?? '',
        phone: question.userPhone ?? '',
        nickname: question.userNickname ?? '',
        avatar: question.userAvatar ?? '',
      },
    }));

    return { questionItems };
  }
}
}