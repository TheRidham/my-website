import { CustomTabs } from '@/components/CustomizeAI/CustomTabs';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Settings } from 'lucide-react'
import { redirect } from 'next/navigation';
import React, { ReactNode } from 'react'

const Layout = ({ children }: { children: ReactNode}) => {

  return (
    <div className='max-w-5xl mx-auto'>
      <header>
        <div className="px-5 pt-6 pb-4">
          <div className="flex items-center gap-2 mb-1">
            <Settings size={20} className="text-primary" />
            <h1 className="text-xl font-extrabold text-gray-900 tracking-tight">
              Customize Your AI
            </h1>
          </div>
          <p className="text-sm text-gray-500 leading-relaxed">
            Settings to get highly personalized AI assistance
          </p>
        </div>
      </header>
      <CustomTabs>
        {children}
      </CustomTabs>
    </div>
  )
}

export default Layout