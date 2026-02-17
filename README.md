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
- AI

---


## 数据库设计
### 社区系统数据库设计文档 (Prisma/PostgreSQL)

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
- 封装成 hooks ，将 bot 的响应式业务剥离
- vercel ai-sdk/react (`pnpm i @ai-sdk/react@1.2.12`)
  - Ai 前端应用，nextjs(react ssr框架)
  - @ai sdk 封装了chatbot，快速开发 
  - chatbot UI 、响应式和AI 业务剥离
