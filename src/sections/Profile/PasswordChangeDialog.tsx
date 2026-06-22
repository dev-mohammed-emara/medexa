import Input from '@/components/ui/Input';
import Portal from '@/components/ui/Portal';
import { cn } from '@/utils/cn';
import { Key, X as CloseIcon, Check, X, Loader2 } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { FaLock } from 'react-icons/fa';
import { useLanguage } from '@/contexts/LanguageContext';
import { profileTranslations } from '@/constants/profile';
import { getCookie } from '@/utils/cookie';
import { apiFetch } from '@/utils/apiFetch';

interface PasswordChangeDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

const PasswordChangeDialog = ({ isOpen, onClose }: PasswordChangeDialogProps) => {
  const overlayRef = useRef<HTMLDivElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const [isClosing, setIsClosing] = useState(false);
  const { isAr, t, dir } = useLanguage();
  const T_PAGE = profileTranslations;

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const passwordCriteria = [
    { label: isAr ? '8 أحرف على الأقل' : '8+ characters', met: newPassword.length >= 8 },
    { label: isAr ? 'حرف كبير (A-Z)' : 'Uppercase (A-Z)', met: /[A-Z]/.test(newPassword) },
    { label: isAr ? 'رقم واحد (0-9)' : 'Number (0-9)', met: /[0-9]/.test(newPassword) },
    { label: isAr ? 'رمز خاص (!@#)' : 'Special char (!@#)', met: /[!@#$%^&*(),.?":{}|<>]/.test(newPassword) },
  ];

  const strengthPoints = passwordCriteria.filter(c => c.met).length;

  const getStrengthColor = () => {
    if (strengthPoints <= 1) return 'bg-destructive';
    if (strengthPoints <= 3) return 'bg-amber-500';
    return 'bg-emerald-500';
  };

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
    if (!currentPassword || !newPassword || !confirmPassword) return;

    if (newPassword !== confirmPassword) {
      window.showToast?.('Passwords do not match', 'error');
      return;
    }

    setLoading(true);
    try {
      const token = getCookie('token');
      const response = await apiFetch('/api/auth/password/change', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          currentPassword,
          newPassword,
          confirmPassword
        })
      });

      if (!response.ok) {
        let errorMsg = 'Failed to change password';
        try {
          const errData = await response.json();
          errorMsg = errData.message || errData.error || errorMsg;
        } catch (e) { /* ignore */ }
        throw new Error(errorMsg);
      }

      const data = await response.json();
      window.showToast?.(data.message || 'Password changed successfully', 'success');
      handleClose();
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      console.error(err);
      window.showToast?.(err.message || 'Error updating password', 'error');
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
              <Key className="text-primary" size={24} />
              {t('profile.change_password', T_PAGE)}
            </h2>
            <p className="text-muted-foreground text-sm">
              {t('profile.change_password_desc', T_PAGE)}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 py-4">
            <div className="space-y-2 text-start">
              <label className="flex items-center gap-2 font-medium text-sm text-foreground" style={{ fontWeight: 600 }}>
                {t('profile.current_password', T_PAGE)}
              </label>
              <div className="relative">
                <Input
                  type="password"
                  required
                  disabled={loading}
                  icon={<FaLock size={16} />}
                  placeholder="••••••••"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="h-11 bg-background border-border focus:border-primary focus:bg-white transition-all duration-300 font-bold"
                />
              </div>
            </div>

            <div className="space-y-2 text-start">
              <label className="flex items-center gap-2 font-medium text-sm text-foreground" style={{ fontWeight: 600 }}>
                {t('profile.new_password', T_PAGE)}
              </label>
              <div className="relative">
                <Input
                  type="password"
                  required
                  disabled={loading}
                  icon={<FaLock size={16} />}
                  placeholder="••••••••"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="h-11 bg-background border-border focus:border-primary focus:bg-white transition-all duration-300 font-bold"
                />
              </div>
              {newPassword.length > 0 && (
                <div className="mt-4 animate-fade">
                  <div className="flex gap-2">
                    {passwordCriteria.map((criterion, i) => (
                      <div key={i} className="flex-1 flex flex-col gap-2">
                        {/* Segmented bar on top */}
                        <div
                          className={cn(
                            "h-1.5 rounded-full transition-all duration-500",
                            criterion.met ? getStrengthColor() : "bg-slate-100"
                          )}
                        />

                        {/* Instruction + Icon below */}
                        <div className="flex items-center justify-center gap-1 px-0.5">
                          {criterion.met ? (
                            <Check className="size-3 text-emerald-500 stroke-[4px] shrink-0" />
                          ) : (
                            <X className="size-3 text-slate-300 stroke-[4px] shrink-0" />
                          )}
                          <span className={cn(
                            "text-[9px] transition-colors leading-tight text-center",
                            criterion.met ? "text-emerald-700 font-bold" : "text-muted-foreground/70"
                          )}>
                            {criterion.label}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-2 text-start">
              <label className="flex items-center gap-2 font-medium text-sm text-foreground" style={{ fontWeight: 600 }}>
                {t('profile.confirm_new_password', T_PAGE)}
              </label>
              <div className="relative">
                <Input
                  type="password"
                  required
                  disabled={loading}
                  icon={<FaLock size={16} />}
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="h-11 bg-background border-border focus:border-primary focus:bg-white transition-all duration-300 font-bold"
                />
              </div>
              <p className="text-xs text-muted-foreground text-start mt-1">{t('profile.password_note', T_PAGE)}</p>
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
            <CloseIcon size={24} />
            <span className="sr-only">{t('profile.close', T_PAGE)}</span>
          </button>
        </div>
      </div>
    </Portal>
  );
};

export default PasswordChangeDialog;
