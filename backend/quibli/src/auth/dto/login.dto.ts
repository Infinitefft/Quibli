import {
  IsNotEmpty,
  IsString,
  MinLength,
  Length,
} from 'class-validator';

export class LoginDto {
  @IsNotEmpty({ message: '手机号不能为空' })
  @IsString()
  @Length(11, 11, { message: '手机号必须是11位' })
  phone: string;

  @IsNotEmpty({ message: '密码不能为空' })
  @IsString()
  @MinLength(6, { message: '密码长度不能小于6位' })
  password: string; 
}