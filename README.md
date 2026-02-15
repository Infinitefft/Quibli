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


### 用户状态管理



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


### AI chat 流式输出
> pnpm add @ai-sdk/react
> pnpm add openai
- 封装成hooks
- 