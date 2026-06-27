import {
  CircleAlert,
  Clock,
  Users,
  TriangleAlert,
  CheckCircle2,
  TrendingUp,
  Download,
  Search,
  Filter,
  Eye,
  List,
  LayoutGrid,
  Columns3,
  ArrowUpDown,
  CircleUser,
  Building2,
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

interface Ticket {
  id: string
  reporter: string
  clinic: string
  category: string
  subject: string
  priority: 'عالية' | 'متوسطة' | 'حرجة' | 'منخفضة'
  status: 'قيد المعالجة' | 'بانتظار العيادة' | 'تم التصعيد' | 'مفتوحة' | 'تم التعيين'
  assignedTo: string
  createdDate: string
  lastActivity: string
  sla: 'ضمن الوقت' | 'تجاوز الوقت'
}

const INITIAL_TICKETS: Ticket[] = [
  {
    id: 'TKT-1245',
    reporter: 'د. محمد العمري',
    clinic: 'عيادة النور الطبية',
    category: 'إدارة المواعيد',
    subject: 'مشكلة في حفظ المواعيد الجديدة',
    priority: 'عالية',
    status: 'قيد المعالجة',
    assignedTo: 'أحمد الفني',
    createdDate: '2024-05-18 10:30',
    lastActivity: '2024-05-18 14:20',
    sla: 'ضمن الوقت'
  },
  {
    id: 'TKT-1244',
    reporter: 'سارة المومني',
    clinic: 'عيادة الشفاء للأسنان',
    category: 'السجلات الطبية',
    subject: 'عدم ظهور التقارير بشكل صحيح',
    priority: 'متوسطة',
    status: 'بانتظار العيادة',
    assignedTo: 'خالد التقني',
    createdDate: '2024-05-17 14:20',
    lastActivity: '2024-05-18 09:15',
    sla: 'ضمن الوقت'
  },
  {
    id: 'TKT-1243',
    reporter: 'د. فاطمة الحسيني',
    clinic: 'مركز الرعاية للقلب',
    category: 'التقارير المالية',
    subject: 'خطأ في حساب الإيرادات',
    priority: 'حرجة',
    status: 'تم التصعيد',
    assignedTo: 'سارة المالية',
    createdDate: '2024-05-17 09:15',
    lastActivity: '2024-05-18 13:45',
    sla: 'تجاوز الوقت'
  },
  {
    id: 'TKT-1242',
    reporter: 'خالد الخطيب',
    clinic: 'عيادة السلام الجراحية',
    category: 'إدارة الأطباء',
    subject: 'طلب تحسين واجهة إضافة الأطباء',
    priority: 'منخفضة',
    status: 'مفتوحة',
    assignedTo: '-',
    createdDate: '2024-05-16 16:45',
    lastActivity: '2024-05-16 16:45',
    sla: 'ضمن الوقت'
  },
  {
    id: 'TKT-1241',
    reporter: 'يوسف الإداري',
    clinic: 'عيادة الحياة للأطفال',
    category: 'نظام التأمين',
    subject: 'مشكلة في إضافة تأمين جديد',
    priority: 'عالية',
    status: 'تم التعيين',
    assignedTo: 'أحمد الفني',
    createdDate: '2024-05-17 11:20',
    lastActivity: '2024-05-18 08:30',
    sla: 'ضمن الوقت'
  }
]

const AdminTickets = () => {
  const navigate = useNavigate()
  const { isLoaded, isExiting } = usePreloader()
  const canAnimate = isLoaded && !isExiting

  // States
  const [tickets] = useState<Ticket[]>(INITIAL_TICKETS)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedPriority, setSelectedPriority] = useState('all')
  const [selectedStatus, setSelectedStatus] = useState('all')
  const [selectedAssignee, setSelectedAssignee] = useState('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(5)
  const [activeLayout, setActiveLayout] = useState<'list' | 'grid' | 'columns'>('list')
  const [sortAsc, setSortAsc] = useState(false)

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

  // Filter & Search Logic
  const filteredTickets = tickets.filter(ticket => {
    const query = searchQuery.trim().toLowerCase()
    const matchesSearch =
      query === '' ||
      ticket.id.toLowerCase().includes(query) ||
      ticket.subject.toLowerCase().includes(query) ||
      ticket.reporter.toLowerCase().includes(query) ||
      ticket.clinic.toLowerCase().includes(query)

    const matchesPriority = selectedPriority === 'all' || ticket.priority === selectedPriority
    const matchesStatus = selectedStatus === 'all' || ticket.status === selectedStatus
    
    let matchesAssignee = true
    if (selectedAssignee !== 'all') {
      if (selectedAssignee === 'unassigned') {
        matchesAssignee = ticket.assignedTo === '-'
      } else {
        matchesAssignee = ticket.assignedTo === selectedAssignee
      }
    }

    return matchesSearch && matchesPriority && matchesStatus && matchesAssignee
  })

  // Sorting Logic (by ticket ID number)
  const sortedTickets = filteredTickets.toSorted((a, b) => {
    const numA = parseInt(a.id.replace('TKT-', ''))
    const numB = parseInt(b.id.replace('TKT-', ''))
    return sortAsc ? numA - numB : numB - numA
  })

  // Pagination Logic
  const totalPages = Math.max(1, Math.ceil(sortedTickets.length / itemsPerPage))
  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages)
    }
  }, [sortedTickets.length, totalPages, currentPage])

  const visibleTickets = sortedTickets.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  // Stats Calculations
  const openCount = tickets.filter(t => t.status === 'مفتوحة').length
  const inProgressCount = tickets.filter(t => t.status === 'قيد المعالجة').length
  const awaitingClinicCount = tickets.filter(t => t.status === 'بانتظار العيادة').length
  const escalatedCount = tickets.filter(t => t.status === 'تم التصعيد').length
  const resolvedTodayCount = 0 // Mock stat matching user HTML
  const avgResponseTime = 2.5 // Mock stat matching user HTML

  const handleExport = () => {
    window.showToast('تم تصدير التذاكر بنجاح بصيغة Excel', 'success')
  }

  const handleViewTicket = async (id: string) => {
    if (window.triggerExitTransition) {
      await window.triggerExitTransition()
    }
    navigate(`/admin/tickets/${id}`)
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
            <h1 className="text-3xl text-[#0F172A] mb-2 font-bold">مركز الدعم الفني</h1>
            <p className="text-[#64748B]">إدارة ومتابعة تذاكر الدعم من جميع العيادات</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleExport}
              className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 active:shadow-md hover:shadow-primary/20 h-9 px-4 py-2 bg-white border border-gray-200 text-[#334155] hover:bg-gray-50 cursor-pointer"
            >
              <Download className="size-4 ml-2" />
              <span>تصدير</span>
            </button>
          </div>
        </div>

        {/* Statistics Cards Grid */}
        <div ref={statsSectionRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
          {/* Card 1: Open Tickets */}
          <div className="text-card-foreground flex flex-col gap-6 rounded-xl duration-300 p-5 bg-white border border-gray-200 shadow-sm hover:shadow-md transition-all">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 bg-blue-500/10 rounded-lg flex items-center justify-center">
                <CircleAlert className="text-blue-600 size-5" />
              </div>
              <TrendingUp className="text-emerald-600 size-4" />
            </div>
            <div>
              <p className="text-xs text-[#64748B] mb-1">تذاكر مفتوحة</p>
              <div className="h-8 flex items-baseline select-none">
                <Counter
                  value={openCount}
                  fontSize={24}
                  fontWeight="700"
                  textColor="#0F172A"
                  isInView={isInView}
                />
              </div>
            </div>
          </div>

          {/* Card 2: In Progress */}
          <div className="text-card-foreground flex flex-col gap-6 rounded-xl duration-300 p-5 bg-white border border-gray-200 shadow-sm hover:shadow-md transition-all">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 bg-amber-500/10 rounded-lg flex items-center justify-center">
                <Clock className="text-amber-600 size-5" />
              </div>
              <TrendingUp className="text-emerald-600 size-4" />
            </div>
            <div>
              <p className="text-xs text-[#64748B] mb-1">قيد المعالجة</p>
              <div className="h-8 flex items-baseline select-none">
                <Counter
                  value={inProgressCount}
                  fontSize={24}
                  fontWeight="700"
                  textColor="#0F172A"
                  isInView={isInView}
                />
              </div>
            </div>
          </div>

          {/* Card 3: Awaiting Clinic */}
          <div className="text-card-foreground flex flex-col gap-6 rounded-xl duration-300 p-5 bg-white border border-gray-200 shadow-sm hover:shadow-md transition-all">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 bg-orange-500/10 rounded-lg flex items-center justify-center">
                <Users className="text-orange-600 size-5" />
              </div>
              <Clock className="text-amber-600 size-4" />
            </div>
            <div>
              <p className="text-xs text-[#64748B] mb-1">بانتظار العيادة</p>
              <div className="h-8 flex items-baseline select-none">
                <Counter
                  value={awaitingClinicCount}
                  fontSize={24}
                  fontWeight="700"
                  textColor="#0F172A"
                  isInView={isInView}
                />
              </div>
            </div>
          </div>

          {/* Card 4: Escalated */}
          <div className="text-card-foreground flex flex-col gap-6 rounded-xl duration-300 p-5 bg-white border border-gray-200 shadow-sm hover:shadow-md transition-all">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 bg-rose-500/10 rounded-lg flex items-center justify-center">
                <TriangleAlert className="text-rose-600 size-5" />
              </div>
              <TriangleAlert className="text-rose-600 size-4" />
            </div>
            <div>
              <p className="text-xs text-[#64748B] mb-1">تم التصعيد</p>
              <div className="h-8 flex items-baseline select-none">
                <Counter
                  value={escalatedCount}
                  fontSize={24}
                  fontWeight="700"
                  textColor="#0F172A"
                  isInView={isInView}
                />
              </div>
            </div>
          </div>

          {/* Card 5: Resolved Today */}
          <div className="text-card-foreground flex flex-col gap-6 rounded-xl duration-300 p-5 bg-white border border-gray-200 shadow-sm hover:shadow-md transition-all">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 bg-emerald-500/10 rounded-lg flex items-center justify-center">
                <CheckCircle2 className="text-emerald-600 size-5" />
              </div>
              <TrendingUp className="text-emerald-600 size-4" />
            </div>
            <div>
              <p className="text-xs text-[#64748B] mb-1">تم الحل اليوم</p>
              <div className="h-8 flex items-baseline select-none">
                <Counter
                  value={resolvedTodayCount}
                  fontSize={24}
                  fontWeight="700"
                  textColor="#0F172A"
                  isInView={isInView}
                />
              </div>
            </div>
          </div>

          {/* Card 6: Average Response Time */}
          <div className="text-card-foreground flex flex-col gap-6 rounded-xl duration-300 p-5 bg-white border border-gray-200 shadow-sm hover:shadow-md transition-all">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 bg-purple-500/10 rounded-lg flex items-center justify-center">
                <Clock className="text-purple-600 size-5" />
              </div>
              <CheckCircle2 className="text-emerald-600 size-4" />
            </div>
            <div>
              <p className="text-xs text-[#64748B] mb-1">متوسط وقت الرد</p>
              <div className="h-8 flex items-baseline select-none">
                <Counter
                  value={avgResponseTime}
                  fontSize={22}
                  fontWeight="700"
                  textColor="#0F172A"
                  isInView={isInView}
                />
                <span className="text-sm font-bold text-[#0F172A] mr-1">ساعة</span>
              </div>
            </div>
          </div>
        </div>

        {/* Filter Card */}
        <div className="text-card-foreground flex flex-col gap-6 rounded-xl transition-all duration-300 hover:shadow-lg p-6 bg-white border border-gray-200 shadow-sm">
          {/* Top Controls: Layout Switches & Search Input */}
          <div className="flex flex-col lg:flex-row-reverse items-start lg:items-center gap-4 ">
            {/* Layout Switches */}
            <div className="flex gap-2 bg-gray-100 p-1 rounded-lg">
              <button
                onClick={() => setActiveLayout('list')}
                className={cn(
                  'px-4 py-2 rounded-md transition-all cursor-pointer',
                  activeLayout === 'list' ? 'bg-white text-[#0EA5E9] shadow-sm' : 'text-[#64748B] hover:text-[#0EA5E9]'
                )}
              >
                <List className="size-4.5" />
              </button>
              <button
                onClick={() => setActiveLayout('grid')}
                className={cn(
                  'px-4 py-2 rounded-md transition-all cursor-pointer',
                  activeLayout === 'grid' ? 'bg-white text-[#0EA5E9] shadow-sm' : 'text-[#64748B] hover:text-[#0EA5E9]'
                )}
              >
                <LayoutGrid className="size-4.5" />
              </button>
              <button
                onClick={() => setActiveLayout('columns')}
                className={cn(
                  'px-4 py-2 rounded-md transition-all cursor-pointer',
                  activeLayout === 'columns' ? 'bg-white text-[#0EA5E9] shadow-sm' : 'text-[#64748B] hover:text-[#0EA5E9]'
                )}
              >
                <Columns3 className="size-4.5" />
              </button>
            </div>

            <div className="flex-1"></div>

            {/* Search Input */}
            <div className="relative w-full lg:w-96">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 size-4.5 pointer-events-none" />
              <input
                type="text"
                placeholder="بحث برقم التذكرة، الموضوع، أو اسم المُبلّغ..."
                value={searchQuery}
                onChange={e => {
                  setSearchQuery(e.target.value)
                  setCurrentPage(1)
                }}
                className="w-full h-9 pr-10 pl-4 bg-gray-50 border border-gray-200 rounded-md text-sm outline-none focus:ring-2 focus:ring-[#0EA5E9]/20 transition-all placeholder:text-gray-400"
              />
            </div>
          </div>

          {/* Bottom Controls: Select Drops */}
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Priority Filter */}
            <div className="w-full lg:w-48">
              <Select name="selectedPriority" value={selectedPriority} onValueChange={setSelectedPriority}>
                <SelectTrigger className="h-9 bg-gray-50 border-gray-200 text-sm rounded-md flex items-center justify-between px-3 text-[#0F172A] focus:ring-2 focus:ring-[#0EA5E9]/20 font-medium">
                  <div className="flex items-center">
                    <Filter className="size-4 ml-2 text-gray-500" />
                    <SelectValue placeholder="جميع الأولويات" />
                  </div>
                </SelectTrigger>
                <SelectContent smallZ>
                  <SelectItem value="all">جميع الأولويات</SelectItem>
                  <SelectItem value="حرجة">حرجة</SelectItem>
                  <SelectItem value="عالية">عالية</SelectItem>
                  <SelectItem value="متوسطة">متوسطة</SelectItem>
                  <SelectItem value="منخفضة">منخفضة</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Status Filter */}
            <div className="w-full lg:w-48">
              <Select name="selectedStatus" value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger className="h-9 bg-gray-50 border-gray-200 text-sm rounded-md text-[#0F172A] focus:ring-2 focus:ring-[#0EA5E9]/20 font-medium">
                  <SelectValue placeholder="جميع الحالات" />
                </SelectTrigger>
                <SelectContent smallZ>
                  <SelectItem value="all">جميع الحالات</SelectItem>
                  <SelectItem value="مفتوحة">مفتوحة</SelectItem>
                  <SelectItem value="قيد المعالجة">قيد المعالجة</SelectItem>
                  <SelectItem value="بانتظار العيادة">بانتظار العيادة</SelectItem>
                  <SelectItem value="تم التعيين">تم التعيين</SelectItem>
                  <SelectItem value="تم التصعيد">تم التصعيد</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Assignee Filter */}
            <div className="w-full lg:w-48">
              <Select name="selectedAssignee" value={selectedAssignee} onValueChange={setSelectedAssignee}>
                <SelectTrigger className="h-9 bg-gray-50 border-gray-200 text-sm rounded-md text-[#0F172A] focus:ring-2 focus:ring-[#0EA5E9]/20 font-medium">
                  <SelectValue placeholder="الجميع" />
                </SelectTrigger>
                <SelectContent smallZ>
                  <SelectItem value="all">الجميع</SelectItem>
                  <SelectItem value="أحمد الفني">أحمد الفني</SelectItem>
                  <SelectItem value="خالد التقني">خالد التقني</SelectItem>
                  <SelectItem value="سارة المالية">سارة المالية</SelectItem>
                  <SelectItem value="unassigned">غير معين</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Table/Layout Card */}
        {activeLayout === 'list' && (
          <div className="text-card-foreground flex flex-col gap-6 rounded-xl transition-all duration-300 hover:shadow-lg bg-white border border-gray-200 shadow-sm overflow-hidden animate-fadeUp">
            <Table className="min-w-[1200px] text-right">
              <TableHeader className="sticky top-0 bg-gray-50 z-10 border-b border-gray-200">
                <TableRow>
                  <TableHead className="h-10 px-4 align-middle whitespace-nowrap text-[#334155] font-semibold text-right cursor-pointer select-none hover:text-[#0EA5E9] transition-colors" onClick={() => setSortAsc(prev => !prev)}>
                    <div className="flex items-center gap-2">
                      <span>رقم التذكرة</span>
                      <ArrowUpDown className="size-3.5" />
                    </div>
                  </TableHead>
                  <TableHead className="h-10 px-4 align-middle whitespace-nowrap text-[#334155] font-semibold text-right">المُبلّغ</TableHead>
                  <TableHead className="h-10 px-4 align-middle whitespace-nowrap text-[#334155] font-semibold text-right">العيادة</TableHead>
                  <TableHead className="h-10 px-4 align-middle whitespace-nowrap text-[#334155] font-semibold text-right">القسم</TableHead>
                  <TableHead className="h-10 px-4 align-middle whitespace-nowrap text-[#334155] font-semibold text-right">الموضوع</TableHead>
                  <TableHead className="h-10 px-4 align-middle whitespace-nowrap text-[#334155] font-semibold text-right">الأولوية</TableHead>
                  <TableHead className="h-10 px-4 align-middle whitespace-nowrap text-[#334155] font-semibold text-right">الحالة</TableHead>
                  <TableHead className="h-10 px-4 align-middle whitespace-nowrap text-[#334155] font-semibold text-right">المعين إليه</TableHead>
                  <TableHead className="h-10 px-4 align-middle whitespace-nowrap text-[#334155] font-semibold text-right">تاريخ الإنشاء</TableHead>
                  <TableHead className="h-10 px-4 align-middle whitespace-nowrap text-[#334155] font-semibold text-right">آخر نشاط</TableHead>
                  <TableHead className="h-10 px-4 align-middle whitespace-nowrap text-[#334155] font-semibold text-right">SLA</TableHead>
                  <TableHead className="h-10 px-4 align-middle whitespace-nowrap text-[#334155] font-semibold text-center">الإجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {visibleTickets.length > 0 ? (
                  visibleTickets.map(ticket => (
                    <TableRow key={ticket.id}>
                      {/* ID */}
                      <TableCell className="p-4 align-middle whitespace-nowrap text-[#0EA5E9] font-mono font-semibold text-right">
                        {ticket.id}
                      </TableCell>

                      {/* Reporter */}
                      <TableCell className="p-4 align-middle whitespace-nowrap text-right">
                        <div className="flex items-center gap-2">
                          <CircleUser className="size-4 text-gray-400" />
                          <span className="text-[#334155]">{ticket.reporter}</span>
                        </div>
                      </TableCell>

                      {/* Clinic */}
                      <TableCell className="p-4 align-middle whitespace-nowrap text-right">
                        <div className="flex items-center gap-2">
                          <Building2 className="size-4 text-gray-400" />
                          <span className="text-[#334155]">{ticket.clinic}</span>
                        </div>
                      </TableCell>

                      {/* Department/Category */}
                      <TableCell className="p-4 align-middle whitespace-nowrap text-[#64748B] text-sm text-right">
                        {ticket.category}
                      </TableCell>

                      {/* Subject */}
                      <TableCell className="p-4 align-middle whitespace-nowrap text-[#0F172A] font-medium max-w-xs truncate text-right">
                        {ticket.subject}
                      </TableCell>

                      {/* Priority Badge */}
                      <TableCell className="p-4 align-middle whitespace-nowrap text-right">
                        <Badge
                          variant={
                            ticket.priority === 'حرجة'
                              ? 'red'
                              : ticket.priority === 'عالية'
                              ? 'yellow'
                              : ticket.priority === 'متوسطة'
                              ? 'blue'
                              : 'purple'
                          }
                        >
                          {ticket.priority}
                        </Badge>
                      </TableCell>

                      {/* Status Badge */}
                      <TableCell className="p-4 align-middle whitespace-nowrap text-right">
                        <Badge
                          variant={
                            ticket.status === 'تم التصعيد'
                              ? 'red'
                              : ticket.status === 'قيد المعالجة'
                              ? 'yellow'
                              : ticket.status === 'مفتوحة'
                              ? 'blue'
                              : ticket.status === 'تم التعيين'
                              ? 'purple'
                              : 'yellow' // default/fallback
                          }
                          className={ticket.status === 'بانتظار العيادة' ? 'bg-orange-500/10 text-orange-600 border-orange-500/20 hover:bg-orange-500/10' : ''}
                        >
                          {ticket.status}
                        </Badge>
                      </TableCell>

                      {/* Assigned To */}
                      <TableCell className="p-4 align-middle whitespace-nowrap text-[#334155] text-right">
                        {ticket.assignedTo}
                      </TableCell>

                      {/* Created Date */}
                      <TableCell className="p-4 align-middle whitespace-nowrap text-[#64748B] text-sm text-right">
                        {ticket.createdDate}
                      </TableCell>

                      {/* Last Activity */}
                      <TableCell className="p-4 align-middle whitespace-nowrap text-[#64748B] text-sm text-right">
                        {ticket.lastActivity}
                      </TableCell>

                      {/* SLA */}
                      <TableCell className="p-4 align-middle whitespace-nowrap text-right">
                        <Badge variant={ticket.sla === 'ضمن الوقت' ? 'green' : 'red'}>
                          {ticket.sla}
                        </Badge>
                      </TableCell>

                      {/* Actions */}
                      <TableCell className="p-4 align-middle whitespace-nowrap text-center" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => handleViewTicket(ticket.id)}
                          className="inline-flex items-center justify-center whitespace-nowrap text-sm font-medium transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 active:shadow-md h-8 rounded-md gap-1.5 px-3 text-[#0EA5E9] hover:text-[#0EA5E9] hover:bg-blue-500/10 cursor-pointer"
                          title="عرض التذكرة"
                        >
                          <Eye className="size-4" />
                        </button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={12} className="p-8 text-center text-gray-400 font-bold">
                      لا توجد تذاكر دعم مطابقة للبحث أو التصفية.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>

            {/* Table Pagination Footer */}
            <TableFooter
              totalItems={sortedTickets.length}
              itemsPerPage={itemsPerPage}
              currentPage={currentPage}
              className="pb-4"
              onPageChange={setCurrentPage}
            />
          </div>
        )}

        {activeLayout === 'grid' && (
          <div data-slot="card" className="text-card-foreground flex flex-col gap-6 rounded-xl transition-all duration-300 hover:shadow-lg p-12 bg-white border border-gray-200 shadow-sm text-center animate-fadeUp">
            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-layout-grid text-gray-300 mx-auto mb-4">
              <rect width="7" height="7" x="3" y="3" rx="1"></rect>
              <rect width="7" height="7" x="14" y="3" rx="1"></rect>
              <rect width="7" height="7" x="14" y="14" rx="1"></rect>
              <rect width="7" height="7" x="3" y="14" rx="1"></rect>
            </svg>
            <h3 className="text-xl text-[#334155] mb-2" style={{ fontWeight: 600 }}>عرض كانبان</h3>
            <p className="text-[#64748B]">سيتم إضافة عرض كانبان قريباً</p>
          </div>
        )}

        {activeLayout === 'columns' && (
          <div data-slot="card" className="text-card-foreground flex flex-col gap-6 rounded-xl transition-all duration-300 hover:shadow-lg p-12 bg-white border border-gray-200 shadow-sm text-center animate-fadeUp">
            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-columns3 lucide-columns-3 text-gray-300 mx-auto mb-4">
              <rect width="18" height="18" x="3" y="3" rx="2"></rect>
              <path d="M9 3v18"></path>
              <path d="M15 3v18"></path>
            </svg>
            <h3 className="text-xl text-[#334155] mb-2" style={{ fontWeight: 600 }}>عرض قائمة الانتظار</h3>
            <p className="text-[#64748B]">سيتم إضافة عرض قائمة الانتظار قريباً</p>
          </div>
        )}
      </div>
    </AdminLayout>
  )
}

export default AdminTickets
