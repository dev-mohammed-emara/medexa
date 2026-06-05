import React from 'react'
import { useSidebar } from '../../contexts/SidebarContext'
import { cn } from '../../utils/cn'
import AdminNavbar from './AdminNavbar'
import AdminSidebar from './AdminSidebar'
import SupportTicket from '../ui/SupportTicket'

interface AdminLayoutProps {
  children: React.ReactNode
}

const AdminLayout = ({ children }: AdminLayoutProps) => {
  const { isCollapsed, toggleSidebar } = useSidebar()

  return (
    <div className="flex min-h-screen w-full flex-row bg-[#F8FAFC]" dir="rtl">
      {/* Admin Sidebar */}
      <AdminSidebar isCollapsed={isCollapsed} onToggle={toggleSidebar} />

      {/* Main content area */}
      <div
        className={cn(
          "flex-1 min-w-0 flex flex-col transition-all duration-300 ease-in-out",
          isCollapsed ? "lg:mr-[80px]" : "lg:mr-[280px]"
        )}
      >
        {/* Admin Navbar */}
        <AdminNavbar onMenuClick={toggleSidebar} />

        {/* Dynamic content */}
        <main className="relative flex-1 min-h-0 overflow-y-auto overflow-x-hidden p-4 lg:p-8 custom-scrollbar scroll-smooth">
          {children}
          <SupportTicket />
        </main>
      </div>
    </div>
  )
}

export default AdminLayout
