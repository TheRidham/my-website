import Jaiya from '@/components/Jaiya/Index'
import React from 'react'

function Layout({ children }: {children: React.ReactNode}) {
  return (
    <section
      className='md:flex md:flex-row min-w-screen min-h-screen'
    >
      <div className='xl:max-w-1/3 lg:max-w-2/5 md:max-w-1/2 flex-1 border-r border-black'>
        { children }
      </div>
      <div
        className='hidden md:block flex-1'
      >
        <Jaiya />
      </div>
    </section>
  )
}

export default Layout