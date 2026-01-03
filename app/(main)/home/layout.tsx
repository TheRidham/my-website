import React from 'react'

function Layout({ children }: {children: React.ReactNode}) {
  return (
    <div>
      common home layout UI as app
      { children }
    </div>
  )
}

export default Layout