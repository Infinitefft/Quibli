import React, { useEffect, useLayoutEffect, useRef } from 'react';
import { useLocation, useOutletContext } from 'react-router-dom';
import useHomeQuestionStore from '@/store/homeQuestion';
import QuestionsItem from '@/components/question/QuestionsItem';
import BackToTop from '@/components/BackToTop';
import { HomeTanStackList, ESTIMATE_QUESTION_ROW } from '@/components/HomeTanStackList';
import { HomeFeedSkeleton } from '@/components/HomeFeedSkeleton';
import type { HomeFeedOutletContext } from '@/pages/home/homeFeedOutletContext';

/** 首页「热门问答」子路由：首屏骨架 → 有数据后虚拟列表；与文章面板同一套滚动/context 协议 */
export default function HomeQuestionsPanel() {
  const { pathname } = useLocation();
  const { listViewportHeight, handleScroll, syncScrollOrigin } =
    useOutletContext<HomeFeedOutletContext>();
  const { loadingQuestions, loadMoreQuestions, questions, hasMoreQuestions } = useHomeQuestionStore();
  const scrollRef = useRef<HTMLDivElement>(null);

  // 首屏拉取问答列表：仅在 questions 仍为空时触发一次（依赖数组刻意为空）
  useEffect(() => {
    if (questions.length === 0) loadMoreQuestions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 无数据且「正在请求或可能还有下一页」时展示骨架，逻辑与文章 Tab 对称
  const showSkeleton = questions.length === 0 && (loadingQuestions || hasMoreQuestions);

  // Tab 切换或骨架/列表形态变化后，把当前 scrollTop 同步回 Layout，修正顶栏联动基准
  useLayoutEffect(() => {
    const el = scrollRef.current;
    if (el) syncScrollOrigin(el.scrollTop);
  }, [pathname, showSkeleton, syncScrollOrigin]);

  return (
    <>
      {showSkeleton ? (
        // 骨架：独立滚动容器 + questions 版骨架行模板
        <div
          ref={scrollRef}
          className="no-scrollbar transform-gpu w-full min-h-0"
          style={{ height: listViewportHeight, overflowY: 'auto' }}
          onScroll={handleScroll}
        >
          <HomeFeedSkeleton variant="questions" />
        </div>
      ) : (
        // 虚拟列表：estimate 用问答行高常量；底部仍由 InfiniteScroll 触发分页
        <HomeTanStackList
          scrollRef={scrollRef}
          items={questions}
          estimateSize={ESTIMATE_QUESTION_ROW}
          height={listViewportHeight}
          onScroll={handleScroll}
          hasMore={hasMoreQuestions}
          isLoading={loadingQuestions}
          onLoadMore={loadMoreQuestions}
          renderItem={(q) => <QuestionsItem question={q} />}
          scrollClassName="no-scrollbar transform-gpu w-full min-h-0"
        />
      )}
      {/*
        key 在骨架/列表间切换：与文章面板同理，避免 BackToTop 仍订阅旧的滚动监听闭包
      */}
      <BackToTop
        key={showSkeleton ? 'q-sk' : 'q-list'}
        targetRef={scrollRef as React.RefObject<HTMLDivElement>}
        tabBarHeight={65}
      />
    </>
  );
}
