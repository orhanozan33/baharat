import { ReactNode } from 'react'
import { DealerSidebar } from '@/components/dealer/DealerSidebar'

export default function DealerLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        <DealerSidebar />
        <main className="flex-1 p-8">{children}</main>
      </div>
    </div>
  )
}


