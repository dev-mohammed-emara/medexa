import Input from '@/components/ui/Input';
import Portal from '@/components/ui/Portal';
import { cn } from '@/utils/cn';
import { Key, Mail, Shield, X } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { FaLock } from 'react-icons/fa';
import { useLanguage } from '@/contexts/LanguageContext';
import { profileTranslations } from '@/constants/profile';

interface EmailChangeDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

const EmailChangeDialog = ({ isOpen, onClose }: EmailChangeDialogProps) => {
  const overlayRef = useRef<HTMLDivElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const [isClosing, setIsClosing] = useState(false);
  const { isAr, t, dir } = useLanguage();
  const T_PAGE = profileTranslations;

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
    window.showToast?.(t('profile.email_confirm_sent', T_PAGE), 'success');
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
        dir={dir}
        onClick={(e) => e.target === overlayRef.current && handleClose()}
      >
        <div
          ref={modalRef}
          className={cn(
            "bg-white relative z-50 grid w-full gap-4 rounded-lg border p-6 shadow-lg sm:max-w-lg max-w-md",
            isClosing ? "animate-scaleDownOut" : "animate-scaleUp"
          )}
        >
          <div className={cn("flex flex-col gap-2", isAr ? "text-right" : "text-left")}>
            <h2 className="text-lg leading-none font-semibold flex items-center gap-2">
              <Mail className="text-primary" size={24} />
              {t('profile.change_email', T_PAGE)}
            </h2>
            <p className="text-muted-foreground text-sm">
              {t('profile.change_email_desc', T_PAGE)}
            </p>
          </div>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="flex items-center gap-2 font-medium text-sm" style={{ fontWeight: 600 }}>
                {t('profile.current_email', T_PAGE)}
              </label>
              <Input
                readOnly
                value="ahmed.alsaeed@medexa.jo"
                className="h-11 bg-muted/50 border-border cursor-not-allowed text-muted-foreground"
              />
            </div>

            <div className="space-y-2">
              <label className="flex items-center gap-2 font-medium text-sm" style={{ fontWeight: 600 }}>
                {t('profile.new_email', T_PAGE)}
              </label>
              <Input
                type="email"
                placeholder="example@medexa.jo"
                className="h-11 bg-background border-border focus:border-primary focus:bg-white transition-all duration-300"
              />
            </div>

            <div className="space-y-2">
              <label className="flex items-center gap-2 font-medium text-sm" style={{ fontWeight: 600 }}>
                {t('profile.password', T_PAGE)}
              </label>
              <Input
                type="password"
                icon={<FaLock size={16} />}
                placeholder="••••••••"
                className="h-11 bg-background border-border focus:border-primary focus:bg-white transition-all duration-300"
              />
              <p className="text-xs text-muted-foreground">{t('profile.password_note', T_PAGE)}</p>
            </div>

            <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <div className="flex gap-2">
                <Shield size={16} className="text-amber-600 shrink-0" />
                <p className="text-xs text-amber-800">
                  {t('profile.security_note', T_PAGE)}
                </p>
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                onClick={handleSubmit}
                className="flex-1 inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all duration-300 text-primary-foreground bg-primary hover:bg-primary/90 hover:shadow-lg hover:-translate-y-0.5 h-11 px-8"
              >
                <Key size={16} className={isAr ? "ml-1" : "mr-1"} />
                {t('profile.confirm_change', T_PAGE)}
              </button>
              <button
                onClick={handleClose}
                className="flex-1 inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all duration-300 border bg-background text-foreground hover:bg-accent hover:text-accent-foreground h-11 px-8"
              >
                {t('common.cancel')}
              </button>
            </div>
          </div>

          <button
            onClick={handleClose}
            className="absolute top-4 left-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
          >
            <X size={24} />
            <span className="sr-only">{t('profile.close', T_PAGE)}</span>
          </button>
        </div>
      </div>
    </Portal>
  );
};

export default EmailChangeDialog;
