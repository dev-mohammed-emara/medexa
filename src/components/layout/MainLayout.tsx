import React, { useEffect } from 'react'
import { useSidebar } from '../../contexts/SidebarContext'
import Navbar from './Navbar'
import Sidebar from './Sidebar'
import SupportTicket from '../ui/SupportTicket'
import { useLanguage } from '../../contexts/LanguageContext'
import { useLocation } from 'react-router-dom'

interface MainLayoutProps {
  children: React.ReactNode
}

const MainLayout = ({ children }: MainLayoutProps) => {
  const { isCollapsed, toggleSidebar } = useSidebar()
  const { dir } = useLanguage()
  const location = useLocation()

  useEffect(() => {
    // Add robots meta tag to protect dashboard pages from indexing
    let metaRobots = document.querySelector('meta[name="robots"]');
    if (!metaRobots) {
      metaRobots = document.createElement('meta');
      metaRobots.setAttribute('name', 'robots');
      document.head.appendChild(metaRobots);
    }
    metaRobots.setAttribute('content', 'noindex, nofollow');

    const lastPath = sessionStorage.getItem('medexa_last_path')
    const currentPath = location.pathname
    
    if (lastPath && lastPath !== currentPath) {
      Object.keys(sessionStorage).forEach(key => {
        if (key.startsWith('medexa_filter_')) {
          sessionStorage.removeItem(key)
        }
      })
    }
    
    sessionStorage.setItem('medexa_last_path', currentPath)
  }, [location.pathname])

  return (
    <div className="flex min-h-screen w-full flex-row bg-background" dir={dir}>
      {/* Persistent Sidebar */}
      <Sidebar isCollapsed={isCollapsed} onToggle={toggleSidebar} />

      {/* Main content area */}
      <div
        className="flex-1 min-w-0 flex flex-col transition-all duration-300 ease-in-out"
      >
        {/* Persistent Navbar */}
        <Navbar onMenuClick={toggleSidebar} />

        {/* Dynamic content */}
        <main className="relative flex-1 pb-20! min-h-0 overflow-y-auto overflow-x-hidden p-4 lg:p-6 custom-scrollbar scroll-smooth">
          {children}
          <SupportTicket />
        </main>
      </div>
    </div>
  )
}

export default MainLayout
