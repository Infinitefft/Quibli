import { useRef, useEffect } from 'react'

interface InfiniteScrollProps {
  hasMore: boolean;   // 是否还有更多数据
  isLoading: boolean;  // 是否正在加载数据
  onLoadMore: () => void;   // 加载更多数据
  children: React.ReactNode;  // InfiniteScroll 通用的滚动功能，滚动过的具体内容 接受自定义
}

const InfiniteScroll: React.FC<InfiniteScrollProps> = ({
  hasMore,
  onLoadMore,
  isLoading = false,
  children,
}) => {

  const sentinelRef = useRef<HTMLDivElement>(null);  
  // react 不建议直接访问 dom ，使用 useRef 获取真实 DOM

  useEffect(() => {

    // IntersectionObserver：浏览器原生 Web API
    // 作用：监听某个 DOM 元素是否进入视口
    const observer = new IntersectionObserver(
      (entries) => {

        const entry = entries[0];

        // isIntersecting：是否进入视口
        // 只有满足：
        // 进入视口
        // 当前不在 loading
        // 还有更多数据
        // 才触发加载
        if (
          entry.isIntersecting &&
          !isLoading &&
          hasMore
        ) {
          onLoadMore();   // 调用加载更多数据函数
        }
      },
      {
        threshold: 0,  
        // 0 表示：哨兵元素只要有 1px 进入视口就触发
      }
    );

    const current = sentinelRef.current;
    // current：哨兵 div 的真实 DOM 节点

    if (current) {
      observer.observe(current);
      // 让 IntersectionObserver 开始观察这个 DOM 元素是否进入视口
    }
    // 卸载（路由切换）或组件销毁时
    return () => {
      if (current) {
        observer.unobserve(current);
        // 组件卸载时，取消观察哨兵元素
      }
    };
    // 只在组件挂载时创建一次 observer
    // 不依赖 isLoading / hasMore
    // 避免 loading 变化导致 observer 反复创建
  }, []);


  return (
    <>
      {children}

      {/* Intersection Observer 哨兵元素 */}
      {/* 页面滚动到底部时，它会进入视口，从而触发 observer */}
      <div ref={sentinelRef} className="h-4" />

      {
        isLoading && (
          <div className="text-center py-4 text-sm text-muted-forgound">
            加载中...
          </div>
        )
      }
      {
        !hasMore && !isLoading && (
          <div className="text-center  text-sm text-muted-foreground">
            已经到底啦~
          </div>
        )
      }
    </>
  );
}

export default InfiniteScroll;
