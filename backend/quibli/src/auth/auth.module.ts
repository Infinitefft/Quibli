import {
  Module,
} from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtModule } from '@nestjs/jwt';

// console.log(process.env.TOKEN_SECRET, "-=-=-=-=-=-=-=");
// 设计模式 面向对象企业级别开发 经验总结
// 23种 工厂模式 单例模式 装饰器模式（类添加属性和方法）
// 观察者模式（IntersectionObserver） 代理模式（Proxy）
// 订阅发布者模式(addEventListener)
@Module({
  imports: [JwtModule.register({
    secret: process.env.TOKEN_SECRET
  })],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {
  
}