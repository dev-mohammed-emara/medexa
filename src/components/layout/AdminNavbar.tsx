import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Bell, LogOut, Search, Menu, Settings, Mail } from 'lucide-react'
import { gsap } from 'gsap'
import { cn } from '../../utils/cn'
import Modal from '../ui/Modal'
import { BiSolidMessageAltError, BiSolidMessageCheck } from 'react-icons/bi'
import { usePreloader } from '../../contexts/PreloaderContext'
import { TransitionLink } from '../transition/TransitionLink'

interface AdminNavbarProps {
  onMenuClick: () => void
}

const AdminNavbar = ({ onMenuClick }: AdminNavbarProps) => {
  const navigate = useNavigate()
  const adminEmail = localStorage.getItem('admin_email') || 'admin@medexa.jo'

  const [showNotifications, setShowNotifications] = useState(false)
  const [showProfile, setShowProfile] = useState(false)
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false)

  const [notifications, setNotifications] = useState([
    { id: 1, title: 'عيادة جديدة مسجلة', desc: 'تم تسجيل عيادة الرعاية الطبية في النظام', time: 'منذ 10 دقائق', isRead: false },
    { id: 2, title: 'مستخدم جديد مسجل', desc: 'انضم د. محمد العمري للنظام كطبيب رئيسي', time: 'منذ 25 دقيقة', isRead: false },
    { id: 3, title: 'تذكرة دعم جديدة', desc: 'طلب دعم فني عاجل من عيادة النور الطبية', time: 'منذ ساعة', isRead: false },
    { id: 4, title: 'طلب موافقة معلق', desc: 'طلب موافقة اشتراك جديد من عيادة الأمل', time: 'منذ ساعتين', isRead: true },
    { id: 5, title: 'تنبيه للنظام', desc: 'محاولة تسجيل دخول غير مصرح بها تم حظرها', time: 'منذ 4 ساعات', isRead: true },
  ])

  const notifRef = useRef<HTMLDivElement>(null)
  const notifBtnRef = useRef<HTMLButtonElement>(null)
  const profileRef = useRef<HTMLDivElement>(null)
  const profileBtnRef = useRef<HTMLDivElement>(null)

  const handleLogout = async () => {
    setIsLogoutModalOpen(false)

    // Trigger seamless preloader transition before navigating
    if (window.triggerExitTransition) {
      await window.triggerExitTransition()
    }

    localStorage.removeItem('admin_token')
    localStorage.removeItem('admin_email')
    navigate('/admin/login')
  }

  // GSAP animation for notifications dropdown
  useEffect(() => {
    if (!notifRef.current) return
    if (showNotifications) {
      gsap.fromTo(notifRef.current,
        { autoAlpha: 0, y: -10, scale: 0.95 },
        { autoAlpha: 1, y: 0, scale: 1, duration: 0.25, ease: 'power2.out' }
      )
    } else {
      gsap.to(notifRef.current, { autoAlpha: 0, y: -10, scale: 0.95, duration: 0.2, ease: 'power2.in' })
    }
  }, [showNotifications])

  // GSAP animation for profile dropdown
  useEffect(() => {
    if (!profileRef.current) return
    if (showProfile) {
      gsap.fromTo(profileRef.current,
        { autoAlpha: 0, y: -10, scale: 0.95 },
        { autoAlpha: 1, y: 0, scale: 1, duration: 0.25, ease: 'power2.out' }
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

  const { isLoaded, isExiting } = usePreloader()
  const canAnimate = isLoaded && !isExiting

  return (
    <header className={cn(
      "h-20 bg-white/80 backdrop-blur-xl border-b border-gray-200 px-6 flex items-center justify-between sticky top-0 z-10 shadow-sm transition-all duration-300 opacity-0",
      canAnimate && "animate-fadeDown animate-delay-[50ms]"
    )} style={{ opacity: canAnimate ? 1 : 0 }} dir="rtl">
      {/* Search Input & Mobile Toggle */}
      <div className="flex items-center gap-4 flex-1">
        <button
          onClick={onMenuClick}
          className="p-2 rounded-md hover:bg-gray-50 text-gray-500 transition-colors lg:hidden shrink-0"
          aria-label="Toggle Menu"
        >
          <Menu className="size-6" />
        </button>

        <div className="relative w-80 hidden md:block">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 size-[18px]" />
          <input 
            type="text" 
            className="flex w-full rounded-md border border-gray-200 px-3 py-1 text-base transition-all outline-none pr-10 h-11 bg-gray-50 text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-[#0B5A8E]/20 focus:border-[#0B5A8E] text-sm" 
            placeholder="بحث في النظام..."
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-4 shrink-0">
        {/* Role Badge */}
        <span className="inline-flex items-center justify-center rounded-md text-xs font-medium w-fit whitespace-nowrap bg-gradient-to-r from-[#0B5A8E]/10 to-[#3FB8AF]/10 text-[#0B5A8E] border border-[#0B5A8E]/20 px-3 py-1">
          مدير النظام
        </span>

        {/* Notifications Bell */}
        <div className="relative">
          <button
            ref={notifBtnRef}
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 rounded-xl text-gray-600 hover:text-[#0B5A8E] hover:bg-gray-50 transition-all duration-300 relative cursor-pointer"
          >
            <Bell className="size-5" />
            {notifications.filter(n => !n.isRead).length > 0 && (
              <span className="absolute -top-1 -left-1 w-5 h-5 flex items-center justify-center p-0 bg-gradient-to-r from-[#0B5A8E] to-[#3FB8AF] text-white text-xs border-2 border-white rounded-full font-bold">
                {notifications.filter(n => !n.isRead).length}
              </span>
            )}
          </button>

          {/* Notifications Dropdown */}
          <div
            ref={notifRef}
            className="absolute top-full left-0 mt-3 w-80 bg-white border border-gray-100 shadow-2xl rounded-2xl invisible opacity-0 will-change-transform z-50 text-right"
          >
            {/* Arrow Pin */}
            <div className="absolute -top-1.5 left-[18px] -translate-x-1/2 w-3 h-3 rotate-45 bg-[#F9FAFB] border-t border-l border-gray-100 z-0"></div>

            <div className="p-4 border-b border-gray-100 bg-gray-50/50 rounded-t-2xl relative z-10">
              <h3 className="font-bold text-sm text-gray-900">التنبيهات والإشعارات</h3>
            </div>
            <div className="max-h-80 overflow-y-auto no-scrollbar relative z-10 bg-white">
              {notifications.length > 0 ? (
                notifications.map((notif) => (
                  <div
                    key={notif.id}
                    onClick={() => setNotifications(prev => prev.map(n => n.id === notif.id ? { ...n, isRead: true } : n))}
                    className={cn(
                      "p-4 border-b border-gray-50 hover:bg-gray-50/80 transition-all cursor-pointer flex items-start gap-3",
                      notif.isRead ? "opacity-75" : "opacity-100"
                    )}
                  >
                    <div className={cn(
                      "size-8 rounded-full flex items-center justify-center shrink-0 transition-colors mt-0.5",
                      notif.isRead ? "bg-emerald-50 text-emerald-600" : "bg-[#0B5A8E]/10 text-[#0B5A8E]"
                    )}>
                      {notif.isRead ? <BiSolidMessageCheck className="size-5" /> : <BiSolidMessageAltError className="size-5" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={cn("text-xs mb-0.5", notif.isRead ? "text-gray-500 font-medium" : "text-gray-900 font-bold")}>
                        {notif.title}
                      </p>
                      <p className="text-[11px] text-gray-500 line-clamp-1 mb-1">{notif.desc}</p>
                      <p className="text-[9px] text-[#0B5A8E]/70 font-semibold">{notif.time}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center flex flex-col items-center gap-3">
                  <div className="size-12 rounded-2xl bg-gray-50 flex items-center justify-center text-gray-300">
                    <Bell className="size-6" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-900">لا توجد إشعارات</p>
                    <p className="text-xs text-gray-400">أنت مطلع على كل شيء حالياً</p>
                  </div>
                </div>
              )}
            </div>
            {notifications.length > 0 && (
              <button
                onClick={() => setNotifications(prev => prev.map(n => ({ ...n, isRead: true })))}
                className="w-full py-3 text-xs text-emerald-600 font-bold hover:bg-emerald-50 transition-colors border-t border-gray-100 flex items-center justify-center gap-2 cursor-pointer rounded-b-2xl relative z-10 bg-white"
              >
                <BiSolidMessageCheck className="size-4" />
                تحديد الكل كمقروء
              </button>
            )}
          </div>
        </div>

        {/* User Profile */}
        <div className="relative">
          <div
            ref={profileBtnRef}
            onClick={() => setShowProfile(!showProfile)}
            className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-gray-50 cursor-pointer transition-colors"
          >
            <div className="text-right hidden md:block">
              <p className="text-sm text-gray-900 font-bold">المدير العام</p>
              <p className="text-xs text-gray-500">{adminEmail}</p>
            </div>
            <span className="relative flex size-10 shrink-0 overflow-hidden rounded-full w-10 h-10 border-2 border-[#0B5A8E]/20 shadow-sm">
              <span className="flex size-full items-center justify-center rounded-full bg-gradient-to-br from-[#0B5A8E] to-[#3FB8AF] text-white font-semibold">م</span>
            </span>
          </div>

          {/* Profile Dropdown */}
          <div
            ref={profileRef}
            className="absolute top-full left-0 mt-3 w-64 bg-white border border-gray-100 shadow-2xl rounded-2xl invisible opacity-0 will-change-transform z-50 text-right"
          >
            {/* Arrow Pin */}
            <div className="absolute -top-1.5 left-[20px] -translate-x-1/2 w-3 h-3 rotate-45 bg-[#F8FAFC] border-t border-l border-gray-100 z-0"></div>

            <div className="p-5 border-b border-gray-100 bg-gradient-to-r from-[#0B5A8E]/5 to-[#3FB8AF]/5 rounded-t-2xl relative z-10">
              <div className="flex items-center gap-3 mb-1">
                <span className="relative flex size-10 shrink-0 overflow-hidden rounded-full w-10 h-10 border-2 border-[#0B5A8E]/20 shadow-sm">
                  <span className="flex size-full items-center justify-center rounded-full bg-gradient-to-br from-[#0B5A8E] to-[#3FB8AF] text-white font-semibold">م</span>
                </span>
                <div className="text-right">
                  <p className="text-sm font-bold text-gray-900 mb-0.5">المدير العام</p>
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-1.5 text-gray-500">
                      <Mail className="size-3 shrink-0" />
                      <p className="text-[10px]">{adminEmail}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-2 relative z-10 bg-white rounded-b-2xl">
              <TransitionLink
                href="/admin/settings"
                onClick={() => setShowProfile(false)}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm rounded-lg hover:bg-gray-50 transition-colors text-gray-700 font-medium"
              >
                <Settings className="size-4 text-gray-500" />
                <span>الإعدادات</span>
              </TransitionLink>

              <div className="h-px bg-gray-100 my-2" />

              <button
                onClick={() => {
                  setShowProfile(false);
                  setIsLogoutModalOpen(true);
                }}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm rounded-lg text-rose-600 hover:bg-rose-50 transition-colors font-bold cursor-pointer"
              >
                <LogOut className="size-4" />
                <span>تسجيل الخروج</span>
              </button>
            </div>
          </div>
        </div>

        {/* Logout Button */}
        <button
          onClick={() => setIsLogoutModalOpen(true)}
          className="p-2 rounded-xl text-rose-500 hover:text-rose-600 hover:bg-rose-50 transition-all duration-300 cursor-pointer shrink-0"
        >
          <LogOut className="size-5" />
        </button>
      </div>

      {/* Logout Modal */}
      <Modal
        isOpen={isLogoutModalOpen}
        onClose={() => setIsLogoutModalOpen(false)}
        onConfirm={handleLogout}
        title="تسجيل الخروج"
        message="هل أنت متأكد من رغبتك في تسجيل الخروج من لوحة التحكم الإدارية؟"
        confirmText="تسجيل الخروج"
        cancelText="إلغاء"
        variant="danger"
      />
    </header>
  )
}

export default AdminNavbar
