import { format } from 'date-fns'
import { ar } from 'date-fns/locale'
import "flatpickr/dist/flatpickr.css"
import { Arabic } from "flatpickr/dist/l10n/ar.js"
import { Check, Eye, EyeOff, Mail, Phone, Plus, Printer, Save, User, X } from 'lucide-react'
import { FaCalendarAlt } from 'react-icons/fa'
import { useCallback, useEffect, useRef, useState } from 'react'
import Flatpickr from "react-flatpickr"
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
import { cn } from '../../utils/cn'
import Portal from '../../components/ui/Portal'

interface Doctor {
  id: number;
  name: string;
  specialty: string;
  status: string;
  phone: string;
  email: string;
  patients: number;
  revenue: string;
  initial: string;
  description?: string;
  gender?: string;
  dob?: string;
  permissions?: string[];
}

interface DoctorDialogProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: (data: Partial<Doctor>) => void
  mode: 'add' | 'edit' | 'view'
  initialData?: Doctor | null
}

const DoctorDialog = ({ isOpen, onClose, onConfirm, mode, initialData }: DoctorDialogProps) => {
  const overlayRef = useRef<HTMLDivElement>(null)
  const modalRef = useRef<HTMLDivElement>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [selectedSpecialty, setSelectedSpecialty] = useState(initialData?.specialty || "")
  const [selectedGender, setSelectedGender] = useState(initialData?.gender || "")
  const [selectedDob, setSelectedDob] = useState<string>(initialData?.dob || "")
  const [isClosing, setIsClosing] = useState(false)

  const handleClose = useCallback(() => {
    setIsClosing(true)
    setTimeout(() => {
      setIsClosing(false)
      onClose()
    }, 400)
  }, [onClose])

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
      window.history.pushState({ modalOpen: true }, '', '')
      const handlePopState = () => handleClose()
      window.addEventListener('popstate', handlePopState)
      return () => {
        document.body.style.overflow = 'unset'
        window.removeEventListener('popstate', handlePopState)
      }
    }
  }, [isOpen, handleClose])

  if (!isOpen) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (mode === 'view') {
      handleClose()
      return
    }
    const formData = new FormData(e.target as HTMLFormElement)
    const data = Object.fromEntries(formData.entries())
    data.specialty = selectedSpecialty
    data.gender = selectedGender
    data.dob = selectedDob
    const permissions: string[] = []
    const permissionCheckboxes = ['managePatients', 'manageAppointments', 'medicalRecords', 'financialReports']
    permissionCheckboxes.forEach(p => {
      const checkbox = (e.target as HTMLFormElement).querySelector(`#${p}`) as HTMLButtonElement
      if (checkbox?.dataset.state === 'checked') permissions.push(p)
    })
    onConfirm({ ...data, permissions, id: initialData?.id || Date.now() })
    handleClose()
  }

  const titles = { add: 'إضافة طبيب جديد', edit: 'تعديل بيانات الطبيب', view: 'تفاصيل الطبيب' }
  const descriptions = { add: 'أدخل المعلومات التفصيلية للطبيب الجديد', edit: 'قم بتحديث المعلومات التفصيلية للطبيب', view: 'عرض المعلومات التفصيلية للطبيب' }
  const inputId = (name: string) => `doctor-${name}-${mode}`

  // Style class for filled inputs as requested (Lil' darker)
  const inputClass = "rounded-xl h-12 text-foreground font-bold"

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
          ref={modalRef}
          role="dialog"
          className={cn(
            "bg-background relative w-full rounded-2xl border p-8 shadow-2xl max-w-xl max-h-[90vh] flex flex-col",
            isClosing ? "animate-scaleDownOut" : "animate-scaleUp"
          )}
        >
          <button onClick={handleClose} type="button" className="absolute top-6 right-6 p-2 rounded-full hover:bg-muted transition-colors opacity-70 hover:opacity-100 outline-none z-20">
            <X size={20} />
          </button>

          <header data-slot="dialog-header" className="flex flex-col gap-2 text-center mb-6">
            <h2 className="text-2xl font-bold text-foreground">{titles[mode]}</h2>
            <p className="text-muted-foreground text-sm">{descriptions[mode]}</p>
          </header>

          <ScrollLockWrapper className="flex-1 overflow-y-auto pr-1 no-scrollbar">
            <form id="doctorForm" onSubmit={handleSubmit} className="space-y-6 py-2" autoComplete="off">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex flex-col gap-2">
                  <label htmlFor={inputId('name')} className="text-sm font-semibold text-foreground/80 pr-1">الاسم</label>
                  <Input id={inputId('name')} name="doctor-name" defaultValue={initialData?.name} required disabled={mode === 'view'} placeholder="أدخل اسم الطبيب الرباعي" icon={<User size={18} />} className={inputClass} />
                </div>
                <div className="flex flex-col gap-2">
                  <label htmlFor={inputId('email')} className="text-sm font-semibold text-foreground/80 pr-1">البريد الإلكتروني</label>
                  <Input id={inputId('email')} type="email" name="doctor-email" defaultValue={initialData?.email} required disabled={mode === 'view'} placeholder="أدخل البريد الإلكتروني" icon={<Mail size={18} />} className={inputClass} />
                </div>
                <div className="flex flex-col gap-2">
                  <label htmlFor={inputId('phone')} className="text-sm font-semibold text-foreground/80 pr-1">رقم الهاتف</label>
                  <Input id={inputId('phone')} name="doctor-phone" defaultValue={initialData?.phone} required disabled={mode === 'view'} placeholder="07XXXXXXXX" icon={<Phone size={18} />} className={inputClass} dir="ltr" />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-semibold text-foreground/80 pr-1">التخصص الطبي</label>
                  <Select value={selectedSpecialty} onValueChange={setSelectedSpecialty} disabled={mode === 'view'}>
                    <SelectTrigger className={cn("rounded-xl h-12 bg-input-background transition-all focus:ring-4 focus:ring-primary/10", (initialData?.specialty || selectedSpecialty) && "text-foreground font-bold")}>
                      <SelectValue placeholder="اختر التخصص" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl text-right z-[600]">
                      <SelectItem value="طب عام">طب عام</SelectItem>
                      <SelectItem value="أطفال">أطفال</SelectItem>
                      <SelectItem value="أسنان">أسنان</SelectItem>
                      <SelectItem value="باطني">باطني</SelectItem>
                      <SelectItem value="جراحة">جراحة</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label htmlFor={inputId('description')} className="text-sm font-semibold text-foreground/80 pr-1">وصف الطبيب</label>
                <textarea
                  id={inputId('description')}
                  name="doctor-description"
                  defaultValue={initialData?.description}
                  disabled={mode === 'view'}
                  className={cn("w-full min-h-24 p-4 rounded-xl border border-border bg-input-background text-sm outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all resize-none disabled:opacity-50 placeholder:text-muted-foreground", initialData?.description && "text-foreground font-bold")}
                  placeholder="الشهادات، الخبرات، التخصصات الفرعية..."
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-semibold text-foreground/80 pr-1">تاريخ الميلاد</label>
                  <div className="relative group flex items-center justify-between h-12 bg-input-background border border-border rounded-xl px-4 transition-all focus-within:ring-4 focus-within:ring-primary/10">
                    <Flatpickr
                      value={selectedDob}
                      onChange={([date]) => setSelectedDob(date ? date.toISOString().split('T')[0] : '')}
                      disabled={mode === 'view'}
                      options={{
                        locale: Arabic,
                        dateFormat: "d F Y",
                        disableMobile: true,
                        maxDate: "today",
                        formatDate: (date: Date) => format(date, "d MMMM yyyy", { locale: ar })
                      }}
                      placeholder="اختر التاريخ"
                      className={cn("flex-1 bg-transparent border-none outline-none text-right font-bold text-base md:text-sm h-full", mode === "view" && "opacity-50 pointer-events-none")}
                    />
                    <FaCalendarAlt className="text-muted-foreground pointer-events-none group-focus-within:text-primary transition-colors size-4" />
                  </div>
                </div>
              </div>

              {mode !== 'view' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex flex-col gap-2">
                    <label htmlFor={inputId('password')} className="text-sm font-semibold text-foreground/80 pr-1">كلمة المرور</label>
                    <div className="relative group">
                      <Input id={inputId('password')} type={showPassword ? "text" : "password"} name="doctor-password" placeholder="••••••••" autoComplete="new-password" className={cn(inputClass, "pl-12")} />
                      <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors outline-none z-10">
                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                      </button>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <label htmlFor={inputId('confirm-password')} className="text-sm font-semibold text-foreground/80 pr-1">تأكيد كلمة المرور</label>
                    <div className="relative group">
                      <Input id={inputId('confirm-password')} type={showConfirmPassword ? "text" : "password"} name="doctor-confirm-password" placeholder="••••••••" autoComplete="new-password" className={cn(inputClass, "pl-12")} />
                      <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors outline-none z-10">
                        {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              <footer className="space-y-3 p-4 bg-muted/30 rounded-2xl border border-border">
                <label className="text-lg font-bold block">الصلاحيات</label>
                <p className="text-xs text-muted-foreground mb-3">حدد الصلاحيات المتاحة للطبيب في النظام</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 px-1">
                  <PermissionCheckbox id="managePatients" label="إدارة المرضى" defaultChecked={initialData?.permissions?.includes('managePatients') ?? true} disabled={mode === 'view'} />
                  <PermissionCheckbox id="manageAppointments" label="إدارة المواعيد" defaultChecked={initialData?.permissions?.includes('manageAppointments') ?? true} disabled={mode === 'view'} />
                  <PermissionCheckbox id="medicalRecords" label="السجلات الطبية" defaultChecked={initialData?.permissions?.includes('medicalRecords') ?? true} disabled={mode === 'view'} />
                  <PermissionCheckbox id="financialReports" label="التقارير المالية" defaultChecked={initialData?.permissions?.includes('financialReports')} disabled={mode === 'view'} />
                </div>
              </footer>
            </form>
          </ScrollLockWrapper>

          <aside className="flex gap-4 pt-6 border-t border-border mt-6">
            {mode === 'view' ? (
              <Button type="button" onClick={() => window.print()} className="flex-1 h-12 rounded-xl text-base shadow-lg shadow-primary/20">
                <Printer size={20} className="ml-2" /> طباعة التقرير
              </Button>
            ) : (
              <Button type="submit" form="doctorForm" className="flex-1 h-12 rounded-xl text-base shadow-lg shadow-primary/20">
                {mode === 'add' ? <Plus size={20} className="ml-2" /> : <Save size={20} className="ml-2" />}
                {mode === 'add' ? 'إضافة الطبيب' : 'حفظ التعديلات'}
              </Button>
            )}
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              className="flex-1 h-12 rounded-xl text-base"
            >
              {mode === 'view' ? 'إغلاق' : 'إلغاء'}
            </Button>
          </aside>
        </figure>
      </div>
    </Portal>
  )
}

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

export default DoctorDialog
