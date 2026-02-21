import { useState, useEffect, useRef } from 'react';
import { Input } from '@/components/ui/SearchInput';
import { useSearchSuggestionsStore } from '@/store/searchSuggestions';
import { ArrowLeft, X, Search } from 'lucide-react';
import { useDebounce } from '@/hooks/useDebounce'; 
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import { ScrollArea } from '@/components/ui/scroll-area';

export default function SearchSuggestions() {
  const navigate = useNavigate();
  const [keyword, setKeyword] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const debouncedKeyword = useDebounce(keyword, 300);  // 防抖

  const {
    loading,
    suggestions,
    history,
    searchSuggestions,
    addHistory,
    clearHistory,
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
    <div className="p-3 max-w-md mx-auto">
      <div className="flex items-center gap-2">
        <Button size="icon" variant="ghost" onClick={() => navigate('/')}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div className="relative flex-1">
          <Input 
            value={keyword} 
            onChange={(e) => setKeyword(e.target.value)}
            ref={inputRef}
            className="pr-9"
            placeholder="搜索你感兴趣的内容"
            // 支持按下回车键直接搜索
            onKeyDown={(e) => e.key === 'Enter' && handleSearch(keyword)}
          />
          {
            keyword && (
              <Button size="icon" variant="ghost"
                className="absolute right-2 top-1/2 -translate-y-1/2 w-5 h-5 p-0"
                onClick={() => setKeyword("")}
              >
                <X className="w-5 h-5" />
              </Button>
            )
          }
        </div>
        <Button size="icon" variant="ghost" onClick={() => handleSearch(keyword)}>
          <Search className="w-5 h-5" />
        </Button>
      </div>

      {
        !keyword && history.length > 0 && (
          <Card className="mb-3 mt-4">
            <CardContent className="p-3">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium">搜索历史</span>
                <Button size="sm" variant="ghost" onClick={() => clearHistory()}>
                  清空
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {
                  history.map((item) => (
                    <Button key={item} variant="secondary" size="sm"
                      onClick={() => { 
                        setKeyword(item);
                        handleSearch(item);
                      }}
                    >
                      {item}
                    </Button>
                  ))
                }
              </div>
            </CardContent>
          </Card>
        )
      }
      
      {
        keyword && (
          <Card className="mb-3 mt-4">
            <CardContent className="p-0">
              <ScrollArea className="h-[60vh]">
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
                    <div key={index} className="px-4 py-3 border-b text-sm active:bg-muted cursor-pointer"
                      onClick={() => {
                        setKeyword(item);
                        handleSearch(item);
                      }}
                    >
                      {item}
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