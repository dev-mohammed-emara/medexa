
import { useEffect, useRef } from 'react'
import { useMediaQuery } from 'react-responsive'
import { useLocation } from 'react-router-dom'
import { gsap } from 'gsap'
import {
  LayoutDashboard,
  Users,
  UserCog,
  UsersRound,
  FileText,
  DollarSign,
  Settings,
  User,
  ChevronLeft,
  Menu,
  X
} from 'lucide-react'
import { FaCalendarAlt } from 'react-icons/fa'
import { useLanguage } from '../../contexts/LanguageContext'
import { navTranslations } from '../../constants/nav'
import { cn } from '../../utils/cn'
import { TransitionLink } from '../transition/TransitionLink'
import { usePreloader } from '../../contexts/PreloaderContext'

const navItems = [
  { icon: LayoutDashboard, label: 'dashboard', href: '/' },
  { icon: Users, label: 'doctors', href: '/doctors' },
  { icon: UserCog, label: 'secretary', href: '/secretary' },
  { icon: UsersRound, label: 'patients', href: '/patients' },
  { icon: FaCalendarAlt, label: 'appointments', href: '/appointments' },
  { icon: FileText, label: 'records', href: '/records' },
  { icon: DollarSign, label: 'finance', href: '/finance' },
  { icon: Settings, label: 'settings', href: '/settings' },
  { icon: User, label: 'profile', href: '/profile' },
]

interface SidebarProps {
  isCollapsed: boolean
  onToggle: () => void
}

const Sidebar = ({ isCollapsed, onToggle }: SidebarProps) => {
  const { isLoaded, isExiting } = usePreloader()
  const { isAr, t } = useLanguage()
  const canAnimate = isLoaded && !isExiting
  const location = useLocation()
  const navContainerRef = useRef<HTMLDivElement>(null)

  const T_PAGE = navTranslations;
  const isWideScreen = useMediaQuery({ query: '(min-width: 1024px)' })

  useEffect(() => {
    if (!canAnimate || !isWideScreen) return

    const ctx = gsap.context(() => {
      gsap.fromTo(".nav-item-animate",
        { x: isAr ? 20 : -20, opacity: 0 },
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
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-100 lg:hidden"
          onClick={onToggle}
        />
      )}

      <aside
        className={cn(
          "bg-sidebar border-sidebar-border will-change-[transform,width] flex flex-col transition-all duration-300 ease-in-out",
          isAr ? "border-l" : "border-r",
          "fixed inset-y-0 z-110 shadow-2xl",
          isAr ? "right-0" : "left-0",
          isCollapsed
            ? (isAr ? "translate-x-[120%] invisible pointer-events-none" : "-translate-x-[120%] invisible pointer-events-none")
            : "translate-x-0 w-full max-w-full sm:max-w-[300px] visible pointer-events-auto",
          "lg:sticky lg:top-0 lg:h-screen lg:shadow-none lg:z-40 lg:translate-x-0 lg:visible lg:pointer-events-auto lg:transform-none",
          isCollapsed ? "lg:w-[80px]" : "lg:w-[280px]"
        )}
      >
        <div className="h-20 flex items-center justify-between border-b border-sidebar-border px-4 transition-all overflow-hidden whitespace-nowrap relative">
          <div className="flex-1 flex items-center justify-center">
            {isCollapsed ? (
              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center shrink-0">
                <span className="text-white text-xl font-bold">M</span>
              </div>
            ) : (
              <img src="/images/logo.png" alt="Medexa" className="h-13 min-w-fit w-auto" />
            )}
          </div>
          {!isWideScreen && !isCollapsed && (
            <button
              onClick={onToggle}
              className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center rounded-xl bg-muted/40 text-muted-foreground hover:bg-red-50 hover:text-red-500 transition-all active:scale-95"
            >
              <X className="size-5" />
            </button>
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
                  onClick={() => {
                    if (!isWideScreen) onToggle()
                  }}
                  className={cn(
                    "relative w-full font-medium flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-300 will-change-transform group nav-item-animate",
                    !isWideScreen ? "opacity-100" : "opacity-0",
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
                    {(!isCollapsed || (isCollapsed && !isWideScreen)) && (
                      <>
                        <span className={cn("flex-1 transition-all duration-300 group-hover:-translate-x-[6px]", isAr ? "text-right" : "text-left")}>
                          {t(`nav.${item.label}`, T_PAGE)}
                        </span>
                        {isActive && <ChevronLeft className={cn("size-4 shrink-0 transition-transform duration-300 group-hover:px-1", !isAr && "rotate-180")} />}
                      </>
                    )}
                  </div>
                </TransitionLink>
              )
            })}
          </div>
        </nav>

        <div className="p-3 border-t border-sidebar-border hidden lg:block">
          <button
            onClick={onToggle}
            className="flex items-center justify-center group w-full h-10 rounded-lg hover:bg-accent hover:-translate-y-0.5 active:translate-y-0 active:shadow-md transition-all duration-300 will-change-transform"
          >
            <Menu className="size-5 text-muted-foreground group-hover:text-white transition-all" />
          </button>
        </div>
      </aside>
    </>
  )
}

export default Sidebar
