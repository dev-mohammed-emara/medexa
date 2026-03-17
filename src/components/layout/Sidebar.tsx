import { useEffect, useRef } from 'react'
import { useLocation } from 'react-router-dom'
import { gsap } from 'gsap'
import {
  LayoutDashboard,
  Users,
  UserCog,
  UsersRound,
  Calendar,
  FileText,
  DollarSign,
  Settings,
  User,
  ChevronLeft,
  Menu
} from 'lucide-react'
import { cn } from '../../utils/cn'
import { TransitionLink } from '../transition/TransitionLink'

const navItems = [
  { icon: LayoutDashboard, label: 'لوحة التحكم', href: '/' },
  { icon: Users, label: 'الأطباء', href: '/doctors' },
  { icon: UserCog, label: 'السكرتارية', href: '/staff' },
  { icon: UsersRound, label: 'المرضى', href: '/patients' },
  { icon: Calendar, label: 'المواعيد', href: '/appointments' },
  { icon: FileText, label: 'السجلات الطبية', href: '/records' },
  { icon: DollarSign, label: 'المالية', href: '/finance' },
  { icon: Settings, label: 'الإعدادات', href: '/settings' },
  { icon: User, label: 'الملف الشخصي', href: '/profile' },
]

interface SidebarProps {
  isCollapsed: boolean
  onToggle: () => void
}

import { usePreloader } from '../../contexts/PreloaderContext'

const Sidebar = ({ isCollapsed, onToggle }: SidebarProps) => {
  const { isLoaded, isExiting } = usePreloader()
  const canAnimate = isLoaded && !isExiting
  const location = useLocation()
  const navContainerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!canAnimate) return

    // Stagger entrance animation for nav items
    const ctx = gsap.context(() => {
      gsap.fromTo(".nav-item-animate",
        { x: 20, opacity: 0 },
        {
          x: 0,
          opacity: 1,
          stagger: 0.05,
          duration: 0.8,
          ease: "power2.out",
          delay: 0.2
        }
      )
    }, navContainerRef)

    return () => ctx.revert()
  }, [canAnimate])

  return (
    <aside
      className="hidden lg:flex flex-col bg-sidebar border-l border-sidebar-border shadow-sm fixed right-0 top-0 h-screen z-20 transition-[width] duration-300 ease-in-out will-change-[width]"
      style={{ width: isCollapsed ? '80px' : '280px' }}
    >
      <div className="h-20 flex items-center justify-center border-b border-sidebar-border px-4 transition-all overflow-hidden whitespace-nowrap">
        {isCollapsed ? (
          <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center shrink-0">
            <span className="text-white text-xl font-bold">M</span>
          </div>
        ) : (
          <h2 className="text-2xl text-primary font-bold">Medexa</h2>
        )}
      </div>

      <nav className="flex-1 py-6 px-3 whitespace-nowrap overflow-y-auto no-scrollbar" ref={navContainerRef}>
        <div className="space-y-1">
          {navItems.map((item, index) => {
            const isActive = location.pathname === item.href
            return (
              <TransitionLink
                key={index}
                href={item.href}
                className={cn(
                  "relative w-full font-medium flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-300 will-change-transform group nav-item-animate opacity-0",
                  isActive
                    ? "bg-sidebar-accent text-sidebar-accent-foreground shadow-lg"
                    : "text-sidebar-foreground hover:bg-sidebar-accent/50"
                )}
              >
                {isActive && (
                  <div className="absolute inset-0 bg-linear-to-r from-primary/10 to-secondary/10 rounded-lg" />
                )}
                <div className="relative z-10 w-full flex items-center gap-3">
                  <div className="flex items-center justify-center w-5">
                    <item.icon className={cn("size-5 shrink-0 transition-transform duration-300 group-hover:scale-110", isActive ? "text-primary" : "text-black")} />
                  </div>
                  {!isCollapsed && (
                    <>
                      <span className="flex-1 text-right transition-all duration-300 group-hover:-translate-x-[6px]">{item.label}</span>
                      {isActive && <ChevronLeft className="size-4 shrink-0 transition-transform duration-300 group-hover:-translate-x-1" />}
                    </>
                  )}
                </div>
              </TransitionLink>
            )
          })}
        </div>
      </nav>

      <div className="p-3 border-t border-sidebar-border">
        <button
          onClick={onToggle}
          className="flex items-center justify-center group w-full h-10 rounded-lg hover:bg-accent hover:-translate-y-0.5 active:translate-y-0 active:shadow-md transition-all duration-300 will-change-transform"
        >
          <Menu className="size-5 text-muted-foreground group-hover:text-white transition-all" />
        </button>
      </div>
    </aside>
  )
}

export default Sidebar
