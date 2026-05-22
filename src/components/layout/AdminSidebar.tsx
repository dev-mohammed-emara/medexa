import { gsap } from 'gsap'
import {
  LayoutDashboard,
  Users,
  UserCheck,
  Building2,
  ClipboardCheck,
  Ticket,
  ShieldCheck,
  BarChart2,
  FileText,
  Settings,
  Menu,
  X,
  Shield,
  ChevronLeft,
  Eye
} from 'lucide-react'
import { useEffect, useRef } from 'react'
import { useMediaQuery } from 'react-responsive'
import { useLocation } from 'react-router-dom'
import { usePreloader } from '../../contexts/PreloaderContext'
import { cn } from '../../utils/cn'
import { TransitionLink } from '../transition/TransitionLink'

const adminNavItems = [
  { icon: LayoutDashboard, label: 'لوحة التحكم', href: '/admin/dashboard' },
  { icon: Users, label: 'إدارة المستخدمين', href: '/admin/users' },
  { icon: UserCheck, label: 'إدارة المرضى', href: '/admin/patients' },
  { icon: Building2, label: 'إدارة العيادات', href: '/admin/clinics' },
  { icon: ClipboardCheck, label: 'موافقات العيادات', href: '/admin/approvals' },
  { icon: Ticket, label: 'تذاكر الدعم', href: '/admin/tickets' },
  { icon: ShieldCheck, label: 'إدارة المدراء', href: '/admin/managers' },
  { icon: BarChart2, label: 'الإحصائيات', href: '/admin/stats' },
  { icon: FileText, label: 'سجلات التدقيق', href: '/admin/audit-logs' },
  { icon: Settings, label: 'الإعدادات', href: '/admin/settings' },
]

interface AdminSidebarProps {
  isCollapsed: boolean
  onToggle: () => void
}

const AdminSidebar = ({ isCollapsed, onToggle }: AdminSidebarProps) => {
  const { isLoaded, isExiting } = usePreloader()
  const canAnimate = isLoaded && !isExiting
  const location = useLocation()
  const navContainerRef = useRef<HTMLDivElement>(null)
  const isWideScreen = useMediaQuery({ query: '(min-width: 1024px)' })

  useEffect(() => {
    if (!canAnimate || !isWideScreen) return

    const ctx = gsap.context(() => {
      gsap.fromTo(".admin-nav-item-animate",
        { x: 20, opacity: 0 },
        {
          x: 0,
          opacity: 1,
          stagger: 0.04,
          duration: 0.7,
          ease: "power2.out",
          delay: 0.15
        }
      )
    }, navContainerRef)

    return () => ctx.revert()
  }, [canAnimate, isWideScreen])

  useEffect(() => {
    const handlePopState = () => {
      if (!isCollapsed && !isWideScreen) {
        onToggle()
      }
    }
    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [isCollapsed, isWideScreen, onToggle])

  return (
    <>
      {!isCollapsed && (
        <div
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-15 lg:hidden"
          onClick={onToggle}
        />
      )}

      <aside
        className={cn(
          "bg-white border-l border-gray-200 shadow-sm flex flex-col transition-all duration-300 ease-in-out fixed inset-y-0 right-0 z-20 h-screen",
          isCollapsed
            ? "w-[80px]"
            : "w-full max-w-full sm:max-w-[280px] lg:w-[280px]",
          // Hide/Show on mobile
          isCollapsed
            ? "translate-x-[120%] lg:translate-x-0"
            : "translate-x-0 visible"
        )}
      >
        {/* Header */}
        <div className="h-20 flex items-center justify-center border-b border-gray-100 px-4 whitespace-nowrap overflow-hidden relative shrink-0">
          {isCollapsed ? (
            <div className="w-10 h-10 bg-gradient-to-br from-[#0B5A8E] to-[#3FB8AF] rounded-xl flex items-center justify-center shadow-md shrink-0">
              <Shield className="text-white size-5" />
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-br from-[#0B5A8E] to-[#3FB8AF] rounded-xl flex items-center justify-center shadow-md shrink-0">
                <Shield className="text-white size-5" />
              </div>
              <div className="text-right">
                <h2 className="text-lg text-[#1A2B3C] font-bold">Medexa Cloud</h2>
                <p className="text-xs text-gray-500">لوحة الإدارة</p>
              </div>
            </div>
          )}

          {!isWideScreen && !isCollapsed && (
            <button
              onClick={onToggle}
              className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center rounded-xl bg-gray-50 text-gray-500 hover:bg-red-50 hover:text-red-500 transition-all active:scale-95 cursor-pointer"
            >
              <X className="size-5" />
            </button>
          )}
        </div>

        {/* Navigation Items */}
        <nav
          ref={navContainerRef}
          className="flex-1 py-6 px-3 overflow-y-auto no-scrollbar whitespace-nowrap"
        >
          <div className="space-y-1">
            {adminNavItems.map((item, index) => {
              const isClinicDetails = item.href === '/admin/clinics' && location.pathname.startsWith('/admin/clinics/') && location.pathname !== '/admin/clinics'
              const isActive = location.pathname === item.href || (item.href === '/admin/clinics' && location.pathname.startsWith('/admin/clinics/'))
              return (
                <TransitionLink
                  key={index}
                  href={item.href}
                  onClick={() => {
                    if (!isWideScreen) onToggle()
                  }}
                  className={cn(
                    "relative w-full font-medium flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 will-change-transform group admin-nav-item-animate",
                    !isWideScreen ? "opacity-100" : "opacity-0",
                    isActive
                      ? "bg-gradient-to-r from-[#0B5A8E]/10 to-[#3FB8AF]/10 text-[#0B5A8E] shadow-sm border border-[#0B5A8E]/20"
                      : "text-gray-600 hover:bg-gray-50 hover:text-[#0B5A8E]"
                  )}
                >
                  <div className="relative z-10 w-full flex items-center gap-3">
                    <div className="flex items-center justify-center w-5">
                      <item.icon className={cn("size-5 shrink-0 transition-transform duration-300 group-hover:scale-110 group-hover:text-[#0B5A8E]", isActive ? "text-[#0B5A8E]" : "text-gray-500")} />
                    </div>
                    {(!isCollapsed || (isCollapsed && !isWideScreen)) && (
                      <>
                        <span className="flex-1 text-right text-sm">
                          {item.label}
                        </span>
                        {isActive && (
                          isClinicDetails ? (
                            <Eye className="size-4 shrink-0 text-[#0B5A8E]" />
                          ) : (
                            <ChevronLeft className="size-4 shrink-0 text-[#0B5A8E]" />
                          )
                        )}
                      </>
                    )}
                  </div>
                </TransitionLink>
              )
            })}
          </div>
        </nav>

        {/* Collapse Toggle Button (Desktop only) */}
        <div className="p-3 border-t border-gray-100 hidden lg:block shrink-0">
          <button
            onClick={onToggle}
            className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all duration-300 h-9 px-4 py-2 w-full text-gray-500 hover:text-[#0B5A8E] hover:bg-gray-50 cursor-pointer"
          >
            <Menu className="size-5" />
          </button>
        </div>
      </aside>
    </>
  )
}

export default AdminSidebar
