import { Module } from '@nestjs/common';
import { PostsService } from './posts.service'
import { PostsController } from './posts.controller'
import { AIModule } from '../ai/ai.module';




@Module({
  imports: [ AIModule, ],  // 这样你也不用在 providers 里重复写 AIService 了],
  controllers: [PostsController],
  providers: [PostsService],
})
export class PostsModule {
  
}