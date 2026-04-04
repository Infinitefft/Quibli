import { useState, useRef, useMemo } from 'react';

interface UseVirtualListOptions<T> {
  // 列表数据源
  list: T[];
  // 每个列表项的高度（固定高度）
  itemHeight: number;
  // 容器高度
  containerHeight: number;
  // 缓冲区数量（上下各渲染几个额外的 item，避免白屏）
  overscan?: number;
}

interface UseVirtualListReturn<T> {
  // 可见区域的数据
  visibleList: Array<{
    data: T;
    index: number;
  }>;
  // 容器的总高度（撑开滚动条）
  totalHeight: number;
  // 可见区域的偏移量（用于定位）
  offsetY: number;
  // 滚动事件处理函数
  onScroll: (e: React.UIEvent<HTMLElement>) => void;
  // 容器 ref（用于获取滚动位置）
  containerRef: React.RefObject<HTMLDivElement>;
}

/**
 * 虚拟列表 Hook
 * 
 * 核心原理：
 * 1. 只渲染可见区域的列表项
 * 2. 通过一个撑开高度的容器模拟完整列表
 * 3. 根据滚动位置动态计算应该渲染哪些项
 * 4. 使用 transform 定位可见区域
 */
export function useVirtualList<T = any>(
  options: UseVirtualListOptions<T>
): UseVirtualListReturn<T> {
  const { list, itemHeight, containerHeight, overscan = 3 } = options;

  // 容器 ref，用于获取滚动位置
  const containerRef = useRef<HTMLDivElement>(null);
  
  // 当前滚动位置
  const [scrollTop, setScrollTop] = useState(0);

  // 计算虚拟列表的各项参数
  const virtualData = useMemo(() => {
    const totalHeight = list.length * itemHeight;

    const visibleCount = Math.ceil(containerHeight / itemHeight);

    const startIndex = Math.floor(scrollTop / itemHeight);

    const startWithOverscan = Math.max(0, startIndex - overscan);
    const endWithOverscan = Math.min(
      list.length,
      startIndex + visibleCount + overscan
    );

    const offsetY = startWithOverscan * itemHeight;

    const visibleList = list
      .slice(startWithOverscan, endWithOverscan)
      .map((data, index) => ({
        data,
        index: startWithOverscan + index,
      }));

    return {
      totalHeight,
      visibleList,
      offsetY,
    };
  }, [list, itemHeight, containerHeight, scrollTop, overscan]);

  const handleScroll = (e: React.UIEvent<HTMLElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
  };

  // 当列表数据变化时，重置滚动位置（可选）
  // useEffect(() => {
  //   if (containerRef.current) {
  //     containerRef.current.scrollTop = 0;
  //     setScrollTop(0);
  //   }
  // }, [list.length]);

  return {
    visibleList: virtualData.visibleList,
    totalHeight: virtualData.totalHeight,
    offsetY: virtualData.offsetY,
    onScroll: handleScroll,
    containerRef,
  };
}
