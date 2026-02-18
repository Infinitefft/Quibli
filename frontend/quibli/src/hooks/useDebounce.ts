// react 版本的防抖
import {
  useState,
  useEffect,
} from 'react';

// 通用
// 泛型，支持类型的传参
// keyword
export function useDebounce<T>(value: T, delay?: number): T {
  const [debounceValue, setDebounceValue] = useState<T>(value);  // 防抖的值
  // api 请求 debounceValue 负责
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebounceValue(value);
    }, delay)
    // 如果再次输入，handler time id 清除
    // 清理函数（新旧状态的清理 再运行新的effect）
    return () => {
      clearTimeout(handler);
    }
  }, [value, delay])
  return debounceValue;
}