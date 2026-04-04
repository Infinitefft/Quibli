import Mock from 'mockjs';
import type { Post } from '../src/types/index';

/**
 * Mock 文章列表总页数（与 fetchPosts 默认 limit=10 相乘 ≈ 总条数）。
 * 仅用于前端性能测试，不调数据库。
 */
export const MOCK_POST_LIST_TOTAL_PAGES = 100;

const DEFAULT_LIMIT = 10;

let installed = false;

function parseSearch(url: string): URLSearchParams {
  try {
    const full = url.startsWith('http') ? url : `http://local.mock${url}`;
    return new URL(full).searchParams;
  } catch {
    return new URLSearchParams();
  }
}

function buildPost(id: number): Post {
  const R = Mock.Random;
  return {
    id,
    title: R.ctitle(10, 48),
    publishedAt: new Date(Date.now() - id * 60_000).toISOString(),
    totalLikes: R.integer(0, 500),
    totalFavorites: R.integer(0, 200),
    totalComments: R.integer(0, 120),
    user: {
      id: R.integer(1, 99_999),
      phone: '13800138000',
      nickname: R.cname(),
      avatar: undefined,
    },
    content: R.cparagraph(2, 6),
    tags: R.shuffle(['前端', 'React', 'Vue', '性能', 'Mock', 'TypeScript']).slice(
      0,
      R.integer(2, 4)
    ),
  };
}

function mockCommentList() {
  const R = Mock.Random;
  const n = R.integer(3, 10);
  return Array.from({ length: n }, (_, i) => ({
    id: i + 1,
    content: R.csentence(8, 40),
    user: {
      nickname: R.cname(),
      avatar: undefined as string | undefined,
    },
    replies:
      R.integer(0, 1) === 1
        ? [
            {
              id: i * 10 + 1,
              content: R.csentence(5, 25),
              user: { nickname: R.cname() },
              replyToUser: R.cname(),
            },
          ]
        : [],
  }));
}

/**
 * 注册 Mock.js 对文章相关 GET 的拦截（依赖浏览器 XMLHttpRequest，与 axios 默认适配器一致）。
 * 请在 main 入口、且仅在需要性能测试时调用（见 VITE_USE_POST_MOCK）。
 */
export function setupPostMock() {
  if (installed || typeof window === 'undefined') return;
  installed = true;

  // 文章列表：GET /api/posts?page=&limit=
  Mock.mock(/\/api\/posts\?/, 'get', (options: { url: string }) => {
    const params = parseSearch(options.url);
    const page = parseInt(params.get('page') || '1', 10);
    const limit = parseInt(params.get('limit') || String(DEFAULT_LIMIT), 10) || DEFAULT_LIMIT;

    if (page > MOCK_POST_LIST_TOTAL_PAGES || page < 1) {
      return { postItems: [] as Post[] };
    }

    const startId = (page - 1) * limit + 1;
    const postItems = Array.from({ length: limit }, (_, i) => buildPost(startId + i));
    return { postItems };
  });

  // 文章详情：GET /api/posts/:id（不含 /comments）
  Mock.mock(/\/api\/posts\/\d+$/, 'get', (options: { url: string }) => {
    const m = options.url.match(/\/posts\/(\d+)/);
    const id = m ? parseInt(m[1], 10) : 1;
    return buildPost(id);
  });

  // 评论列表：GET /api/posts/:id/comments
  Mock.mock(/\/api\/posts\/\d+\/comments/, 'get', () => mockCommentList());
}
