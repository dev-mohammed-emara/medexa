import Input from '@/components/ui/Input';
import Portal from '@/components/ui/Portal';
import { cn } from '@/utils/cn';
import { Key, Mail, Shield, X, Loader2 } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';

import { useLanguage } from '@/contexts/LanguageContext';
import { profileTranslations } from '@/constants/profile';

import { getCookie } from '@/utils/cookie';

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

  const [newEmail, setNewEmail] = useState('');
  const [loading, setLoading] = useState(false);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmail) return;

    setLoading(true);
    try {
      const token = getCookie('token');
      const response = await fetch('/api/auth/email/change', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          newEmail: newEmail
        })
      });

      if (!response.ok) {
        let errorMsg = 'Failed to verify email';
        try {
          const errData = await response.json();
          errorMsg = errData.message || errData.error || errorMsg;
        } catch (e) { /* ignore */ }
        throw new Error(errorMsg);
      }

      const data = await response.json();
      window.showToast?.(data.message || t('profile.email_confirm_sent', T_PAGE), 'success');
      handleClose();
    } catch (err: any) {
      console.error(err);
      window.showToast?.(err.message || 'Error updating email', 'error');
    } finally {
      setLoading(false);
    }
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
        onClick={(e) => e.target === overlayRef.current && !loading && handleClose()}
      >
        <div
          ref={modalRef}
          className={cn(
            "bg-white relative z-50 grid w-full gap-4 rounded-xl border p-6 shadow-lg sm:max-w-lg max-w-md",
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

          <form onSubmit={handleSubmit} className="space-y-4 py-4">            <div className="space-y-2 text-start">
            <label className="flex items-center gap-2 font-medium text-sm text-foreground" style={{ fontWeight: 600 }}>
              {t('profile.new_email', T_PAGE)}
            </label>
            <Input
              type="email"
              required
              icon={<Mail size={18} />}
              disabled={loading}
              placeholder="example@medexa.jo"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              className="h-11 bg-background border-border focus:border-primary focus:bg-white transition-all duration-300 font-bold"
            />
          </div>
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-start">
              <div className="flex gap-2">
                <Shield size={16} className="text-amber-600 shrink-0" />
                <p className="text-xs text-amber-800">
                  {t('profile.security_note', T_PAGE)}
                </p>
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-medium transition-all duration-300 text-primary-foreground bg-primary hover:bg-primary/90 hover:shadow-lg hover:-translate-y-0.5 h-11 px-8 disabled:opacity-50"
              >
                {loading ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Key size={16} className={isAr ? "ml-1" : "mr-1"} />
                )}
                {t('profile.confirm_change', T_PAGE)}
              </button>
              <button
                type="button"
                disabled={loading}
                onClick={handleClose}
                className="flex-1 inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-medium transition-all duration-300 border bg-background text-foreground hover:bg-accent hover:text-accent-foreground h-11 px-8 disabled:opacity-50"
              >
                {t('common.cancel')}
              </button>
            </div>
          </form>

          <button
            onClick={handleClose}
            disabled={loading}
            className={`absolute top-4 ${isAr ? 'left-4' : 'right-4'} rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2`}
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
