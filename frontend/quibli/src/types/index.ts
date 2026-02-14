export interface User {
  id: number;
  phone: string;
  nickname: string;
  avatar?: string;
}


// 用户登录请求参数
export interface Credential {
  phone: string;
  password: string;
}