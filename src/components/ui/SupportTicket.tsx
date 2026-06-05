import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { MdFeedback } from 'react-icons/md';
import Modal from './Modal';
import { useLanguage } from '../../contexts/LanguageContext';
import { getCookie } from '../../utils/cookie';
import { cn } from '../../utils/cn';

const SupportTicket = () => {
  const { isAr } = useLanguage();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  const handleSubmit = async () => {
    if (!description.trim()) return;
    setIsSubmitting(true);
    const sectionName = getSectionName(location.pathname);

    try {
      const token = getCookie('token');
      const response = await fetch('/api/support-ticket', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          section: sectionName,
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
      {/* Bottom Warning Button (Yellowish warning theme) */}
      <div className="mt-8 mb-4 flex justify-center w-full">
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="px-6 py-3 rounded-xl font-bold bg-yellow-400 hover:bg-yellow-500 text-yellow-950 shadow-lg shadow-yellow-400/20 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 cursor-pointer"
        >
          {isAr ? 'هل تواجه أي مشكلة؟' : 'Having any issue?'}
        </button>
      </div>

      {/* Floating Support Icon on the far left - Opens Modal directly now */}
      <button
        type="button"
        onClick={() => setIsOpen(true)}
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
        <div className="space-y-4 py-2  flex flex-col items-start">
          <div className="space-y-2 w-full">
            <label className="text-xs font-bold text-foreground/70 block ">
              {isAr ? 'صف المشكلة' : 'Issue Description'} <span className="text-destructive">*</span>
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={isAr ? 'اكتب تفاصيل المشكلة هنا...' : 'Type issue details here...'}
              className={cn(
                "w-full min-h-[120px] p-4 rounded-xl border border-border bg-muted/20 focus:ring-4 focus:ring-yellow-500/10 focus:border-yellow-500 transition-all outline-none font-semibold text-sm resize-none  text-foreground placeholder:text-muted-foreground/60"
              )}
              dir={isAr ? 'rtl' : 'ltr'}
            />
          </div>
        </div>
      </Modal>
    </>
  );
};

export default SupportTicket;
