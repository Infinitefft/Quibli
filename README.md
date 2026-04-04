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
``` ts
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



### 无限滚动组件遇到的问题（闭包陷阱）

> 变量永远是组件挂载时的状态
``` jsx
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
  }, []);  // 没有依赖项，变量永远是组件挂载时的状态


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
修复1：添加依赖项，但是，这将导致 observer 在 isLoading 或 hasMore 每次变化时都被重新创建，这可能会带来性能问题，并且注释中也提到了“避免 loading 变化导致 observer 反复创建”。

最佳实践：使用 `useRef` 来存储 `isLoading` 和 `hasMore` 的最新值。 这样， `useEffect` 的依赖数组`仍然可以是空的`，但 `observer` 的回调函数可以通过 `ref` 访问到最新的值。这种方法在需要避免 `useEffect` **频繁重新运行**，但又需要访问最新 prop 值时非常有用。避免了 Observer 对象的重复装卸。

``` jsx
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
  
  // 使用 useRef 保存最新的 props 值，避免闭包陷阱
  // 闭包陷阱：IntersectionObserver 回调函数会捕获创建时的变量值
  // 使用 ref 可以让回调函数始终访问到最新值
  const hasMoreRef = useRef(hasMore);
  const isLoadingRef = useRef(isLoading);
  const onLoadMoreRef = useRef(onLoadMore);

  // 每次渲染时同步更新 ref 的值
  // 无依赖项的 useEffect 会在每次渲染后执行useEffect 
  // 保证了赋值动作发生在 Commit 阶段。
  // 含义：只有当 React 确定“这次渲染成功了，屏幕已经更新了”，它才会去跑 useEffect 里的赋值。
  // 结果：这保证了 isLoadingRef.current 里的值，永远与当前屏幕上正在显示的那个 isLoading 状态保持一致。
  useEffect(() => {
    hasMoreRef.current = hasMore;
    isLoadingRef.current = isLoading;
    onLoadMoreRef.current = onLoadMore;
  });

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
          !isLoadingRef.current &&
          hasMoreRef.current
        ) {
          onLoadMoreRef.current();   // 调用加载更多数据函数
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
    // 依赖项为空数组，observer 只在组件挂载时创建一次
    // 避免 loading 变化导致 observer 反复创建
    // 通过 ref.current 访问最新的 props 值，避免闭包陷阱
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



### 虚拟列表优化

> 非虚拟列表下，页面性能随数据量呈线性衰减：由于 DOM 节点随滚动不断堆积，导致浏览器在执行样式计算（Recalculate Style）和布局（Layout）时耗时指数级增长，最终在触发路由跳转或长列表滚动时，因主线程被秒级长任务（Long Task）阻塞而产生严重掉帧和交互假死

可以参考性能图片：[没有虚拟列表前的性能](img\BeforeVisulList.png)







可优化的点：
你已想到的两个方向（都很好）
1. 虚拟列表（Virtual List）
当前问题：首页、搜索、关注页的帖子/问题列表全量渲染 DOM，列表越长内存和重绘成本越高。

自己手写而非直接用 react-virtuoso，展示底层原理理解
结合你已有的 InfiniteScroll + PullToRefresh，形成完整的**「虚拟滚动 + 无限加载 + 下拉刷新」**三合一方案
核心难点：

动态高度：帖子卡片有图片、不同长度文本，高度不一致。需要先渲染测量真实高度再缓存（ResizeObserver），而非固定行高
滚动锚定：上方 item 高度变化时保持视口内容不跳动
与 KeepAlive 协作：首页用了 react-activation 缓存，虚拟列表的滚动位置恢复需要特殊处理
面试时可以说的术语：可视区域计算、overscan（上下缓冲区）、ResizeObserver 动态测高、滚动锚定（scroll anchoring）、transform 偏移替代 padding 占位

2. 文章级 RAG（Retrieval-Augmented Generation）
当前状态：你的 AI 聊天是纯 LLM 对话，没有任何检索增强；向量搜索只用在搜索列表页，没有接入对话。


前端主导的 RAG 交互设计：用户在文章详情页可以针对这篇文章提问，AI 结合文章内容回答
涉及全栈链路：前端传 postId → 后端取文章 embedding → 检索相关段落 → 注入 system prompt → 流式返回
核心难点：

Context Window 管理：文章可能很长，需要截断或分块（chunking），选择最相关的片段注入 prompt
流式 SSE：当前用 fetch + ReadableStream，可以升级为标准 SSE（EventSource 或 @microsoft/fetch-event-source），面试时可以对比两种方案
前端状态设计：每篇文章的对话上下文独立管理，与全局 AI 聊天共存
简易实现方案：不需要复杂的向量分块，可以直接把文章的 title + content + tags 作为 system prompt 的 context，API 新增一个 /ai/article-chat 端点，前端在详情页加一个悬浮的 AI 问答入口。

二、我额外建议的高价值优化点
3. 修复 InfiniteScroll 的闭包陷阱（必修，面试高频题）
当前 Bug：你的 InfiniteScroll 组件 useEffect 依赖为空数组 []，IntersectionObserver 的回调捕获的是首次渲染时的 isLoading、hasMore、onLoadMore，之后状态变化后回调仍然使用旧值。


修复方案：用 useRef 保存最新的回调和状态：

const callbackRef = useRef(onLoadMore);
const stateRef = useRef({ isLoading, hasMore });
useEffect(() => {
  callbackRef.current = onLoadMore;
  stateRef.current = { isLoading, hasMore };
});
useEffect(() => {
  const observer = new IntersectionObserver((entries) => {
    if (entries[0].isIntersecting && !stateRef.current.isLoading && stateRef.current.hasMore) {
      callbackRef.current();
    }
  }, { threshold: 0 });
  // ...
}, []); // observer 只创建一次，但始终读取最新状态
面试时可以说：为什么 useEffect 闭包会过期、useRef 为什么能解决、与 useCallback 的区别、IntersectionObserver vs scroll 事件的性能差异。

4. 请求竞态处理（AbortController）
当前问题：搜索页切换 Tab、快速翻页时，旧请求可能比新请求晚返回，导致数据错乱（Race Condition）。


实现方案：

在 useEffect 的 cleanup 中 abort 上一次请求
axios 支持 signal: controller.signal
搜索联想的防抖 + AbortController 组合使用
useEffect(() => {
  const controller = new AbortController();
  fetchData({ signal: controller.signal });
  return () => controller.abort();
}, [keyword, activeTab]);
5. 骨架屏（Skeleton Screen）
当前状态：加载时只有文字「加载中...」或空白。


实现：利用你已有的 shadcn Skeleton 组件，为 PostsItem / QuestionsItem 做对应的骨架版本，首屏和加载更多时展示。工作量小但视觉效果提升大。

6. 双 Token 无感刷新的完善（已有雏形，值得打磨）
当前状态：api/config.ts 已实现了 401 拦截 → 刷新 → 重放队列，思路正确。


多请求并发刷新：当前 isRefreshing 锁 + 队列已覆盖，但刷新失败时队列没有 reject，排队的请求会悬挂
多 Tab 同步：一个 Tab 刷新后，通过 BroadcastChannel 或 storage event 通知其他 Tab 更新 token
refresh token 过期：平滑跳转登录页 + 保存当前路由，登录后自动回到原页面
三、优先级排序建议
按面试性价比（投入时间 vs 面试效果）排序：

优先级	优化项	投入	面试效果	原因
P0	修复 InfiniteScroll 闭包	0.5h	极高	闭包陷阱是必考题，改完就是现成案例
P0	虚拟列表	2-3天	极高	性能优化核心，手写 vs 库的取舍能讲很多
P1	文章级 RAG	1-2天	很高	AI + 全栈能力展示，当下热点
P1	请求竞态 AbortController	1h	很高	异步处理是前端核心能力
P2	骨架屏	2h	中高	UX 意识，工作量小
P2	双 Token 刷新完善	3h	中高	鉴权方案深度
你想从哪个开始？我可以直接帮你动手实现。如果要同时推进多个，我建议先从 P0 的 InfiniteScroll 闭包修复开始（最快见效），然后进入虚拟列表。