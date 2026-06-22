import { useState } from 'react'
import { useLocation } from 'react-router-dom'
import {
  Users,
  UserCheck,
  Building2,
  ClipboardCheck,
  Ticket,
  ShieldCheck,
  BarChart2,
  FileText,
  Settings,
  Search,
  Plus,
  Check,
  X,
  Lock,
  Database,
  Trash2,
  Eye,
  Edit
} from 'lucide-react'
import AdminLayout from '../../components/layout/AdminLayout'
import Badge from '../../components/ui/badge'
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '../../components/ui/table'
import { usePreloader } from '../../contexts/PreloaderContext'
import { cn } from '../../utils/cn'


const AdminPlaceholderPage = () => {
  const location = useLocation()
  const path = location.pathname
  const { isLoaded, isExiting } = usePreloader()
  const canAnimate = isLoaded && !isExiting

  // Search filter
  const [searchTerm, setSearchTerm] = useState('')

  // Settings tabs state
  const [activeTab, setActiveTab] = useState<'general' | 'security' | 'backup'>('general')

  // Approvals mock state to make it interactive
  const [approvals, setApprovals] = useState([
    { id: 1, name: 'عيادة الشفاء التخصصية', owner: 'د. عماد حسن', specialty: 'طب الأطفال', date: '2026-05-20', status: 'معلق' },
    { id: 2, name: 'مركز النخبة للأسنان', owner: 'د. ليلى خالد', specialty: 'طب الأسنان', date: '2026-05-19', status: 'معلق' },
    { id: 3, name: 'مجمع ابن سينا الطبي', owner: 'د. أحمد سليمان', specialty: 'عيادة متعددة', date: '2026-05-18', status: 'معلق' },
  ])

  const handleApprovalAction = (id: number, action: 'قبول' | 'رفض') => {
    setApprovals(prev =>
      prev.map(app => (app.id === id ? { ...app, status: action === 'قبول' ? 'مقبول' : 'مرفوض' } : app))
    )
    window.showToast(action === 'قبول' ? 'تم قبول طلب تسجيل العيادة بنجاح' : 'تم رفض طلب التسجيل')
  }

  // Get Page Details
  const getPageInfo = () => {
    switch (path) {
      case '/admin/users':
        return {
          title: 'إدارة المستخدمين',
          desc: 'عرض وتعديل حسابات الأطباء، الممرضين، وموظفي الاستقبال في النظام',
          icon: Users,
        }
      case '/admin/patients':
        return {
          title: 'إدارة المرضى',
          desc: 'مراجعة ملفات المرضى المسجلين والسجلات الطبية المرتبطة بهم',
          icon: UserCheck,
        }
      case '/admin/clinics':
        return {
          title: 'إدارة العيادات',
          desc: 'إدارة العيادات المشتركة في المنصة ومراجعة تراخيصها واشتراكاتها',
          icon: Building2,
        }
      case '/admin/approvals':
        return {
          title: 'موافقات العيادات',
          desc: 'الطلبات المعلقة للعيادات والمراكز الطبية الجديدة الراغبة في الانضمام',
          icon: ClipboardCheck,
        }
      case '/admin/tickets':
        return {
          title: 'تذاكر الدعم الفني',
          desc: 'متابعة وحل مشكلات واستفسارات العيادات المشتركة في النظام',
          icon: Ticket,
        }
      case '/admin/managers':
        return {
          title: 'إدارة المدراء',
          desc: 'التحكم في حسابات مسؤولي النظام وصلاحيات الوصول الخاصة بهم',
          icon: ShieldCheck,
        }
      case '/admin/stats':
        return {
          title: 'التقارير والإحصائيات',
          desc: 'تحليلات تفصيلية حول أداء المنصة، والعيادات، ونمو أعداد المرضى',
          icon: BarChart2,
        }
      case '/admin/audit-logs':
        return {
          title: 'سجلات التدقيق',
          desc: 'تتبع ومراقبة جميع العمليات والتغييرات الحساسة التي تتم على النظام',
          icon: FileText,
        }
      case '/admin/settings':
        return {
          title: 'إعدادات النظام العامة',
          desc: 'تهيئة وتخصيص معايير المنصة، خيارات النسخ الاحتياطي، وإعدادات الأمان',
          icon: Settings,
        }
      default:
        return {
          title: 'صفحة إدارية',
          desc: 'لوحة التحكم الإدارية السحابية لـ Medexa Cloud',
          icon: Settings,
        }
    }
  }

  const info = getPageInfo()

  // Render mock data dynamically
  const renderContent = () => {
    switch (path) {
      case '/admin/users': {
        const usersList = [
          { id: 'USR-890', name: 'د. رامي العتوم', email: 'rami@medexa.jo', role: 'طبيب', clinic: 'عيادة العتوم للعيون', status: 'نشط' },
          { id: 'USR-891', name: 'د. سارة المصري', email: 'sara@medexa.jo', role: 'طبيب', clinic: 'مركز الرعاية الشاملة', status: 'نشط' },
          { id: 'USR-892', name: 'أحمد فؤاد', email: 'ahmed.rec@medexa.jo', role: 'موظف استقبال', clinic: 'عيادة الأمل للأطفال', status: 'نشط' },
          { id: 'USR-893', name: 'منى سلامة', email: 'mona@medexa.jo', role: 'ممرض', clinic: 'مركز الشفاء الطبي', status: 'غير نشط' },
        ].filter(u => u.name.includes(searchTerm) || u.email.includes(searchTerm) || u.role.includes(searchTerm))

        return (
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden transition-all duration-300">
            <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 size-4" />
                <input
                  type="text"
                  placeholder="بحث عن مستخدم..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="w-full h-10 bg-gray-50 border border-gray-200 rounded-xl pr-10 pl-4 text-sm focus:ring-2 focus:ring-[#0B5A8E]/20 focus:border-[#0B5A8E] outline-none"
                />
              </div>
              <button className="h-10 px-4 bg-gradient-to-r from-[#0B5A8E] to-[#3FB8AF] text-white rounded-xl text-sm font-semibold flex items-center gap-2 hover:shadow-lg hover:shadow-[#0B5A8E]/20 transition-all cursor-pointer">
                <Plus className="size-4" /> إضافة مستخدم جديد
              </button>
            </div>
            <div className="overflow-x-auto">
              <Table className="w-full text-right">
                <TableHeader className="bg-gray-50 border-b border-gray-100">
                  <TableRow>
                    <TableHead className="px-6 py-4 text-xs font-bold text-gray-500 text-right">المعرف</TableHead>
                    <TableHead className="px-6 py-4 text-xs font-bold text-gray-500 text-right">الاسم</TableHead>
                    <TableHead className="px-6 py-4 text-xs font-bold text-gray-500 text-right">البريد الإلكتروني</TableHead>
                    <TableHead className="px-6 py-4 text-xs font-bold text-gray-500 text-right">الدور الوظيفي</TableHead>
                    <TableHead className="px-6 py-4 text-xs font-bold text-gray-500 text-right">العيادة</TableHead>
                    <TableHead className="px-6 py-4 text-xs font-bold text-gray-500 text-right">الحالة</TableHead>
                    <TableHead className="px-6 py-4 text-xs font-bold text-gray-500 text-center">العمليات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody className="divide-y divide-gray-50">
                  {usersList.map((user, i) => (
                    <TableRow key={i} className="hover:bg-gray-50/50 transition-colors">
                      <TableCell className="px-6 py-4 text-sm font-semibold text-gray-900">{user.id}</TableCell>
                      <TableCell className="px-6 py-4 text-sm text-gray-800">{user.name}</TableCell>
                      <TableCell className="px-6 py-4 text-sm text-gray-500">{user.email}</TableCell>
                      <TableCell className="px-6 py-4">
                        <Badge variant={user.role === 'طبيب' ? 'blue' : 'purple'}>
                          {user.role}
                        </Badge>
                      </TableCell>
                      <TableCell className="px-6 py-4 text-sm text-gray-500">{user.clinic}</TableCell>
                      <TableCell className="px-6 py-4">
                        <Badge variant={user.status === 'نشط' ? 'green' : 'red'}>
                          {user.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="px-6 py-4 text-sm text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button className="p-1.5 text-gray-400 hover:text-[#0B5A8E] hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"><Edit className="size-4" /></button>
                          <button className="p-1.5 text-gray-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"><Trash2 className="size-4" /></button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        )
      }

      case '/admin/patients': {
        const patientsList = [
          { id: 'PAT-402', name: 'محمد عبد الله الشمري', fileNo: '109283', phone: '0798765432', lastVisit: '2026-05-20', gender: 'ذكر' },
          { id: 'PAT-403', name: 'ياسمين محمود الحويطات', fileNo: '108745', phone: '0781234567', lastVisit: '2026-05-18', gender: 'أنثى' },
          { id: 'PAT-404', name: 'علي رضا العبادي', fileNo: '106392', phone: '0775556677', lastVisit: '2026-05-15', gender: 'ذكر' },
          { id: 'PAT-405', name: 'رانية سمير الحديد', fileNo: '105128', phone: '0799988776', lastVisit: '2026-05-10', gender: 'أنثى' },
        ].filter(p => p.name.includes(searchTerm) || p.fileNo.includes(searchTerm) || p.phone.includes(searchTerm))

        return (
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden transition-all duration-300">
            <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 size-4" />
                <input
                  type="text"
                  placeholder="بحث برقم الملف، الاسم، أو الجوال..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="w-full h-10 bg-gray-50 border border-gray-200 rounded-xl pr-10 pl-4 text-sm focus:ring-2 focus:ring-[#0B5A8E]/20 focus:border-[#0B5A8E] outline-none"
                />
              </div>
            </div>
            <div className="overflow-x-auto">
              <Table className="w-full text-right">
                <TableHeader className="bg-gray-50 border-b border-gray-100">
                  <TableRow>
                    <TableHead className="px-6 py-4 text-xs font-bold text-gray-500 text-right">المعرف</TableHead>
                    <TableHead className="px-6 py-4 text-xs font-bold text-gray-500 text-right">اسم المريض</TableHead>
                    <TableHead className="px-6 py-4 text-xs font-bold text-gray-500 text-right">رقم الملف</TableHead>
                    <TableHead className="px-6 py-4 text-xs font-bold text-gray-500 text-right">رقم الجوال</TableHead>
                    <TableHead className="px-6 py-4 text-xs font-bold text-gray-500 text-right">الجنس</TableHead>
                    <TableHead className="px-6 py-4 text-xs font-bold text-gray-500 text-right">تاريخ آخر زيارة</TableHead>
                    <TableHead className="px-6 py-4 text-xs font-bold text-gray-500 text-center">العمليات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody className="divide-y divide-gray-50">
                  {patientsList.map((patient, i) => (
                    <TableRow key={i} className="hover:bg-gray-50/50 transition-colors">
                      <TableCell className="px-6 py-4 text-sm font-semibold text-gray-900">{patient.id}</TableCell>
                      <TableCell className="px-6 py-4 text-sm text-gray-800 font-medium">{patient.name}</TableCell>
                      <TableCell className="px-6 py-4 text-sm text-gray-500">{patient.fileNo}</TableCell>
                      <TableCell className="px-6 py-4 text-sm text-gray-500">{patient.phone}</TableCell>
                      <TableCell className="px-6 py-4 text-sm text-gray-500">{patient.gender}</TableCell>
                      <TableCell className="px-6 py-4 text-sm text-gray-500">{patient.lastVisit}</TableCell>
                      <TableCell className="px-6 py-4 text-sm text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button className="p-1.5 text-gray-400 hover:text-[#0B5A8E] hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"><Eye className="size-4" /></button>
                          <button className="p-1.5 text-gray-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"><Trash2 className="size-4" /></button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        )
      }

      case '/admin/clinics': {
        const clinicsList = [
          { name: 'مجمع صحتي الطبي المتميز', doctors: 8, patients: 1240, plan: 'ذهبي', status: 'نشط', revenue: '45,200 د.أ', address: 'عمان، الأردن' },
          { name: 'عيادة د. سمير لتقويم الأسنان', doctors: 2, patients: 450, plan: 'فضي', status: 'نشط', revenue: '12,800 د.أ', address: 'إربد، الأردن' },
          { name: 'مركز الهلال للأشعة والرنين', doctors: 5, patients: 890, plan: 'بلاتيني', status: 'نشط', revenue: '31,500 د.أ', address: 'الزرقاء، الأردن' },
          { name: 'عيادة الأطفال الحديثة', doctors: 3, patients: 620, plan: 'فضي', status: 'غير نشط', revenue: '9,400 د.أ', address: 'العقبة، الأردن' },
        ].filter(c => c.name.includes(searchTerm) || c.address.includes(searchTerm))

        return (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 size-4" />
                <input
                  type="text"
                  placeholder="بحث عن عيادة بـالاسم أو العنوان..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="w-full h-10 bg-gray-50 border border-gray-200 rounded-xl pr-10 pl-4 text-sm focus:ring-2 focus:ring-[#0B5A8E]/20 focus:border-[#0B5A8E] outline-none"
                />
              </div>
              <button className="h-10 px-4 bg-gradient-to-r from-[#0B5A8E] to-[#3FB8AF] text-white rounded-xl text-sm font-semibold flex items-center gap-2 hover:shadow-lg hover:shadow-[#0B5A8E]/20 transition-all cursor-pointer">
                <Plus className="size-4" /> إضافة عيادة جديدة
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {clinicsList.map((clinic, index) => (
                <div key={index} className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-all flex flex-col justify-between relative overflow-hidden group">
                  <div className="absolute top-0 left-0 w-2 h-full bg-[#0B5A8E]" />
                  <div>
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h4 className="font-bold text-gray-900 text-lg group-hover:text-[#0B5A8E] transition-colors">{clinic.name}</h4>
                        <p className="text-xs text-gray-400 mt-1">{clinic.address}</p>
                      </div>
                      <span className={cn(
                        "px-2.5 py-0.5 rounded-full text-xs font-semibold",
                        clinic.plan === 'بلاتيني' ? "bg-purple-50 text-purple-600 border border-purple-100" :
                          clinic.plan === 'ذهبي' ? "bg-amber-50 text-amber-600 border border-amber-100" :
                            "bg-slate-50 text-slate-600 border border-slate-100"
                      )}>
                        خطة {clinic.plan}
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-4 py-4 my-2 border-y border-gray-50 text-center">
                      <div>
                        <p className="text-xs text-gray-400">الأطباء</p>
                        <p className="text-base font-bold text-gray-800 mt-1">{clinic.doctors}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400">المرضى</p>
                        <p className="text-base font-bold text-gray-800 mt-1">{clinic.patients}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400">الإيرادات</p>
                        <p className="text-base font-bold text-emerald-600 mt-1">{clinic.revenue}</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-4">
                    <span className={cn(
                      "inline-flex items-center gap-1.5 text-xs font-bold",
                      clinic.status === 'نشط' ? "text-emerald-600" : "text-rose-500"
                    )}>
                      <span className={cn("size-2 rounded-full", clinic.status === 'نشط' ? "bg-emerald-500" : "bg-rose-500")} />
                      {clinic.status === 'نشط' ? 'مشترك نشط' : 'الاشتراك منتهي'}
                    </span>

                    <div className="flex items-center gap-2">
                      <button className="text-xs text-[#0B5A8E] hover:underline cursor-pointer">إدارة الاشتراك</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )
      }

      case '/admin/approvals':
        return (
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-100">
              <h4 className="font-bold text-gray-900">طلبات انضمام العيادات الطبية المعلقة</h4>
            </div>
            <div className="divide-y divide-gray-100">
              {approvals.map((app) => (
                <div key={app.id} className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-gray-50/50 transition-colors">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-[#0B5A8E]/10 text-[#0B5A8E] rounded-xl flex items-center justify-center flex-shrink-0">
                      <Building2 className="size-6" />
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900">{app.name}</h4>
                      <p className="text-xs text-gray-500 mt-1">المشرف: {app.owner} • التخصص: {app.specialty}</p>
                      <p className="text-[10px] text-gray-400 mt-0.5">تاريخ التقديم: {app.date}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 self-end sm:self-auto">
                    {app.status === 'معلق' ? (
                      <>
                        <button
                          onClick={() => handleApprovalAction(app.id, 'قبول')}
                          className="h-9 px-3 bg-emerald-500 text-white rounded-lg text-xs font-bold hover:bg-emerald-600 transition-colors flex items-center gap-1.5 cursor-pointer"
                        >
                          <Check className="size-4" /> قبول الطلب
                        </button>
                        <button
                          onClick={() => handleApprovalAction(app.id, 'رفض')}
                          className="h-9 px-3 bg-rose-50 text-rose-600 rounded-lg text-xs font-bold hover:bg-rose-100 transition-colors flex items-center gap-1.5 cursor-pointer"
                        >
                          <X className="size-4" /> رفض الطلب
                        </button>
                      </>
                    ) : (
                      <span className={cn(
                        "px-3 py-1 rounded-lg text-xs font-bold border",
                        app.status === 'مقبول' ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-rose-50 text-rose-600 border-rose-100"
                      )}>
                        {app.status}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )

      case '/admin/tickets': {
        const tickets = [
          { id: 'TCK-551', clinic: 'مركز الرعاية الشاملة', title: 'خطأ في طباعة التقارير المالية', priority: 'عالي', status: 'مفتوح', date: 'منذ ساعتين' },
          { id: 'TCK-552', clinic: 'عيادة الأسنان التخصصية', title: 'بطء في تحميل السجلات الطبية للمرضى', priority: 'متوسط', status: 'قيد المعالجة', date: 'منذ 5 ساعات' },
          { id: 'TCK-553', clinic: 'مجمع ابن سينا الطبي', title: 'استفسار حول زيادة عدد المستخدمين بالخطة الذهبية', priority: 'منخفض', status: 'مغلق', date: 'أمس' },
        ]

        return (
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-100">
              <h4 className="font-bold text-gray-900">تذاكر الدعم الفني والمساعدة</h4>
            </div>
            <div className="divide-y divide-gray-100">
              {tickets.map((ticket, i) => (
                <div key={i} className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-gray-50/50 transition-colors">
                  <div>
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="text-sm font-semibold text-gray-900">{ticket.id}</span>
                      <span className={cn(
                        "px-2 py-0.5 rounded text-[10px] font-bold",
                        ticket.priority === 'عالي' ? "bg-rose-100 text-rose-700" :
                          ticket.priority === 'متوسط' ? "bg-amber-100 text-amber-700" :
                            "bg-slate-100 text-slate-700"
                      )}>
                        أولوية {ticket.priority}
                      </span>
                    </div>
                    <h5 className="font-bold text-gray-800 text-sm">{ticket.title}</h5>
                    <p className="text-xs text-gray-500 mt-1">المصدر: {ticket.clinic} • تاريخ الإنشاء: {ticket.date}</p>
                  </div>

                  <div className="flex items-center gap-4">
                    <span className={cn(
                      "px-2.5 py-0.5 rounded-full text-xs font-semibold",
                      ticket.status === 'مفتوح' ? "bg-blue-500/10 text-blue-600" :
                        ticket.status === 'قيد المعالجة' ? "bg-amber-50 text-amber-600" :
                          "bg-emerald-50 text-emerald-600"
                    )}>
                      {ticket.status}
                    </span>
                    <button className="h-9 px-3 bg-gray-50 hover:bg-gray-100 text-gray-700 border border-gray-200 rounded-lg text-xs font-bold transition-all cursor-pointer">
                      معاينة التذكرة
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )
      }

      case '/admin/managers': {
        const managers = [
          { name: 'المدير العام', email: 'admin@medexa.jo', role: 'مدير خارق (Super Admin)', lastLogin: '2026-05-22 01:45', ip: '192.168.1.1' },
          { name: 'م. أحمد صالح', email: 'ahmed.it@medexa.jo', role: 'دعم فني وتدقيق الكود', lastLogin: '2026-05-21 18:20', ip: '192.168.1.5' },
          { name: 'أ. خالد الحسين', email: 'khaled.mngr@medexa.jo', role: 'مدير حسابات العيادات', lastLogin: '2026-05-20 09:12', ip: '192.168.1.12' },
        ]

        return (
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
              <h4 className="font-bold text-gray-900">مسؤولو النظام وصلاحياتهم</h4>
              <button className="h-10 px-4 bg-gradient-to-r from-[#0B5A8E] to-[#3FB8AF] text-white rounded-xl text-sm font-semibold flex items-center gap-2 hover:shadow-lg hover:shadow-[#0B5A8E]/20 transition-all cursor-pointer">
                <Plus className="size-4" /> إضافة مسؤول جديد
              </button>
            </div>
            <div className="overflow-x-auto">
              <Table className="w-full text-right">
                <TableHeader className="bg-gray-50 border-b border-gray-100">
                  <TableRow>
                    <TableHead className="px-6 py-4 text-xs font-bold text-gray-500 text-right">الاسم</TableHead>
                    <TableHead className="px-6 py-4 text-xs font-bold text-gray-500 text-right">البريد الإلكتروني</TableHead>
                    <TableHead className="px-6 py-4 text-xs font-bold text-gray-500 text-right">الصلاحيات</TableHead>
                    <TableHead className="px-6 py-4 text-xs font-bold text-gray-500 text-right">آخر تسجيل دخول</TableHead>
                    <TableHead className="px-6 py-4 text-xs font-bold text-gray-500 text-right">عنوان IP</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody className="divide-y divide-gray-50">
                  {managers.map((mgr, i) => (
                    <TableRow key={i} className="hover:bg-gray-50/50 transition-colors">
                      <TableCell className="px-6 py-4 text-sm font-bold text-gray-900">{mgr.name}</TableCell>
                      <TableCell className="px-6 py-4 text-sm text-gray-500">{mgr.email}</TableCell>
                      <TableCell className="px-6 py-4">
                        <Badge variant="green">
                          {mgr.role}
                        </Badge>
                      </TableCell>
                      <TableCell className="px-6 py-4 text-sm text-gray-500">{mgr.lastLogin}</TableCell>
                      <TableCell className="px-6 py-4 text-sm text-gray-400">{mgr.ip}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        )
      }

      case '/admin/stats':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
              <h4 className="font-bold text-gray-900 mb-4">توزيع العيادات الطبية حسب المحافظة</h4>
              <div className="h-64 flex items-center justify-center border-2 border-dashed border-gray-100 rounded-xl">
                <div className="text-center text-gray-400">
                  <BarChart2 className="size-12 mx-auto mb-2 opacity-55 text-[#0B5A8E]" />
                  <p className="text-sm">مخطط تفاعلي لتوزيع العيادات بالمحافظات الأردنية</p>
                  <p className="text-xs text-gray-400 mt-1">(عمان 55%، إربد 22%، الزرقاء 12%، أخرى 11%)</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
              <h4 className="font-bold text-gray-900 mb-4">معدل نمو الاشتراكات السنوية (د.أ)</h4>
              <div className="h-64 flex items-center justify-center border-2 border-dashed border-gray-100 rounded-xl">
                <div className="text-center text-gray-400">
                  <BarChart2 className="size-12 mx-auto mb-2 opacity-55 text-[#3FB8AF]" />
                  <p className="text-sm">إجمالي الإيرادات السحابية وحجم النمو السنوي</p>
                  <p className="text-xs text-gray-400 mt-1">(نمو ربع سنوي متوقع بمعدل +18.2%)</p>
                </div>
              </div>
            </div>
          </div>
        )

      case '/admin/audit-logs': {
        const logs = [
          { time: '2026-05-22 01:52', user: 'admin@medexa.jo', action: 'تغيير اشتراك عيادة الرعاية الطبية', resource: 'عيادات / اشتراكات', status: 'ناجح' },
          { time: '2026-05-22 01:30', user: 'admin@medexa.jo', action: 'إنشاء حساب طبيب جديد (USR-890)', resource: 'مستخدمون', status: 'ناجح' },
          { time: '2026-05-22 00:15', user: 'ahmed.it@medexa.jo', action: 'تحديث معايير الأمان وجدار الحماية', resource: 'إعدادات النظام / أمان', status: 'ناجح' },
          { time: '2026-05-21 23:40', user: 'خارج النظام', action: 'محاولة تسجيل دخول غير مصرح بها (admin2)', resource: 'تسجيل دخول المسؤول', status: 'حظر (403)' },
        ]

        return (
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
              <h4 className="font-bold text-gray-900">سجل النشاطات والأحداث البرمجية الحساسة</h4>
              <button className="h-9 px-3 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer">
                تصدير السجلات (CSV)
              </button>
            </div>
            <div className="overflow-x-auto">
              <Table className="w-full text-right text-sm">
                <TableHeader className="bg-gray-50 border-b border-gray-100">
                  <TableRow>
                    <TableHead className="px-6 py-4 text-xs font-bold text-gray-500 text-right">التوقيت</TableHead>
                    <TableHead className="px-6 py-4 text-xs font-bold text-gray-500 text-right">المستخدم المسؤول</TableHead>
                    <TableHead className="px-6 py-4 text-xs font-bold text-gray-500 text-right">العملية الإجراء</TableHead>
                    <TableHead className="px-6 py-4 text-xs font-bold text-gray-500 text-right">الملف/الوحدة</TableHead>
                    <TableHead className="px-6 py-4 text-xs font-bold text-gray-500 text-right">حالة العملية</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody className="divide-y divide-gray-50">
                  {logs.map((log, i) => (
                    <TableRow key={i} className="hover:bg-gray-50/50 transition-colors">
                      <TableCell className="px-6 py-4 text-gray-500 font-mono text-xs">{log.time}</TableCell>
                      <TableCell className="px-6 py-4 font-semibold text-gray-900">{log.user}</TableCell>
                      <TableCell className="px-6 py-4 text-gray-700">{log.action}</TableCell>
                      <TableCell className="px-6 py-4 text-gray-500">{log.resource}</TableCell>
                      <TableCell className="px-6 py-4">
                        <Badge variant={log.status === 'ناجح' ? 'green' : 'red'}>
                          {log.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        )
      }

      case '/admin/settings':
        return (
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden flex flex-col md:flex-row min-h-[480px]">
            {/* Sidebar Tabs */}
            <div className="w-full md:w-60 border-l border-gray-100 p-4 space-y-1 bg-gray-50/30">
              <button
                onClick={() => setActiveTab('general')}
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all text-right cursor-pointer",
                  activeTab === 'general' ? "bg-white text-[#0B5A8E] shadow-sm border border-gray-200" : "text-gray-600 hover:bg-gray-100/50"
                )}
              >
                <Settings className="size-4 shrink-0" /> الإعدادات العامة
              </button>
              <button
                onClick={() => setActiveTab('security')}
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all text-right cursor-pointer",
                  activeTab === 'security' ? "bg-white text-[#0B5A8E] shadow-sm border border-gray-200" : "text-gray-600 hover:bg-gray-100/50"
                )}
              >
                <Lock className="size-4 shrink-0" /> الأمن والخصوصية
              </button>
              <button
                onClick={() => setActiveTab('backup')}
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all text-right cursor-pointer",
                  activeTab === 'backup' ? "bg-white text-[#0B5A8E] shadow-sm border border-gray-200" : "text-gray-600 hover:bg-gray-100/50"
                )}
              >
                <Database className="size-4 shrink-0" /> قواعد البيانات والنسخ
              </button>
            </div>

            {/* Tab content panel */}
            <div className="flex-1 p-8 text-right">
              {activeTab === 'general' && (
                <div className="space-y-6">
                  <h5 className="font-bold text-gray-900 border-b border-gray-100 pb-3 text-lg">إعدادات المنصة الأساسية</h5>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-gray-600">اسم المنصة الإدارية</label>
                      <input type="text" defaultValue="Medexa Cloud" className="w-full h-11 px-4 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#0B5A8E]/20 focus:border-[#0B5A8E] outline-none" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-gray-600">البريد الإلكتروني للاتصال بالدعم</label>
                      <input type="email" defaultValue="support@medexa.jo" className="w-full h-11 px-4 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#0B5A8E]/20 focus:border-[#0B5A8E] outline-none" />
                    </div>
                  </div>
                  <div className="flex justify-end pt-4 border-t border-gray-100">
                    <button onClick={() => window.showToast('تم حفظ التغييرات بنجاح')} className="h-10 px-6 bg-gradient-to-r from-[#0B5A8E] to-[#3FB8AF] text-white rounded-xl text-sm font-semibold hover:shadow-lg cursor-pointer">حفظ التغييرات</button>
                  </div>
                </div>
              )}

              {activeTab === 'security' && (
                <div className="space-y-6">
                  <h5 className="font-bold text-gray-900 border-b border-gray-100 pb-3 text-lg">سياسة الأمان وكلمات المرور</h5>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100">
                      <div>
                        <h6 className="text-sm font-bold text-gray-900">تفعيل المصادقة الثنائية (2FA) للمشرفين</h6>
                        <p className="text-xs text-gray-400 mt-1">يجب إدخال رمز التحقق عند تسجيل الدخول للوحة التحكم</p>
                      </div>
                      <input type="checkbox" defaultChecked className="size-4 text-[#0B5A8E] rounded border-gray-300 focus:ring-[#0B5A8E]" />
                    </div>

                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100">
                      <div>
                        <h6 className="text-sm font-bold text-gray-900">تحديد أوقات الجلسة (Session timeout)</h6>
                        <p className="text-xs text-gray-400 mt-1">إنهاء الجلسة تلقائياً بعد مرور 30 دقيقة من الخمول</p>
                      </div>
                      <input type="checkbox" defaultChecked className="size-4 text-[#0B5A8E] rounded border-gray-300 focus:ring-[#0B5A8E]" />
                    </div>
                  </div>
                  <div className="flex justify-end pt-4 border-t border-gray-100">
                    <button onClick={() => window.showToast('تم تحديث إعدادات الأمان')} className="h-10 px-6 bg-gradient-to-r from-[#0B5A8E] to-[#3FB8AF] text-white rounded-xl text-sm font-semibold hover:shadow-lg cursor-pointer">تحديث السياسة</button>
                  </div>
                </div>
              )}

              {activeTab === 'backup' && (
                <div className="space-y-6">
                  <h5 className="font-bold text-gray-900 border-b border-gray-100 pb-3 text-lg">النسخ الاحتياطي وإدارة قواعد البيانات</h5>
                  <div className="p-4 bg-[#0B5A8E]/5 border border-[#0B5A8E]/10 rounded-2xl flex items-center gap-4">
                    <Database className="size-8 text-[#0B5A8E]" />
                    <div>
                      <h6 className="text-sm font-bold text-gray-900">آخر نسخة احتياطية ناجحة</h6>
                      <p className="text-xs text-gray-500 mt-0.5">تم الحفظ بنجاح بتاريخ: اليوم 02:00 صباحاً</p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <button onClick={() => window.showToast('بدء عملية النسخ الاحتياطي التلقائي...')} className="h-11 px-5 border border-[#0B5A8E] text-[#0B5A8E] hover:bg-[#0B5A8E]/5 rounded-xl text-xs font-bold transition-all cursor-pointer">
                      نسخ احتياطي فوري الآن
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )

      default:
        return (
          <div className="bg-white p-12 rounded-2xl border border-gray-200 shadow-sm text-center">
            <info.icon className="size-16 text-[#0B5A8E] mx-auto mb-4 opacity-75" />
            <h4 className="text-xl font-bold text-gray-900 mb-2">{info.title}</h4>
            <p className="text-gray-500 text-sm">{info.desc}</p>
          </div>
        )
    }
  }

  return (
    <AdminLayout>
      <div
        className={cn(
          "space-y-8 opacity-0",
          canAnimate && "animate-fadeUp opacity-100 animate-delay-[100ms]",
          isExiting && "animate-fadeDownOut"
        )}
        dir="rtl"
        style={{ opacity: canAnimate ? 1 : 0 }}
      >
        {/* Page Header */}
        <div className="text-right">
          <h1 className="text-3xl font-bold text-[#1A2B3C] mb-2">{info.title}</h1>
          <p className="text-gray-500 text-sm leading-relaxed">{info.desc}</p>
        </div>

        {/* Dynamic Inner Page Panel */}
        {renderContent()}
      </div>
    </AdminLayout>
  )
}

export default AdminPlaceholderPage
