import { useCallback, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import type { UIEvent } from 'react';
import { Input } from '@/components/ui/SearchInput';
import { Search } from 'lucide-react';
import { useUserStore } from '@/store/user';
import type { HomeFeedOutletContext } from '@/pages/home/homeFeedOutletContext';

/**
 * 首页壳（Layout）：
 * - 负责固定顶栏、搜索条、Tab、以及中间「列表视口」占位；
 * - 通过 Outlet context 把「列表高度 + 滚动联动逻辑」交给子路由；
 * - 子路由只关心列表数据与渲染，不关心顶栏测量细节。
 */
export default function HomeFeedLayout() {
  const navigate = useNavigate();
  const user = useUserStore((state) => state.user);

  // --- DOM 引用：用于直接写 style（顶栏位移、搜索条透明度）以及测量列表高度 ---
  const headerRef = useRef<HTMLElement>(null);
  const searchBarRef = useRef<HTMLDivElement>(null);
  const listViewportRef = useRef<HTMLDivElement>(null);

  // 列表可视高度（px）：首屏用 window 估算，挂载后用 ResizeObserver 覆盖为真实值
  const [listViewportHeight, setListViewportHeight] = useState(() =>
    typeof window !== 'undefined' ? Math.max(200, window.innerHeight - 145 - 96) : 400
  );

  // 滚动联动用的「上一帧 scrollTop」与「当前顶栏 translate」——放 ref 里避免滚动时 setState 狂刷
  const lastScrollY = useRef(0);
  const currentTranslateY = useRef(0);

  /**
   * 把「顶栏整体上移/下移」与「搜索条渐隐」写到同一个函数里，保证两处状态一致。
   * translate 为负：顶栏向上收起（最多 -57，与搜索条高度一致）；为 0：完全展开。
   */
  const updateHeader = useCallback((translate: number) => {
    // 1）记住当前位移，供下一帧 handleScroll 做增量叠加
    currentTranslateY.current = translate;
    // 2）移动整颗 fixed header（包含搜索条 + Tab），形成「上滑隐藏搜索区、保留下方 Tab」的效果
    if (headerRef.current) {
      headerRef.current.style.transform = `translate3d(0, ${translate}px, 0)`;
    }
    if (searchBarRef.current) {
      // 3）随位移增加降低搜索条不透明度；接近完全收起时禁用点击，避免点到透明层
      const opacity = Math.max(0, 1 - (Math.abs(translate) / 40));
      searchBarRef.current.style.opacity = opacity.toString();
      searchBarRef.current.style.pointerEvents = opacity < 0.1 ? 'none' : 'auto';
    }
  }, []);

  /**
   * 列表滚动时调用：用「本次 scrollTop − 上次 scrollTop」得到 delta，
   * 再把 delta 反加到顶栏 translate 上（手指向下拉内容，顶栏应向下展开，故取反）。
   */
  const handleScroll = useCallback(
    (e: UIEvent<HTMLDivElement>) => {
      const scrollTop = e.currentTarget.scrollTop;
      if (scrollTop < 0) return;

      // 1）deltaY：内容往下滚了多少（正值表示列表向下滚动）
      const deltaY = scrollTop - lastScrollY.current;
      lastScrollY.current = scrollTop;

      // 2）把滚动增量映射成顶栏位移：内容向下滚 → translate 变大（更接近 0，展开）
      let newTranslate = currentTranslateY.current - deltaY;
      // 3）钳制在 [-57, 0]：最多把搜索条那一截藏掉，Tab 仍留在视口里
      newTranslate = Math.max(-57, Math.min(0, newTranslate));
      // 4）在顶部（含橡皮筋回弹到 0）强制完全展开，避免停在半收起状态
      if (scrollTop <= 0) newTranslate = 0;

      if (newTranslate !== currentTranslateY.current) {
        updateHeader(newTranslate);
      }
    },
    [updateHeader]
  );

  /**
   * 子面板在「路由切换 / 骨架与列表切换」后调用：
   * 先让 lastScrollY 与真实 DOM 对齐；若在顶部附近则重置顶栏，避免切换后顶栏卡在半隐藏。
   */
  const syncScrollOrigin = useCallback(
    (scrollTop: number) => {
      lastScrollY.current = scrollTop;
      if (scrollTop < 10) {
        currentTranslateY.current = 0;
        updateHeader(0);
      }
    },
    [updateHeader]
  );

  // 监听列表视口高度：键盘弹出、字体缩放、窗口变化都会触发，虚拟列表需要同步 height
  useLayoutEffect(() => {
    const el = listViewportRef.current;
    if (!el) return;
    const update = () => setListViewportHeight(el.getBoundingClientRect().height);
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // 缓存 context 对象引用，避免 Outlet 每次父 render 都拿到新对象导致子树无意义更新
  const outletContext = useMemo<HomeFeedOutletContext>(
    () => ({ listViewportHeight, handleScroll, syncScrollOrigin }),
    [listViewportHeight, handleScroll, syncScrollOrigin]
  );

  return (
    // 根：整页固定铺满 —— 外层不滚动，滚动只发生在子面板自己的列表容器里
    <div className="fixed inset-0 w-full h-full bg-gray-50 flex flex-col overflow-hidden">
      {/* 供子列表容器隐藏滚动条（className: no-scrollbar），样式集中写在这里一次即可 */}
      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>

      {/*
        顶栏整块 fixed：通过 transform translateY 做显示/隐藏动画。
        pt-10：为系统状态栏/安全区预留；will-change-transform：提示浏览器优化合成层。
      */}
      <header
        ref={headerRef}
        className="fixed top-0 left-0 right-0 z-50 bg-white shadow-[0_1px_3px_rgba(0,0,0,0.05)] pt-10 will-change-transform"
      >
        <div
          ref={searchBarRef}
          className="h-[57px] px-4 py-3 flex items-center space-x-3 border-b border-gray-100/50 box-border"
        >
          <div className="flex-1">
            <Input
              placeholder="搜索你感兴趣的内容..."
              icon={<Search className="w-4 h-4 text-gray-400" />}
              className="bg-gray-100/80 border-transparent focus:bg-white focus:border-blue-200 focus:ring-2 focus:ring-blue-100 h-9 text-sm"
              onClick={() => navigate('/searchsuggestions')}
            />
          </div>
          <button
            type="button"
            className="group relative flex-shrink-0 active:scale-95 transition-transform duration-200 ml-1"
            onClick={() => navigate('/mine')}
          >
            <div className="w-9 h-9 rounded-full bg-gray-50 border border-gray-200 p-0.5 shadow-sm overflow-hidden flex items-center justify-center">
              {user?.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.nickname || 'User'}
                  className="w-full h-full rounded-full object-cover bg-white"
                />
              ) : (
                <div className="w-full h-full rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-sm">
                  {user?.nickname?.[0]?.toUpperCase() || 'G'}
                </div>
              )}
            </div>
          </button>
        </div>

        <div className="h-[48px] flex items-center justify-center relative bg-white box-border border-b border-gray-100">
          <NavLink
            to="/feed/posts"
            className={({ isActive }) =>
              `flex-1 h-full flex items-center justify-center text-[15px] font-medium transition-colors relative ${
                isActive ? 'text-blue-600' : 'text-gray-500 hover:text-gray-700'
              }`
            }
          >
            {({ isActive }) => (
              <>
                推荐文章
                {isActive && (
                  <span className="absolute bottom-0 w-6 h-1 bg-blue-600 rounded-t-full transition-all duration-300 ease-out" />
                )}
              </>
            )}
          </NavLink>
          <div className="w-[1px] h-3 bg-gray-200" />
          <NavLink
            to="/feed/questions"
            className={({ isActive }) =>
              `flex-1 h-full flex items-center justify-center text-[15px] font-medium transition-colors relative ${
                isActive ? 'text-blue-600' : 'text-gray-500 hover:text-gray-700'
              }`
            }
          >
            {({ isActive }) => (
              <>
                热门问答
                {isActive && (
                  <span className="absolute bottom-0 w-6 h-1 bg-blue-600 rounded-t-full transition-all duration-300 ease-out" />
                )}
              </>
            )}
          </NavLink>
        </div>
      </header>

      {/*
        主内容区：flex-1 占满 header 下方剩余高度；overflow-hidden 防止这里再出现一层全页滚动
      */}
      <main className="flex-1 relative w-full h-full overflow-hidden">
        {/*
          pt-[145px]：给 fixed header（搜索+Tab 总高度）留出占位，避免列表被遮挡；
          pb-24：给底部导航条留空；min-h-0：允许 flex 子项在列方向收缩，否则子列表 height 算不对
        */}
        <div className="h-full flex flex-col min-h-0 pt-[145px] pb-24 box-border">
          {/*
            listViewportRef：ResizeObserver 量的是「去掉顶底 padding 后，列表真正可用」的矩形高度
          */}
          <div ref={listViewportRef} className="flex-1 min-h-0 flex flex-col">
            {/* Outlet：/feed/posts 与 /feed/questions 各自渲染面板；context 同一份传下去 */}
            <Outlet context={outletContext} />
          </div>
        </div>
      </main>
    </div>
  );
}
