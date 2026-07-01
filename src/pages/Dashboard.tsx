import MainLayout from '../components/layout/MainLayout'
import { useLanguage } from '../contexts/LanguageContext'
import { usePreloader } from '../contexts/PreloaderContext'
import { useAuth } from '../contexts/AuthContext'
import { formatDateDisplay } from '../utils/date'
import { cn } from '../utils/cn'
import {
  Users,
  Calendar,
  DollarSign,
  Settings,
  ChevronRight,
  Activity,
  HeartPulse,
  Clock
} from 'lucide-react'
import { TransitionLink } from '../components/transition/TransitionLink'
import ShineHover from '../components/ui/ShineHover'

const Dashboard = () => {
  const { isAr } = useLanguage()
  const { user } = useAuth()
  const { isLoaded, isExiting } = usePreloader()
  const canAnimate = isLoaded && !isExiting

  const quickLinks = [
    {
      title: isAr ? 'المرضى' : 'Patients',
      desc: isAr ? 'إدارة سجلات المرضى' : 'Manage patient records',
      icon: Users,
      href: '/patients',
      color: 'bg-blue-500/20 text-blue-600',
      border: 'border-blue-100',
      hover: 'hover:border-blue-300 hover:shadow-blue-100'
    },
    {
      title: isAr ? 'المواعيد' : 'Appointments',
      desc: isAr ? 'جدولة ومتابعة المواعيد' : 'Schedule and track appointments',
      icon: Calendar,
      href: '/appointments',
      color: 'bg-emerald-50 text-emerald-600',
      border: 'border-emerald-100',
      hover: 'hover:border-emerald-300 hover:shadow-emerald-100'
    },
    {
      title: isAr ? 'المالية' : 'Finance',
      desc: isAr ? 'إدارة الفواتير والمدفوعات' : 'Manage billing and payments',
      icon: DollarSign,
      href: '/finance',
      color: 'bg-amber-50 text-amber-600',
      border: 'border-amber-100',
      hover: 'hover:border-amber-300 hover:shadow-amber-100'
    },
    {
      title: isAr ? 'الإعدادات' : 'Settings',
      desc: isAr ? 'إعدادات النظام والملف الشخصي' : 'System and profile settings',
      icon: Settings,
      href: '/profile?info=clinic',
      color: 'bg-purple-50 text-purple-600',
      border: 'border-purple-100',
      hover: 'hover:border-purple-300 hover:shadow-purple-100'
    }
  ]

  return (
    <MainLayout>
      <div className={cn(
        "max-w-7xl mx-auto space-y-8 opacity-0",
        canAnimate && "animate-fadeUp animate-delay-[100ms]",
        isExiting && "animate-fadeDownOut"
      )} style={{ opacity: canAnimate ? 1 : 0 }} dir={isAr ? "rtl" : "ltr"}>

        {/* Welcome Section */}
        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary to-[#3FB8AF] p-8 md:p-12 shadow-2xl shadow-primary/20 text-white">
          <div className="absolute top-0 right-0 -mt-16 -mr-16 opacity-10">
            <HeartPulse size={300} />
          </div>
          <div className="absolute bottom-0 left-0 -mb-16 -ml-16 opacity-10">
            <Activity size={300} />
          </div>

          <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
            <div className="w-24 h-24 md:w-32 md:h-32 bg-white/10 backdrop-blur-md rounded-3xl shadow-inner border border-white/20 flex items-center justify-center p-4 shrink-0 animate-hovering">
              <img src="/images/logo.png" alt="Medexa" className="max-w-full h-auto drop-shadow-md brightness-0 invert" />
            </div>

            <div className={cn("flex-1 space-y-3", isAr ? "text-right" : "text-left")}>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 text-sm font-medium mb-2">
                <Clock size={16} />
                <span>{formatDateDisplay(new Date())}</span>
              </div>
              <h1 className="text-3xl md:text-5xl font-bold tracking-tight">
                {isAr ? "مرحباً بك، " : "Welcome back, "}
                <span className="text-white/90">{user?.firstName || (isAr ? 'مدير العيادة' : 'Clinic Manager')}</span>
              </h1>
              <p className="text-lg text-primary-foreground/80 max-w-2xl leading-relaxed">
                {isAr
                  ? "إليك نظرة سريعة على نظامك الطبي اليوم. اختر إحدى الوجهات السريعة للبدء بإدارة عيادتك بكفاءة."
                  : "Here's a quick overview of your medical system today. Choose a quick destination to start managing your clinic efficiently."}
              </p>
            </div>
          </div>
        </section>

        {/* Quick Links Section */}
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-foreground">{isAr ? "الوصول السريع" : "Quick Access"}</h2>
              <p className="text-muted-foreground">{isAr ? "انتقل بسرعة إلى الأقسام الأكثر استخداماً" : "Navigate quickly to your most used sections"}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {quickLinks.map((link, idx) => (
              <TransitionLink
                key={idx}
                href={link.href}
                className={cn(
                  "group relative p-6 bg-white rounded-2xl border transition-all duration-500 overflow-hidden",
                  link.border,
                  link.hover,
                  "hover:-translate-y-1 hover:shadow-xl"
                )}
              >
                <ShineHover color="#3FB8AF" />
                <div className="flex flex-col h-full gap-4 relative z-10">
                  <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3", link.color)}>
                    <link.icon className="size-6" />
                  </div>

                  <div className="flex-1">
                    <h3 className="font-bold text-lg text-foreground mb-1 group-hover:text-primary transition-colors">{link.title}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-2">{link.desc}</p>
                  </div>

                  <div className={cn("flex items-center text-sm font-bold mt-2", link.color.split(' ')[1])}>
                    <span>{isAr ? "اذهب للقسم" : "Go to section"}</span>
                    <ChevronRight className={cn("size-4 transition-transform duration-300 group-hover:translate-x-1", isAr && "rotate-180 group-hover:-translate-x-1 group-hover:translate-x-0")} />
                  </div>
                </div>
              </TransitionLink>
            ))}
          </div>
        </section>

        {/* Recent Activity Empty State - Ready for real data later */}
        <section className="bg-white rounded-3xl border border-border p-8 text-center shadow-lg hover:shadow-xl transition-shadow duration-300">
          <div className="max-w-md mx-auto space-y-4">
            <div className="w-20 h-20 bg-muted/30 rounded-full flex items-center justify-center mx-auto mb-6">
              <Activity className="size-10 text-muted-foreground/50" />
            </div>
            <h3 className="text-xl font-bold text-foreground">
              {isAr ? "لا توجد نشاطات حديثة" : "No recent activities"}
            </h3>
            <p className="text-muted-foreground leading-relaxed">
              {isAr
                ? "سيتم عرض ملخص للنشاطات والأحداث الأخيرة في العيادة هنا قريباً لتبقيك على إطلاع دائم."
                : "A summary of recent activities and events in the clinic will be displayed here soon to keep you updated."}
            </p>
          </div>
        </section>

      </div>
    </MainLayout>
  )
}

export default Dashboard
