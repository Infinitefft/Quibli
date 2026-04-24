import { Injectable } from '@nestjs/common';
// 定义和继承 Passport 身份验证策略和基类 定规则
import { PassportStrategy } from '@nestjs/passport';
// 身份验证策略选择 jwt
import { Strategy, ExtractJwt } from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      // token 在哪里 Bearer 前缀 Authorization
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      // 不是直接调用 PassportStrategy(Strategy) 封装
      // 自动化地去做
      ignoreExpiration: false,
      secretOrKey: process.env.TOKEN_SECRET || ""
    })
  }

  async validate(payload: any) {
    // console.log(payload);
    // validate(payload) 是“验签成功后的二次处理函数”。
    // 它的返回值会自动挂到 req.user。
    // 现在返回的是：
    // id: payload.sub
    // name: payload.name
    // 在其他的模块的constroller 里可以通过 req.user.id 拿到当前登录者的id
    // req.user 这个属性名是 Passport 约定好的默认字段
    return {
      id: payload.sub,
      name: payload.name,
    }
  }
}