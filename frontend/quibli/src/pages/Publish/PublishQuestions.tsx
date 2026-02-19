import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { usePublishStore } from '@/store/publish';
import { Badge } from '@/components/ui/badge';
import { X, Plus, AlertCircle } from 'lucide-react'; 
import { Button } from '@/components/ui/button';

export default function PublishQuestions() {
  const currentQuestion = usePublishStore((state) => state.currentQuestion);
  const setQuestionData = usePublishStore((state) => state.setQuestionData);
  
  const [tagInput, setTagInput] = useState('');
  const [showTagError, setShowTagError] = useState(false);
  const [showTitleError, setShowTitleError] = useState(false);

  // --- 配置权重上限 ---
  const TITLE_MIN_SCORE = 7;    // 新增：标题最小分值
  const TITLE_SCORE_LIMIT = 46; // 标题最大总分
  const TAG_SCORE_LIMIT = 14;   // 单个标签总分
  const MAX_TAG_COUNT = 5;

  const tags = currentQuestion.tags || [];

  // --- 核心工具函数：权重计算 ---
  const getWeightScore = (str: string) => {
    let score = 0;
    for (const char of str) {
      score += /[\u4e00-\u9fa5]/.test(char) ? 2 : 1;
    }
    return score;
  };

  // --- 核心工具函数：按权重截断 ---
  const truncateByWeight = (str: string, limit: number) => {
    let score = 0;
    let result = '';
    for (const char of str) {
      const charWeight = /[\u4e00-\u9fa5]/.test(char) ? 2 : 1;
      if (score + charWeight <= limit) {
        score += charWeight;
        result += char;
      } else {
        break;
      }
    }
    return result;
  };

  const titleScore = getWeightScore(currentQuestion?.title || '');

  // --- 标题输入函数 ---
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    const score = getWeightScore(val);
    if (score > TITLE_SCORE_LIMIT) {
      setQuestionData({ title: truncateByWeight(val, TITLE_SCORE_LIMIT) });
      setShowTitleError(true);
    } else {
      setQuestionData({ title: val });
      setShowTitleError(false);
    }
  };

  // --- 标签输入处理逻辑 ---
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

  const handleAddTag = () => {
    const trimmedTag = tagInput.trim();
    if (trimmedTag && !tags.includes(trimmedTag) && tags.length < MAX_TAG_COUNT) {
      setQuestionData({ tags: [...tags, trimmedTag] });
      setTagInput(''); 
      setShowTagError(false);
    }
  };

  const removeTag = (e: React.MouseEvent, tagIndex: number) => {
    e.stopPropagation();
    e.preventDefault();
    const newTags = tags.filter((_, index) => index !== tagIndex);
    setQuestionData({ tags: newTags });
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowTagError(false);
      setShowTitleError(false);
    }, 2000);
    return () => clearTimeout(timer);
  }, [showTagError, showTitleError]);

  return (
    <div className="p-4 space-y-6 bg-white min-h-screen">
      {/* 标题输入区 */}
      <div className="space-y-1">
        <div className="relative">
          <Input
            placeholder="清晰的问题标题能获得更多回答..."
            value={currentQuestion?.title || ''}
            onChange={handleTitleChange}
            className="border-none text-xl font-bold focus-visible:ring-0 px-0 placeholder:text-gray-300"
          />
          {currentQuestion.title && (
            <span 
              className={`absolute right-0 bottom-2 text-[10px] transition-colors font-medium
                ${showTitleError ? 'text-red-500 font-bold' : (titleScore < TITLE_MIN_SCORE ? 'text-orange-400' : 'text-gray-400')}
              `}
            >
              {titleScore}/{TITLE_SCORE_LIMIT}
            </span>
          )}
        </div>
        
        {/* 动态校验提示 */}
        {showTitleError ? (
          <p className="text-[11px] text-red-500 animate-pulse font-medium">标题内容过长，建议精简描述</p>
        ) : titleScore > 0 && titleScore < TITLE_MIN_SCORE ? (
          <p className="text-[11px] text-orange-400 font-medium italic flex items-center gap-1">
             <AlertCircle className="w-3 h-3" /> 标题太短啦，再多写一点吧
          </p>
        ) : null}
      </div>

      <div className="space-y-4">
        {/* 已有标签展示区 */}
        <div className="flex flex-wrap gap-2">
          {tags.map((tag, index) => (
            <Badge 
              key={`${tag}-${index}`} 
              className="bg-blue-50 text-blue-600 hover:bg-blue-100 border-none px-3 py-1.5 rounded-full flex items-center gap-1"
            >
              {tag}
              <span 
                onClick={(e) => removeTag(e, index)}
                className="hover:bg-blue-200 rounded-full p-0.5 transition-colors cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </span>
            </Badge>
          ))}
        </div>

        {/* 标签录入区 */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 border-b border-gray-100 pb-1 focus-within:border-blue-500 transition-colors">
            <div className="relative flex-1">
              <input
                value={tagInput}
                onChange={handleTagInputChange}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                placeholder={tags.length >= MAX_TAG_COUNT ? "标签已达上限" : "添加标签..."}
                disabled={tags.length >= MAX_TAG_COUNT}
                className="w-full outline-none text-sm py-2 bg-transparent disabled:text-gray-400"
              />
              
              {tagInput.length > 0 && (
                <span className={`absolute right-0 top-1/2 -translate-y-1/2 text-[10px] transition-colors ${showTagError ? 'text-red-500 font-bold' : 'text-gray-400'}`}>
                  {getWeightScore(tagInput)}/{TAG_SCORE_LIMIT}
                </span>
              )}
            </div>
            
            <Button 
              type="button"
              size="sm"
              variant="ghost"
              onClick={handleAddTag}
              disabled={!tagInput.trim() || tags.length >= MAX_TAG_COUNT}
              className="text-blue-500 hover:text-blue-600 font-medium"
            >
              <Plus className="w-4 h-4 mr-1" />
              添加
            </Button>
          </div>

          {showTagError ? (
            <p className="flex items-center gap-1 text-[11px] text-red-500 animate-pulse font-medium">
              <AlertCircle className="w-3 h-3" />
              单标签长度已达上限
            </p>
          ) : (
            <p className="flex items-center gap-1 text-[11px] text-gray-400 italic">
              <AlertCircle className="w-3 h-3" />
              添加合适的标签，能让问题更精准地推送给专业人士
            </p>
          )}
        </div>
      </div>
    </div>
  );
}