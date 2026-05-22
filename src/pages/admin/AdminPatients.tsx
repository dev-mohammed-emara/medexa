import { Activity, Building2, Calendar, Download, Eye, Search } from 'lucide-react'
import { useEffect, useState } from 'react'
import AdminLayout from '../../components/layout/AdminLayout'
import Modal from '../../components/ui/Modal'
import TableFooter from '../../components/ui/TableFooter'
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

interface Patient {
  id: number
  firstName: string
  lastName: string
  phone: string
  regDate: string
  clinics: string[]
  visitsCount: number
  visits: Array<{
    date: string
    clinic: string
    doctor: string
    reason: string
    notes?: string
  }>
  clinicalSummary?: string
}

const INITIAL_PATIENTS: Patient[] = [
  {
    id: 1,
    firstName: 'محمد',
    lastName: 'العمري',
    phone: '+962-79-123-4567',
    regDate: '2024-01-15',
    clinics: ['عيادة النور', 'عيادة الأمل'],
    visitsCount: 12,  
    visits: [
      { date: '2024-05-10', clinic: 'عيادة النور', doctor: 'د. أحمد السعيد', reason: 'فحص دوري ومتابعة الضغط', notes: 'الضغط مستقر 120/80. الاستمرار على نفس الجرعة.' },
      { date: '2024-04-18', clinic: 'عيادة الأمل', doctor: 'د. سارة علي', reason: 'استشارة طبية عامة', notes: 'شكوى من إرهاق خفيف بسبب قلة النوم.' },
      { date: '2024-03-05', clinic: 'عيادة النور', doctor: 'د. محمد أحمد', reason: 'متابعة علاجية', notes: 'تحسن ملحوظ في الفحوصات المخبرية.' },
      { date: '2024-02-12', clinic: 'عيادة النور', doctor: 'د. أحمد السعيد', reason: 'فحص أسنان دوري', notes: 'تنظيف جير ووقاية.' }
    ],
    clinicalSummary: 'المريض ملتزم بالمتابعة الطبية الدورية. يعاني من ارتفاع ضغط دم طفيف متحكم به عبر العلاج الدوائي ونمط الحياة الصحي.'
  },
  {
    id: 2,
    firstName: 'فاطمة',
    lastName: 'الحسيني',
    phone: '+962-78-234-5678',
    regDate: '2024-02-10',
    clinics: ['عيادة السلام'],
    visitsCount: 8,
    visits: [
      { date: '2024-05-02', clinic: 'عيادة السلام', doctor: 'د. ليلى خالد', reason: 'فحص الغدة الدرقية', notes: 'جرعة هرمون الثايروكسين مناسبة. لا تغيير.' },
      { date: '2024-03-15', clinic: 'عيادة السلام', doctor: 'د. ليلى خالد', reason: 'مراجعة نتائج التحاليل', notes: 'تحسن في نسب الفيتامينات والمعادن.' }
    ],
    clinicalSummary: 'متابعة حالة خمول الغدة الدرقية. الحالة مستقرة والتحاليل الدورية ممتازة.'
  },
  {
    id: 3,
    firstName: 'أحمد',
    lastName: 'الزعبي',
    phone: '+962-77-345-6789',
    regDate: '2024-03-05',
    clinics: ['عيادة النور', 'عيادة الشفاء'],
    visitsCount: 15,
    visits: [
      { date: '2024-05-15', clinic: 'عيادة النور', doctor: 'د. محمد أحمد', reason: 'متابعة مستويات السكر', notes: 'تعديل طفيف في جرعة الأنسولين المسائية.' },
      { date: '2024-04-20', clinic: 'عيادة الشفاء', doctor: 'د. عماد حسن', reason: 'فحص نظر دوري', notes: 'تغير طفيف في درجات النظر. تم وصف نظارة جديدة.' }
    ],
    clinicalSummary: 'مريض سكري من النوع الثاني. متابعة دورية لوظائف الكلى وشبكية العين مستمرة بانتظام.'
  },
  {
    id: 4,
    firstName: 'سارة',
    lastName: 'المومني',
    phone: '+962-79-456-7890',
    regDate: '2024-01-20',
    clinics: ['عيادة الأمل'],
    visitsCount: 6,
    visits: [
      { date: '2024-05-05', clinic: 'عيادة الأمل', doctor: 'د. سارة علي', reason: 'استشارة تغذية وتخسيس', notes: 'خسارة 3 كغم بفضل الالتزام بالحمية الموصوفة.' }
    ],
    clinicalSummary: 'متابعة نمط الحياة الصحي والوزن. الفحوصات الحيوية سليمة وضمن المعدلات الطبيعية.'
  },
  {
    id: 5,
    firstName: 'خالد',
    lastName: 'الخطيب',
    phone: '+962-78-567-8901',
    regDate: '2024-02-25',
    clinics: ['عيادة النور'],
    visitsCount: 10,
    visits: [
      { date: '2024-05-09', clinic: 'عيادة النور', doctor: 'د. أحمد السعيد', reason: 'علاج طبيعي للمفاصل', notes: 'الجلسة الرابعة. استجابة ممتازة وزيادة في المدى الحركي.' }
    ],
    clinicalSummary: 'يخضع لبرنامج تأهيل وعلاج طبيعي بعد إصابة رياضية خفيفة في الركبة. تطور إيجابي ملحوظ.'
  }
]

const AdminPatients = () => {
  const { isLoaded, isExiting } = usePreloader()
  const canAnimate = isLoaded && !isExiting

  const [patients] = useState<Patient[]>(INITIAL_PATIENTS)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null)
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)

  // Real-time dynamic search filter
  const filteredPatients = patients.filter((patient) => {
    const fullName = `${patient.firstName} ${patient.lastName}`.toLowerCase()
    const matchesName = fullName.includes(searchQuery.toLowerCase())
    const matchesPhone = patient.phone.includes(searchQuery)
    return matchesName || matchesPhone
  })

  // Export Toast Action
  const handleExport = () => {
    window.showToast('تم تصدير سجلات المرضى بنجاح كملف Excel', 'success')
  }

  const handleOpenDetails = (patient: Patient) => {
    setSelectedPatient(patient)
    setIsDetailsModalOpen(true)
  }

  useEffect(() => {
    const maxPage = Math.max(1, Math.ceil(filteredPatients.length / (itemsPerPage || Math.max(1, filteredPatients.length))))
    if (currentPage > maxPage) {
      setCurrentPage(maxPage)
    }
  }, [filteredPatients.length, itemsPerPage, currentPage])

  return (
    <AdminLayout>
      <div
        className={cn(
          "space-y-6 opacity-0",
          canAnimate && "animate-fadeUp opacity-100 animate-delay-[100ms]",
          isExiting && "animate-fadeDownOut"
        )}
        dir="rtl"
        style={{ opacity: canAnimate ? 1 : 0 }}
      >
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 text-right">
          <div>
            <h1 className="text-3xl text-[#1A2B3C] mb-2 font-bold">إدارة المرضى</h1>
            <p className="text-gray-500 text-sm">عرض وإدارة جميع مرضى النظام</p>
          </div>
          <button
            onClick={handleExport}
            className="h-11 px-5 bg-gradient-to-r from-[#0B5A8E] to-[#3FB8AF] text-white rounded-xl text-sm font-semibold shadow-md hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 active:shadow-md transition-all duration-300 flex items-center gap-2 cursor-pointer"
          >
            <Download className="size-4 shrink-0" />
            <span>تصدير البيانات</span>
          </button>
        </div>

        {/* Search Card */}
        <div
          data-slot="card"
          className="text-card-foreground flex flex-col gap-6 rounded-xl transition-all duration-300 hover:shadow-lg p-6 bg-white border border-gray-200 shadow-sm"
        >
          {/* Search Row */}
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 size-4" />
              <input
                type="text"
                placeholder="بحث بالاسم، الهاتف..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-11 pr-10 pl-4 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#0B5A8E]/20 focus:border-[#0B5A8E] outline-none transition-all"
              />
            </div>
          </div>

          {/* Table Container */}
          <div className="overflow-x-auto mt-2">
            <Table className="min-w-[1000px] text-right">
              <TableHeader>
                <TableRow>
                  <TableHead>الاسم الأول</TableHead>
                  <TableHead>اسم العائلة</TableHead>
                  <TableHead>رقم الهاتف</TableHead>
                  <TableHead>تاريخ التسجيل</TableHead>
                  <TableHead>العيادات</TableHead>
                  <TableHead>عدد الزيارات</TableHead>
                  <TableHead className="text-center">الإجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPatients.length > 0 ? (
                  filteredPatients.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map((patient) => (
                    <TableRow
                      key={patient.id}
                    >
                      <TableCell className="p-4 align-middle whitespace-nowrap text-[#1A2B3C] font-semibold">
                        {patient.firstName}
                      </TableCell>
                      <TableCell className="p-4 align-middle whitespace-nowrap text-[#1A2B3C] font-semibold">
                        {patient.lastName}
                      </TableCell>
                      <TableCell className="p-4 align-middle whitespace-nowrap text-gray-600 font-mono text-sm">
                        {patient.phone}
                      </TableCell>
                      <TableCell className="p-4 align-middle whitespace-nowrap text-gray-600">
                        {patient.regDate}
                      </TableCell>
                      <TableCell className="p-4 align-middle whitespace-nowrap">
                        <div className="flex flex-wrap gap-1">
                          {patient.clinics.map((clinic, index) => (
                            <Badge key={index} variant="blue">{clinic}</Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell className="p-4 align-middle whitespace-nowrap">
                        <Badge variant="purple">{patient.visitsCount} زيارة</Badge>
                      </TableCell>
                      <TableCell className="p-4 align-middle whitespace-nowrap text-center">
                        <div className="flex justify-center gap-2">
                          <button
                            onClick={() => handleOpenDetails(patient)}
                            title="عرض تفاصيل المريض"
                            className="inline-flex items-center justify-center whitespace-nowrap text-sm font-medium transition-all duration-300 disabled:pointer-events-none disabled:opacity-50 shrink-0 outline-none hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 active:shadow-sm h-8 rounded-md px-2.5 text-[#0B5A8E] hover:text-[#3FB8AF] hover:bg-blue-500/10 cursor-pointer"
                          >
                            <Eye className="size-4" />
                          </button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="p-8 text-center text-gray-400 font-bold">
                      لا يوجد مرضى يطابقون خيارات البحث المحددة.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

            <TableFooter
              totalItems={filteredPatients.length}
              itemsPerPage={itemsPerPage}
              currentPage={currentPage}
              onPageChange={setCurrentPage}
              onItemsPerPageChange={(val) => {
                const nextPerPage = val === 'all' ? Math.max(1, filteredPatients.length) : Number(val)
                setItemsPerPage(nextPerPage)
                setCurrentPage(1)
              }}
            />
          </div>
        </div>

      {/* Patient Premium Details Modal */}
      {selectedPatient && (
        <Modal
          isOpen={isDetailsModalOpen}
          onClose={() => setIsDetailsModalOpen(false)}
          title="تفاصيل المريض"
          message="المعلومات الكاملة عن المريض"
          confirmText="موافق"
          cancelText="إغلاق"
          variant="primary"
          onConfirm={() => setIsDetailsModalOpen(false)}
          hideFooter
          showCloseButton
          hideHeaderIcon
        >
          <div className="space-y-6 mt-4 text-right" dir="rtl">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                <p className="text-xs text-gray-500 mb-1">الاسم الكامل</p>
                <p className="text-base text-[#1A2B3C] font-semibold">{selectedPatient.firstName} {selectedPatient.lastName}</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                <p className="text-xs text-gray-500 mb-1">رقم الهاتف</p>
                <p className="text-base text-[#1A2B3C] font-mono font-semibold">{selectedPatient.phone}</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                <p className="text-xs text-gray-500 mb-1 flex items-center gap-2">
                  <Calendar className="size-4" />
                  تاريخ التسجيل
                </p>
                <p className="text-base text-[#1A2B3C] font-semibold">{selectedPatient.regDate}</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                <p className="text-xs text-gray-500 mb-1 flex items-center gap-2">
                  <Activity className="size-4" />
                  عدد الزيارات
                </p>
                <p className="text-base text-emerald-600 font-semibold">{selectedPatient.visitsCount} زيارة</p>
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
              <p className="text-xs text-gray-500 mb-3 flex items-center gap-2">
                <Building2 className="size-4" />
                العيادات المرتبطة
              </p>
              <div className="flex flex-wrap gap-2">
                {selectedPatient.clinics.map((clinic, index) => (
                  <Badge key={index} variant="blue" className="text-[10px] px-2 py-1">
                    {clinic}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </Modal>
      )}
    </AdminLayout>
  )
}

export default AdminPatients
