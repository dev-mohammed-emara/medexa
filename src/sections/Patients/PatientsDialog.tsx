import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import "flatpickr/dist/flatpickr.css";
import { Arabic } from "flatpickr/dist/l10n/ar.js";
import { FileText, MapPin, Phone, Plus, Printer, Save, User, X } from 'lucide-react';
import { FaCalendarAlt } from 'react-icons/fa';
import { useCallback, useEffect, useRef, useState } from 'react';
import Flatpickr from "react-flatpickr";
import { Button } from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import ScrollLockWrapper from '../../components/ui/ScrollLockWrapper';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import type { Patient } from '../../constants/Patients_dummy';
import { cn } from '../../utils/cn';
import Portal from '../../components/ui/Portal';

interface PatientsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (data: Partial<Patient>) => void;
  mode: 'add' | 'edit' | 'view';
  initialData?: Patient | null;
}

const PatientsDialog = ({ isOpen, onClose, onConfirm, mode, initialData }: PatientsDialogProps) => {
  const overlayRef = useRef<HTMLDivElement>(null);
  const [isClosing, setIsClosing] = useState(false);
  const [selectedGender, setSelectedGender] = useState(initialData?.gender || "");
  const [selectedDob, setSelectedDob] = useState<string>(initialData?.dob || "");

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
      name: data['name'] as string,
      phone: data['phone'] as string,
      gender: selectedGender,
      dob: selectedDob,
      address: data['address'] as string,
      notes: data['notes'] as string,
      age: calculateAge(selectedDob) || initialData?.age || 0,
    });
    handleClose();
  };

  const calculateAge = (dob: string) => {
    if (!dob) return 0;
    const birthDate = new Date(dob);
    if (isNaN(birthDate.getTime())) return 0;
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const titles = { add: 'إضافة مريض جديد', edit: 'تعديل بيانات المريض', view: 'عرض بيانات المريض' };
  const descriptions = { add: 'أدخل المعلومات الكاملة للمريض الجديد في النظام', edit: 'قم بتحديث سجل المعلومات الخاص بالمريض', view: 'عرض السجل الطبي والمعلومات الشخصية للمريض' };

  return (
    <Portal>
      <div
        ref={overlayRef}
        className={cn(
          "fixed inset-0 z-500 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4",
          isClosing ? "animate-fadeOut" : "animate-fade"
        )}
        dir="rtl"
        onClick={(e) => e.target === overlayRef.current && handleClose()}
      >
        <div
          role="dialog"
          className={cn(
            "bg-background relative w-full rounded-2xl border p-8 shadow-2xl max-w-2xl max-h-[90vh] flex flex-col",
            isClosing ? "animate-scaleDownOut" : "animate-scaleUp"
          )}
        >
          <button
            onClick={handleClose}
            type="button"
            className="absolute top-6 right-6 p-2 rounded-full hover:bg-muted transition-colors opacity-70 hover:opacity-100 outline-none z-20"
          >
            <X className="size-5" />
            <span className="sr-only">Close</span>
          </button>

          <header data-slot="dialog-header" className="flex flex-col gap-2 text-center mb-6">
            <h2 data-slot="dialog-title" className="text-2xl font-bold text-foreground">
              {titles[mode]}
            </h2>
            <p className="text-muted-foreground text-sm">{descriptions[mode]}</p>
          </header>

          <ScrollLockWrapper className="z-500 overflow-visible overflow-y-auto pr-1 no-scrollbar">
            <form id="patientForm" onSubmit={handleSubmit} className="py-2" autoComplete="off">
              <article className="space-y-6">
                <div className="flex flex-col xs:grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Name */}
                  <div className="flex flex-col gap-2 col-span-2">
                    <label className="text-sm font-semibold text-foreground/80 pr-1">اسم المريض</label>
                    <Input
                      name="name"
                      defaultValue={initialData?.name || ""}
                      required
                      disabled={mode === 'view'}
                      placeholder="أدخل الاسم الرباعي"
                      icon={<User size={18} />}
                      className="font-bold rounded-xl h-12"
                    />
                  </div>

                  {/* Phone */}
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-semibold text-foreground/80 pr-1">رقم الهاتف</label>
                    <Input
                      name="phone"
                      defaultValue={initialData?.phone || ""}
                      required
                      disabled={mode === 'view'}
                      placeholder="07XXXXXXXX"
                      dir="ltr"
                      icon={<Phone size={18} />}
                      className="font-bold rounded-xl h-12"
                    />
                  </div>

                  {/* Gender */}
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-semibold text-foreground/80 pr-1">الجنس</label>
                    <Select value={selectedGender} onValueChange={setSelectedGender} disabled={mode === 'view'}>
                      <SelectTrigger className={cn("rounded-xl h-12 bg-input-background transition-all focus:ring-4 focus:ring-primary/10", (initialData?.gender || selectedGender) && "text-foreground font-bold")}>
                        <SelectValue placeholder="اختر الجنس" />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl text-right z-600">
                        <SelectItem value="ذكر">ذكر</SelectItem>
                        <SelectItem value="أنثى">أنثى</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* DOB */}
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
                        className={cn(
                          "flex-1 bg-transparent border-none outline-none text-right font-bold h-full text-base md:text-sm",
                          mode === 'view' && "opacity-50 cursor-not-allowed"
                        )}
                      />
                      <FaCalendarAlt className="text-muted-foreground pointer-events-none group-focus-within:text-primary transition-colors size-[18px]" />
                    </div>
                  </div>

                  {/* Address */}
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-semibold text-foreground/80 pr-1">العنوان</label>
                    <Input
                      name="address"
                      defaultValue={initialData?.address || ""}
                      disabled={mode === 'view'}
                      placeholder="المدينة، المنطقة، الشارع"
                      icon={<MapPin size={18} />}
                      className="font-bold rounded-xl h-12"
                    />
                  </div>

                  {/* Notes */}
                  <div className="flex flex-col gap-2 col-span-2">
                    <label className="text-sm font-semibold text-foreground/80 pr-1">ملاحظات طبية / إضافية</label>
                    <div className="relative group">
                      <textarea
                        name="notes"
                        defaultValue={initialData?.notes || ""}
                        disabled={mode === 'view'}
                        className={cn(
                          "w-full min-h-24 p-4 pr-12 rounded-xl border border-border bg-input-background text-sm outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all resize-none disabled:opacity-50 placeholder:text-muted-foreground font-bold"
                        )}
                        placeholder="أدخل أي ملاحظات طبية أو حساسية..."
                        rows={3}
                      />
                      <FileText className="absolute right-4 top-4 text-muted-foreground pointer-events-none group-focus-within:text-primary transition-colors size-[18px]" />
                    </div>
                  </div>
                </div>
              </article>
            </form>
          </ScrollLockWrapper>

          <footer className="flex gap-4 pt-6 border-t border-border mt-6">
            {mode === 'add' && (
              <>
                <Button type="submit" form="patientForm" className="flex-1 h-12 rounded-xl text-base shadow-lg shadow-primary/20">
                  <Plus size={20} className="ml-2" /> حفظ المريض
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
            )}
            {mode === 'edit' && (
              <>
                <Button type="submit" form="patientForm" className="flex-1 h-12 rounded-xl text-base shadow-lg shadow-primary/20">
                  <Save size={20} className="ml-2" /> تحديث البيانات
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
            )}
            {mode === 'view' && (
              <>
                <Button type="button" onClick={() => window.print()} className="flex-1 h-12 rounded-xl text-base shadow-lg shadow-primary/20">
                   <Printer size={20} className="ml-2" /> طباعة السجل
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleClose}
                  className="flex-1 h-12 rounded-xl text-base"
                >
                  إغلاق
                </Button>
              </>
            )}
          </footer>
        </div>
      </div>
    </Portal>
  );
};

export default PatientsDialog;
