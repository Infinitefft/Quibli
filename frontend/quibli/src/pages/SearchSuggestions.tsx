import { useState, useEffect, useRef } from 'react';
import { Input } from '@/components/ui/SearchInput';
import { useSearchSuggestionsStore } from '@/store/searchSuggestions';
import { ArrowLeft, X, Search, Trash2, Edit3, Check } from 'lucide-react'; // 新增图标
import { useDebounce } from '@/hooks/useDebounce'; 
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import { ScrollArea } from '@/components/ui/scroll-area';

export default function SearchSuggestions() {
  const navigate = useNavigate();
  const [keyword, setKeyword] = useState('');
  const [isEditing, setIsEditing] = useState(false); // 控制是否进入清除/编辑模式
  const inputRef = useRef<HTMLInputElement>(null);

  const debouncedKeyword = useDebounce(keyword, 300);  // 防抖

  const {
    loading,
    suggestions,
    history,
    searchSuggestions,
    addHistory,
    clearHistory,
    delete: deleteHistory,
  } = useSearchSuggestionsStore();

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {   // 当防抖后的关键词变化时，触发搜索建议
    if (debouncedKeyword.trim()) {
      searchSuggestions(debouncedKeyword);
    }
  }, [debouncedKeyword, searchSuggestions]);

  // 统一的搜索跳转逻辑
  const handleSearch = (searchKey: string) => {   // 搜索
    const trimmed = searchKey.trim();
    if (!trimmed) return;
    
    addHistory(trimmed);    // 添加搜索历史
    
    // 跳转到搜索结果页，将关键词放在 URL 参数中
    // 这样能解决请求丢失 keyword 的问题，且符合标准的搜索交互
    navigate(`/search?keyword=${encodeURIComponent(trimmed)}&type=post`);
  };

  return (
    <div className="pt-12 p-3 max-w-md mx-auto min-h-screen bg-background">
      <div className="flex items-center gap-2">
        <Button size="icon" variant="ghost" onClick={() => navigate('/')}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div className="relative flex-1">
          <Input 
            value={keyword} 
            onChange={(e) => setKeyword(e.target.value)}
            ref={inputRef}
            className="pr-9 rounded-full bg-muted/50 border-none"
            placeholder="搜索你感兴趣的内容"
            // 支持按下回车键直接搜索
            onKeyDown={(e) => e.key === 'Enter' && handleSearch(keyword)}
          />
          {
            keyword && (
              <Button size="icon" variant="ghost"
                className="absolute right-2 top-1/2 -translate-y-1/2 w-5 h-5 p-0 hover:bg-transparent"
                onClick={() => setKeyword("")}
              >
                <X className="w-4 h-4 text-muted-foreground" />
              </Button>
            )
          }
        </div>
        <Button size="icon" variant="ghost" onClick={() => handleSearch(keyword)}>
          <Search className="w-5 h-5 text-primary" />
        </Button>
      </div>

      {/* 历史记录部分 */}
      {!keyword && (
        <div className="mt-6 px-1">
          <div className="flex justify-between items-center mb-4">
            <span className="text-sm font-bold text-foreground/80">搜索历史</span>
            
            {/* 只有有历史记录时才显示管理按钮 */}
            {history.length > 0 && (
              <div className="flex items-center gap-3">
                {/* 清空按钮：仅在编辑模式下出现 */}
                {isEditing && (
                  <button 
                    onClick={() => {
                      clearHistory();
                      setIsEditing(false); // 清空后退出编辑模式
                    }}
                    className="text-xs text-destructive flex items-center gap-1 animate-in fade-in slide-in-from-right-2"
                  >
                    <Trash2 className="w-3 h-3" />
                    清空全部
                  </button>
                )}
                
                {/* 切换模式按钮 */}
                <button 
                  onClick={() => setIsEditing(!isEditing)}
                  className="text-xs text-blue-600 font-medium flex items-center gap-1"
                >
                  {isEditing ? (
                    <><Check className="w-3 h-3" /> 完成</>
                  ) : (
                    <><Edit3 className="w-3 h-3" /> 清除</>
                  )}
                </button>
              </div>
            )}
          </div>

          {history.length > 0 ? (
            <div className="flex flex-wrap gap-x-3 gap-y-4">
              {history.map((item, index) => (
                <div key={`${item}-${index}`} className="relative">
                  <button
                    disabled={isEditing} // 编辑模式下禁止点击跳转搜索
                    onClick={() => { 
                      setKeyword(item);
                      handleSearch(item);
                    }}
                    className={`px-4 py-2 rounded-lg text-sm transition-all max-w-[150px] truncate block
                      ${isEditing ? 'bg-muted/40 text-muted-foreground opacity-70' : 'bg-muted text-secondary-foreground hover:bg-muted/80'}
                    `}
                  >
                    {item}
                  </button>
                  
                  {/* 右上角删除按钮：仅在编辑模式出现 */}
                  {isEditing && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteHistory(index);
                      }}
                      className="absolute -top-2 -right-2 w-5 h-5 bg-destructive text-white rounded-full flex items-center justify-center shadow-md border-2 border-background animate-in zoom-in"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center text-xs text-muted-foreground border-2 border-dashed border-muted rounded-xl">
              暂无搜索历史记录
            </div>
          )}
        </div>
      )}
      
      {/* 搜索建议列表逻辑保留 */}
      {
        keyword && (
          <Card className="mb-3 mt-4 border-none shadow-none bg-transparent">
            <CardContent className="p-0">
              <ScrollArea className="h-[70vh]">
                {
                  loading && (
                    <div className="p-4 text-center text-sm text-muted-foreground">
                      搜索中...
                    </div>
                  )
                }
                {
                  !loading && suggestions.length === 0 && (
                    <div className="p-5 text-center text-sm text-muted-foreground">
                      暂无搜索建议
                    </div>
                  )
                }
                {
                  suggestions.map((item, index) => (
                    <div key={index} 
                      className="flex items-center px-2 py-4 border-b border-border/50 text-[15px] active:bg-muted cursor-pointer transition-colors"
                      onClick={() => {
                        setKeyword(item);
                        handleSearch(item);
                      }}
                    >
                      <Search className="w-4 h-4 mr-3 text-muted-foreground shrink-0" />
                      <span className="truncate flex-1">{item}</span>
                    </div>
                  ))
                }
              </ScrollArea>
            </CardContent>
          </Card>
        )
      }
    </div>
  );
}