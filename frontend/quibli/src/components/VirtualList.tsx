import React, { forwardRef, useCallback } from 'react';
import { useVirtualList } from '@/hooks/useVirtualList';
import InfiniteScroll from '@/components/InfiniteScroll';

/** 与当前 PostsItem（line-clamp）大致匹配的参考行高，可按设计微调 */
export const SUGGESTED_ITEM_HEIGHT_POST = 280;
/** 与当前 QuestionsItem 大致匹配的参考行高 */
export const SUGGESTED_ITEM_HEIGHT_QUESTION = 300;

export interface VirtualListProps<T> {
  list: T[];
  /** 虚拟化时每一行的固定高度（px），短列表全量渲染时不强制行高 */
  itemHeight: number;
  containerHeight: number;
  overscan?: number;
  renderItem: (item: T, index: number) => React.ReactNode;
  /** 列表项 key，不传则使用 index */
  getItemKey?: (item: T, index: number) => React.Key;
  className?: string;
  /** 虚拟化时套在每一行外层的 class（如 `[&>*]:!mb-0` 抵消卡片 margin） */
  rowClassName?: string;
  onScroll?: (e: React.UIEvent<HTMLDivElement>) => void;
  /**
   * 条数低于此值时全量渲染、行高随内容（与虚拟化固定行高不同）。
   * 设为 0 则始终虚拟化。
   */
  virtualizationThreshold?: number;
  empty?: React.ReactNode;
  hasMore?: boolean;
  isLoading?: boolean;
  onLoadMore?: () => void;
  /** 短列表时包裹 map 的外层 class */
  listWrapperClassName?: string;
}

function mergeRefs<T>(
  ...refs: Array<React.Ref<T> | undefined>
): React.RefCallback<T> {
  return (node) => {
    refs.forEach((ref) => {
      if (!ref) return;
      if (typeof ref === 'function') ref(node);
      else (ref as React.MutableRefObject<T | null>).current = node;
    });
  };
}

function wrapContent<T>(
  list: T[],
  empty: React.ReactNode | undefined,
  onLoadMore: (() => void) | undefined,
  hasMore: boolean,
  isLoading: boolean,
  body: React.ReactNode
) {
  if (list.length === 0 && empty !== undefined) {
    return empty;
  }
  if (onLoadMore) {
    return (
      <InfiniteScroll hasMore={hasMore} isLoading={isLoading} onLoadMore={onLoadMore}>
        {body}
      </InfiniteScroll>
    );
  }
  return body;
}

/** 短列表：自然行高，不走切片 */
function VirtualListPlain<T>({
  props,
  setContainerRef,
}: {
  props: VirtualListProps<T>;
  setContainerRef: React.RefCallback<HTMLDivElement>;
}) {
  const {
    list,
    renderItem,
    getItemKey,
    className = '',
    onScroll,
    empty,
    hasMore = false,
    isLoading = false,
    onLoadMore,
    listWrapperClassName = 'pb-4 bg-gray-50',
  } = props;

  const body = (
    <div className={listWrapperClassName}>
      {list.map((item, index) => (
        <React.Fragment key={getItemKey ? String(getItemKey(item, index)) : index}>
          {renderItem(item, index)}
        </React.Fragment>
      ))}
    </div>
  );

  return (
    <div
      ref={setContainerRef}
      className={`overflow-y-auto ${className}`}
      style={{ height: props.containerHeight }}
      onScroll={onScroll}
    >
      {wrapContent(list, empty, onLoadMore, hasMore, isLoading, body)}
    </div>
  );
}

/** 长列表：固定行高 + useVirtualList */
function VirtualListVirtual<T>({
  props,
  setContainerRef,
}: {
  props: VirtualListProps<T>;
  setContainerRef: React.RefCallback<HTMLDivElement>;
}) {
  const {
    list,
    itemHeight,
    containerHeight,
    overscan = 4,
    renderItem,
    getItemKey,
    className = '',
    rowClassName,
    onScroll: externalOnScroll,
    empty,
    hasMore = false,
    isLoading = false,
    onLoadMore,
  } = props;

  const { visibleList, totalHeight, offsetY, onScroll, containerRef } = useVirtualList({
    list,
    itemHeight,
    containerHeight,
    overscan,
  });

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    onScroll(e);
    externalOnScroll?.(e);
  };

  const body = (
    <div style={{ height: totalHeight, position: 'relative' }}>
      <div
        style={{
          transform: `translateY(${offsetY}px)`,
          willChange: 'transform',
        }}
      >
        {visibleList.map(({ data, index }) => (
          <div
            key={getItemKey ? String(getItemKey(data, index)) : index}
            style={{ height: itemHeight, overflow: 'hidden' }}
            className={rowClassName}
          >
            {renderItem(data, index)}
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div
      ref={mergeRefs(setContainerRef, containerRef as React.Ref<HTMLDivElement>)}
      className={`overflow-y-auto ${className}`}
      style={{ height: containerHeight }}
      onScroll={handleScroll}
    >
      {wrapContent(list, empty, onLoadMore, hasMore, isLoading, body)}
    </div>
  );
}

/**
 * 通用虚拟列表：任意数据 `T` + `renderItem` 即可，无需再为每种业务加 variant。
 *
 * - 条数 ≥ `virtualizationThreshold`（默认 40）：固定 `itemHeight` 虚拟化。
 * - 条数较少：全量渲染，行高随内容。
 */
const VirtualList = forwardRef(function VirtualList<T>(
  props: VirtualListProps<T>,
  ref: React.ForwardedRef<HTMLDivElement>
) {
  const { list, virtualizationThreshold = 40 } = props;

  const setContainerRef = useCallback(
    (el: HTMLDivElement | null) => {
      if (typeof ref === 'function') ref(el);
      else if (ref) ref.current = el;
    },
    [ref]
  );

  const usePlain = list.length < virtualizationThreshold && virtualizationThreshold > 0;

  if (usePlain) {
    return <VirtualListPlain<T> props={props} setContainerRef={setContainerRef} />;
  }

  return <VirtualListVirtual<T> props={props} setContainerRef={setContainerRef} />;
}) as <T>(
  props: VirtualListProps<T> & React.RefAttributes<HTMLDivElement>
) => React.ReactElement;

export default VirtualList;
