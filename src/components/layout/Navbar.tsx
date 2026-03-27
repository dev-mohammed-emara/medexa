import { gsap } from 'gsap'
import { Bell, LogOut, Mail, Menu, Phone, Search, Settings, User } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { TransitionLink } from '../transition/TransitionLink'
import Modal from '../ui/Modal'
import { useAuth } from '@/contexts/AuthContext'
import { useLanguage } from '@/contexts/LanguageContext'
import { navTranslations } from '@/constants/nav'
import { cn } from '../../utils/cn'

interface NavbarProps {
  onMenuClick: () => void;
}

const Navbar = ({ onMenuClick }: NavbarProps) => {
  const [showNotifications, setShowNotifications] = useState(false)
  const [showProfile, setShowProfile] = useState(false)
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false)

  const navigate = useNavigate()
  const notifRef = useRef<HTMLDivElement>(null)
  const profileRef = useRef<HTMLDivElement>(null)
  const notifBtnRef = useRef<HTMLButtonElement>(null)
  const profileBtnRef = useRef<HTMLDivElement>(null)
  const { profileImage } = useAuth()
  const { isAr, t } = useLanguage()
  const T_PAGE = navTranslations;

  const handleLogout = async () => {
    setIsLogoutModalOpen(false)

    // Trigger seamless transition before navigating
    if (window.triggerExitTransition) {
      await window.triggerExitTransition()
    }

    window.showToast(t('nav.logout_success'))
    navigate('/login')
  }

  useEffect(() => {
    if (!notifRef.current) return
    if (showNotifications) {
      gsap.fromTo(notifRef.current,
        { autoAlpha: 0, y: -10, scale: 0.95 },
        { autoAlpha: 1, y: 0, scale: 1, duration: 0.3, ease: 'power2.out' }
      )
    } else {
      gsap.to(notifRef.current, { autoAlpha: 0, y: -10, scale: 0.95, duration: 0.2, ease: 'power2.in' })
    }
  }, [showNotifications])

  useEffect(() => {
    if (!profileRef.current) return
    if (showProfile) {
      gsap.fromTo(profileRef.current,
        { autoAlpha: 0, y: -10, scale: 0.95 },
        { autoAlpha: 1, y: 0, scale: 1, duration: 0.3, ease: 'power2.out' }
      )
    } else {
      gsap.to(profileRef.current, { autoAlpha: 0, y: -10, scale: 0.95, duration: 0.2, ease: 'power2.in' })
    }
  }, [showProfile])

  // Outside click detection
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node) && !notifBtnRef.current?.contains(e.target as Node)) {
        setShowNotifications(false)
      }
      if (profileRef.current && !profileRef.current.contains(e.target as Node) && !profileBtnRef.current?.contains(e.target as Node)) {
        setShowProfile(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <header className="h-20 bg-white border-b border-border px-6 flex items-center justify-between shadow-sm sticky top-0 z-30">
      <div className={cn("flex items-center gap-4", isAr ? "flex-row-reverse" : "flex-row")}>
        {/* Menu toggle for all screen sizes */}
        <button
          onClick={onMenuClick}
          className="p-2 rounded-md hover:bg-accent text-muted-foreground transition-colors lg:hidden"
          aria-label="Toggle Menu"
        >
          <Menu className="size-6" />
        </button>

        {/* Search */}
        <div className="relative w-64 hidden md:block">
          <Search className={cn("absolute top-1/2 -translate-y-1/2 text-muted-foreground size-[18px]", isAr ? "right-3" : "left-3")} />
          <input
            type="text"
            placeholder={t('nav.search', T_PAGE)}
            className={cn(
              "w-full h-10 bg-input-background border border-border rounded-xl text-sm focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all",
              isAr ? "pr-10 pl-4 text-right" : "pl-10 pr-4 text-left"
            )}
          />
        </div>
      </div>

      <div className="flex items-center gap-4 ">
        <span className={cn("text-sm text-muted-foreground hidden md:block border-border", isAr ? "border-l pl-4" : "border-r pr-4")}>{t('nav.clinic_name', T_PAGE)}</span>

        {/* Notifications */}
        <div className="relative">
          <button
            ref={notifBtnRef}
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 rounded-lg group hover:bg-accent transition-all relative"
          >
            <Bell className="size-5 text-muted-foreground group-hover:text-white transition-all" />
            <span className="absolute top-0 left-0 size-4.5 bg-destructive text-white text-[12px] flex items-center justify-center rounded-full">3</span>
          </button>

          {/* Notifications Tooltip/Dropdown */}
          <div
            ref={notifRef}
            className="absolute top-full left-1/2 -translate-x-1/2 mt-3 w-80 bg-white border border-border shadow-2xl rounded-2xl overflow-hidden invisible opacity-0 will-change-transform z-60"
            dir={isAr ? "rtl" : "ltr"}
          >
            <div className="p-4 border-b border-border bg-slate-50/50">
              <h3 className={cn("font-bold text-sm", isAr ? "text-right" : "text-left")}>{t('nav.notifications', T_PAGE)}</h3>
            </div>
            <div className="max-h-80 overflow-y-auto">
              {[
                { title: 'موعد جديد', desc: 'مريض محمد علي قام بحجز موعد جديد', time: 'منذ 5 دقائق' },
                { title: 'تذكير', desc: 'يجب مراجعة التقارير الطبية المسائية', time: 'منذ ساعة' },
                { title: 'دفعة مالية', desc: 'تم استلام دفعة جديدة بقيمة 50 دينار', time: 'منذ ساعتين' },
              ].map((item, i) => (
                <div key={i} className="p-4 border-b border-border/50 hover:bg-slate-50 transition-colors cursor-pointer">
                  <p className="text-sm font-bold mb-1">{item.title}</p>
                  <p className="text-xs text-muted-foreground mb-1">{item.desc}</p>
                  <p className="text-[10px] text-primary/70">{item.time}</p>
                </div>
              ))}
            </div>
            <button className="w-full py-3 text-xs text-primary font-bold hover:bg-primary/5 transition-colors">{t('nav.view_all', T_PAGE)}</button>
          </div>
        </div>

        {/* User Profile */}
        <div className="relative">
          <div
            ref={profileBtnRef}
            onClick={() => setShowProfile(!showProfile)}
            className={cn("flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity", isAr ? "border-r border-border pr-4" : "border-l border-border pl-4")}
          >
            <div className={cn("hidden md:block", isAr ? "text-right" : "text-left")}>
              <p className="text-sm font-bold">{'أحمد الحشيكا'}</p>
              <p className="text-[10px] text-muted-foreground">{t('nav.clinic_owner', T_PAGE)}</p>
            </div>
            <div className="size-10 rounded-full border-2 border-primary bg-primary flex items-center justify-center text-white font-bold overflow-hidden shadow-md">
              {profileImage ? (
                <img src={profileImage} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                "أ"
              )}
            </div>
          </div>

          {/* Profile Tooltip/Dropdown */}
          <div
            ref={profileRef}
            className="absolute top-full left-18 xs:left-1/2 -translate-x-1/2 mt-3 w-64 bg-white border border-border shadow-2xl rounded-2xl overflow-hidden invisible opacity-0 will-change-transform z-60"
            dir={isAr ? "rtl" : "ltr"}
          >
            <div className="p-5 border-b border-border bg-linear-to-r from-primary/5 to-secondary/5">
              <div className="flex items-center gap-3 mb-1">
                <div className="size-10 rounded-full border-2 border-primary bg-primary flex items-center justify-center text-white font-bold overflow-hidden shadow-sm">
                  {profileImage ? (
                    <img src={profileImage} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    "أ"
                  )}
                </div>
                <div className={cn(isAr ? "text-right" : "text-left")}>
                  <p className="text-sm font-bold mb-1">{'أحمد الحشيكا'}</p>
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      <Mail className="size-3 shrink-0" />
                      <p className="text-[10px]">dr.ahmed@medexa.com</p>
                    </div>
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      <Phone className="size-3 shrink-0" />
                      <p className="text-[10px]" dir="ltr">0789651800</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-2">
              <TransitionLink
                href="/profile"
                onClick={() => setShowProfile(false)}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm rounded-lg hover:bg-slate-50 transition-colors"
              >
                <User className="size-4 text-muted-foreground" />
                <span>{t('nav.profile', T_PAGE)}</span>
              </TransitionLink>
              <TransitionLink
                href="/settings"
                onClick={() => setShowProfile(false)}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm rounded-lg hover:bg-slate-50 transition-colors"
              >
                <Settings className="size-4 text-muted-foreground" />
                <span>{t('nav.settings', T_PAGE)}</span>
              </TransitionLink>
              <div className="h-px bg-border my-2" />
              <button
                onClick={() => setIsLogoutModalOpen(true)}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm rounded-lg text-destructive hover:bg-destructive/10 transition-colors font-bold"
              >
                <LogOut className="size-4" />
                <span>{t('nav.logout', T_PAGE)}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Logout (Restored standalone as before) */}
        <button
          onClick={() => setIsLogoutModalOpen(true)}
          className="p-2 rounded-lg text-destructive hover:bg-destructive/10 transition-all"
        >
          <LogOut className="size-5" />
        </button>
      </div>

      <Modal
        isOpen={isLogoutModalOpen}
        onClose={() => setIsLogoutModalOpen(false)}
        onConfirm={handleLogout}
        title={t('nav.logout', T_PAGE)}
        message={t('nav.logout_confirm', T_PAGE)}
        confirmText={t('nav.logout', T_PAGE)}
        cancelText={t('common.cancel')}
        variant="danger"
      />
    </header>
  )
}

export default Navbar
