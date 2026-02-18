import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/SearchInput';
import { useSearchSuggestionsStore } from '@/store/searchSuggestions';
import { ArrowLeft, X, Search } from 'lucide-react';
import { useDebounce } from '@/hooks/useDebounce'; 
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import { ScrollArea } from '@/components/ui/scroll-area';



export default function SearchDetails() {
  const navigate = useNavigate();
  const [keyword, setKeyword] = useState('');

  const debouncedKeyword = useDebounce(keyword, 300);  // 防抖

  const {
    loading,
    suggestions,
    history,
    searchSuggestions,
    addHistory,
    clearHistory,
  } = useSearchSuggestionsStore();

  useEffect(() => {   // 当防抖后的关键词变化时，触发搜索建议
    if (debouncedKeyword.trim()) {
      searchSuggestions(debouncedKeyword);
    }
  }, [debouncedKeyword, searchSuggestions]);

  const handleSearch = (debouncedKeyword: string) => {   // 搜索
    if (!debouncedKeyword.trim()) return;
    addHistory(debouncedKeyword);    // 添加搜索历史
    // console.log("Searching for:", debouncedKeyword);
  };

  return (
    <div className="p-3 max-w-md mx-auto">
      <div className="flex items-center gap-2">
        <Button size="icon" variant="ghost" onClick={() => navigate(-1)}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div className="relative flex-1">
          <Input value={keyword} onChange={(e) => setKeyword(e.target.value)}
            placeholder="搜索你感兴趣的内容" className="pr-9"
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
        <Button size="icon" variant="ghost" onClick={()=>handleSearch(keyword)}>
          <Search className="w-5 h-5" />
        </Button>
      </div>

      {
        !keyword && history.length > 0 && (
          <Card className="mb-3">
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
                      onClick={() => { handleSearch(item); setKeyword(item)}}
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
          <Card className="mb-3">
            <CardContent className="p-0">
              {/* ScrollArea 为移动端丝滑滚动而生 */}
              <ScrollArea className="h-[60vh]">
                {
                  loading && (
                    <div className="p-4 text-center text-sm text-muted-foreground">
                      搜索中...
                    </div>
                  )
                }
                {/* --------------------------------------- */}
                {
                  !loading && suggestions.length === 0 && (
                    <div className="p-5 text-center text-sm text-muted-foreground">
                      暂无搜索结果
                    </div>
                  )
                }
                {/* --------------------------------------- */}
                {
                  suggestions.map((item, index) => (
                    <div key={index} className="px-4 py-3 border-b text-sm active:bg-muted"
                      onClick={() => navigate('/')}
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