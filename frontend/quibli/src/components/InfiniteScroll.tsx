import { useRef, useEffect } from 'react'

interface InfiniteScrollProps {
  hasMore: boolean;   // 是否还有更多数据
  isLoading: boolean;  // 是否正在加载数据
  onLoadMore: () => void;   // 加载更多数据
  children: React.ReactNode;  // InfiniteScroll 通用的滚动功能，滚动过的具体内容 接受自定义
}


const InfiniteScroll:React.FC<InfiniteScrollProps> = ({
  hasMore,
  onLoadMore,
  isLoading = false,
  children,
}) => {
  const sentinelRef = useRef<HTMLDivElement>(null);  // react 不建议直接访问 dom ，使用useRef
  useEffect(() => {
    if (isLoading || !hasMore) return;  // 如果正在加载或没有更多数据
    // IntersectionObserver：浏览器原生 Web API
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {  // 哨兵进入视窗  viewport
        onLoadMore();   // 调用加载更多数据函数
      }
    }, {
      threshold: 0,  // 哨兵元素只要有一个像素进入视窗时触发
    })
    // current：是哨兵 div 的真实 DOM 节点。
    if (sentinelRef.current) {
      observer.observe(sentinelRef.current);  // 让 IntersectionObserver 开始观察这个 DOM 元素是否进入视口。
    }
    // 卸载（路由切换）
    // 更新时
    return () => {
      if (sentinelRef.current) {
        observer.unobserve(sentinelRef.current);   // 组件卸载时，取消观察哨兵元素
      }
    }
    // dom ，组件挂载后 sentinelRef.current
  }, [isLoading, hasMore, onLoadMore])

  return (
    <>
      {children}
      {/* Intersection Observer 哨兵元素 */}
      <div ref={sentinelRef} className="h-4" />
      {
        isLoading && (
          <div className="text-center py-4 text-sm text-muted-forgound">
            加载中...
          </div>
        )
      }
    </>
  )
}

export default InfiniteScroll;