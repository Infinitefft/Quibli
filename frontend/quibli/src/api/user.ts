import axios from '@/api/config';
import type { Credential } from '@/types/index';
import type { RegisterCredentil } from '@/types/index';


// 用户登录请求
export const doLogin = async (userData: Credential) => {
  const res = await axios.post('/auth/login', userData);
  // console.log("user.ts:res:", res);
  return res;
}


export const doRegister = async (registerData: RegisterCredentil) => {
  const res = await axios.post('/user/register', registerData);
  // console.log("user.ts:res:", res);
  return res;
}
