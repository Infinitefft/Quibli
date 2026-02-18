import {
  useState,
} from 'react';
import { Input } from '@/components/ui/SearchInput';


export default function SearchDetails() {
  const [keyword, setKeyword] = useState('');
  



  return (
    <>
      <div >
        <Input 
          placeholder="搜索你感兴趣的内容..."
          className="bg-gray-100/80 border-transparent focus:bg-white focus:border-blue-200 focus:ring-2 focus:ring-blue-100 h-8 text-sm"
        />
      </div>

      {
        
      }
    </>
  );
}