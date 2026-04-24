import Skeleton, { SkeletonTheme } from 'react-loading-skeleton';

/** 骨架屏配色：与页面灰底/白卡协调，避免闪白或过暗 */
const theme = {
  baseColor: '#e5e7eb',
  highlightColor: '#f3f4f6',
};

/** 单条「文章卡片」占位：布局顺序尽量贴近真实 PostsItem，首屏感知更自然 */
function PostRowSkeleton() {
  return (
    <div className="bg-white mb-[12px] p-6 w-full">
      {/*
        块 A：作者区 —— 左头像 + 右两行文字的信息密度，对应列表项顶部 meta
      */}
      <div className="flex items-center mb-3 space-x-2">
        <Skeleton circle width={24} height={24} />
        <Skeleton width={96} height={16} />
        <Skeleton width={56} height={12} />
      </div>
      {/*
        块 B：标题/摘要多行 —— 宽度错落模拟真实标题折行与摘要行数
      */}
      <Skeleton className="mb-2" height={18} width="85%" />
      <Skeleton className="mb-2" height={18} width="55%" />
      <Skeleton className="mb-1.5" height={16} width="100%" />
      <Skeleton className="mb-4" height={16} width="90%" />
      {/*
        块 C：标签区 —— 若干圆角小块，对应话题/分类 chip 占位
      */}
      <div className="flex gap-2 mb-5">
        <Skeleton width={48} height={20} borderRadius={4} />
        <Skeleton width={56} height={20} borderRadius={4} />
        <Skeleton width={40} height={20} borderRadius={4} />
      </div>
      {/*
        块 D：底栏互动 —— 带顶部分割线，对应点赞/评论等操作行
      */}
      <div className="flex items-center space-x-8 border-t border-gray-50 pt-4">
        <Skeleton width={56} height={20} />
        <Skeleton width={56} height={20} />
        <Skeleton width={48} height={20} />
      </div>
    </div>
  );
}

/** 单条「问答卡片」占位：左右结构 + 正文 + 底栏，贴近 QuestionsItem */
function QuestionRowSkeleton() {
  return (
    <div className="bg-white mb-2 p-6 border-b border-gray-50">
      {/*
        块 A：头部左右分栏
        A.1 左侧：大头像 + 昵称/辅助信息（flex-1 + min-w-0 允许中间省略号布局在真组件里生效）
        A.2 右侧：小操作块（关注/更多等），flex-shrink-0 防止被挤没
      */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center space-x-3 flex-1 mr-4 min-w-0">
          <Skeleton circle width={44} height={44} />
          <div className="flex flex-col gap-2 min-w-0">
            <Skeleton width={112} height={16} />
            <Skeleton width={64} height={12} />
          </div>
        </div>
        <div className="flex gap-1 flex-shrink-0">
          <Skeleton width={48} height={20} borderRadius={4} />
          <Skeleton width={56} height={20} borderRadius={4} />
        </div>
      </div>
      {/*
        块 B：问题标题区 —— 两行高度接近真实标题行高
      */}
      <div className="mb-6 space-y-2">
        <Skeleton height={18} width="100%" />
        <Skeleton height={18} width="70%" />
      </div>
      {/*
        块 C：统计/互动行 —— 三个横向块对应浏览量、回答数等占位
      */}
      <div className="flex items-center space-x-8">
        <Skeleton width={96} height={20} />
        <Skeleton width={80} height={20} />
        <Skeleton width={64} height={20} />
      </div>
    </div>
  );
}

type HomeFeedSkeletonProps = {
  variant: 'posts' | 'questions';
  rows?: number;
};

/**
 * 首页 Feed 首屏骨架：在真实列表尚未渲染前占位，减少白屏抖动。
 * - variant：切换行模板，使文章/问答骨架形状与各自列表一致
 * - rows：重复渲染多少行（默认 5）
 */
export function HomeFeedSkeleton({ variant, rows = 5 }: HomeFeedSkeletonProps) {
  // 步骤 1：按路由/Tab 类型选择行组件（同一套容器，只换行内结构）
  const Row = variant === 'posts' ? PostRowSkeleton : QuestionRowSkeleton;
  return (
    // 步骤 2：SkeletonTheme 注入 shimmer 配色，子树里所有 <Skeleton /> 共享主题
    <SkeletonTheme {...theme}>
      {/*
        步骤 3：外层容器样式与真实列表外层（灰底 + 底部留白）对齐，切换骨架/列表时跳动更小
      */}
      <div className="pb-4 bg-gray-50 w-full px-0">
        {/*
          步骤 4：用固定长度数组映射出 N 行
          4.1 key 用索引即可：骨架无稳定业务 id，且列表不重排
          4.2 Row 是组件变量，React 会按元素类型区分挂载
        */}
        {Array.from({ length: rows }, (_, i) => (
          <Row key={i} />
        ))}
      </div>
    </SkeletonTheme>
  );
}
