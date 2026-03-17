import { Search, Bell, LogOut, Menu, User, Settings, Shield } from 'lucide-react'
import { useState, useRef, useEffect } from 'react'
import { gsap } from 'gsap'
import { useNavigate } from 'react-router-dom'
import Modal from '../ui/Modal'

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

  const handleLogout = async () => {
    setIsLogoutModalOpen(false)

    // Trigger seamless transition before navigating
    if (window.triggerExitTransition) {
      await window.triggerExitTransition()
    }

    window.showToast('تم تسجيل الخروج بنجاح')
    navigate('/login')
  }

  useEffect(() => {
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
    <header className="h-20 bg-white border-b border-border px-6 flex items-center justify-between shadow-sm sticky top-0 z-50">
      <div className="flex items-center gap-4 flex-row-reverse">
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
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground size-4" />
          <input
            type="text"
            placeholder="بحث..."
            className="w-full h-10 pr-10 pl-4 bg-input-background border border-border rounded-lg text-sm focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all text-right"
          />
        </div>
      </div>

      <div className="flex items-center gap-4 ">
        <span className="text-sm text-muted-foreground hidden md:block border-l border-border pl-4">عيادة النور الطبية</span>

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
            className="absolute top-full left-1/2 -translate-x-1/2 mt-3 w-80 bg-white border border-border shadow-2xl rounded-2xl overflow-hidden invisible will-change-transform z-60"
            dir="rtl"
          >
            <div className="p-4 border-b border-border bg-slate-50/50">
              <h3 className="font-bold text-sm">التنبيهات</h3>
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
            <button className="w-full py-3 text-xs text-primary font-bold hover:bg-primary/5 transition-colors">عرض كل التنبيهات</button>
          </div>
        </div>

        {/* User Profile */}
        <div className="relative">
          <div
            ref={profileBtnRef}
            onClick={() => setShowProfile(!showProfile)}
            className="flex items-center gap-3 border-r border-border pr-4 cursor-pointer hover:opacity-80 transition-opacity"
          >
            <div className="text-right hidden md:block">
              <p className="text-sm font-bold">د. أحمد الحشايكة</p>
              <p className="text-[10px] text-muted-foreground">مالك العيادة</p>
            </div>
            <div className="size-10 rounded-full border-2 border-primary/20 bg-primary flex items-center justify-center text-white font-bold">
              أ
            </div>
          </div>

          {/* Profile Tooltip/Dropdown */}
          <div
            ref={profileRef}
            className="absolute top-full left-1/2 -translate-x-1/2 mt-3 w-64 bg-white border border-border shadow-2xl rounded-2xl overflow-hidden invisible will-change-transform z-60"
            dir="rtl"
          >
            <div className="p-5 border-b border-border bg-linear-to-r from-primary/5 to-secondary/5">
              <div className="flex items-center gap-3 mb-1">
                <div className="size-10 rounded-full bg-primary flex items-center justify-center text-white font-bold">أ</div>
                <div>
                  <p className="text-sm font-bold">د. أحمد الحشايكة</p>
                  <p className="text-[10px] text-muted-foreground">dr.ahmed@medexa.com</p>
                </div>
              </div>
            </div>

            <div className="p-2">
              <button className="w-full flex items-center gap-3 px-4 py-2.5 text-sm rounded-lg hover:bg-slate-50 transition-colors">
                <User className="size-4 text-muted-foreground" />
                <span>عرض الملف الشخصي</span>
              </button>
              <button className="w-full flex items-center gap-3 px-4 py-2.5 text-sm rounded-lg hover:bg-slate-50 transition-colors">
                <Settings className="size-4 text-muted-foreground" />
                <span>الإعدادات</span>
              </button>
              <button className="w-full flex items-center gap-3 px-4 py-2.5 text-sm rounded-lg hover:bg-slate-50 transition-colors">
                <Shield className="size-4 text-muted-foreground" />
                <span>الأمان</span>
              </button>
              <div className="h-px bg-border my-2" />
              <button
                onClick={() => setIsLogoutModalOpen(true)}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm rounded-lg text-destructive hover:bg-destructive/10 transition-colors font-bold"
              >
                <LogOut className="size-4" />
                <span>تسجيل الخروج</span>
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
        title="تسجيل الخروج"
        message="هل أنت متأكد من رغبتك في تسجيل الخروج من النظام؟"
        confirmText="تسجيل الخروج"
        cancelText="إلغاء"
        variant="danger"
      />
    </header>
  )
}

export default Navbar
