// 获取字符串的权重分 (中文2分，其他1分)
export const getWeightScore = (str: string = ''): number => {
  let score = 0;
  for (const char of str) {
    score += /[\u4e00-\u9fa5]/.test(char) ? 2 : 1;
  }
  return score;
};



// 根据权重分限额截断字符串
export const truncateByWeight = (str: string, limit: number): string => {
  let score = 0;
  let result = '';
  for (const char of str) {
    const charWeight = /[\u4e00-\u9fa5]/.test(char) ? 2 : 1;
    if (score + charWeight <= limit) {
      score += charWeight;
      result += char;
    } else {
      break;
    }
  }
  return result;
};