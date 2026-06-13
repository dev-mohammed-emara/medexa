import {
  Activity,
  Building2,
  Clock,
  DollarSign,
  Calendar,
  Award,
  Power,
  Pen,
  MessageSquare,
  Users,
  TrendingUp,
  MapPin,
  Mail,
  Phone,
  Stethoscope,
  ArrowRight,
  CreditCard,
  User
} from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import AdminLayout from '../../components/layout/AdminLayout'
import Counter from '../../components/ui/Counter'
import Badge from '../../components/ui/badge'
import { usePreloader } from '../../contexts/PreloaderContext'
import { cn } from '../../utils/cn'

interface Clinic {
  id: number
  name: string
  category: string
  phone: string
  email: string
  city: string
  region: string
  address: string
  registerDate: string
  expireDate: string
  subscriptions: number
  status: 'نشط' | 'ينتهي قريباً'
  revenue: number
  isActive: boolean
  rating: number
  patientsCount: number
  usersCount: number
  visitsCount: number
  imports: number
  exports: number
}

const CLINICS_DATA: Record<number, Clinic> = {
  1: {
    id: 1,
    name: 'عيادة النور الطبية',
    category: 'طب عام',
    phone: '+962-79-111-2222',
    email: 'alnour@clinic.jo',
    city: 'عمان',
    region: 'الدوار السابع',
    address: 'شارع الملك عبدالله، بناية رقم 15',
    registerDate: '2024-01-15',
    expireDate: '2025-01-15',
    subscriptions: 3,
    status: 'نشط',
    revenue: 45000,
    isActive: true,
    rating: 92,
    patientsCount: 1250,
    usersCount: 12,
    visitsCount: 3420,
    imports: 125000,
    exports: 80000
  },
  2: {
    id: 2,
    name: 'عيادة الشفاء للأسنان',
    category: 'طب أسنان',
    phone: '+962-78-333-4444',
    email: 'shifa@dental.jo',
    city: 'إربد',
    region: 'وسط البلد',
    address: 'شارع الملك حسين، بناية رقم 4',
    registerDate: '2024-02-20',
    expireDate: '2024-12-20',
    subscriptions: 2,
    status: 'ينتهي قريباً',
    revenue: 32000,
    isActive: true,
    rating: 88,
    patientsCount: 840,
    usersCount: 6,
    visitsCount: 1980,
    imports: 85000,
    exports: 53000
  },
  3: {
    id: 3,
    name: 'مركز الرعاية للقلب',
    category: 'أمراض القلب',
    phone: '+962-77-555-6666',
    email: 'care@heart.jo',
    city: 'الزرقاء',
    region: 'شارع الجيش',
    address: 'شارع الجيش، مجمع الطبيين رقم 10',
    registerDate: '2023-12-10',
    expireDate: '2025-06-10',
    subscriptions: 5,
    status: 'نشط',
    revenue: 78000,
    isActive: true,
    rating: 96,
    patientsCount: 2100,
    usersCount: 18,
    visitsCount: 5120,
    imports: 210000,
    exports: 132000
  },
  4: {
    id: 4,
    name: 'عيادة السلام الجراحية',
    category: 'جراحة عامة',
    phone: '+962-79-777-8888',
    email: 'salam@surgery.jo',
    city: 'عمان',
    region: 'خلدا',
    address: 'شارع وصفي التل، مجمع البركة رقم 22',
    registerDate: '2024-03-05',
    expireDate: '2024-11-05',
    subscriptions: 1,
    status: 'ينتهي قريباً',
    revenue: 28000,
    isActive: false,
    rating: 85,
    patientsCount: 420,
    usersCount: 4,
    visitsCount: 950,
    imports: 58000,
    exports: 30000
  },
  5: {
    id: 5,
    name: 'عيادة الحياة للأطفال',
    category: 'طب أطفال',
    phone: '+962-78-999-0000',
    email: 'hayat@pediatric.jo',
    city: 'عمان',
    region: 'شارع مكة',
    address: 'شارع مكة، مجمع الحسيني رقم 8',
    registerDate: '2024-04-12',
    expireDate: '2025-04-12',
    subscriptions: 4,
    status: 'نشط',
    revenue: 56000,
    isActive: true,
    rating: 94,
    patientsCount: 1480,
    usersCount: 10,
    visitsCount: 3890,
    imports: 145000,
    exports: 89000
  }
}

const AdminClinicDetails = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { isLoaded, isExiting } = usePreloader()
  const canAnimate = isLoaded && !isExiting

  // Get clinic data based on ID
  const clinicId = Number(id)
  const [clinic, setClinic] = useState<Clinic | null>(null)

  // Stats Section Ref for Counter
  const [isInView, setIsInView] = useState(false)
  const statsSectionRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (CLINICS_DATA[clinicId]) {
      setClinic(CLINICS_DATA[clinicId])
    } else {
      // Fallback if not found, use first clinic
      setClinic(CLINICS_DATA[1])
    }
  }, [clinicId])

  useEffect(() => {
    if (!canAnimate || !statsSectionRef.current) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true)
          observer.unobserve(entry.target)
        }
      },
      { threshold: 0.1 }
    )

    observer.observe(statsSectionRef.current)
    return () => observer.disconnect()
  }, [canAnimate, clinic])

  if (!clinic) return null

  const handleToggleActive = () => {
    setClinic((prev) => {
      if (!prev) return null
      const nextState = !prev.isActive
      window.showToast(
        nextState
          ? `تم تفعيل عيادة "${prev.name}" بنجاح`
          : `تم إلغاء تفعيل عيادة "${prev.name}" بنجاح`,
        'success'
      )
      return { ...prev, isActive: nextState }
    })
  }

  const handleEditData = () => {
    window.showToast('سيتم فتح نموذج تعديل البيانات قريباً', 'info')
  }

  const handleContactClinic = () => {
    window.showToast(`بدء محادثة جديدة مع ${clinic.name}`, 'success')
  }

  // Users lists for rendering
  const getMockUsers = (category: string) => {
    const isDental = category.includes('أسنان')
    const isCardiac = category.includes('قلب')
    const isPediatric = category.includes('أطفال')
    const isSurgery = category.includes('جراحة')

    return [
      {
        id: 1,
        name: isDental ? 'د. سمير الخطيب' : isCardiac ? 'د. ليلى خالد' : isPediatric ? 'د. رانية سمير' : isSurgery ? 'د. عماد حسن' : 'د. أحمد السعيد',
        role: isDental ? 'طبيب أسنان' : isCardiac ? 'أخصائي قلب' : isPediatric ? 'طبيب أطفال' : isSurgery ? 'جراح عام' : 'طبيب عام',
        avatar: 'د',
        status: 'نشط',
        lastLogin: '2024-05-18 14:30'
      },
      {
        id: 2,
        name: 'سارة محمد',
        role: 'موظفة استقبال',
        avatar: 'س',
        status: 'نشط',
        lastLogin: '2024-05-18 13:15'
      },
      {
        id: 3,
        name: 'خالد عبدالله',
        role: 'ممرض',
        avatar: 'خ',
        status: 'نشط',
        lastLogin: '2024-05-18 10:20'
      }
    ]
  }

  const clinicUsers = getMockUsers(clinic.category)

  return (
    <AdminLayout>
      <div
        className={cn(
          'space-y-6 pb-8 opacity-0',
          canAnimate && 'animate-fadeUp opacity-100 animate-delay-[100ms]',
          isExiting && 'animate-fadeDownOut'
        )}
        dir="rtl"
        style={{ opacity: canAnimate ? 1 : 0 }}
      >
        {/* Banner / Header Card */}
        <div className="flex flex-col md:flex-row items-start justify-between gap-6 bg-white p-6 rounded-2xl border border-gray-200 shadow-xs">
          <div className="flex flex-col sm:flex-row items-start gap-6">
            {/* Clinic Logo Initial */}
            <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center text-white text-4xl font-bold shadow-lg shrink-0">
              {clinic.name.trim().startsWith('مركز') ? 'م' : 'ع'}
            </div>

            <div>
              {/* Back Button */}
              <button
                onClick={async () => {
                  if (window.triggerExitTransition) {
                    await window.triggerExitTransition()
                  }
                  navigate('/admin/clinics')
                }}
                className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all duration-300 hover:bg-accent hover:shadow-sm h-9 px-4 py-2 text-[#64748B] hover:text-[#0F172A] mb-3 -mr-2 cursor-pointer"
              >
                <ArrowRight className="size-4.5 ml-2" />
                <span>العودة إلى العيادات</span>
              </button>

              {/* Title */}
              <h1 className="text-3xl text-[#0F172A] mb-3 font-bold">{clinic.name}</h1>

              {/* Badges */}
              <div className="flex items-center flex-wrap gap-2 mb-3">
                <Badge variant="purple">
                  <Stethoscope className="size-3.5 ml-1" />
                  <span>{clinic.category}</span>
                </Badge>
                <Badge variant={clinic.status === 'نشط' ? 'green' : 'yellow'}>
                  <span>{clinic.status}</span>
                </Badge>
                <Badge variant={clinic.isActive ? 'green' : 'red'}>
                  <span>{clinic.isActive ? 'مفعّل' : 'ملغى التفعيل'}</span>
                </Badge>
              </div>

              {/* Meta information */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6 text-sm text-[#64748B]">
                <div className="flex items-center gap-2">
                  <Calendar className="size-4.5" />
                  <span>تسجيل: {clinic.registerDate}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="size-4.5" />
                  <span>ينتهي: {clinic.expireDate}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Award className="size-4.5 text-amber-500" />
                  <span className="text-[#0F172A] font-semibold">تقييم الأداء: {clinic.rating}%</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons Row */}
        <div className="flex flex-wrap gap-3">
          <button
            onClick={handleToggleActive}
            className={cn(
              'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 active:shadow-md hover:shadow-rose-500/20 h-9 px-4 py-2 text-white cursor-pointer',
              clinic.isActive ? 'bg-rose-500 hover:bg-rose-600' : 'bg-emerald-500 hover:bg-emerald-600 hover:shadow-emerald-500/20'
            )}
          >
            <Power className="size-4 ml-2" />
            <span>{clinic.isActive ? 'إلغاء التفعيل' : 'تفعيل العيادة'}</span>
          </button>

          <button
            onClick={handleEditData}
            className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 active:shadow-md hover:shadow-blue-500/20 h-9 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white cursor-pointer"
          >
            <Pen className="size-4 ml-2" />
            <span>تعديل البيانات</span>
          </button>

          <button
            onClick={handleContactClinic}
            className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 active:shadow-md hover:shadow-amber-500/20 h-9 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white cursor-pointer"
          >
            <MessageSquare className="size-4 ml-2" />
            <span>تواصل مع العيادة</span>
          </button>
        </div>

        {/* Main Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Left Main Contents Column */}
          <div className="lg:col-span-2 space-y-6">

            {/* Clinic Info Card */}
            <div className="text-card-foreground flex flex-col gap-6 rounded-xl transition-all duration-300 hover:shadow-lg p-6 bg-white border border-gray-200 shadow-xs">
              <h2 className="text-xl text-[#0F172A] font-bold mb-2">معلومات العيادة</h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                  <div className="flex items-center gap-3 mb-2">
                    <Building2 className="text-[#64748B] size-4.5" />
                    <p className="text-sm text-[#64748B]">اسم العيادة</p>
                  </div>
                  <p className="text-[#0F172A] font-semibold">{clinic.name}</p>
                </div>

                <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                  <div className="flex items-center gap-3 mb-2">
                    <Stethoscope className="text-[#64748B] size-4.5" />
                    <p className="text-sm text-[#64748B]">التخصص</p>
                  </div>
                  <p className="text-[#0F172A] font-semibold">{clinic.category}</p>
                </div>

                <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                  <div className="flex items-center gap-3 mb-2">
                    <Phone className="text-[#64748B] size-4.5" />
                    <p className="text-sm text-[#64748B]">رقم الهاتف</p>
                  </div>
                  <p className="text-[#0F172A] font-semibold font-mono">{clinic.phone}</p>
                </div>

                <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                  <div className="flex items-center gap-3 mb-2">
                    <Mail className="text-[#64748B] size-4.5" />
                    <p className="text-sm text-[#64748B]">البريد الإلكتروني</p>
                  </div>
                  <p className="text-[#0F172A] font-semibold">{clinic.email}</p>
                </div>

                <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                  <div className="flex items-center gap-3 mb-2">
                    <MapPin className="text-[#64748B] size-4.5" />
                    <p className="text-sm text-[#64748B]">المدينة</p>
                  </div>
                  <p className="text-[#0F172A] font-semibold">{clinic.city}</p>
                </div>

                <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                  <div className="flex items-center gap-3 mb-2">
                    <MapPin className="text-[#64748B] size-4.5" />
                    <p className="text-sm text-[#64748B]">المنطقة</p>
                  </div>
                  <p className="text-[#0F172A] font-semibold">{clinic.region}</p>
                </div>

                <div className="sm:col-span-2 bg-gray-50 p-4 rounded-xl border border-gray-200">
                  <div className="flex items-center gap-3 mb-2">
                    <MapPin className="text-[#64748B] size-4.5" />
                    <p className="text-sm text-[#64748B]">العنوان الكامل</p>
                  </div>
                  <p className="text-[#0F172A] font-semibold">{clinic.address}</p>
                </div>
              </div>
            </div>

            {/* Clinic Statistics Cards Grid */}
            <div ref={statsSectionRef} className="text-card-foreground flex flex-col gap-6 rounded-xl transition-all duration-300 hover:shadow-lg p-6 bg-white border border-gray-200 shadow-xs">
              <h2 className="text-xl text-[#0F172A] font-bold mb-2">إحصائيات العيادة</h2>

              <div className="grid grid-cols-1 md:grid-cols-2  lg:grid-cols-3 gap-4">
                {/* Number of Patients */}
                <div className="bg-gradient-to-br from-blue-50 to-cyan-50 p-5 rounded-xl border border-blue-100 hover:shadow-md transition-all select-none">
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                      <Users className="text-white size-5" />
                    </div>
                    <TrendingUp className="text-blue-600 size-4.5" />
                  </div>
                  <p className="text-sm text-[#64748B] mb-1 font-medium">عدد المرضى</p>
                  <div className="h-9 flex items-baseline">
                    <Counter
                      value={clinic.patientsCount}
                      fontSize={24}
                      fontWeight="700"
                      textColor="#0F172A"
                      isInView={isInView}
                    />
                  </div>
                </div>

                {/* Number of Users */}
                <div className="bg-gradient-to-br from-emerald-50 to-teal-50 p-5 rounded-xl border border-emerald-100 hover:shadow-md transition-all select-none">
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-10 h-10 bg-emerald-500 rounded-lg flex items-center justify-center">
                      <Users className="text-white size-5" />
                    </div>
                    <TrendingUp className="text-emerald-600 size-4.5" />
                  </div>
                  <p className="text-sm text-[#64748B] mb-1 font-medium">عدد المستخدمين</p>
                  <div className="h-9 flex items-baseline">
                    <Counter
                      value={clinic.usersCount}
                      fontSize={24}
                      fontWeight="700"
                      textColor="#0F172A"
                      isInView={isInView}
                    />
                  </div>
                </div>

                {/* Number of Visits */}
                <div className="bg-gradient-to-br from-purple-50 to-violet-50 p-5 rounded-xl border border-purple-100 hover:shadow-md transition-all select-none">
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center">
                      <Activity className="text-white size-5" />
                    </div>
                    <TrendingUp className="text-purple-600 size-4.5" />
                  </div>
                  <p className="text-sm text-[#64748B] mb-1 font-medium">عدد الزيارات</p>
                  <div className="h-9 flex items-baseline">
                    <Counter
                      value={clinic.visitsCount}
                      fontSize={24}
                      fontWeight="700"
                      textColor="#0F172A"
                      isInView={isInView}
                    />
                  </div>
                </div>

                {/* Total Imports */}
                <div className="bg-gradient-to-br from-amber-50 to-orange-50 p-5 rounded-xl border border-amber-100 hover:shadow-md transition-all select-none">
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-10 h-10 bg-amber-500 rounded-lg flex items-center justify-center">
                      <DollarSign className="text-white size-5" />
                    </div>
                    <TrendingUp className="text-amber-600 size-4.5" />
                  </div>
                  <p className="text-sm text-[#64748B] mb-1 font-medium">إجمالي الواردات</p>
                  <div className="h-9 flex items-baseline flex-row-reverse justify-end gap-1">
                    <span className="text-[#0F172A] font-bold text-sm">د.أ</span>
                    <Counter
                      value={clinic.imports}
                      fontSize={24}
                      fontWeight="700"
                      textColor="#0F172A"
                      isInView={isInView}
                    />
                  </div>
                </div>

                {/* Total Exports */}
                <div className="bg-gradient-to-br from-rose-50 to-red-50 p-5 rounded-xl border border-rose-100 hover:shadow-md transition-all select-none">
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-10 h-10 bg-rose-500 rounded-lg flex items-center justify-center">
                      <DollarSign className="text-white size-5" />
                    </div>
                    <Activity className="text-rose-600 size-4.5" />
                  </div>
                  <p className="text-sm text-[#64748B] mb-1 font-medium">إجمالي الصادرات</p>
                  <div className="h-9 flex items-baseline flex-row-reverse justify-end gap-1">
                    <span className="text-[#0F172A] font-bold text-sm">د.أ</span>
                    <Counter
                      value={clinic.exports}
                      fontSize={24}
                      fontWeight="700"
                      textColor="#0F172A"
                      isInView={isInView}
                    />
                  </div>
                </div>

                {/* Net Profit */}
                <div className="bg-gradient-to-br from-indigo-50 to-blue-50 p-5 rounded-xl border border-indigo-100 hover:shadow-md transition-all select-none">
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-10 h-10 bg-indigo-500 rounded-lg flex items-center justify-center">
                      <DollarSign className="text-white size-5" />
                    </div>
                    <TrendingUp className="text-indigo-600 size-4.5" />
                  </div>
                  <p className="text-sm text-[#64748B] mb-1 font-medium">صافي الربح</p>
                  <div className="h-9 flex items-baseline flex-row-reverse justify-end gap-1">
                    <span className="text-[#0F172A] font-bold text-sm">د.أ</span>
                    <Counter
                      value={clinic.imports - clinic.exports}
                      fontSize={24}
                      fontWeight="700"
                      textColor="#0F172A"
                      isInView={isInView}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Clinic Users List Card */}
            <div className="text-card-foreground flex flex-col gap-6 rounded-xl transition-all duration-300 hover:shadow-lg p-6 bg-white border border-gray-200 shadow-xs">
              <h2 className="text-xl text-[#0F172A] font-bold mb-2">المستخدمين في العيادة</h2>

              <div className="space-y-3">
                {clinicUsers.map((user) => (
                  <div
                    key={user.id}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-200 hover:shadow-md transition-all"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                        {user.avatar}
                      </div>
                      <div className="text-right">
                        <p className="text-[#0F172A] font-semibold">{user.name}</p>
                        <p className="text-sm text-[#64748B]">{user.role}</p>
                      </div>
                    </div>
                    <div className="text-left">
                      <Badge variant="green" className="mb-2">
                        {user.status}
                      </Badge>
                      <p className="text-xs text-[#64748B]">آخر دخول: {user.lastLogin}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Sidebar Contents Column */}
          <div className="space-y-6">

            {/* Subscription Summary Card */}
            <div className="text-card-foreground flex flex-col gap-6 rounded-xl transition-all duration-300 hover:shadow-lg p-6 bg-gradient-to-br from-gray-50 to-slate-50 border border-gray-200 shadow-xs">
              <h2 className="text-xl text-[#0F172A] font-bold">ملخص الاشتراكات</h2>

              <div className="space-y-6">
                <div>
                  <p className="text-sm text-[#64748B] mb-2 font-medium">عدد الاشتراكات</p>
                  <p className="text-4xl text-[#0F172A] font-bold">{clinic.subscriptions}</p>
                </div>

                <div>
                  <p className="text-sm text-[#64748B] mb-2 font-medium">إجمالي المدفوعات</p>
                  <p className="text-4xl text-emerald-600 font-bold">{clinic.revenue.toLocaleString()} د.أ</p>
                </div>

                <div>
                  <p className="text-sm text-[#64748B] mb-2 font-medium">حالة الاشتراك</p>
                  <Badge variant={clinic.status === 'نشط' ? 'green' : 'yellow'} className="text-base px-4 py-2">
                    {clinic.status}
                  </Badge>
                </div>

                <button
                  onClick={() => window.showToast('عرض تفاصيل الفاتورة والاشتراك', 'info')}
                  className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 active:shadow-md hover:shadow-blue-500/20 h-9 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white w-full cursor-pointer"
                >
                  <CreditCard className="size-4 ml-2" />
                  <span>عرض تفاصيل الاشتراك</span>
                </button>
              </div>
            </div>

            {/* Recent Activities Card */}
            <div className="text-card-foreground flex flex-col gap-6 rounded-xl transition-all duration-300 hover:shadow-lg p-6 bg-white border border-gray-200 shadow-xs">
              <h2 className="text-xl text-[#0F172A] font-bold">النشاطات الأخيرة</h2>

              <div className="space-y-4">
                <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
                  <div className="w-10 h-10 bg-blue-500/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Calendar className="text-blue-600 size-5" />
                  </div>
                  <div className="flex-1 min-w-0 text-right">
                    <p className="text-sm text-[#0F172A] font-semibold mb-1">موعد جديد</p>
                    <p className="text-xs text-[#64748B] truncate">د. أحمد السعيد - فحص عام</p>
                    <p className="text-xs text-[#64748B] mt-1">منذ 15 دقيقة</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
                  <div className="w-10 h-10 bg-blue-500/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <User className="text-blue-600 size-5" />
                  </div>
                  <div className="flex-1 min-w-0 text-right">
                    <p className="text-sm text-[#0F172A] font-semibold mb-1">مريض جديد</p>
                    <p className="text-xs text-[#64748B] truncate">محمد العمري - رقم السجل: 12345</p>
                    <p className="text-xs text-[#64748B] mt-1">منذ ساعة واحدة</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
                  <div className="w-10 h-10 bg-blue-500/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <CreditCard className="text-blue-600 size-5" />
                  </div>
                  <div className="flex-1 min-w-0 text-right">
                    <p className="text-sm text-[#0F172A] font-semibold mb-1">دفعة جديدة</p>
                    <p className="text-xs text-[#64748B] truncate">اشتراك Premium - 15,000 د.أ</p>
                    <p className="text-xs text-[#64748B] mt-1">منذ 3 ساعات</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
                  <div className="w-10 h-10 bg-blue-500/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <User className="text-blue-600 size-5" />
                  </div>
                  <div className="flex-1 min-w-0 text-right">
                    <p className="text-sm text-[#0F172A] font-semibold mb-1">مستخدم جديد</p>
                    <p className="text-xs text-[#64748B] truncate">د. سارة محمد - طبيبة أسنان</p>
                    <p className="text-xs text-[#64748B] mt-1">منذ 5 ساعات</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Latest Tickets Card */}
            <div className="text-card-foreground flex flex-col gap-6 rounded-xl transition-all duration-300 hover:shadow-lg p-6 bg-white border border-gray-200 shadow-xs">
              <h2 className="text-xl text-[#0F172A] font-bold">أحدث التذاكر</h2>

              <div className="space-y-3">
                <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 hover:shadow-md transition-all">
                  <div className="flex items-start justify-between mb-2">
                    <p className="text-[#0F172A] font-semibold text-sm">مشكلة في نظام الحجز</p>
                    <Badge variant="blue">مفتوحة</Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="red">عالية</Badge>
                    <span className="text-xs text-[#64748B]">منذ 2 ساعات</span>
                  </div>
                </div>

                <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 hover:shadow-md transition-all">
                  <div className="flex items-start justify-between mb-2">
                    <p className="text-[#0F172A] font-semibold text-sm">طلب ميزة جديدة</p>
                    <Badge variant="yellow">قيد المعالجة</Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="yellow">متوسطة</Badge>
                    <span className="text-xs text-[#64748B]">منذ 1 يوم</span>
                  </div>
                </div>

                <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 hover:shadow-md transition-all">
                  <div className="flex items-start justify-between mb-2">
                    <p className="text-[#0F172A] font-semibold text-sm">استفسار عن الفواتير</p>
                    <Badge variant="green">تم الحل</Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="purple">منخفضة</Badge>
                    <span className="text-xs text-[#64748B]">منذ 3 أيام</span>
                  </div>
                </div>
              </div>
            </div>

          </div>

        </div>
      </div>
    </AdminLayout>
  )
}

export default AdminClinicDetails
