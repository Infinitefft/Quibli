import { useEffect, useState, useRef, useLayoutEffect } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import InfiniteScroll from '@/components/InfiniteScroll';
import { PullToRefresh } from '@/components/PullToRefresh';
import QuestionsItem from '@/components/question/QuestionsItem';
import { getUserQuestions } from '@/api/user';

const cacheMap: Record<string, any> = {};

export default function UserQuestionsInfomations({ userId: propUserId }: { userId?: number | string }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { userId: paramsUserId } = useParams<{ userId: string }>();
  
  const userId = propUserId || paramsUserId;

  if (userId && !cacheMap[userId]) {
    cacheMap[userId] = { items: [], page: 1, hasMore: true, scrollY: 0, fetchingPage: 0 };
  }
  const cache = userId ? cacheMap[userId] : { items: [], page: 1, hasMore: false, scrollY: 0, fetchingPage: 0 };

  const [items, setItems] = useState<any[]>(cache.items);
  const [loading, setLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const loadMore = async () => {
    if (!userId || loading || !cache.hasMore || cache.fetchingPage === cache.page) return;
    setLoading(true);
    cache.fetchingPage = cache.page;
    try {
      const res = await getUserQuestions(Number(userId), cache.page, 10);
      const newItems = res.questionItems || [];
      const uniqueItems = newItems.filter(
        (newItem: any) => !cache.items.some((oldItem: any) => oldItem.id === newItem.id)
      );
      cache.items = [...cache.items, ...uniqueItems];
      cache.hasMore = cache.items.length < (res.total || 0);
      cache.page += 1;
      setItems([...cache.items]);
    } finally {
      setLoading(false);
      cache.fetchingPage = 0;
    }
  };

  const handleRefresh = async () => {
    if (!userId) return;
    cache.page = 1;
    cache.hasMore = true;
    cache.items = [];
    setItems([]);
    await loadMore();
  };

  useLayoutEffect(() => {
    if (containerRef.current && cache.scrollY > 0) {
      containerRef.current.scrollTop = cache.scrollY;
    }
  }, [items]);

  useEffect(() => {
    if (userId && cache.items.length === 0) loadMore();
  }, [userId]);

  if (!userId) return null;

  return (
    <div 
      ref={containerRef} 
      className="h-full overflow-y-auto no-scrollbar"
      onScroll={(e) => { cache.scrollY = e.currentTarget.scrollTop; }}
    >
      <PullToRefresh onRefresh={handleRefresh} scrollableElementRef={containerRef}>
        <InfiniteScroll onLoadMore={loadMore} hasMore={cache.hasMore} isLoading={loading}>
          <div className="pb-4">
            {items.map((question, index) => (
              <QuestionsItem 
                key={`${question.id}-${index}`} 
                question={question} 
                onClick={() => navigate(`/questions/${question.id}`, { state: { fromUrl: location.pathname } })} 
              />
            ))}
          </div>
        </InfiniteScroll>
      </PullToRefresh>
    </div>
  );
}