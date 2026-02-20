# $Quibli$

> AI-powered knowledge, Q & A community

### $Quibli$ 是一个轻量的内容社区平台，用户可以发布文章、提问、回答问题，并通过 **$AI（RAG-enhanced）$** 获取智能答疑。


### 技术栈：

- 前端：
  - React
  - react-router-dom(npm install react-router-dom)
  - zustand(npm i zustand)
  - react-activation
  - tailwindcss
  - typescript
  - axios
  - shadcn(pnpm i shadcn@latest, npx shadcn@latest init, npx shadcn@latest add button)
- 后端：
  - Node.js + TypeScript
  - NestJS (nest new nest-test-demo)
  - Prisma ORM(pnpm i prisma@6.19.2, npx prisma init, npx prisma migrate dev --name add_posts)
  - PostgreSQL
  - JWT
  - docker
    - 查看所有运行中的容器：`docker ps`
    - 查看所有容器（包括未运行的）：`docker ps -a`
    - 进入默认数据库：`docker exec -it pgvector-db psql -U postgres -d postgres`
- AI

---


## 数据库设计

### 1. 用户模块 (Users & Follows)
支持 11 位手机号注册登录，以及用户间的粉丝关注逻辑。

#### 1.1 用户表 (`users`)
| 字段名 | 类型 | 约束 | 描述 |
| :--- | :--- | :--- | :--- |
| `id` | Int | Primary Key, AutoInc | 用户唯一内部 ID |
| `phone` | VarChar(11) | Unique, Not Null | **核心凭证**：11位手机号用于注册登录 |
| `nickname` | VarChar(50) | Not Null | 用户展示用的昵称 |
| `password` | VarChar(255) | Not Null | 哈希加密后的密码 |
| `avatar` | VarChar(255) | Nullable | 头像 URL |
| `created_at` | Timestamptz | Default: now() | 账号注册时间 |
| `updated_at` | Timestamptz | Default: now() | 资料更新时间 |

#### 1.2 关注表 (`follows`)
| 字段名 | 类型 | 约束 | 描述 |
| :--- | :--- | :--- | :--- |
| `followerId` | Int | Composite PK, FK | 发起关注的用户 ID (粉丝) |
| `followingId` | Int | Composite PK, FK | 被关注的用户 ID (目标) |
| `created_at` | Timestamptz | Default: now() | 建立关注的时间 |

---

### 2. 内容模块 (Posts & Questions)
系统区分长文和短提问，两表物理分离。

#### 2.1 文章表 (`posts`)
| 字段名 | 类型 | 约束 | 描述 |
| :--- | :--- | :--- | :--- |
| `id` | Int | Primary Key, AutoInc | 文章 ID |
| `title` | VarChar(255) | Not Null | 文章标题 |
| `content` | Text | Not Null | **文章正文内容** |
| `userId` | Int | FK, Index, SetNull | 作者 ID |
| `created_at` | Timestamptz | Default: now() | 发布时间 |

#### 2.2 问题表 (`questions`)
| 字段名 | 类型 | 约束 | 描述 |
| :--- | :--- | :--- | :--- |
| `id` | Int | Primary Key, AutoInc | 问题 ID |
| `title` | VarChar(255) | Not Null | 问题标题 |
| `userId` | Int | FK, Index, SetNull | 提问者 ID |
| `created_at` | Timestamptz | Default: now() | 提问时间 |
| *注* | - | - | **无正文设计**，保持提问简短 |

---

### 3. 互动与共享模块 (Comments & Tags)
通过多态外键和中间表实现逻辑共用。

#### 3.1 评论表 (`comments`)
* **多态关联**：由 `postId` 和 `questionId` 决定评论所属。
* **无限级回复**：通过 `parentId` 实现评论嵌套。

| 字段名 | 类型 | 约束 | 描述 |
| :--- | :--- | :--- | :--- |
| `id` | Int | Primary Key, AutoInc | 评论 ID |
| `content` | Text | Not Null | 评论文本或回答内容 |
| `userId` | Int | FK, Index, Cascade | 评论者 ID |
| `postId` | Int | FK, Nullable, Index | 关联文章 (为空表示不是文章评论) |
| `questionId` | Int | FK, Nullable, Index | 关联问题 (为空表示不是提问回答) |
| `parentId` | Int | FK, Nullable, Index | 回复的父评论 ID |
| `created_at` | Timestamptz | Default: now() | 发布时间 |

#### 3.2 标签系统 (Tags)
* **标签库 (`tags`)**：存储唯一标签名。
* **文章关联 (`post_tags`)**：多对多中间表。
* **问题关联 (`question_tags`)**：多对多中间表。
* **业务逻辑**：后端 Service 需校验发布内容时关联的标签数 $\le 10$。

---

### 4. 点赞与收藏模块 (Interactions)
| 模块 | 表名 | 复合主键字段 | 描述 |
| :--- | :--- | :--- | :--- |
| **文章点赞** | `user_like_posts` | `userId`, `postId` | 用户点赞的文章记录 |
| **问题点赞** | `user_like_questions` | `userId`, `questionId` | 用户点赞的问题记录 |
| **文章收藏** | `user_favorite_posts` | `userId`, `postId` | 用户收藏的文章记录 |
| **问题收藏** | `user_favorite_questions` | `userId`, `questionId` | 用户收藏的问题记录 |

---

### 参考
1.  **回答逻辑**：向 `comments` 表插入数据，仅填充 `questionId`。
2.  **回复逻辑**：向 `comments` 表插入数据，填充 `parentId`。
3.  **查询逻辑**：
    * 查询“全站 Node.js 标签内容”时，需通过 `tags` 表连接 `post_tags` 和 `question_tags`。
    * 查询“我收藏的所有内容”时，需并集查询 `user_favorite_posts` 和 `user_favorite_questions`。
4.  **级联规则**：用户/文章/问题删除时，其关联的评论、点赞、标签记录必须 **Cascade (级联删除)**。


### 禁用底部导航栏触发滑动
- `touch-none`

### 首页优化
- 避免首页不断地挂载，卸载，导致性能问题
使用 KeepAlive 组件，缓存首页，避免重复挂载卸载
- **npm install react-activation**
- home 不能卸载
- react-activation
  cache 缓存 home，界面和数据都保持
  display:none  离开文档流
  KeepAlive + AliveScope


### 无限滚动组件
- 分页加载
- 监听哨兵 div 滚动事件，到达底部时加载更多数据

``` ts
import { useRef, useEffect } from 'react'

interface InfiniteScrollProps {
  hasMore: boolean;   // 是否还有更多数据
  isLoading: boolean;  // 是否正在加载数据
  onLoadMore: () => void;   // 加载更多数据
  children: React.ReactNode;  // InfiniteScroll 通用的滚动功能，滚动过的具体内容 接受自定义
}

const InfiniteScroll: React.FC<InfiniteScrollProps> = ({
  hasMore,
  onLoadMore,
  isLoading = false,
  children,
}) => {

  const sentinelRef = useRef<HTMLDivElement>(null);  
  // react 不建议直接访问 dom ，使用 useRef 获取真实 DOM

  useEffect(() => {

    // IntersectionObserver：浏览器原生 Web API
    // 作用：监听某个 DOM 元素是否进入视口
    const observer = new IntersectionObserver(
      (entries) => {

        const entry = entries[0];

        // isIntersecting：是否进入视口
        // 只有满足：
        // 进入视口
        // 当前不在 loading
        // 还有更多数据
        // 才触发加载
        if (
          entry.isIntersecting &&
          !isLoading &&
          hasMore
        ) {
          onLoadMore();   // 调用加载更多数据函数
        }
      },
      {
        threshold: 0,  
        // 0 表示：哨兵元素只要有 1px 进入视口就触发
      }
    );

    const current = sentinelRef.current;
    // current：哨兵 div 的真实 DOM 节点

    if (current) {
      observer.observe(current);
      // 让 IntersectionObserver 开始观察这个 DOM 元素是否进入视口
    }
    // 卸载（路由切换）或组件销毁时
    return () => {
      if (current) {
        observer.unobserve(current);
        // 组件卸载时，取消观察哨兵元素
      }
    };
    // 只在组件挂载时创建一次 observer
    // 不依赖 isLoading / hasMore
    // 避免 loading 变化导致 observer 反复创建
  }, []);


  return (
    <>
      {children}

      {/* Intersection Observer 哨兵元素 */}
      {/* 页面滚动到底部时，它会进入视口，从而触发 observer */}
      <div ref={sentinelRef} className="h-4" />

      {
        isLoading && (
          <div className="text-center py-4 text-sm text-muted-forgound">
            加载中...
          </div>
        )
      }
      {
        !hasMore && !isLoading && (
          <div className="text-center  text-sm text-muted-foreground">
            已经到底啦~
          </div>
        )
      }
    </>
  );
}

export default InfiniteScroll;
```



### 用户注册功能
- 通过**手机号，昵称，密码**注册
- 在后端 `user` 下增加 `register dto`
``` ts
import {
  IsNotEmpty,
  IsString,
  MinLength,
  Length,
} from 'class-validator';

export class RegisterDto {
  @IsNotEmpty({ message: '手机号不能为空' })
  @IsString()
  @Length(11, 11, { message: '手机号必须是11位' })
  phone: string;

  @IsNotEmpty({ message: '密码不能为空' })
  @IsString()
  @MinLength(6, { message: '密码长度不能小于6位' })
  password: string; 

  @IsNotEmpty({ message: '昵称不能为空' })
  @IsString()
  nickname: string;
}
```

并且通过 `bcrypt` 进行加密
``` ts
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
}
```


### 双 token 机制
- refreshToken 和 accessToken 双 token 机制
- 前端 config.ts 根据后端返回的响应，如果响应失败则判断是否是 token 过期，如果是则刷新 token 并将失败的请求放进请求队列中，token 刷新后重新发送请求，否则返回错误信息。

``` ts
import axios from 'axios';
import { useUserStore } from '@/store/user';


// instance 拦截器
// instance 即为 axios 实例
const instance = axios.create({
  baseURL: 'http://localhost:3001/api',
})

// 请求拦截器，在请求发送前添加 token
instance.interceptors.request.use(config => {
  const token = useUserStore.getState().accessToken;
  if (token) {
    // 将 token 添加到请求头
    config.headers['Authorization'] = `Bearer ${token}`;
  }
  return config;
})


// 实现无感刷新token

// 是否在刷新token
let isRefreshing = false;

// 请求队列，refresh 中，在并发的请求再去发送没有意义
// 保存下来，存到一个队列中，无缝地将之前的所有失败的请求，再请求，带上新的token 就会成功
let requestQueue: any[] = [];

instance.interceptors.response.use(res => {
  // console.log('////[][][]');
  // console.log("|||||||", res);
  // if (res.status != 200) {
  //   console.log("出错了");
  //   return;
  // }
  // 来到这里说明成功响应
  // 直接返回 res.data ，那么别的 api 下直接返回 res 即可
  return res.data;
}, async (err) => {
  // 说明响应不成功，需要去刷新token
  const { config, response } = err;
  // config：原始请求的配置对象，包括 url、method、headers、data，自己加的token 等
  // 鉴权不成功返回 401 Unauthorized。
  if (response?.stauts === 401 && !config._retry) {
    // 401 就是token过期，如果token 过期了
    if (isRefreshing) {
      // 刷新了一次 token
      // 当 access_token 过期（401）时，你只想 刷新一次 token，而不希望并发的其他请求也去刷新。
      // 所以使用了一个队列 requestQueue 来存放这些请求的回调。
      // 刷新 token 完成后，会依次执行队列里所有请求，带上新的 token。
      return new Promise((resolve) => {  // 这就意味着当前请求被 挂起，不会继续执行后面的刷新逻辑
        // requestQueue 里存的是 (token: string) => void 类型的函数。
        // token刷新完成后再依次拿到队列中的回调，然后再带上新的token 发送新的请求
        requestQueue.push((token: string) => {
          config.headers.Authorization = `Bearer ${token}`
          // resolve 是 Promise 的成功回调函数，也就是用来告诉外部 “这个 Promise 已经完成，并返回结果了”。
          // instance(config) 发送请求
          // config 闭包，每个回调函数都会带上自己的config（原始请求对象）
          resolve(instance(config));
        });
      })
    }
    // retry 是每个请求自己的，如果一个请求进来了并且 isRefreshing 为 true，那么这个请求就会进入队列
    // 并且 retry 为 true 那么再请求就不会来到这
    config.retry = true;  // retry 开关  防止同一个请求无限循环刷新 token
    isRefreshing = true;  // 刷新一次 token

    try {
      const { refreshToken } = useUserStore.getState();  // 拿到前端存储的 refreshtoken 去刷新
      if (refreshToken) {
        // 拿到刷新的 token
        const { access_token, refresh_token } = await instance.post('/auth/refresh', {
          refresh_token: refreshToken
        });
        // 存到前端本地存储
        useUserStore.setState({
          accessToken: access_token,
          refreshToken: refresh_token,
          isLogin: true,
        });
        // 重新对之前刷新时的网络请求带上新的token进行请求
        // 队列存储的都是回调函数
        // (callback) => callback(access_token) 去调用存储的
        requestQueue.forEach((callback) => callback(access_token)); 
        requestQueue = [];

        config.headers.Authorization = `Bearer ${access_token}`
        // 原始请求的请求头带上新的 token
        // 若 refreshtoken 还有效 那么就会后续就会触发回调
        return instance(config);   // 触发刷新 token 的第一个请求重试
      }
    } catch (err) {
      window.location.href = '/login';
      return Promise.reject(err);   // 出错
    } finally {
      isRefreshing = false;
    }
  }
  // refreshtoken 也失效了，那么第一个失败的请求也就失败了
  // 第一个请求就失败了，队列里的请求也不会被执行
  // reject 是 Promise 的失败回调
  return Promise.reject(err);   // 外层 async 函数的默认返回
})


export default instance;
```

- 后端使用 jwt 进行鉴权和颁发token
```
import { 
  Injectable,
  UnauthorizedException,  // UnauthorizedException 是 NestJS 内置的一个异常类
} from '@nestjs/common';

import { LoginDto } from './dto/login.dto';
import { JwtService } from '@nestjs/jwt';
import bcrypt from 'bcrypt';
import {
  PrismaService,
} from '../prisma/prisma.service';



@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}


  async login(loginDto: LoginDto) {
    const { phone, password } = loginDto;
    // 根据手机号查询数据库中的用户
    const user = await this.prisma.user.findUnique({
      where: {
        phone,
      },
    });
    // hashed password 比对
    if(!user || !(await bcrypt.compare(password, user.password))) {
      throw new UnauthorizedException('用户名或密码错误')
    }

    // 颁发token
    const tokens = await this.generateTokens(user.id.toString(), user.phone);
    // generateTokens 返回 access_token 和 refresh_token
    return {
      ...tokens,  // 使用 ... 把 generateTokens 返回的 { access_token, refresh_token } 和新的 user 对象组合成一个最终返回对象。
      user:{
        id: user.id.toString(),
        nickname: user.nickname,
        phone: user.phone
      }
    }
  }


  // 刷新 token
  async refreshToken(rt: string) {
    try {
      // verifyAsync：验证 JWT 的方法。
      // 如果 token 过期或篡改，verifyAsync 会抛异常，你在 catch 里捕获，返回 401 错误。
      const payload = await this.jwtService.verifyAsync(rt, {
        secret:process.env.TOKEN_SECRET
      });
      // console.log(payload, "--------()()()")
      // 没有过期，那么生成新的 token
      return this.generateTokens(payload.sub, payload.name);
    } catch(err) {
      throw new UnauthorizedException("Refresh Token 已失效，请重新登录");
    }
  }


  // 生成 token
  private async generateTokens(userId: string, phone: string) {
    const payload = {
      sub: userId,   // sub：用来唯一标识 token 所代表的主体，刚好可以用 userID
      name: phone    // name：自定义字段，可以随便放你想让 token 携带的信息 
    };

    const [at, rt] = await Promise.all([
      // 颁发了两个token  access_token
      this.jwtService.signAsync(payload, {
        expiresIn: '15m', // 有效期 15分钟 更安全 被中间人攻击
        // TOKNE_SECRET：JWT 的签名密钥
        secret: process.env.TOKEN_SECRET
      }),
      // refresh_token  刷新
      // 7d 服务器接受我们，用于refresh 
      // 服务器再次生成两个token 给我们
      // 依然使用 15m token 请求 
      this.jwtService.signAsync(payload, {
        expiresIn: '7d',
        secret: process.env.TOKEN_SECRET
      }),
    ])
    return {
      access_token: at,
      refresh_token: rt
    }
  }
}
```


### AI chat 流式输出
<!-- - 封装成 hooks ，将 bot 的响应式业务剥离
- vercel ai-sdk/react (`pnpm i @ai-sdk/react@1.2.12`)
  - Ai 前端应用，nextjs(react ssr框架)
  - @ai sdk 封装了chatbot，快速开发 
  - chatbot UI 、响应式和AI 业务剥离 -->




### AI 语义化搜索

- 查看所有运行中的容器：`docker ps`
- 查看所有容器（包括未运行的）：`docker ps -a`
- 进入默认数据库：`docker exec -it pgvector-db psql -U postgres -d postgres`


### AI 生成头像功能
- 使用通义万象生成
``` ts
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
```




### 发布功能
- `zustand` 统一管理发布文章和问题
- 学习到 `Partial<T>` : 把类型 T 中的所有属性都变成“可选的”（Optional）。
``` ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Question, Post } from '@/types/index';


interface PublishState {
  // Partial<T> 的作用是把类型 T 中的所有属性都变成“可选的”（Optional）。
  // 在 TypeScript 的严格模式下，如果你创建一个对象，必须一次性填满所有必填字段，否则会报错。
  // 但是 Question, Post 接口还有创建时间等属性，所以使用 Partial 就不会报错了
  currentQuestion: Partial<Question>;
  currentPost: Partial<Post>;
  setQuestionData: (data: Partial<Question>) => void;
  // 更新文章草稿
  setPostData: (data: Partial<Post>) => void;
  
  // 重置方法（发布成功或清空时调用）
  resetQuestion: () => void;
  resetPost: () => void;
}



export const usePublishStore = create<PublishState>()(
    persist((set, get) => ({
      currentQuestion: {
        title: '',
        tags: [],
      },
      currentPost: {
        title: '',
        content: '',
        tags: [],
      },
      // state: 永远是上一次更新完成后的最终结果
      setQuestionData: (data: Partial<Question>) => set((state: PublishState) => ({
        currentQuestion: { 
          ...state.currentQuestion, 
          ...data 
        }
      })),

      // 更新文章草稿
      setPostData: (data: Partial<Post>) => set((state: PublishState) => ({
        currentPost: { 
          ...state.currentPost, 
          ...data 
        }
      })),

      // 重置（发布成功后调用）
      resetQuestion: () => set({ currentQuestion: {} }),
      resetPost: () => set({ currentPost: {} }),
    }),
    {
      name: 'publish-store',
    }
  )
)
```


### 发布页面
- store 可以实现用户在发布页面的草稿功能
- 发布文章和问题时，都需要对用户输入的标题和标签进行限制
- 使用权重计算，中文标签权重为2分，英文标签权重为1分

``` ts
// --- 配置区 ---
// const TITLE_TOTAL_SCORE = 30; // 总权重分
// const MAX_TAG_COUNT = 5;
// const TAG_CN_LIMIT = 7;
// const TAG_EN_LIMIT = 16;


// 获取字符串的权重分 (中文2分，其他1分)
export const getWeightScore = (str: string = ''): number => {
  let score = 0;
  for (const char of str) {
    score += /[\u4e00-\u9fa5]/.test(char) ? 2 : 1;
  }
  return score;
};


// 根据权重分限额截断字符串
export const truncateByWeight = (str: string, limit: number): string => {
  let score = 0;
  let result = '';
  for (const char of str) {
    const charWeight = /[\u4e00-\u9fa5]/.test(char) ? 2 : 1;
    if (score + charWeight <= limit) {
      score += charWeight;
      result += char;
    } else {
      break;
    }
  }
  return result;
};
```



### 文章/问题详情页 评论区查询
- 抽离评论查询逻辑到服务层
``` ts
async findComments(questionId: number, page: number = 1, limit: number = 10) {
  const skip = (page - 1) * limit;

  const comments = await this.prisma.comment.findMany({
    where: {
      questionId,
      parentId: null, // 获取一级回答
    },
    skip,
    take: limit,
    orderBy: { createAt: 'desc' },
    include: {
      user: true,
      replies: {
        include: {
          user: true,
          parent: { include: { user: true } }, // 用于平铺时显示“回复了谁”
        },
        orderBy: { createAt: 'asc' },
      },
    },
  });

  return comments.map((c) => ({
    id: c.id,
    content: c.content,
    createdAt: c.createAt,
    user: {
      id: c.user.id,
      nickname: c.user.nickname,
      avatar: c.user.avatar,
    },
    replies: c.replies.map((r) => ({
      id: r.id,
      content: r.content,
      createdAt: r.createAt,
      user: {
        id: r.user.id,
        nickname: r.user.nickname,
        avatar: r.user.avatar,
      },
      replyToUser: r.parent?.user?.nickname ?? null,
    })),
  }));
}
```


### 手机 App 刷新逻辑
``` ts
import React, { useState, useRef, TouchEvent, RefObject, useEffect, useCallback } from 'react';

interface PullToRefreshProps {
  onRefresh: () => Promise<void>;
  children: React.ReactNode;
  scrollableElementRef?: RefObject<HTMLElement>;
}

export const PullToRefresh: React.FC<PullToRefreshProps> = ({ onRefresh, children, scrollableElementRef }) => {
  const [startY, setStartY] = useState(0);
  const [translateY, setTranslateY] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const isPulling = useRef(false);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // 阈值：下拉多少像素触发刷新
  const THRESHOLD = 70;
  // 最大下拉距离
  const MAX_PULL = 120;

  const getScrollTop = useCallback(() => {
    return scrollableElementRef?.current?.scrollTop ?? window.scrollY;
  }, [scrollableElementRef]);

  const handleTouchStart = (e: TouchEvent<HTMLDivElement>) => {
    // 只有当页面滚动在顶部时才记录起点
    if (isRefreshing) return;
    if (getScrollTop() === 0) {
      setStartY(e.touches[0].clientY);
      isPulling.current = true;
    } else {
      isPulling.current = false;
    }
  };

  const handleTouchMove = useCallback((e: globalThis.TouchEvent) => {
    // 如果不在顶部或者正在刷新，不处理
    if (!isPulling.current || isRefreshing) return;
    const currentY = e.touches[0].clientY;
    const diff = currentY - startY;

    if (getScrollTop() > 5) { // Add a small tolerance
      isPulling.current = false;
      setTranslateY(0);
      return;
    }

    // 只有向下拉动才处理
    if (diff > 0) {
      e.preventDefault(); // Prevent parent scroll, now safe to call
      // 增加阻尼感 (diff * 0.4)
      const pullDistance = Math.min(diff * 0.4, MAX_PULL);
      setTranslateY(pullDistance);
    } else {
      setTranslateY(0);
    }
  }, [isRefreshing, startY, getScrollTop]);

  useEffect(() => {
    const element = containerRef.current;
    if (!element) return;

    const handleMove = (e: globalThis.TouchEvent) => {
      handleTouchMove(e);
    };

    element.addEventListener('touchmove', handleMove, { passive: false });

    return () => {
      element.removeEventListener('touchmove', handleMove);
    };
  }, [handleTouchMove]);

  const handleTouchEnd = async () => {
    if (!isPulling.current || isRefreshing) return;
    isPulling.current = false;

    if (translateY > THRESHOLD) {
      // 触发刷新
      setIsRefreshing(true);
      setTranslateY(THRESHOLD); // 停留在加载位置

      try {
        await onRefresh();
      } finally {
        // 刷新完成，延时收起
        setTimeout(() => {
          setIsRefreshing(false);
          setTranslateY(0);
          setStartY(0);
        }, 500);
      }
    } else {
      // 未达到阈值，回弹
      setTranslateY(0);
      setStartY(0);
    }
  };

  return (
    <div
      ref={containerRef}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      style={{
        position: 'relative',
        backgroundColor: 'inherit', 
        touchAction: 'pan-y',
        transform: `translateY(${translateY}px)`,
        transition: isRefreshing ? 'transform 0.2s' : 'transform 0.3s ease-out',
      }}
    >
      {/* 下拉加载指示器 */}
      <div
        style={{
          position: 'absolute',
          top: `-${THRESHOLD}px`,
          left: 0,
          width: '100%',
          height: `${THRESHOLD}px`,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        {isRefreshing ? (
          <div className="spinner" style={{
            width: '24px',
            height: '24px',
            border: '3px solid #e0e0e0',
            borderTopColor: '#3498db',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }} />
        ) : (
          <span style={{ color: '#888', fontSize: '14px', opacity: translateY / THRESHOLD }}>
            {translateY > THRESHOLD ? '释放刷新' : '下拉刷新'}
          </span>
        )}
      </div>

      {/* 注入简单的动画样式 */}
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>

      {/* 内容区域 */}
      {children}
    </div>
  );
};
```