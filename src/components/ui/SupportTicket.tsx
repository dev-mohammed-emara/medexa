import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { MdFeedback } from 'react-icons/md';
import Modal from './Modal';
import { useLanguage } from '../../contexts/LanguageContext';
import { getCookie } from '../../utils/cookie';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './select';

const SupportTicket = () => {
  const { isAr } = useLanguage();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [section, setSection] = useState('dashboard_page');

  // Hide the floating button on the support-tickets page and admin pages
  const isSupportTicketsPage = location.pathname.includes('/support-tickets');
  const isAdminPage = location.pathname.includes('/admin');
  if (isSupportTicketsPage || isAdminPage) return null;

  const getSectionName = (path: string) => {
    const cleanPath = path.toLowerCase().replace(/^\/admin/, '').replace(/^\//, '').split('/')[0];
    if (!cleanPath) return 'dashboard_page';
    if (cleanPath === 'dashboard') return 'dashboard_page';
    if (cleanPath === 'doctors') return 'doctor_page';
    if (cleanPath === 'patients') return 'patient_page';
    if (cleanPath === 'secretary') return 'secretary_page';
    if (cleanPath === 'appointments') return 'appointment_page';
    if (cleanPath === 'records') return 'medical_record_page';
    if (cleanPath === 'finance') return 'finance_page';
    if (cleanPath === 'profile') return 'profile_page';
    if (cleanPath === 'settings') return 'settings_page';
    return `${cleanPath}_page`;
  };

  const handleOpen = () => {
    setSection(getSectionName(location.pathname));
    setIsOpen(true);
  };

  const handleSubmit = async () => {
    if (!description.trim()) return;
    setIsSubmitting(true);

    try {
      const token = getCookie('token');
      const response = await fetch('/api/support-ticket', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          section: section,
          description: description
        })
      });

      if (response.ok) {
        window.showToast?.(isAr ? 'شكراً لملاحظاتك!' : 'Thanks for the feedback!', 'success');
        setIsOpen(false);
        setDescription('');
      } else {
        let errMsg = 'Failed to submit support ticket';
        try {
          const errData = await response.json();
          errMsg = errData.message || errData.error || errMsg;
        } catch (e) {}
        window.showToast?.(errMsg, 'error');
      }
    } catch (error: any) {
      console.error('Error submitting support ticket:', error);
      window.showToast?.(error.message || 'Error communicating with server', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {/* Floating Support Icon on the far left - Opens Modal directly now */}
      <button
        type="button"
        onClick={handleOpen}
        className="fixed bottom-6 left-6 z-40 p-3.5 rounded-full bg-yellow-400 hover:bg-yellow-500 text-black shadow-xl hover:scale-110 active:scale-95 transition-all duration-200 flex items-center justify-center cursor-pointer border border-yellow-300"
        title={isAr ? 'الدعم الفني' : 'Support'}
      >
        <MdFeedback className="size-6 animate-pulse" />
      </button>

      {/* Support Ticket Modal (Yellow warning variant with centered text fields) */}
      <Modal
        isOpen={isOpen}
        onClose={() => {
          setIsOpen(false);
          setDescription('');
        }}
        onConfirm={handleSubmit}
        title={isAr ? 'إرسال تذكرة دعم' : 'Submit Support Ticket'}
        message={isAr ? 'يرجى وصف المشكلة بالتفصيل لمساعدتنا في حلها.' : 'Please describe the issue in detail to help us resolve it.'}
        confirmText={isAr ? 'إرسال' : 'Submit'}
        cancelText={isAr ? 'إلغاء' : 'Cancel'}
        variant="warning"
        isConfirmDisabled={!description.trim() || isSubmitting}
      >
        <div className="space-y-4 py-2 flex flex-col w-full text-start" dir={isAr ? 'rtl' : 'ltr'}>
          <div className="space-y-2 w-full">
            <label className="text-xs font-bold text-foreground/70 block">
              {isAr ? 'الصفحة المعنية' : 'Related Page'} <span className="text-destructive">*</span>
            </label>
            <Select value={section} onValueChange={setSection}>
              <SelectTrigger className="w-full h-12 rounded-xl bg-white border border-border text-start">
                <SelectValue placeholder={isAr ? 'الصفحة المعنية' : 'Related Page'} />
              </SelectTrigger>
              <SelectContent smallZ className="z-[700]">
                <SelectItem value="dashboard_page">{isAr ? 'لوحة التحكم' : 'Dashboard'}</SelectItem>
                <SelectItem value="doctor_page">{isAr ? 'الأطباء' : 'Doctors'}</SelectItem>
                <SelectItem value="patient_page">{isAr ? 'المرضى' : 'Patients'}</SelectItem>
                <SelectItem value="secretary_page">{isAr ? 'السكرتاريا' : 'Secretaries'}</SelectItem>
                <SelectItem value="appointment_page">{isAr ? 'المواعيد' : 'Appointments'}</SelectItem>
                <SelectItem value="medical_record_page">{isAr ? 'السجلات الطبية' : 'Medical Records'}</SelectItem>
                <SelectItem value="finance_page">{isAr ? 'المالية' : 'Finance'}</SelectItem>
                <SelectItem value="profile_page">{isAr ? 'الملف الشخصي' : 'Profile'}</SelectItem>
                <SelectItem value="settings_page">{isAr ? 'الإعدادات' : 'Settings'}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2 w-full text-start">
            <label className="text-xs font-bold text-foreground/70 block">
              {isAr ? 'صف المشكلة' : 'Issue Description'} <span className="text-destructive">*</span>
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={isAr ? 'اكتب تفاصيل المشكلة هنا...' : 'Type issue details here...'}
              className="w-full min-h-[120px] p-4 rounded-xl border border-border bg-muted/20 focus:ring-4 focus:ring-yellow-500/10 focus:border-yellow-500 transition-all outline-none font-semibold text-sm resize-none text-foreground placeholder:text-muted-foreground/60"
              dir={isAr ? 'rtl' : 'ltr'}
            />
          </div>
        </div>
      </Modal>
    </>
  );
};

export default SupportTicket;
