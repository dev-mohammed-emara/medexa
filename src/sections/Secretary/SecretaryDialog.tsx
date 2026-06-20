import { format } from 'date-fns'
import { ar } from 'date-fns/locale'
import "flatpickr/dist/flatpickr.css"
import { Arabic } from "flatpickr/dist/l10n/ar.js"
import { Check, Mail, Phone, Plus, Save, User, X } from 'lucide-react'
import { FaCalendarAlt } from 'react-icons/fa'
import { useCallback, useEffect, useRef, useState } from 'react'
import { DatePicker } from '../../components/ui/DatePicker';
import { cn } from '../../utils/cn'
import { Button } from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import ScrollLockWrapper from '../../components/ui/ScrollLockWrapper'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select"
import Portal from '../../components/ui/Portal'
import { useLanguage } from '../../contexts/LanguageContext'
import { secretaryTranslations } from '../../constants/translations/secretary'
import { useBroadcast } from '../../hooks/useBroadcast'
import { enUS } from 'date-fns/locale'
import { createSecretary, updateSecretary } from '../../api/secretaryApi'
import type { ApiSecretary } from '../../api/secretaryApi'
import { formatPhoneForPayload, formatPhoneForDisplay } from '../../utils/phone'
import PermissionsFieldset from '../../components/ui/PermissionsFieldset'

interface SecretaryDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (data: ApiSecretary) => void;
  mode: 'add' | 'edit' | 'view';
  initialData?: ApiSecretary | null;
}

const SecretaryDialog = ({ isOpen, onClose, onConfirm, mode, initialData }: SecretaryDialogProps) => {
  const { isAr, t } = useLanguage();
  const { broadcast } = useBroadcast();
  const T = secretaryTranslations;
  const currentLocale = isAr ? ar : enUS;
  const overlayRef = useRef<HTMLDivElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  const [selectedGender, setSelectedGender] = useState(initialData?.user?.gender || "");
  const [selectedDob, setSelectedDob] = useState<string>(initialData?.user?.dateOfBirth || "");
  const [isClosing, setIsClosing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>(initialData?.user?.permissions || []);

  const [password, setPassword] = useState('');
  const [passwordError, setPasswordError] = useState<string | null>(null);

  // Sync initialData values when dialog opens or changes
  useEffect(() => {
    if (initialData) {
      setSelectedGender(initialData.user?.gender || "");
      setSelectedDob(initialData.user?.dateOfBirth || "");
      setSelectedPermissions(initialData.user?.permissions || []);
    } else {
      setSelectedGender("");
      setSelectedDob("");
      setPassword("");
      setSelectedPermissions([]);
    }
  }, [initialData, isOpen]);

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
      const handlePopState = () => handleClose();
      window.addEventListener('popstate', handlePopState);
      return () => {
        document.body.style.overflow = 'unset';
        window.removeEventListener('popstate', handlePopState);
      };
    }
  }, [isOpen, handleClose]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === 'view') {
      handleClose();
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData(e.target as HTMLFormElement);
      const formDataObj = Object.fromEntries(formData.entries());

      // Construct API payload
      const userPayload: any = {
        firstName: String(formDataObj.firstName),
        surName: String(formDataObj.surName),
        lastName: String(formDataObj.lastName),
        email: String(formDataObj.email),
        phoneNumber: formatPhoneForPayload(String(formDataObj.phoneNumber)),
        gender: selectedGender || 'MALE',
        dateOfBirth: selectedDob || '1990-01-01',
        permissions: selectedPermissions
      };

      // Password is required for adding new secretary
      if (mode === 'add') {
        userPayload.password = String(formDataObj.password)
      } else if (mode === 'edit') {
        // Do not update email in edit mode
        delete userPayload.email;
      }

      const bodyPayload = {
        user: userPayload
      }

      let responseData: any
      if (mode === 'add') {
        responseData = await createSecretary(bodyPayload)
        const successMsg = responseData?.details?.[0]?.message || responseData?.message || t('toast_add_success', T)
        window.showToast?.(successMsg, 'success')
      } else {
        // Edit mode (PUT)
        if (!initialData?.uuid) {
          throw new Error('Missing secretary UUID for update')
        }
        responseData = await updateSecretary(initialData.uuid, bodyPayload)
        const successMsg = responseData?.details?.[0]?.message || responseData?.message || t('toast_update_success', T)
        window.showToast?.(successMsg, 'success')
      }

      onConfirm(responseData);
      broadcast({ type: 'DATA_UPDATE', module: 'secretaries' });
      handleClose();
    } catch (error: any) {
      console.error(error)
      if (error.message && error.message.toLowerCase().includes('password')) {
        setPasswordError(error.message);
      }
      window.showToast?.(error.message || t('error_save', T), 'error')
    } finally {
      setLoading(false);
    }
  };

  const titles = {
    add: t('title_add', T),
    edit: t('title_edit', T),
    view: t('title_view', T)
  };
  const descriptions = {
    add: t('desc_add', T),
    edit: t('desc_edit', T),
    view: t('desc_view', T)
  };
  const inputId = (name: string) => `secretary-${name}-${mode}`;
  const inputClass = "rounded-xl h-12 text-foreground font-bold";

  return (
    <Portal>
      <div
        ref={overlayRef}
        className={cn(
          "fixed inset-0 z-500 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6",
          isClosing ? "animate-fadeOut" : "animate-fade"
        )}
        dir={isAr ? "rtl" : "ltr"}
        onClick={(e) => e.target === overlayRef.current && !loading && handleClose()}
      >
        <figure
          ref={modalRef}
          role="dialog"
          className={cn(
            "bg-background relative w-full rounded-2xl border p-8 shadow-2xl max-w-2xl max-h-[90vh] flex flex-col outline-none",
            isClosing ? "animate-scaleDownOut" : "animate-scaleUp"
          )}
        >
          <button
            onClick={handleClose}
            disabled={loading}
            type="button"
            className={cn(
              "absolute top-6 p-2 rounded-full hover:bg-muted transition-colors opacity-70 hover:opacity-100 outline-none z-20",
              isAr ? "left-6" : "right-6"
            )}
          >
            <X size={20} />
            <span className="sr-only">Close</span>
          </button>

          <header data-slot="dialog-header" className={cn("flex flex-col gap-2 mb-6", isAr ? "text-right" : "text-left")}>
            <h2 className="text-2xl font-bold text-foreground">{titles[mode]}</h2>
            <p className="text-muted-foreground text-sm">{descriptions[mode]}</p>
          </header>

          <ScrollLockWrapper className="flex-1 overflow-y-auto pr-1 no-scrollbar">
            <form id="secretaryForm" onSubmit={handleSubmit} className="space-y-6 py-2" autoComplete="off">
              {/* Name Fields - Three Columns */}
              <div className="grid grid-cols-1 md:grid-cols-2  lg:grid-cols-3 gap-4">
                <div className="flex flex-col gap-2 text-start">
                  <label htmlFor={inputId('first_name')} className="text-sm font-semibold text-foreground/80 pr-1">{t('first_name', T)}</label>
                  <Input
                    id={inputId('first_name')}
                    name="firstName"
                    defaultValue={initialData?.user?.firstName}
                    required
                    disabled={mode === 'view'}
                    placeholder={t('first_name_placeholder', T)}
                    icon={<User size={18} />}
                    className={inputClass}
                    dir={isAr ? "rtl" : "ltr"}
                  />
                </div>
                <div className="flex flex-col gap-2 text-start">
                  <label htmlFor={inputId('surname')} className="text-sm font-semibold text-foreground/80 pr-1">{t('surname', T)}</label>
                  <Input
                    id={inputId('surname')}
                    name="surName"
                    defaultValue={initialData?.user?.surName}
                    required
                    disabled={mode === 'view'}
                    placeholder={t('surname_placeholder', T)}
                    icon={<User size={18} />}
                    className={inputClass}
                    dir={isAr ? "rtl" : "ltr"}
                  />
                </div>
                <div className="flex flex-col gap-2 text-start">
                  <label htmlFor={inputId('last_name')} className="text-sm font-semibold text-foreground/80 pr-1">{t('last_name', T)}</label>
                  <Input
                    id={inputId('last_name')}
                    name="lastName"
                    defaultValue={initialData?.user?.lastName}
                    required
                    disabled={mode === 'view'}
                    placeholder={t('last_name_placeholder', T)}
                    icon={<User size={18} />}
                    className={inputClass}
                    dir={isAr ? "rtl" : "ltr"}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Email */}
                <div className="flex flex-col gap-2 text-start">
                  <label htmlFor={inputId('email')} className="text-sm font-semibold text-foreground/80 pr-1">{t('email', T)}</label>
                  <Input
                    id={inputId('email')}
                    type="email"
                    name="email"
                    defaultValue={initialData?.user?.email}
                    required
                    disabled={mode === 'view' || mode === 'edit'}
                    placeholder={t('email_placeholder', T)}
                    icon={<Mail size={18} />}
                    className={inputClass}
                    dir="ltr"
                  />
                </div>

                <div className="flex flex-col gap-2 text-start">
                  <label htmlFor={inputId('phone')} className="text-sm font-semibold text-foreground/80 pr-1">{t('phone', T)}</label>
                  <Input
                    id={inputId('phone')}
                    name="phoneNumber"
                    defaultValue={formatPhoneForDisplay(initialData?.user?.phoneNumber || '')}
                    required
                    disabled={mode === 'view'}
                    placeholder="9627XXXXXXXX"
                    icon={<Phone size={18} />}
                    className={inputClass}
                    dir="ltr"
                  />
                  {mode !== 'view' && (
                    <p className="text-[11px] text-[#0B5A8E] mt-0.5 leading-relaxed font-semibold">
                      {isAr
                        ? "* يرجى إدخال رقم هاتف أردني صحيح (مثال: 962791234567)"
                        : "* Please enter a valid Jordanian phone number (e.g. 962791234567)"
                      }
                    </p>
                  )}
                </div>
              </div>

              {/* Password field only on add mode */}
              {/* Password field only on add mode */}
              {mode === 'add' && (() => {
                const passwordCriteria = [
                  { label: isAr ? '8 أحرف على الأقل' : 'Min 8 chars', met: password.length >= 8 },
                  { label: isAr ? 'حرف كبير (A-Z)' : 'Uppercase (A-Z)', met: /[A-Z]/.test(password) },
                  { label: isAr ? 'رقم واحد (0-9)' : 'Number (0-9)', met: /[0-9]/.test(password) },
                  { label: isAr ? 'رمز خاص (!@#)' : 'Special char (!@#)', met: /[!@#$%^&*(),.?":{}|<>]/.test(password) },
                ];
                const strengthPoints = passwordCriteria.filter(c => c.met).length;
                const getStrengthColor = () => {
                  if (strengthPoints <= 1) return 'bg-destructive';
                  if (strengthPoints <= 3) return 'bg-amber-500';
                  return 'bg-emerald-500';
                };
                return (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="flex flex-col gap-2 text-start">
                      <label htmlFor={inputId('password')} className="text-sm font-semibold text-foreground/80 pr-1">{t('password', T)}</label>
                      <Input
                        id={inputId('password')}
                        type="password"
                        name="password"
                        required
                        placeholder="••••••••"
                        className={inputClass}
                        dir="ltr"
                        value={password}
                        error={passwordError || undefined}
                        onChange={(e) => {
                          if (passwordError) setPasswordError(null);
                          setPassword(e.target.value);
                        }}
                      />
                      {password.length > 0 && (
                        <div className="mt-2 animate-fade">
                          <div className="flex gap-2">
                            {passwordCriteria.map((criterion, i) => (
                              <div key={i} className="flex-1 flex flex-col gap-1.5">
                                <div
                                  className={cn(
                                    "h-1 rounded-full transition-all duration-500",
                                    criterion.met ? getStrengthColor() : "bg-slate-100"
                                  )}
                                />
                                <div className="flex items-center justify-center gap-0.5 px-0.5">
                                  {criterion.met ? (
                                    <Check className="size-2.5 text-emerald-500 stroke-[4px] shrink-0" />
                                  ) : (
                                    <X className="size-2.5 text-slate-300 stroke-[4px] shrink-0" />
                                  )}
                                  <span className={cn(
                                    "text-[8px] transition-colors leading-tight text-center font-semibold",
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
                  </div>
                );
              })()}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Gender */}
                <div className="flex flex-col gap-2 text-start">
                  <label className="text-sm font-semibold text-foreground/80 pr-1">{t('gender', T)}</label>
                  <Select name="gender" required value={selectedGender} onValueChange={setSelectedGender} disabled={mode === 'view'}>
                    <SelectTrigger className={cn((selectedGender) && "text-foreground font-bold")}>
                      <SelectValue placeholder={t('choose_gender', T)} />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl z-[600]" dir={isAr ? "rtl" : "ltr"}>
                      <SelectItem value="MALE">{isAr ? "ذكر" : "Male"}</SelectItem>
                      <SelectItem value="FEMALE">{isAr ? "أنثى" : "Female"}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* DOB Pickr */}
                <div className="flex flex-col gap-2 text-start">
                  <label className={cn("text-sm font-semibold text-foreground/80", isAr ? "pr-1" : "pl-1")}>{t('dob', T)}</label>
                  <DatePicker
                    name="dateOfBirth"
                    required
                    value={selectedDob}
                    onChange={([date]) => setSelectedDob(date ? date.toISOString().split('T')[0] : '')}
                    disabled={mode === 'view'}
                    options={{
                      locale: isAr ? Arabic : undefined,
                      dateFormat: "d F Y",
                      disableMobile: true,
                      maxDate: "today",
                      formatDate: (date: Date) => format(date, "d MMMM yyyy", { locale: currentLocale })
                    }}
                    placeholder={t('select_date', T)}
                    icon={<FaCalendarAlt className="size-4" />}
                    className={cn(isAr ? "text-right" : "text-left", mode === "view" && "opacity-50 pointer-events-none")}
                  />
                </div>
              </div>

              {/* Permissions Section */}
              <PermissionsFieldset
                selectedPermissions={selectedPermissions}
                onChange={setSelectedPermissions}
                disabled={mode === 'view'}
                titleAr={t('permissions', T)}
                titleEn={t('permissions', T)}
                descriptionAr={t('permissions_desc', T)}
                descriptionEn={t('permissions_desc', T)}
              />
            </form>
          </ScrollLockWrapper>

          <aside className="flex gap-4 pt-6 border-t border-border mt-6">
            {mode !== 'view' ? (
              <>
                <Button
                  type="submit"
                  form="secretaryForm"
                  disabled={loading}
                  className="flex-1 h-12 rounded-xl text-base shadow-lg shadow-primary/20"
                >
                  {mode === 'add' ? <Plus size={20} className={cn(isAr ? "ml-2" : "mr-2")} /> : <Save size={20} className={cn(isAr ? "ml-2" : "mr-2")} />}
                  {loading ? t('loading', T) : (mode === 'add' ? t('add_employee', T) : t('save_changes', T))}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  disabled={loading}
                  onClick={handleClose}
                  className="flex-1 h-12 rounded-xl text-base"
                >
                  {t('cancel', T)}
                </Button>
              </>
            ) : (
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                className="flex-1 h-12 rounded-xl text-base"
              >
                {t('close', T)}
              </Button>
            )}
          </aside>
        </figure>
      </div>
    </Portal>
  );
};

export default SecretaryDialog
