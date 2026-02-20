export class CreatePostDto {
  title: string;
  content: string;
  tags?: string[]; // 对应前端 interface Post 里的 tags: string[]
}