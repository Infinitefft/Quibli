export interface User {
  id: number;
  phone: string;
  nickname: string;
  avatar?: string;
  
  // 关注
  following?: number[];   // 我关注的人的 ID 列表

  // 文章
  likePosts?: number[];   // 点赞的文章 ID 列表
  favoritePosts?: number[];  // 收藏的文章 ID 列表

  // 问题交互
  likeQuestions?: number[];  // 点赞的问题 ID 列表
  favoriteQuestions?: number[];  // 收藏的问题 ID 列表
}


export interface Post {
  id: number;
  title: string;  // 标题
  // brief: string;  // 简介
  publishedAt: string;  // 发布时间
  totalLikes?: number;   // 点赞数
  totalFavorites?: number;   // 收藏数
  totalComments?: number;   // 评论数
  user: User;   // 发布用户
  content: string;  // 内容
  tags: string[];  // 标签
}


export interface Question {
  id: number;
  title: string;  // 问题标题
  tags: string[];  // 标签
  publishedAt: string;   // 发布时间
  totalAnswers?: number;    // 回答数
  totalLikes?: number;   // 点赞数
  totalFavorites?: number;   // 收藏数
  user: User;   // 发布用户
}



// 用户登录请求参数
export interface Credential {
  phone: string;
  password: string;
}

export interface RegisterCredentil extends Credential {
  nickname: string;
}


// 用户信息
export interface MineProfile {
  user: User;
  posts: Post[];
  questions: Question[];
  followers?: User[];       // 粉丝
  following?: User[];       // 关注
  likedPosts?: Post[];      // 点赞的文章
  favoritedPosts?: Post[];  // 收藏的文章
  likedQuestions?: Question[];    // 点赞的问题
  favoritedQuestions?: Question[]; // 收藏的问题
}