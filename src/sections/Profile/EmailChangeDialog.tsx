import Input from '@/components/ui/Input';
import Portal from '@/components/ui/Portal';
import { cn } from '@/utils/cn';
import { Key, Mail, Shield, X } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { FaLock } from 'react-icons/fa';

interface EmailChangeDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

const EmailChangeDialog = ({ isOpen, onClose }: EmailChangeDialogProps) => {
  const overlayRef = useRef<HTMLDivElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const [isClosing, setIsClosing] = useState(false);

  const handleClose = useCallback(() => {
    setIsClosing(true);
    setTimeout(() => {
      setIsClosing(false);
      onClose();
    }, 400);
  }, [onClose]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';

      // History state for mobile back button
      window.history.pushState({ modalOpen: true }, '');

      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') handleClose();
      };

      const handlePopState = () => {
        handleClose();
      };

      window.addEventListener('keydown', handleKeyDown);
      window.addEventListener('popstate', handlePopState);

      return () => {
        document.body.style.overflow = 'unset';
        window.removeEventListener('keydown', handleKeyDown);
        window.removeEventListener('popstate', handlePopState);

        if (window.history.state?.modalOpen) {
          window.history.back();
        }
      };
    }
  }, [isOpen, handleClose]);

  if (!isOpen) return null;

  const handleSubmit = () => {
    window.showToast?.('تم إرسال رابط التأكيد للبريد الجديد', 'success');
    handleClose();
  };

  return (
    <Portal>
      <div
        ref={overlayRef}
        className={cn(
          "fixed inset-0 z-100 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm",
          isClosing ? "animate-fadeOut" : "animate-fade"
        )}
        dir="rtl"
        onClick={(e) => e.target === overlayRef.current && handleClose()}
      >
        <div
          ref={modalRef}
          className={cn(
            "bg-white relative z-50 grid w-full gap-4 rounded-lg border p-6 shadow-lg sm:max-w-lg max-w-md",
            isClosing ? "animate-scaleDownOut" : "animate-scaleUp"
          )}
        >
          <div className="flex flex-col gap-2 text-right">
            <h2 className="text-lg leading-none font-semibold flex items-center gap-2">
              <Mail className="text-primary" size={24} />
              تغيير البريد الإلكتروني
            </h2>
            <p className="text-muted-foreground text-sm">
              لأمان حسابك، يرجى إدخال البريد الجديد وتأكيد كلمة المرور
            </p>
          </div>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="flex items-center gap-2 font-medium text-sm" style={{ fontWeight: 600 }}>
                البريد الإلكتروني الحالي
              </label>
              <Input
                readOnly
                value="ahmed.alsaeed@medexa.jo"
                className="h-11 bg-muted/50 border-border cursor-not-allowed text-muted-foreground"
              />
            </div>

            <div className="space-y-2">
              <label className="flex items-center gap-2 font-medium text-sm" style={{ fontWeight: 600 }}>
                البريد الإلكتروني الجديد
              </label>
              <Input
                type="email"
                placeholder="example@medexa.jo"
                className="h-11 bg-background border-border focus:border-primary focus:bg-white transition-all duration-300"
              />
            </div>

            <div className="space-y-2">
              <label className="flex items-center gap-2 font-medium text-sm" style={{ fontWeight: 600 }}>
                كلمة المرور
              </label>
              <Input
                type="password"
                icon={<FaLock size={16} />}
                placeholder="••••••••"
                className="h-11 bg-background border-border focus:border-primary focus:bg-white transition-all duration-300"
              />
              <p className="text-xs text-muted-foreground">يرجى إدخال كلمة المرور الحالية لتأكيد التغيير</p>
            </div>

            <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <div className="flex gap-2">
                <Shield size={16} className="text-amber-600 shrink-0" />
                <p className="text-xs text-amber-800">
                  بعد تغيير البريد الإلكتروني، سيتم إرسال رابط تأكيد إلى البريد الجديد
                </p>
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                onClick={handleSubmit}
                className="flex-1 inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all duration-300 text-primary-foreground bg-primary hover:bg-primary/90 hover:shadow-lg hover:-translate-y-0.5 h-11 px-8"
              >
                <Key size={16} className="ml-1" />
                تأكيد التغيير
              </button>
              <button
                onClick={handleClose}
                className="flex-1 inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all duration-300 border bg-background text-foreground hover:bg-accent hover:text-accent-foreground h-11 px-8"
              >
                إلغاء
              </button>
            </div>
          </div>

          <button
            onClick={handleClose}
            className="absolute top-4 left-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
          >
            <X size={24} />
            <span className="sr-only">إغلاق</span>
          </button>
        </div>
      </div>
    </Portal>
  );
};

export default EmailChangeDialog;
