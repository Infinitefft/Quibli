import { 
  useState, 
  useEffect
} from 'react';
import { Input } from '@/components/ui/input';
import { usePublishStore } from '@/store/publish';
import { Badge } from '@/components/ui/badge';
import { X, Plus, AlertCircle } from 'lucide-react'; 
import { Button } from '@/components/ui/button';

export default function PublishQuestions() {
  const currentQuestion = usePublishStore((state) => state.currentQuestion);
  const setQuestionData = usePublishStore((state) => state.setQuestionData);
  
  const [tagInput, setTagInput] = useState('');
  // 新增：用于显示超长提示的状态
  const [showError, setShowError] = useState(false);

  const MAX_CN_LENGTH = 7;
  const MAX_EN_LENGTH = 16;
  const MAX_TAG_COUNT = 5;

  // 这里的技巧：在组件顶部先定义好安全的 tags 数组，下面就不用到处写 ?? [] 了
  const tags = currentQuestion.tags || [];

  // --- 添加标签函数 ---
  const handleAddTag = () => {
    const trimmedTag = tagInput.trim();
    // 校验：不能为空、不能重复、最多5个标签
    if (trimmedTag && !tags.includes(trimmedTag) && tags.length < MAX_TAG_COUNT) {
      setQuestionData({ tags: [...tags, trimmedTag] });
      setTagInput(''); 
      setShowError(false);
    }
  };

  // --- 删除标签函数 ---
  const removeTag = (e: React.MouseEvent, tagIndex: number) => {
    e.stopPropagation();
    e.preventDefault();
    const newTags = tags.filter((_, index) => index !== tagIndex);
    setQuestionData({ tags: newTags });
  };

  // --- 标题输入函数 ---
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuestionData({ title: e.target.value });
  };

  // --- 封装：标签输入处理逻辑 ---
  const handleTagInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    // 实时检查新输入的字符串是否包含中文
    const willHaveChinese = /[\u4e00-\u9fa5]/.test(val);
    const limit = willHaveChinese ? MAX_CN_LENGTH : MAX_EN_LENGTH;
    
    // 如果切换字符类型导致长度溢出，则进行截断，否则正常输入
    if (val.length > limit) {
      setTagInput(val.slice(0, limit));
      setShowError(true); // 触发截断时显示提示
    } else {
      setTagInput(val);
      setShowError(false);
    }
  };

  // 提示显示 2 秒后自动消失
  useEffect(() => {
    if (showError) {
      const timer = setTimeout(() => setShowError(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [showError]);

  // --- 校验标签长度函数 ---
  const hasChinese = /[\u4e00-\u9fa5]/.test(tagInput);
  const currentLimit = hasChinese ? MAX_CN_LENGTH : MAX_EN_LENGTH;

  return (
    <div className="p-4 space-y-6 bg-white min-h-screen">
      {/* 标题输入 */}
      <Input
        placeholder="清晰的问题标题能获得更多回答..."
        value={currentQuestion?.title || ''}
        onChange={handleTitleChange}
        className="border-none text-xl font-bold focus-visible:ring-0 px-0 placeholder:text-gray-300"
      />

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
                className="hover:bg-blue-200 rounded-full p-0.5 transition-colors"
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
                <span className={`absolute right-0 top-1/2 -translate-y-1/2 text-[10px] transition-colors ${showError ? 'text-red-500 font-bold' : 'text-gray-400'}`}>
                  {tagInput.length}/{currentLimit}
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

          {/* 引导文案：不强制，但告诉用户好处。当报错时显示错误提示。 */}
          {showError ? (
            <p className="flex items-center gap-1 text-[11px] text-red-500 animate-pulse font-medium">
              <AlertCircle className="w-3 h-3" />
              已达该类字符长度上限 (中文{MAX_CN_LENGTH}/英文{MAX_EN_LENGTH})
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