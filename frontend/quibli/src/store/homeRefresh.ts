import { useHomePostStore } from '@/store/homePost';
import { fetchPosts } from '@/api/post';
import { useHomeQuestionStore } from '@/store/homeQuestion';
import { fetchQuestions } from '@/api/question';

/**
 * 刷新首页帖子列表
 * 逻辑：请求第1页数据 -> 覆盖原有 posts -> 重置 page 为 2
 */
export const refreshHomePosts = async () => {
  // 直接访问 store 实例
  const { loadingPosts } = useHomePostStore.getState();
  
  // 如果正在加载更多，避免冲突（可选）
  if (loadingPosts) return;

  try {
    // 请求第一页数据
    const res = await fetchPosts(1);
    
    if (res && res.postItems) {
      // 直接调用 setState 更新 store，不修改原 store 文件
      useHomePostStore.setState({
        posts: res.postItems,      // 覆盖旧数据
        postPage: 2,               // 下次加载第 2 页
        hasMorePosts: res.postItems.length > 0,
        loadingPosts: false
      });
    }
  } catch (error) {
    console.error("刷新帖子失败", error);
    // 确保 loading 状态被重置
    useHomePostStore.setState({ loadingPosts: false });
  }
};

/**
 * 刷新首页问题列表
 */
export const refreshHomeQuestions = async () => {
  const { loadingQuestions } = useHomeQuestionStore.getState();
  if (loadingQuestions) return;

  try {
    const res = await fetchQuestions(1);
    
    if (res && res.questionItems) {
      useHomeQuestionStore.setState({
        questions: res.questionItems,
        questionsPage: 2,
        hasMoreQuestions: res.questionItems.length > 0,
        loadingQuestions: false
      });
    }
  } catch (error) {
    console.error("刷新问题失败", error);
    useHomeQuestionStore.setState({ loadingQuestions: false });
  }
};