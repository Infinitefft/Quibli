import {
  useState,
} from 'react';

import type { Question } from '@/types'
import { Input } from '@/components/ui/input'



export default function PublishQuestions() {
  const [formData, setFormData] = useState<Question>();

  
  

  const handleSubmit = (e: React.FormEvent) {
    e.preventDefault();
  }



  return (
    <div>
      <form onSubmit={handleSubmit}>
        <div >
          <Input
            placeholder="请输入问题"  value={formData?.title} onChange={handleChange}
          />
        </div>
      </form>
    </div>
  )
}