import { format } from 'date-fns'
import { ar } from 'date-fns/locale'
import "flatpickr/dist/flatpickr.css"
import { Arabic } from "flatpickr/dist/l10n/ar.js"
import { Check, Mail, Phone, Plus, Save, User, X } from 'lucide-react'
import { FaCalendarAlt } from 'react-icons/fa'
import { useCallback, useEffect, useRef, useState } from 'react'
import Flatpickr from "react-flatpickr"
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

  const [password, setPassword] = useState("");

  // Sync initialData values when dialog opens or changes
  useEffect(() => {
    if (initialData) {
      setSelectedGender(initialData.user?.gender || "");
      setSelectedDob(initialData.user?.dateOfBirth || "");
    } else {
      setSelectedGender("");
      setSelectedDob("");
      setPassword("");
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

      const permissions: string[] = []
      const permissionCheckboxes = ['MANAGE_DOCTORS', 'MANAGE_SECRETARIES', 'MANAGE_CLINIC', 'MANAGE_PATIENTS', 'MANAGE_APPOINTMENTS', 'MANAGE_TRANSACTIONS', 'MANAGE_MEDICAL_RECORDS']
      permissionCheckboxes.forEach(p => {
        const checkbox = (e.target as HTMLFormElement).querySelector(`#${p}`) as HTMLButtonElement
        if (checkbox?.dataset.state === 'checked') permissions.push(p)
      })

      const formatPhone = (phoneStr: string) => {
        let cleaned = phoneStr.trim().replace(/[\s\-\(\)]/g, '');
        if (cleaned.startsWith('00')) {
          cleaned = '+' + cleaned.substring(2);
        }
        if (!cleaned.startsWith('+')) {
          cleaned = '+' + cleaned;
        }
        return cleaned;
      };

      // Construct API payload
      const userPayload: any = {
        firstName: String(formDataObj.firstName),
        surName: String(formDataObj.surName),
        lastName: String(formDataObj.lastName),
        email: String(formDataObj.email),
        phoneNumber: formatPhone(String(formDataObj.phoneNumber)),
        gender: selectedGender || 'MALE',
        dateOfBirth: selectedDob || '1990-01-01',
        permissions: permissions.length > 0 ? permissions : ['MANAGE_DOCTORS', 'MANAGE_SECRETARIES']
      }

      // Password is required for adding new secretary
      if (mode === 'add') {
        userPayload.password = String(formDataObj.password)
      }

      const bodyPayload = {
        user: userPayload
      }

      let responseData: ApiSecretary
      if (mode === 'add') {
        responseData = await createSecretary(bodyPayload)
        window.showToast?.(t('toast_add_success', T), 'success')
      } else {
        // Edit mode (PUT)
        if (!initialData?.uuid) {
          throw new Error('Missing secretary UUID for update')
        }
        responseData = await updateSecretary(initialData.uuid, bodyPayload)
        window.showToast?.(t('toast_update_success', T), 'success')
      }

      onConfirm(responseData);
      broadcast({ type: 'DATA_UPDATE', module: 'secretaries' });
      handleClose();
    } catch (error: any) {
      console.error(error)
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
               isAr ? "right-6" : "left-6"
            )}
          >
            <X size={20} />
            <span className="sr-only">Close</span>
          </button>

          <header data-slot="dialog-header" className="flex flex-col gap-2 text-center mb-6">
            <h2 className="text-2xl font-bold text-foreground">{titles[mode]}</h2>
            <p className="text-muted-foreground text-sm">{descriptions[mode]}</p>
          </header>

          <ScrollLockWrapper className="flex-1 overflow-y-auto pr-1 no-scrollbar">
            <form id="secretaryForm" onSubmit={handleSubmit} className="space-y-6 py-2" autoComplete="off">
              {/* Name Fields - Three Columns */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                    disabled={mode === 'view'}
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
                    defaultValue={initialData?.user?.phoneNumber}
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
                        onChange={(e) => setPassword(e.target.value)}
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
                  <Select value={selectedGender} onValueChange={setSelectedGender} disabled={mode === 'view'}>
                    <SelectTrigger className={cn("rounded-xl h-12 bg-input-background transition-all focus:ring-4 focus:ring-primary/10", (selectedGender) && "text-foreground font-bold")}>
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
                  <label className="text-sm font-semibold text-foreground/80 pr-1">{t('dob', T)}</label>
                  <div className={cn("relative group flex items-center justify-between h-12 bg-input-background border border-border rounded-xl px-4 transition-all focus-within:ring-4 focus-within:ring-primary/10", isAr ? "flex-row" : "flex-row-reverse")}>
                    <Flatpickr
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
                      className={cn("flex-1 bg-transparent border-none outline-none font-bold text-base md:text-sm h-full", isAr ? "text-right" : "text-left", mode === "view" && "opacity-50 pointer-events-none")}
                    />
                    <FaCalendarAlt className="text-muted-foreground pointer-events-none group-focus-within:text-primary transition-colors size-4" />
                  </div>
                </div>
              </div>

              {/* Permissions */}
              <footer className="space-y-3 p-4 bg-muted/30 rounded-2xl border border-border text-start">
                <label className="text-lg font-bold block">{t('permissions', T)}</label>
                <p className="text-xs text-muted-foreground mb-3">{t('permissions_desc', T)}</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 px-1">
                  <PermissionCheckbox id="MANAGE_DOCTORS" label={isAr ? "إدارة الأطباء" : "Manage Doctors"} defaultChecked={initialData?.user?.permissions?.includes('MANAGE_DOCTORS') ?? true} disabled={mode === 'view'} />
                  <PermissionCheckbox id="MANAGE_SECRETARIES" label={isAr ? "إدارة السكرتاريا" : "Manage Secretaries"} defaultChecked={initialData?.user?.permissions?.includes('MANAGE_SECRETARIES') ?? true} disabled={mode === 'view'} />
                  <PermissionCheckbox id="MANAGE_CLINIC" label={isAr ? "إدارة العيادة" : "Manage Clinic"} defaultChecked={initialData?.user?.permissions?.includes('MANAGE_CLINIC') ?? true} disabled={mode === 'view'} />
                  <PermissionCheckbox id="MANAGE_PATIENTS" label={isAr ? "إدارة المرضى" : "Manage Patients"} defaultChecked={initialData?.user?.permissions?.includes('MANAGE_PATIENTS') ?? false} disabled={mode === 'view'} />
                  <PermissionCheckbox id="MANAGE_APPOINTMENTS" label={isAr ? "إدارة المواعيد" : "Manage Appointments"} defaultChecked={initialData?.user?.permissions?.includes('MANAGE_APPOINTMENTS')} disabled={mode === 'view'} />
                  <PermissionCheckbox id="MANAGE_TRANSACTIONS" label={isAr ? "إدارة المعاملات المالية" : "Manage Transactions"} defaultChecked={initialData?.user?.permissions?.includes('MANAGE_TRANSACTIONS') ?? true} disabled={mode === 'view'} />
                  <PermissionCheckbox id="MANAGE_MEDICAL_RECORDS" label={isAr ? "إدارة السجلات الطبية" : "Manage Medical Records"} defaultChecked={initialData?.user?.permissions?.includes('MANAGE_MEDICAL_RECORDS') ?? true} disabled={mode === 'view'} />
                </div>
              </footer>
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

const PermissionCheckbox = ({ id, label, defaultChecked = false, disabled = false }: { id: string, label: string, defaultChecked?: boolean, disabled?: boolean }) => {
  const [checked, setChecked] = useState(defaultChecked)
  return (
    <div className="flex items-center gap-3 py-1">
      <button
        type="button"
        id={id}
        disabled={disabled}
        data-state={checked ? 'checked' : 'unchecked'}
        onClick={() => setChecked(!checked)}
        className={cn(
          "peer size-5 shrink-0 rounded-md border shadow-xs transition-all outline-none focus-visible:ring-4 focus-visible:ring-primary/10 disabled:cursor-not-allowed disabled:opacity-50 flex items-center justify-center",
          checked ? "bg-primary text-white border-primary" : "bg-input-background border-border hover:border-primary/50"
        )}
      >
        {checked && <Check size={16} className="stroke-[3px]" />}
      </button>
      <label htmlFor={id} className="text-sm cursor-pointer select-none font-semibold text-foreground/80">{label}</label>
    </div>
  )
}

export default SecretaryDialog
