import {
  Activity,
  Building2,
  Clock,
  DollarSign,
  Download,
  Eye,
  Pen,
  Search,
  Filter,
} from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import AdminLayout from '../../components/layout/AdminLayout'
import Counter from '../../components/ui/Counter'
import Badge from '../../components/ui/badge'
import TableFooter from '../../components/ui/TableFooter'
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '../../components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select'
import { usePreloader } from '../../contexts/PreloaderContext'
import { cn } from '../../utils/cn'

interface Clinic {
  id: number
  name: string
  category: string
  phone: string
  email: string
  city: string
  registerDate: string
  expireDate: string
  subscriptions: number
  status: 'نشط' | 'ينتهي قريباً'
  revenue: number
  isActive: boolean
}

const INITIAL_CLINICS: Clinic[] = [
  {
    id: 1,
    name: 'عيادة النور الطبية',
    category: 'طب عام',
    phone: '+962-79-111-2222',
    email: 'alnour@clinic.jo',
    city: 'عمان',
    registerDate: '2024-01-15',
    expireDate: '2025-01-15',
    subscriptions: 3,
    status: 'نشط',
    revenue: 45000,
    isActive: true,
  },
  {
    id: 2,
    name: 'عيادة الشفاء للأسنان',
    category: 'طب أسنان',
    phone: '+962-78-333-4444',
    email: 'shifa@dental.jo',
    city: 'إربد',
    registerDate: '2024-02-20',
    expireDate: '2024-12-20',
    subscriptions: 2,
    status: 'ينتهي قريباً',
    revenue: 32000,
    isActive: true,
  },
  {
    id: 3,
    name: 'مركز الرعاية للقلب',
    category: 'أمراض القلب',
    phone: '+962-77-555-6666',
    email: 'care@heart.jo',
    city: 'الزرقاء',
    registerDate: '2023-12-10',
    expireDate: '2025-06-10',
    subscriptions: 5,
    status: 'نشط',
    revenue: 78000,
    isActive: true,
  },
  {
    id: 4,
    name: 'عيادة السلام الجراحية',
    category: 'جراحة عامة',
    phone: '+962-79-777-8888',
    email: 'salam@surgery.jo',
    city: 'عمان',
    registerDate: '2024-03-05',
    expireDate: '2024-11-05',
    subscriptions: 1,
    status: 'ينتهي قريباً',
    revenue: 28000,
    isActive: false,
  },
  {
    id: 5,
    name: 'عيادة الحياة للأطفال',
    category: 'طب أطفال',
    phone: '+962-78-999-0000',
    email: 'hayat@pediatric.jo',
    city: 'عمان',
    registerDate: '2024-04-12',
    expireDate: '2025-04-12',
    subscriptions: 4,
    status: 'نشط',
    revenue: 56000,
    isActive: true,
  },
]

const AdminClinics = () => {
  const navigate = useNavigate()
  const { isLoaded, isExiting } = usePreloader()
  const canAnimate = isLoaded && !isExiting

  // States
  const [clinics, setClinics] = useState<Clinic[]>(INITIAL_CLINICS)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedStatus, setSelectedStatus] = useState('all')
  const [selectedCity, setSelectedCity] = useState('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(5)

  // GSAP Counter observer
  const [isInView, setIsInView] = useState(false)
  const statsSectionRef = useRef<HTMLDivElement>(null)

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
  }, [canAnimate])

  // Filter logic
  const filteredClinics = clinics.filter((clinic) => {
    const query = searchQuery.trim().toLowerCase()
    const matchesSearch =
      query === '' ||
      clinic.name.toLowerCase().includes(query) ||
      clinic.email.toLowerCase().includes(query) ||
      clinic.phone.toLowerCase().includes(query)

    const matchesCategory = selectedCategory === 'all' || clinic.category === selectedCategory
    const matchesStatus = selectedStatus === 'all' || clinic.status === selectedStatus
    const matchesCity = selectedCity === 'all' || clinic.city === selectedCity

    return matchesSearch && matchesCategory && matchesStatus && matchesCity
  })

  // Dynamic statistics calculations
  const totalClinics = clinics.length
  const activeClinics = clinics.filter((c) => c.status === 'نشط').length
  const endingSoonClinics = clinics.filter((c) => c.status === 'ينتهي قريباً').length
  const totalRevenue = clinics.reduce((sum, c) => sum + c.revenue, 0)

  // Pagination calculations
  const totalPages = Math.max(1, Math.ceil(filteredClinics.length / itemsPerPage))
  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages)
    }
  }, [filteredClinics.length, totalPages, currentPage])

  const visibleClinics = filteredClinics.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  const handleToggleActive = (id: number) => {
    setClinics((prev) =>
      prev.map((c) => {
        if (c.id === id) {
          const nextState = !c.isActive
          window.showToast(
            nextState
              ? `تم تفعيل عيادة "${c.name}" بنجاح`
              : `تم إلغاء تفعيل عيادة "${c.name}" بنجاح`,
            'success'
          )
          return { ...c, isActive: nextState }
        }
        return c
      })
    )
  }

  const handleExportData = () => {
    window.showToast('تم تصدير بيانات العيادات بنجاح بصيغة CSV', 'success')
  }

  return (
    <AdminLayout>
      <div
        className={cn(
          'space-y-6 opacity-0',
          canAnimate && 'animate-fadeUp opacity-100 animate-delay-[100ms]',
          isExiting && 'animate-fadeDownOut'
        )}
        dir="rtl"
        style={{ opacity: canAnimate ? 1 : 0 }}
      >
        {/* Top Header Row */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl text-[#0F172A] mb-2 font-bold">إدارة العيادات</h1>
            <p className="text-[#64748B] text-sm">مراقبة وإدارة جميع العيادات المسجلة في النظام</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleExportData}
              className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all duration-300 disabled:pointer-events-none disabled:opacity-50 hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 active:shadow-md h-9 px-4 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white"
            >
              <Download className="size-4" />
              <span>تصدير البيانات</span>
            </button>
          </div>
        </div>

        {/* Dynamic Statistics Cards Grid */}
        <div ref={statsSectionRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Total Clinics Card */}
          <div className="text-card-foreground flex flex-col gap-6 rounded-xl duration-300 p-6 bg-white border border-gray-200 shadow-sm hover:shadow-md transition-all">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[#64748B] mb-1 font-medium">إجمالي العيادات</p>
                <div className="h-9 flex items-baseline select-none">
                  <Counter
                    value={totalClinics}
                    fontSize={30}
                    fontWeight="700"
                    textColor="#0F172A"
                    isInView={isInView}
                  />
                </div>
              </div>
              <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center">
                <Building2 className="text-blue-600 size-6" />
              </div>
            </div>
          </div>

          {/* Active Clinics Card */}
          <div className="text-card-foreground flex flex-col gap-6 rounded-xl duration-300 p-6 bg-white border border-gray-200 shadow-sm hover:shadow-md transition-all">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[#64748B] mb-1 font-medium">العيادات النشطة</p>
                <div className="h-9 flex items-baseline select-none">
                  <Counter
                    value={activeClinics}
                    fontSize={30}
                    fontWeight="700"
                    textColor="#0F172A"
                    isInView={isInView}
                  />
                </div>
              </div>
              <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center">
                <Activity className="text-emerald-600 size-6" />
              </div>
            </div>
          </div>

          {/* Ending Soon Card */}
          <div className="text-card-foreground flex flex-col gap-6 rounded-xl duration-300 p-6 bg-white border border-gray-200 shadow-sm hover:shadow-md transition-all">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[#64748B] mb-1 font-medium">تنتهي قريباً</p>
                <div className="h-9 flex items-baseline select-none">
                  <Counter
                    value={endingSoonClinics}
                    fontSize={30}
                    fontWeight="700"
                    textColor="#0F172A"
                    isInView={isInView}
                  />
                </div>
              </div>
              <div className="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center">
                <Clock className="text-amber-600 size-6" />
              </div>
            </div>
          </div>

          {/* Total Revenue Card */}
          <div className="text-card-foreground flex flex-col gap-6 rounded-xl duration-300 p-6 bg-white border border-gray-200 shadow-sm hover:shadow-md transition-all">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[#64748B] mb-1 font-medium">إجمالي الإيرادات (د.أ)</p>
                <div className="h-9 flex items-baseline select-none">
                  <Counter
                    value={totalRevenue}
                    fontSize={30}
                    fontWeight="700"
                    textColor="#0F172A"
                    isInView={isInView}
                  />
                </div>
              </div>
              <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center">
                <DollarSign className="text-purple-600 size-6" />
              </div>
            </div>
          </div>
        </div>

        {/* Filter Card */}
        <div className="text-card-foreground flex flex-col gap-6 rounded-xl transition-all duration-300 hover:shadow-lg p-6 bg-white border border-gray-200 shadow-sm">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 size-4.5 pointer-events-none" />
              <input
                type="text"
                placeholder="بحث بالاسم، البريد الإلكتروني، أو رقم الهاتف..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value)
                  setCurrentPage(1)
                }}
                className="w-full h-9 pr-10 pl-4 bg-gray-50 border border-gray-200 rounded-md text-sm outline-none focus:ring-2 focus:ring-[#0EA5E9]/20 transition-all placeholder:text-gray-400"
              />
            </div>

            {/* Medical Category Filter */}
            <div className="w-full lg:w-48">
              <Select name="selectedCategory" value={selectedCategory}
                onValueChange={(val) => {
                  setSelectedCategory(val)
                  setCurrentPage(1)
                }}
              >
                <SelectTrigger className="h-9 bg-gray-50 border-gray-200 text-sm rounded-md flex items-center justify-between px-3 text-[#0F172A] focus:ring-2 focus:ring-[#0EA5E9]/20 font-medium">
                  <div className="flex items-center">
                    <Filter className="size-4 ml-2 text-gray-500" />
                    <SelectValue placeholder="الكل" />
                  </div>
                </SelectTrigger>
                <SelectContent smallZ>
                  <SelectItem value="all">الكل</SelectItem>
                  <SelectItem value="طب عام">طب عام</SelectItem>
                  <SelectItem value="طب أسنان">طب أسنان</SelectItem>
                  <SelectItem value="أمراض القلب">أمراض القلب</SelectItem>
                  <SelectItem value="جراحة عامة">جراحة عامة</SelectItem>
                  <SelectItem value="طب أطفال">طب أطفال</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Status Filter */}
            <div className="w-full lg:w-48">
              <Select name="selectedStatus" value={selectedStatus}
                onValueChange={(val) => {
                  setSelectedStatus(val)
                  setCurrentPage(1)
                }}
              >
                <SelectTrigger className="h-9 bg-gray-50 border-gray-200 text-sm rounded-md text-[#0F172A] focus:ring-2 focus:ring-[#0EA5E9]/20 font-medium">
                  <SelectValue placeholder="جميع الحالات" />
                </SelectTrigger>
                <SelectContent smallZ>
                  <SelectItem value="all">جميع الحالات</SelectItem>
                  <SelectItem value="نشط">نشط</SelectItem>
                  <SelectItem value="ينتهي قريباً">ينتهي قريباً</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* City Filter */}
            <div className="w-full lg:w-48">
              <Select name="selectedCity" value={selectedCity}
                onValueChange={(val) => {
                  setSelectedCity(val)
                  setCurrentPage(1)
                }}
              >
                <SelectTrigger className="h-9 bg-gray-50 border-gray-200 text-sm rounded-md text-[#0F172A] focus:ring-2 focus:ring-[#0EA5E9]/20 font-medium">
                  <SelectValue placeholder="الكل" />
                </SelectTrigger>
                <SelectContent smallZ>
                  <SelectItem value="all">الكل</SelectItem>
                  <SelectItem value="عمان">عمان</SelectItem>
                  <SelectItem value="إربد">إربد</SelectItem>
                  <SelectItem value="الزرقاء">الزرقاء</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Table Card */}
        <div className="text-card-foreground flex flex-col gap-6 rounded-xl transition-all duration-300 hover:shadow-lg bg-white border border-gray-200 shadow-sm overflow-hidden">
          <Table className="min-w-[1000px] text-right">
            <TableHeader className="sticky top-0 bg-gray-50 z-10 border-b border-gray-200">
              <TableRow>
                <TableHead className="h-10 px-4 align-middle whitespace-nowrap text-[#334155] font-semibold text-right">
                  اسم العيادة
                </TableHead>
                <TableHead className="h-10 px-4 align-middle whitespace-nowrap text-[#334155] font-semibold text-right">
                  الفئة الطبية
                </TableHead>
                <TableHead className="h-10 px-4 align-middle whitespace-nowrap text-[#334155] font-semibold text-right">
                  رقم الهاتف
                </TableHead>
                <TableHead className="h-10 px-4 align-middle whitespace-nowrap text-[#334155] font-semibold text-right">
                  البريد الإلكتروني
                </TableHead>
                <TableHead className="h-10 px-4 align-middle whitespace-nowrap text-[#334155] font-semibold text-right">
                  المدينة
                </TableHead>
                <TableHead className="h-10 px-4 align-middle whitespace-nowrap text-[#334155] font-semibold text-right">
                  تاريخ التسجيل
                </TableHead>
                <TableHead className="h-10 px-4 align-middle whitespace-nowrap text-[#334155] font-semibold text-right">
                  تاريخ الانتهاء
                </TableHead>
                <TableHead className="h-10 px-4 align-middle whitespace-nowrap text-[#334155] font-semibold text-center">
                  الاشتراكات
                </TableHead>
                <TableHead className="h-10 px-4 align-middle whitespace-nowrap text-[#334155] font-semibold text-right">
                  الحالة
                </TableHead>
                <TableHead className="h-10 px-4 align-middle whitespace-nowrap text-[#334155] font-semibold text-right">
                  المبلغ المدفوع
                </TableHead>
                <TableHead className="h-10 px-4 align-middle whitespace-nowrap text-[#334155] font-semibold text-center">
                  التفعيل
                </TableHead>
                <TableHead className="h-10 px-4 align-middle whitespace-nowrap text-[#334155] font-semibold text-center">
                  الإجراءات
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {visibleClinics.length > 0 ? (
                visibleClinics.map((clinic) => (
                  <TableRow
                    key={clinic.id}
                  >
                    {/* Name & Avatar */}
                    <TableCell className="p-4 align-middle whitespace-nowrap text-[#0F172A] font-semibold text-right">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center text-white font-bold">
                          {clinic.name.trim().startsWith('مركز') ? 'م' : 'ع'}
                        </div>
                        <span>{clinic.name}</span>
                      </div>
                    </TableCell>

                    {/* Medical Category */}
                    <TableCell className="p-4 align-middle whitespace-nowrap text-right">
                      <Badge variant="purple">{clinic.category}</Badge>
                    </TableCell>

                    {/* Phone */}
                    <TableCell className="p-4 align-middle whitespace-nowrap text-[#334155] font-mono text-sm text-right">
                      {clinic.phone}
                    </TableCell>

                    {/* Email */}
                    <TableCell className="p-4 align-middle whitespace-nowrap text-[#334155] text-sm text-right">
                      {clinic.email}
                    </TableCell>

                    {/* City */}
                    <TableCell className="p-4 align-middle whitespace-nowrap text-[#334155] text-right">
                      {clinic.city}
                    </TableCell>

                    {/* Register Date */}
                    <TableCell className="p-4 align-middle whitespace-nowrap text-[#64748B] text-sm text-right">
                      {clinic.registerDate}
                    </TableCell>

                    {/* Expire Date */}
                    <TableCell className="p-4 align-middle whitespace-nowrap text-[#64748B] text-sm text-right">
                      {clinic.expireDate}
                    </TableCell>

                    {/* Subscriptions */}
                    <TableCell className="p-4 align-middle whitespace-nowrap text-center">
                      <Badge variant="blue">{clinic.subscriptions}</Badge>
                    </TableCell>

                    {/* Status */}
                    <TableCell className="p-4 align-middle whitespace-nowrap text-right">
                      <Badge variant={clinic.status === 'نشط' ? 'green' : 'yellow'}>
                        {clinic.status}
                      </Badge>
                    </TableCell>

                    {/* Revenue (Amount Paid) */}
                    <TableCell className="p-4 align-middle whitespace-nowrap text-[#0F172A] font-semibold text-right">
                      {clinic.revenue.toLocaleString()} د.أ
                    </TableCell>

                    {/* Activation Toggle Switch */}
                    <TableCell className="p-4 align-middle whitespace-nowrap text-center">
                      <button
                        onClick={() => handleToggleActive(clinic.id)}
                        className={cn(
                          'w-12 h-6 rounded-full transition-colors relative cursor-pointer duration-300 flex items-center',
                          clinic.isActive ? 'bg-emerald-500' : 'bg-gray-300'
                        )}
                      >
                        <div
                          className={cn(
                            'w-5 h-5 bg-white rounded-full absolute top-0.5 transition-all duration-300 shadow-xs',
                            clinic.isActive ? 'right-0.5' : 'right-[26px]'
                          )}
                        />
                      </button>
                    </TableCell>

                    {/* Actions */}
                    <TableCell className="p-4 align-middle whitespace-nowrap text-center">
                      <div className="flex gap-2 justify-center">
                        <button
                          onClick={async () => {
                            if (window.triggerExitTransition) {
                              await window.triggerExitTransition()
                            }
                            navigate(`/admin/clinics/${clinic.id}`)
                          }}
                          className="inline-flex items-center justify-center whitespace-nowrap text-sm font-medium transition-all duration-300 disabled:pointer-events-none disabled:opacity-50 hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 active:shadow-sm h-8 rounded-md px-2.5 text-[#0EA5E9] hover:text-[#0EA5E9] hover:bg-blue-500/10 cursor-pointer"
                          title="عرض التفاصيل"
                        >
                          <Eye className="size-4" />
                        </button>
                        <button
                          onClick={() => {}}
                          className="inline-flex items-center justify-center whitespace-nowrap text-sm font-medium transition-all duration-300 disabled:pointer-events-none disabled:opacity-50 hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 active:shadow-sm h-8 rounded-md px-2.5 text-amber-600 hover:text-amber-700 hover:bg-amber-50 cursor-pointer"
                          title="تعديل العيادة"
                        >
                          <Pen className="size-4" />
                        </button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={12} className="p-8 text-center text-gray-400 font-bold">
                    لا توجد عيادات مطابقة للبحث أو خيارات التصفية.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>

          {/* Pagination Footer */}
          <TableFooter
            totalItems={filteredClinics.length}
            itemsPerPage={itemsPerPage}
            currentPage={currentPage}
            className='pb-4'
            onPageChange={setCurrentPage}
          />
        </div>
      </div>
    </AdminLayout>
  )
}

export default AdminClinics
