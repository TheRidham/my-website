import { CustomTabs } from '@/components/CustomizeAI/CustomTabs';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ArrowLeft, Settings } from 'lucide-react'
import Link from 'next/link';
import { redirect } from 'next/navigation';
import React, { ReactNode } from 'react'

const Layout = ({ children }: { children: ReactNode}) => {

  return (
    <div className='max-w-5xl mx-auto'>
      <header>
        <div className="px-5 py-4">
          <div className="flex items-center gap-2 mb-1">
            <Link 
              href={'/'}
              className='p-3 hover:bg-primary/10 rounded-2xl'
            >
              <ArrowLeft size={22} />
            </Link>
            <Settings size={22} className="text-primary" />
            <h1 className="text-xl font-extrabold text-gray-900 tracking-tight">
              Customize Your AI
            </h1>
            <p className='ml-2 border-primary border-2 rounded-xl bg-primary/5 text-primary text-sm px-2 py-px font-medium'>
              Beta
            </p>
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