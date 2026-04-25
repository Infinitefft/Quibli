import { useRef, useEffect } from 'react'

interface InfiniteScrollProps {
  hasMore: boolean;   // 是否还有更多数据
  isLoading: boolean;  // 是否正在加载数据
  onLoadMore: () => void;   // 加载更多数据
  onPrefetch?: () => void;   // 预请求（可选）
  children: React.ReactNode;  // InfiniteScroll 通用的滚动功能，滚动过的具体内容 接受自定义
}

const InfiniteScroll: React.FC<InfiniteScrollProps> = ({
  hasMore,
  onLoadMore,
  isLoading = false,
  onPrefetch,
  children,
}) => {
  
  const sentinelRef = useRef<HTMLDivElement>(null);  
  // react 不建议直接访问 dom ，使用 useRef 获取真实 DOM
  
  // 使用 useRef 保存最新的 props 值，避免闭包陷阱
  // 闭包陷阱：IntersectionObserver 回调函数会捕获创建时的变量值
  // 使用 ref 可以让回调函数始终访问到最新值
  const hasMoreRef = useRef(hasMore);
  const isLoadingRef = useRef(isLoading);
  const onLoadMoreRef = useRef(onLoadMore);
  const onPrefetchRef = useRef(onPrefetch);

  // 每次渲染时同步更新 ref 的值
  // 无依赖项的 useEffect 会在每次渲染后执行useEffect 
  // 保证了赋值动作发生在 Commit 阶段。
  // 含义：只有当 React 确定“这次渲染成功了，屏幕已经更新了”，它才会去跑 useEffect 里的赋值。
  // 结果：这保证了 isLoadingRef.current 里的值，永远与当前屏幕上正在显示的那个 isLoading 状态保持一致。
  useEffect(() => {
    hasMoreRef.current = hasMore;
    isLoadingRef.current = isLoading;
    onLoadMoreRef.current = onLoadMore;
    onPrefetchRef.current = onPrefetch;
  });


  useEffect(() => {
    let idleHandle: number;
    
    // 不在加载中并且还有数据，并且传入了 prefetch 函数
    if (!isLoading && hasMore && onPrefetchRef.current) {
      idleHandle = requestIdleCallback(() => {
        // 浏览器主线程空闲时，执行
        if (onPrefetchRef.current) {
          onPrefetchRef.current();
        }
      })
    }

    return () => {
      if (idleHandle) {
        cancelIdleCallback(idleHandle);
      }
    }
  })

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
          !isLoadingRef.current &&
          hasMoreRef.current
        ) {
          onLoadMoreRef.current();   // 调用加载更多数据函数
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
    // 依赖项为空数组，observer 只在组件挂载时创建一次
    // 避免 loading 变化导致 observer 反复创建
    // 通过 ref.current 访问最新的 props 值，避免闭包陷阱
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
