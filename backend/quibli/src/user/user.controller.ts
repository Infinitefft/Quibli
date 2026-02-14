import {
  Controller,
  Post,
  Body,
} from '@nestjs/common'
import { UsersService } from './user.service';
import { RegisterDto } from './dto/user-register.dto';


@Controller('user')
export class UsersController {
  constructor(private readonly usersService: UsersService){}

  @Post('/register')
  async register(@Body() registerDto: RegisterDto) {
    console.log(registerDto);
    return this.usersService.register(registerDto)
  }
}