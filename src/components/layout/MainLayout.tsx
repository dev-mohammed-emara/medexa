import React, { useState } from 'react'
import Sidebar from './Sidebar'
import Navbar from './Navbar'

interface MainLayoutProps {
  children: React.ReactNode
}

const MainLayout = ({ children }: MainLayoutProps) => {
  const [isCollapsed, setIsCollapsed] = useState(false)

  return (
    <div className="min-h-screen bg-background flex flex-row-reverse" dir="rtl">
      {/* Persistent Sidebar */}
      <Sidebar isCollapsed={isCollapsed} onToggle={() => setIsCollapsed(!isCollapsed)} />

      {/* Main content area */}
      <div 
        className="flex-1 flex flex-col transition-[margin-right] duration-300 ease-in-out will-change-[margin-right]"
        style={{ marginRight: isCollapsed ? '80px' : '280px' }}
      >
        {/* Persistent Navbar */}
        <Navbar />

        {/* Dynamic content */}
        <main className="flex-1 p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  )
}

export default MainLayout
