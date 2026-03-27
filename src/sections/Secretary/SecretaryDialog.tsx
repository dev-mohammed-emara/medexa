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

interface Secretary {
  id: number;
  name: string;
  role: string;
  status: string;
  phone: string;
  email: string;
  initial: string;
  description?: string;
  gender?: string;
  dob?: string;
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
  const overlayRef = useRef<HTMLDivElement>(null);
  const [selectedRole, setSelectedRole] = useState(initialData?.role || "");
  const [selectedGender, setSelectedGender] = useState(initialData?.gender || "");
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
    const data = Object.fromEntries(formData.entries());

    onConfirm({
      ...initialData,
      name: data['secretary-name'] as string,
      email: data['secretary-email'] as string,
      phone: data['secretary-phone'] as string,
      role: selectedRole,
      gender: selectedGender,
      status: 'نشط',
    });
    handleClose();
  };

  const titles = { add: 'إضافة سكرتير/ة جديد', edit: 'تعديل بيانات السكرتارية', view: 'عرض بيانات السكرتارية' };
  const descriptions = { add: 'أدخل معلومات الحساب الجديد للسكرتارية', edit: 'قم بتحديث معلومات الدخول والصلاحيات', view: 'عرض معلومات حساب السكرتارية' };
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
        dir="rtl"
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
            className="absolute top-6 right-6 p-2 rounded-full hover:bg-muted transition-colors opacity-70 hover:opacity-100 outline-none z-20"
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
                <div className="flex flex-col gap-2">
                  <label htmlFor={inputId('name')} className="text-sm font-semibold text-foreground/80 pr-1">الاسم الكامل</label>
                  <Input
                    id={inputId('name')}
                    name="secretary-name"
                    defaultValue={initialData?.name}
                    required
                    disabled={mode === 'view'}
                    placeholder="أدخل اسم الموظف الرباعي"
                    icon={<User size={18} />}
                    className={inputClass}
                  />
                </div>

                {/* Email */}
                <div className="flex flex-col gap-2">
                  <label htmlFor={inputId('email')} className="text-sm font-semibold text-foreground/80 pr-1">البريد الإلكتروني</label>
                  <Input
                    id={inputId('email')}
                    type="email"
                    name="secretary-email"
                    defaultValue={initialData?.email}
                    required
                    disabled={mode === 'view'}
                    placeholder="أدخل البريد الإلكتروني"
                    icon={<Mail size={18} />}
                    className={inputClass}
                  />
                </div>

                {/* Role */}
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-semibold text-foreground/80 pr-1">الدور الوظيفي</label>
                  <Select value={selectedRole} onValueChange={setSelectedRole} disabled={mode === 'view'}>
                    <SelectTrigger className={cn("rounded-xl h-12 bg-input-background transition-all focus:ring-4 focus:ring-primary/10", (initialData?.role || selectedRole) && "text-foreground font-bold")}>
                      <SelectValue placeholder="اختر الدور" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl text-right z-[600]">
                      <SelectItem value="سكرتيرة رئيسية">سكرتيرة رئيسية</SelectItem>
                      <SelectItem value="استقبال">استقبال</SelectItem>
                      <SelectItem value="محاسبة">محاسبة</SelectItem>
                      <SelectItem value="إدارة عمليات">إدارة عمليات</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Phone */}
                <div className="flex flex-col gap-2">
                  <label htmlFor={inputId('phone')} className="text-sm font-semibold text-foreground/80 pr-1">رقم الهاتف</label>
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
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-semibold text-foreground/80 pr-1">الجنس</label>
                  <Select value={selectedGender} onValueChange={setSelectedGender} disabled={mode === 'view'}>
                    <SelectTrigger className={cn("rounded-xl h-12 bg-input-background transition-all focus:ring-4 focus:ring-primary/10", (initialData?.gender || selectedGender) && "text-foreground font-bold")}>
                      <SelectValue placeholder="اختر الجنس" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl text-right z-[600]">
                      <SelectItem value="ذكر">ذكر</SelectItem>
                      <SelectItem value="أنثى">أنثى</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Permissions */}
              <footer className="space-y-3 p-4 bg-muted/30 rounded-2xl border border-border">
                <label className="text-lg font-bold block">الصلاحيات المتاحة</label>
                <p className="text-xs text-muted-foreground mb-3">حدد صلاحيات الوصول والمهمات الموكلة للسكرتير/ة</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 px-1">
                  <PermissionCheckbox id="manageAppointments" label="إدارة المواعيد" defaultChecked={initialData?.permissions?.includes('manageAppointments') ?? true} disabled={mode === 'view'} />
                  <PermissionCheckbox id="managePatients" label="إدارة المرضى" defaultChecked={initialData?.permissions?.includes('managePatients') ?? true} disabled={mode === 'view'} />
                  <PermissionCheckbox id="medicalRecords" label="السجلات الطبية" defaultChecked={initialData?.permissions?.includes('medicalRecords') ?? false} disabled={mode === 'view'} />
                  <PermissionCheckbox id="financialReports" label="التقارير المالية" defaultChecked={initialData?.permissions?.includes('financialReports')} disabled={mode === 'view'} />
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
                  {mode === 'add' ? <Plus size={20} className="ml-2" /> : <Save size={20} className="ml-2" />}
                  {mode === 'add' ? 'إضافة الموظف' : 'حفظ التعديلات'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleClose}
                  className="flex-1 h-12 rounded-xl text-base"
                >
                  إلغاء
                </Button>
              </>
            ) : (
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                className="flex-1 h-12 rounded-xl text-base"
              >
                إغلاق
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

export default SecretaryDialog;
