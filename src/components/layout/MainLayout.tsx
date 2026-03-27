import React from 'react'
import { useSidebar } from '../../contexts/SidebarContext'
import Navbar from './Navbar'
import Sidebar from './Sidebar'

interface MainLayoutProps {
  children: React.ReactNode
}

const MainLayout = ({ children }: MainLayoutProps) => {
  const { isCollapsed, setIsCollapsed, toggleSidebar } = useSidebar()

  return (
    <div className="flex min-h-screen w-full flex-row bg-background" dir="rtl">
      {/* Persistent Sidebar */}
      <Sidebar isCollapsed={isCollapsed} onToggle={toggleSidebar} />

      {/* Main content area */}
      <div
        className="flex-1 min-w-0 flex flex-col transition-all duration-300 ease-in-out"
      >
        {/* Persistent Navbar */}
        <Navbar onMenuClick={toggleSidebar} />

        {/* Dynamic content */}
        <main className="relative flex-1 min-h-0 overflow-y-auto overflow-x-hidden p-4 lg:p-6 custom-scrollbar scroll-smooth">
          {children}
        </main>
      </div>
    </div>
  )
}

export default MainLayout
