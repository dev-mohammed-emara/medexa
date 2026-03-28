import { Check, Mail, Phone, Plus, Save, User, X } from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'
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

import { useBroadcast } from '../../hooks/useBroadcast';

interface Secretary {
  id: number;
  name_ar: string;
  name_en: string;
  role_ar: string;
  role_en: string;
  status: string;
  phone: string;
  email: string;
  gender_ar: string;
  gender_en: string;
  dob: string;
  description_ar: string;
  description_en: string;
  permissions?: string[];
}

interface SecretaryDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (data: Partial<Secretary>) => void;
  mode: 'add' | 'edit' | 'view';
  initialData?: Secretary | null;
}

const SecretaryDialog = ({ isOpen, onClose, onConfirm, mode, initialData }: SecretaryDialogProps) => {
  const { isAr, t } = useLanguage();
  const { broadcast } = useBroadcast();
  const T = secretaryTranslations;
  const overlayRef = useRef<HTMLDivElement>(null);
  const [selectedRole, setSelectedRole] = useState((isAr ? initialData?.role_ar : initialData?.role_en) || "");
  const [selectedGender, setSelectedGender] = useState((isAr ? initialData?.gender_ar : initialData?.gender_en) || "");
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
      const handlePopState = () => handleClose();
      window.addEventListener('popstate', handlePopState);
      return () => {
        document.body.style.overflow = 'unset';
        window.removeEventListener('popstate', handlePopState);
      };
    }
  }, [isOpen, handleClose]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === 'view') {
      handleClose();
      return;
    }
    const formData = new FormData(e.target as HTMLFormElement);
    const formDataObj = Object.fromEntries(formData.entries());

    const data: Partial<Secretary> = {
      ...initialData,
      name_ar: isAr ? formDataObj['secretary-name'] as string : initialData?.name_ar || '',
      name_en: !isAr ? formDataObj['secretary-name'] as string : initialData?.name_en || '',
      email: formDataObj['secretary-email'] as string,
      phone: formDataObj['secretary-phone'] as string,
      role_ar: isAr ? selectedRole : initialData?.role_ar || '',
      role_en: !isAr ? selectedRole : initialData?.role_en || '',
      gender_ar: isAr ? selectedGender : initialData?.gender_ar || '',
      gender_en: !isAr ? selectedGender : initialData?.gender_en || '',
      status: 'active',
    };

    onConfirm(data);
    broadcast({ type: 'DATA_UPDATE', module: 'secretaries' });
    handleClose();
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
        onClick={(e) => e.target === overlayRef.current && handleClose()}
      >
        <figure
          role="dialog"
          className={cn(
            "bg-background relative w-full rounded-2xl border p-8 shadow-2xl max-w-xl max-h-[90vh] flex flex-col outline-none",
            isClosing ? "animate-scaleDownOut" : "animate-scaleUp"
          )}
        >
          <button
            onClick={handleClose}
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Name */}
                <div className="flex flex-col gap-2 text-start">
                  <label htmlFor={inputId('name')} className="text-sm font-semibold text-foreground/80 pr-1">{t('full_name', T)}</label>
                  <Input
                    id={inputId('name')}
                    name="secretary-name"
                    defaultValue={isAr ? initialData?.name_ar : initialData?.name_en}
                    required
                    disabled={mode === 'view'}
                    placeholder={t('name_placeholder', T)}
                    icon={<User size={18} />}
                    className={inputClass}
                  />
                </div>

                {/* Email */}
                <div className="flex flex-col gap-2 text-start">
                  <label htmlFor={inputId('email')} className="text-sm font-semibold text-foreground/80 pr-1">{t('email', T)}</label>
                  <Input
                    id={inputId('email')}
                    type="email"
                    name="secretary-email"
                    defaultValue={initialData?.email}
                    required
                    disabled={mode === 'view'}
                    placeholder={t('email_placeholder', T)}
                    icon={<Mail size={18} />}
                    className={inputClass}
                  />
                </div>

                {/* Role */}
                <div className="flex flex-col gap-2 text-start">
                  <label className="text-sm font-semibold text-foreground/80 pr-1">{t('job_role', T)}</label>
                  <Select value={selectedRole} onValueChange={setSelectedRole} disabled={mode === 'view'}>
                    <SelectTrigger className={cn("rounded-xl h-12 bg-input-background transition-all focus:ring-4 focus:ring-primary/10", ((isAr ? initialData?.role_ar : initialData?.role_en) || selectedRole) && "text-foreground font-bold")}>
                      <SelectValue placeholder={t('choose_role', T)} />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl z-[600]" dir={isAr ? "rtl" : "ltr"}>
                      <SelectItem value="سكرتيرة رئيسية">{t('role_main', T)}</SelectItem>
                      <SelectItem value="استقبال">{t('role_reception', T)}</SelectItem>
                      <SelectItem value="محاسبة">{t('role_accounting', T)}</SelectItem>
                      <SelectItem value="إدارة عمليات">{t('role_operations', T)}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Phone */}
                <div className="flex flex-col gap-2 text-start">
                  <label htmlFor={inputId('phone')} className="text-sm font-semibold text-foreground/80 pr-1">{t('phone', T)}</label>
                  <Input
                    id={inputId('phone')}
                    name="secretary-phone"
                    defaultValue={initialData?.phone}
                    required
                    disabled={mode === 'view'}
                    placeholder="07XXXXXXXX"
                    icon={<Phone size={18} />}
                    className={inputClass}
                    dir="ltr"
                  />
                </div>

                {/* Gender */}
                <div className="flex flex-col gap-2 text-start">
                  <label className="text-sm font-semibold text-foreground/80 pr-1">{t('gender', T)}</label>
                  <Select value={selectedGender} onValueChange={setSelectedGender} disabled={mode === 'view'}>
                    <SelectTrigger className={cn("rounded-xl h-12 bg-input-background transition-all focus:ring-4 focus:ring-primary/10", ((isAr ? initialData?.gender_ar : initialData?.gender_en) || selectedGender) && "text-foreground font-bold")}>
                      <SelectValue placeholder={t('choose_gender', T)} />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl z-[600]" dir={isAr ? "rtl" : "ltr"}>
                      <SelectItem value={isAr ? "ذكر" : "Male"}>{t('male', T)}</SelectItem>
                      <SelectItem value={isAr ? "أنثى" : "Female"}>{t('female', T)}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Permissions */}
              <footer className="space-y-3 p-4 bg-muted/30 rounded-2xl border border-border text-start">
                <label className="text-lg font-bold block">{t('permissions', T)}</label>
                <p className="text-xs text-muted-foreground mb-3">{t('permissions_desc', T)}</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 px-1">
                  <PermissionCheckbox id="manageAppointments" label={t('perm_appointments', T)} defaultChecked={initialData?.permissions?.includes('manageAppointments') ?? true} disabled={mode === 'view'} />
                  <PermissionCheckbox id="managePatients" label={t('perm_patients', T)} defaultChecked={initialData?.permissions?.includes('managePatients') ?? true} disabled={mode === 'view'} />
                  <PermissionCheckbox id="medicalRecords" label={t('perm_records', T)} defaultChecked={initialData?.permissions?.includes('medicalRecords') ?? false} disabled={mode === 'view'} />
                  <PermissionCheckbox id="financialReports" label={t('perm_financial', T)} defaultChecked={initialData?.permissions?.includes('financialReports')} disabled={mode === 'view'} />
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
                  className="flex-1 h-12 rounded-xl text-base shadow-lg shadow-primary/20"
                >
                  {mode === 'add' ? <Plus size={20} className={cn(isAr ? "ml-2" : "mr-2")} /> : <Save size={20} className={cn(isAr ? "ml-2" : "mr-2")} />}
                  {mode === 'add' ? t('add_employee', T) : t('save_changes', T)}
                </Button>
                <Button
                  type="button"
                  variant="outline"
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
