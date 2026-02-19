import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { usePublishStore } from '@/store/publish';
import { Badge } from '@/components/ui/badge';
import { X, Plus, AlertCircle } from 'lucide-react'; 
import { Button } from '@/components/ui/button';
import PublishLayouts from '@/pages/Publish/PublishLayouts';
import { getWeightScore, truncateByWeight } from '@/utils/calculateweight';  // 引入权重计算工具

export default function PublishPost() {
  const currentPost = usePublishStore((state) => state.currentPost);
  const setPostData = usePublishStore((state) => state.setPostData);
  
  const [tagInput, setTagInput] = useState('');
  const [showTagError, setShowTagError] = useState(false);
  const [showTitleError, setShowTitleError] = useState(false);

  // --- 配置权重上限 ---
  const TITLE_MIN_SCORE = 10;    // 标题最小分
  const TITLE_SCORE_LIMIT = 46; // 标题最大总分
  const TAG_SCORE_LIMIT = 14;   // 单个标签权重上限
  const MAX_TAG_COUNT = 5;

  const tags = currentPost.tags || [];

  const titleScore = getWeightScore(currentPost?.title || '');

  // --- 标题输入处理 ---
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    const score = getWeightScore(val);
    if (score > TITLE_SCORE_LIMIT) {
      setPostData({ title: truncateByWeight(val, TITLE_SCORE_LIMIT) });
      setShowTitleError(true);
    } else {
      setPostData({ title: val });
      setShowTitleError(false);
    }
  };

  // --- 标签输入处理 (切权重计分) ---
  const handleTagInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    const score = getWeightScore(val);
    if (score > TAG_SCORE_LIMIT) {
      setTagInput(truncateByWeight(val, TAG_SCORE_LIMIT));
      setShowTagError(true);
    } else {
      setTagInput(val);
      setShowTagError(false);
    }
  };

  // --- 添加标签 ---
  const handleAddTag = () => {
    const trimmedTag = tagInput.trim();
    if (trimmedTag && !tags.includes(trimmedTag) && tags.length < MAX_TAG_COUNT) {
      setPostData({ tags: [...tags, trimmedTag] });
      setTagInput(''); 
      setShowTagError(false);
    }
  };

  // --- 删除标签 ---
  const removeTag = (e: React.MouseEvent, tagIndex: number) => {
    e.stopPropagation();
    e.preventDefault();
    const newTags = tags.filter((_, index) => index !== tagIndex);
    setPostData({ tags: newTags });
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowTagError(false);
      setShowTitleError(false);
    }, 2000);
    return () => clearTimeout(timer);
  }, [showTagError, showTitleError]);

  return (
    <PublishLayouts>
      <div className="p-4 space-y-6 bg-white min-h-screen">
        {/* 标题区 */}
        <div className="space-y-1">
          <div className="relative">
            <Input
              placeholder="请输入文章标题..."
              value={currentPost?.title || ''}
              onChange={handleTitleChange}
              className="border-none text-2xl font-black focus-visible:ring-0 px-0 placeholder:text-gray-300"
            />
            {currentPost.title && (
              <span 
                className={`absolute right-0 bottom-2 text-[10px] transition-colors font-medium
                  ${showTitleError ? 'text-red-500 font-bold' : (titleScore < TITLE_MIN_SCORE ? 'text-orange-400' : 'text-gray-400')}
                `}
              >
                {titleScore}/{TITLE_SCORE_LIMIT}
              </span>
            )}
          </div>
          
          {showTitleError ? (
            <p className="text-[11px] text-red-500 animate-pulse font-medium">标题容量已达上限</p>
          ) : titleScore > 0 && titleScore < TITLE_MIN_SCORE ? (
            <p className="text-[11px] text-orange-400 font-medium italic flex items-center gap-1">
              <AlertCircle className="w-3 h-3" /> 文章标题太短啦，再丰富一下吧
            </p>
          ) : null}
        </div>

        {/* 标签展示与录入 */}
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {tags.map((tag, index) => (
              <Badge key={`${tag}-${index}`} className="bg-blue-50 text-blue-600 border-none px-3 py-1.5 rounded-full flex items-center gap-1">
                {tag}
                <span onClick={(e) => removeTag(e, index)} className="cursor-pointer">
                  <X className="w-3.5 h-3.5" />
                </span>
              </Badge>
            ))}
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2 border-b border-gray-100 pb-1 focus-within:border-blue-500 transition-colors">
              <div className="relative flex-1">
                <input
                  value={tagInput}
                  onChange={handleTagInputChange}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                  placeholder={tags.length >= MAX_TAG_COUNT ? "标签已达上限" : "添加文章标签..."}
                  disabled={tags.length >= MAX_TAG_COUNT}
                  className="w-full outline-none text-sm py-2 bg-transparent"
                />
                {tagInput.length > 0 && (
                  <span className={`absolute right-0 top-1/2 -translate-y-1/2 text-[10px] transition-colors ${showTagError ? 'text-red-500 font-bold' : 'text-gray-400'}`}>
                    {getWeightScore(tagInput)}/{TAG_SCORE_LIMIT}
                  </span>
                )}
              </div>
              <Button variant="ghost" size="sm" onClick={handleAddTag} disabled={!tagInput.trim() || tags.length >= MAX_TAG_COUNT}>
                <Plus className="w-4 h-4 mr-1" />添加
              </Button>
            </div>
            {showTagError && (
              <p className="flex items-center gap-1 text-[11px] text-red-500 animate-pulse font-medium">
                <AlertCircle className="w-3 h-3" />
                单标签长度已达上限
              </p>
            )}
          </div>
        </div>

        {/* 正文 */}
        <div className="pt-2">
          <Textarea
            placeholder="既然来了，就写点什么吧..."
            value={currentPost?.content || ''}
            onChange={(e) => setPostData({ content: e.target.value })}
            className="border-none focus-visible:ring-0 px-0 text-base leading-relaxed min-h-[400px] resize-none placeholder:text-gray-300"
          />
        </div>
      </div>
    </PublishLayouts>
  );
}