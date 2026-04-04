import { useState, useEffect, useRef, useMemo } from 'react';

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
    // 1. 计算总高度（用于撑开滚动条）
    const totalHeight = list.length * itemHeight;

    // 2. 计算可见区域能容纳多少个 item
    const visibleCount = Math.ceil(containerHeight / itemHeight);

    // 3. 计算起始索引（当前滚动到第几个 item）
    const startIndex = Math.floor(scrollTop / itemHeight);

    // 4. 计算结束索引（考虑缓冲区）
    // 上方缓冲区
    const startWithOverscan = Math.max(0, startIndex - overscan);
    // 下方缓冲区
    const endWithOverscan = Math.min(
      list.length,
      startIndex + visibleCount + overscan
    );

    // 5. 计算偏移量（可见区域相对于容器顶部的距离）
    const offsetY = startWithOverscan * itemHeight;

    // 6. 获取可见区域的数据
    const visibleList = list
      .slice(startWithOverscan, endWithOverscan)
      .map((data, index) => ({
        data,
        index: startWithOverscan + index, // 原始索引
      }));

    return {
      totalHeight,
      visibleList,
      offsetY,
    };
  }, [list, itemHeight, containerHeight, scrollTop, overscan]);

  // 滚动事件处理
  const handleScroll = (e: React.UIEvent<HTMLElement>) => {
    const scrollTop = e.currentTarget.scrollTop;
    setScrollTop(scrollTop);
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
