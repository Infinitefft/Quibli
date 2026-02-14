import {
  Outlet
} from 'react-router-dom'

import BottomNav from '@/components/BottomNav'


export default function MianLayout() {
  return (
    <div className="min-h-screen bg-gray-50 pb-16">
      <div className="h-full w-full o-hidden">
        <Outlet />
      </div>
      {/* 底栏 */}
      <BottomNav />
    </div>
  )
}