export interface User {
  id: number;
  phone: string;
  nickname: string;
  avatar?: string;
}

export interface Post {
  id: number;
  title: string;  // 标题
  brief: string;  // 简介
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