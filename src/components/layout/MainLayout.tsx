import React, { useState } from 'react'
import { useMediaQuery } from 'react-responsive'
import Sidebar from './Sidebar'
import Navbar from './Navbar'

interface MainLayoutProps {
  children: React.ReactNode
}

const MainLayout = ({ children }: MainLayoutProps) => {
  const isDesktop = useMediaQuery({ query: '(min-width: 1024px)' })
  const [isCollapsed, setIsCollapsed] = useState(!isDesktop)

  return (
    <div className="flex min-h-screen w-full flex-row bg-background" dir="rtl">
      {/* Persistent Sidebar */}
      <Sidebar isCollapsed={isCollapsed} onToggle={() => setIsCollapsed(!isCollapsed)} />

      {/* Main content area */}
      <div
        className="flex-1 min-w-0 flex flex-col transition-all duration-300 ease-in-out"
      >
        {/* Persistent Navbar */}
        <Navbar onMenuClick={() => setIsCollapsed(!isCollapsed)} />

        {/* Dynamic content */}
        <main className="relative flex-1 min-h-0 overflow-y-auto overflow-x-hidden p-4 lg:p-6 custom-scrollbar scroll-smooth">
          {children}
        </main>
      </div>
    </div>
  )
}

export default MainLayout
