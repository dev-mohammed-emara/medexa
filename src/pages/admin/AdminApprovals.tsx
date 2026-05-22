import { useState } from 'react'
import {
  CircleCheck
} from 'lucide-react'
import AdminLayout from '../../components/layout/AdminLayout'
import Badge from '../../components/ui/badge'
import { usePreloader } from '../../contexts/PreloaderContext'
import { cn } from '../../utils/cn'
import Modal from '../../components/ui/Modal'
import ClinicApprovalArticle, { type Approval } from './clinicApprovalArticle'

const INITIAL_APPROVALS: Approval[] = [
  {
    id: 1,
    clinicName: 'عيادة الرعاية الطبية',
    category: 'طب عام',
    ownerName: 'د. يوسف العبدالله',
    email: 'youssef@clinic.jo',
    phone: '+962-79-111-2222',
    date: '2024-05-10',
    documents: ['سجل تجاري', 'ترخيص طبي', 'هوية الطبيب']
  },
  {
    id: 2,
    clinicName: 'عيادة الأسنان المتقدمة',
    category: 'طب أسنان',
    ownerName: 'د. رانيا الحموري',
    email: 'rania@dental.jo',
    phone: '+962-78-333-4444',
    date: '2024-05-12',
    documents: ['سجل تجاري', 'ترخيص طبي']
  },
  {
    id: 3,
    clinicName: 'عيادة القلب والشرايين',
    category: 'أمراض القلب',
    ownerName: 'د. محمود الزيود',
    email: 'mahmoud@heart.jo',
    phone: '+962-77-555-6666',
    date: '2024-05-14',
    documents: ['سجل تجاري', 'ترخيص طبي', 'شهادة البورد']
  }
]

const delayClasses = [
  'animate-delay-100',
  'animate-delay-200',
  'animate-delay-300',
  'animate-delay-400',
  'animate-delay-500',
  'animate-delay-600',
  'animate-delay-700',
  'animate-delay-800',
  'animate-delay-900',
  'animate-delay-1000'
]

const AdminApprovals = () => {
  const { isLoaded, isExiting } = usePreloader()
  const canAnimate = isLoaded && !isExiting

  const [approvals, setApprovals] = useState<Approval[]>(INITIAL_APPROVALS)
  const [selectedApproval, setSelectedApproval] = useState<Approval | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const handleOpenReview = (approval: Approval) => {
    setSelectedApproval(approval)
    setIsModalOpen(true)
  }

  const handleCloseReview = () => {
    setIsModalOpen(false)
    // Delay clearing selected data for exit animation
    setTimeout(() => {
      setSelectedApproval(null)
    }, 200)
  }

  const handleAction = (action: 'قبول' | 'معلومات' | 'رفض') => {
    if (!selectedApproval) return

    let toastMessage = ''
    let toastType: 'success' | 'info' | 'error' = 'success'

    if (action === 'قبول') {
      toastMessage = `تم قبول طلب تسجيل عيادة "${selectedApproval.clinicName}" بنجاح`
      toastType = 'success'
    } else if (action === 'معلومات') {
      toastMessage = `تم إرسال طلب معلومات إضافية لعيادة "${selectedApproval.clinicName}"`
      toastType = 'info'
    } else {
      toastMessage = `تم رفض طلب تسجيل عيادة "${selectedApproval.clinicName}"`
      toastType = 'error'
    }

    window.showToast(toastMessage, toastType)
    
    // Remove from active list
    setApprovals(prev => prev.filter(item => item.id !== selectedApproval.id))
    
    handleCloseReview()
  }

  return (
    <AdminLayout>
      <div
        className={cn(
          'space-y-6 opacity-0 transition-all duration-300',
          canAnimate && 'animate-fadeUp opacity-100 animate-delay-[100ms]',
          isExiting && 'animate-fadeDownOut'
        )}
        dir="rtl"
        style={{ opacity: canAnimate ? 1 : 0 }}
      >
        {/* Header Section */}
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl text-[#1A2B3C] mb-2 font-bold animate-pulse-slow">موافقات العيادات</h1>
            <p className="text-gray-500 text-sm font-medium">مراجعة والموافقة على طلبات تسجيل العيادات الجديدة</p>
          </div>
          {approvals.length > 0 && (
            <Badge variant="yellow" className="text-lg px-4 py-2 font-medium">
              {approvals.length} طلب قيد الانتظار
            </Badge>
          )}
        </div>

        {/* Content Section */}
        {approvals.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {approvals.map((approval, index) => (
              <ClinicApprovalArticle
                key={approval.id}
                approval={approval}
                onReview={handleOpenReview}
                className={cn(
                  'opacity-0',
                  canAnimate && 'animate-snappyUp opacity-100',
                  canAnimate && delayClasses[index % delayClasses.length]
                )}
              />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center shadow-xs flex flex-col items-center justify-center max-w-2xl mx-auto mt-12 animate-fadeUp">
            <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-500 mb-4 border border-emerald-100 shadow-xs">
              <CircleCheck className="size-8 animate-bounce-slow" />
            </div>
            <h3 className="text-lg text-[#1A2B3C] font-bold mb-2">لا توجد طلبات معلقة</h3>
            <p className="text-gray-500 text-sm">تمت مراجعة جميع طلبات تسجيل العيادات والموافقة عليها بنجاح.</p>
          </div>
        )}

        {/* Review Modal */}
        {selectedApproval && (
          <Modal
            isOpen={isModalOpen}
            onClose={handleCloseReview}
            onConfirm={() => {}}
            title="مراجعة طلب التسجيل"
            message="المعلومات الكاملة عن طلب تسجيل العيادة"
            confirmText=""
            cancelText=""
            hideFooter={true}
            showCloseButton={true}
            hideHeaderIcon={true}
          >
            <div className="space-y-6 pr-1 pl-1 scrollbar-thin">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                  <p className="text-sm text-gray-500 mb-1">اسم العيادة</p>
                  <p className="text-lg text-[#1A2B3C]" style={{ fontWeight: 600 }}>{selectedApproval.clinicName}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                  <p className="text-sm text-gray-500 mb-1">الفئة الطبية</p>
                  <p className="text-lg text-[#1A2B3C]" style={{ fontWeight: 600 }}>{selectedApproval.category}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                  <p className="text-sm text-gray-500 mb-1">صاحب العيادة</p>
                  <p className="text-lg text-[#1A2B3C]" style={{ fontWeight: 600 }}>{selectedApproval.ownerName}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                  <p className="text-sm text-gray-500 mb-1">تاريخ التسجيل</p>
                  <p className="text-lg text-[#1A2B3C]" style={{ fontWeight: 600 }}>{selectedApproval.date}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                  <p className="text-sm text-gray-500 mb-1">البريد الإلكتروني</p>
                  <p className="text-base text-[#1A2B3C]" style={{ fontWeight: 600 }}>{selectedApproval.email}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                  <p className="text-sm text-gray-500 mb-1">رقم الهاتف</p>
                  <p className="text-base text-[#0F172A] font-mono" style={{ fontWeight: 600 }}>{selectedApproval.phone}</p>
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                <p className="text-sm text-gray-500 mb-3">المستندات المرفقة</p>
                <div className="flex flex-wrap gap-2">
                  {selectedApproval.documents.map((doc, idx) => (
                    <Badge key={idx} variant="green" className="px-2 py-0.5 text-xs">
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-file-text ml-1">
                        <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"></path>
                        <path d="M14 2v4a2 2 0 0 0 2 2h4"></path>
                        <path d="M10 9H8"></path>
                        <path d="M16 13H8"></path>
                        <path d="M16 17H8"></path>
                      </svg>
                      {doc}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button 
                  onClick={() => handleAction('قبول')}
                  data-slot="button" 
                  className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all duration-300 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 active:shadow-md hover:bg-primary/90 hover:shadow-primary/20 h-9 px-4 py-2 has-[>svg]:px-3 flex-1 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white cursor-pointer"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" stroke-linecap="round" stroke-linejoin="round" className="lucide lucide-circle-check ml-2">
                    <circle cx="12" cy="12" r="10"></circle>
                    <path d="m9 12 2 2 4-4"></path>
                  </svg>
                  قبول
                </button>
                <button 
                  onClick={() => handleAction('معلومات')}
                  data-slot="button" 
                  className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all duration-300 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 active:shadow-md hover:bg-primary/90 hover:shadow-primary/20 h-9 px-4 py-2 has-[>svg]:px-3 flex-1 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white cursor-pointer"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" className="lucide lucide-circle-alert ml-2">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="12" x2="12" y1="8" y2="12"></line>
                    <line x1="12" x2="12.01" y1="16" y2="16"></line>
                  </svg>
                  طلب معلومات إضافية
                </button>
                <button 
                  onClick={() => handleAction('رفض')}
                  data-slot="button" 
                  className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all duration-300 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 active:shadow-md hover:bg-primary/90 hover:shadow-primary/20 h-9 px-4 py-2 has-[>svg]:px-3 flex-1 bg-gradient-to-r from-rose-500 to-red-500 hover:from-rose-600 hover:to-red-600 text-white cursor-pointer"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" className="lucide lucide-circle-x ml-2">
                    <circle cx="12" cy="12" r="10"></circle>
                    <path d="m15 9-6 6"></path>
                    <path d="m9 9 6 6"></path>
                  </svg>
                  رفض
                </button>
              </div>
            </div>
          </Modal>
        )}
      </div>
    </AdminLayout>
  )
}

export default AdminApprovals
