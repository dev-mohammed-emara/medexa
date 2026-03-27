import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import "flatpickr/dist/flatpickr.css";
import { Arabic } from "flatpickr/dist/l10n/ar.js";
import { Calendar, Plus, Clock, X, User, Phone, Stethoscope, DollarSign } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import Flatpickr from "react-flatpickr";
import { Button } from '../../components/ui/Button';
import TimePicker from '../../components/ui/TimePicker';
import ScrollLockWrapper from '../../components/ui/ScrollLockWrapper';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import { cn } from '../../utils/cn';
import { statusConfig } from './constants';

export interface Appointment {
  id: number;
  patientName: string;
  doctorName: string;
  date: Date | string;
  time: string;
  status: string;
  patientNotes?: string;
  doctorNotes?: string;
  color?: 'amber' | 'emerald' | 'rose' | 'blue';
}

interface AppointmentsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (data: Partial<Appointment>) => void;
  mode: 'add' | 'edit' | 'view';
  initialData?: Appointment | null;
}

const AppointmentsDialog = ({ isOpen, onClose, onConfirm, mode, initialData }: AppointmentsDialogProps) => {
  const overlayRef = useRef<HTMLDivElement>(null);
  const [isClosing, setIsClosing] = useState(false);

  // Form States
  const [selectedDate, setSelectedDate] = useState<string>(
    initialData?.date ? (typeof initialData.date === 'string' ? initialData.date : initialData.date.toISOString().split('T')[0]) : ""
  );
  const [selectedTime, setSelectedTime] = useState<string>(initialData?.time || "");
  const [selectedStatus, setSelectedStatus] = useState(initialData?.status || "قيد الانتظار");
  const [selectedDoctor, setSelectedDoctor] = useState(initialData?.doctorName || "");
  const [selectedPatient, setSelectedPatient] = useState(initialData?.patientName || "");

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

  const handleSubmit = (e: React.BaseSyntheticEvent) => {
    e.preventDefault();
    if (mode === 'view') {
      handleClose();
      return;
    }

    onConfirm({
      patientName: selectedPatient,
      doctorName: selectedDoctor,
      date: selectedDate,
      time: selectedTime,
      status: selectedStatus,
    });

    window.showToast?.(mode === 'add' ? 'تم حفظ الموعد بنجاح' : 'تم تحديث الموعد بنجاح');
    handleClose();
  };

  const titles = { add: 'إضافة موعد جديد', edit: 'تعديل الموعد', view: 'تفاصيل الموعد' };
  const descriptions = {
    add: 'أدخل تفاصيل الموعد الجديد للمريض',
    edit: 'قم بتحديث بيانات الموعد المختار',
    view: 'عرض كافة تفاصيل الموعد والملاحظات الطبية'
  };

  return (
    <div
      ref={overlayRef}
      className={cn(
        "fixed inset-0 z-110 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4",
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

        <div data-slot="dialog-header" className="flex flex-col gap-2 text-left mb-6">
          <h2 data-slot="dialog-title" className="text-2xl font-bold text-foreground">
            {titles[mode]}
          </h2>
          <p className="text-muted-foreground text-sm">{descriptions[mode]}</p>
        </div>

        <ScrollLockWrapper className="flex-1 overflow-y-auto pr-1 no-scrollbar">
          {mode === 'view' ? (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="flex items-center gap-2 font-medium text-muted-foreground text-xs">اسم المريض</label>
                  <div className="flex items-center gap-2">
                    <User className="size-4 text-primary" />
                    <span className="font-medium">{initialData?.patientName || "محمد العمري"}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="flex items-center gap-2 font-medium text-muted-foreground text-xs">رقم الهاتف</label>
                  <div className="flex items-center gap-2" dir="ltr">
                    <Phone className="size-4 text-primary" />
                    <span className="font-medium">+962 79 123 4567</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="flex items-center gap-2 font-medium text-muted-foreground text-xs">اسم الطبيب</label>
                  <div className="flex items-center gap-2">
                    <Stethoscope className="size-4 text-primary" />
                    <span className="font-medium">{initialData?.doctorName || "د. ليلى الخطيب"}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="flex items-center gap-2 font-medium text-muted-foreground text-xs">وقت الموعد</label>
                  <div className="flex items-center gap-2">
                    <Clock className="size-4 text-primary" />
                    <span className="font-medium">{initialData?.time || "10:00"}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="flex items-center gap-2 font-medium text-muted-foreground text-xs">حالة الموعد</label>
                  {(() => {
                    const status = initialData?.status || "قيد الانتظار";
                    const config = statusConfig[status] || statusConfig['قيد الانتظار'];
                    return (
                      <span className={cn(
                        "inline-flex items-center justify-center rounded-lg px-3 py-1 text-xs font-bold w-fit border-2 shadow-sm transition-all animate-in fade-in zoom-in duration-300",
                        config.bg,
                        config.text,
                        config.border
                      )}>
                         <div className={cn("size-1.5 rounded-full ml-1.5", config.dotColor)} />
                        {status}
                      </span>
                    );
                  })()}
                </div>

                <div className="space-y-2">
                  <label className="flex items-center gap-2 font-medium text-muted-foreground text-xs">سعر الكشف</label>
                  <div className="flex items-center gap-2">
                    <DollarSign className="size-4 text-primary" />
                    <span className="font-medium">25 د.أ</span>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="flex items-center gap-2 font-medium text-muted-foreground text-xs">ملاحظات المريض</label>
                <div className="p-3 bg-muted/30 rounded-lg border border-border min-h-[60px]">
                  <p className="text-sm">{initialData?.patientNotes || "لا توجد ملاحظات"}</p>
                </div>
              </div>

              <div className="space-y-2">
                <label className="flex items-center gap-2 font-medium text-muted-foreground text-xs">ملاحظات الطبيب</label>
                <div className="p-3 bg-muted/30 rounded-lg border border-border min-h-[60px]">
                  <p className="text-sm">{initialData?.doctorNotes || "لا توجد ملاحظات"}</p>
                </div>
              </div>
            </div>
          ) : mode === 'edit' ? (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">حالة الموعد</label>
                <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                  <SelectTrigger className={cn("rounded-xl h-12 bg-input-background transition-all focus:ring-4 focus:ring-primary/10", (selectedStatus) && "text-foreground font-bold")}>
                    <SelectValue placeholder="حالة الموعد" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl text-right">
                    <SelectItem value="قيد الانتظار">
                      <div className="flex items-center gap-2">
                        <div className="size-2 rounded-full bg-amber-500" />
                        <span>قيد الانتظار</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="مكتمل">
                      <div className="flex items-center gap-2">
                        <div className="size-2 rounded-full bg-emerald-500" />
                        <span>مكتمل</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="ملغي">
                      <div className="flex items-center gap-2">
                        <div className="size-2 rounded-full bg-rose-500" />
                        <span>ملغي</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          ) : (
            <div className="space-y-6 py-2">
              <div className="grid grid-cols-2 gap-6">
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-semibold text-foreground/80 pr-1">المريض</label>
                  <Select value={selectedPatient} onValueChange={setSelectedPatient}>
                    <SelectTrigger className={cn("rounded-xl h-12 bg-input-background transition-all focus:ring-4 focus:ring-primary/10", (selectedPatient) && "text-foreground font-bold")}>
                      <SelectValue placeholder="اختر المريض" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl text-right" >
                      <SelectItem value="محمد أحمد">محمد أحمد</SelectItem>
                      <SelectItem value="سارة علي">سارة علي</SelectItem>
                      <SelectItem value="ياسين محمود">ياسين محمود</SelectItem>
                      <SelectItem value="ليلى حسن">ليلى حسن</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-sm font-semibold text-foreground/80 pr-1">الطبيب</label>
                  <Select value={selectedDoctor} onValueChange={setSelectedDoctor}>
                    <SelectTrigger className={cn("rounded-xl h-12 bg-input-background transition-all focus:ring-4 focus:ring-primary/10", (selectedDoctor) && "text-foreground font-bold")}>
                      <SelectValue placeholder="اختر الطبيب" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl text-right" >
                      <SelectItem value="د. أحمد علي">د. أحمد علي</SelectItem>
                      <SelectItem value="د. سامي يوسف">د. سامي يوسف</SelectItem>
                      <SelectItem value="د. ليلى خالد">د. ليلى خالد</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-sm font-semibold text-foreground/80 pr-1">التاريخ</label>
                  <div className="relative group">
                    <Flatpickr
                      value={selectedDate}
                      onChange={([date]) => setSelectedDate(date ? date.toISOString().split('T')[0] : '')}
                      options={{
                        locale: Arabic,
                        dateFormat: "Y-m-d",
                        disableMobile: true,
                        minDate: "today",
                        formatDate: (date: Date) => format(date, "d MMMM yyyy", { locale: ar })
                      }}
                      placeholder="اختر التاريخ"
                      className="w-full h-12 bg-input-background border border-border rounded-xl px-4 pr-12 text-right transition-all outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 text-base md:text-sm font-bold"
                    />
                    <Calendar className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none group-focus-within:text-primary transition-colors size-[18px]" />
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-sm font-semibold text-foreground/80 pr-1">الوقت</label>
                  <div className="relative group">
                    <TimePicker
                      value={selectedTime}
                      onChange={setSelectedTime}
                      className="w-full h-12 bg-input-background border border-border rounded-xl pr-12 text-right transition-all outline-none focus-within:border-primary focus-within:ring-4 focus-within:ring-primary/10"
                    />
                    <Clock className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none group-focus-within:text-primary transition-colors size-[18px] z-10" />
                  </div>
                </div>

                <div className="flex flex-col gap-2 col-span-2">
                  <label className="text-sm font-semibold text-foreground/80 pr-1">حالة الموعد</label>
                  <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                    <SelectTrigger className={cn("rounded-xl h-12 bg-input-background transition-all focus:ring-4 focus:ring-primary/10", (selectedStatus) && "text-foreground font-bold")}>
                      <SelectValue placeholder="حالة الموعد" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl text-right">
                      <SelectItem value="قيد الانتظار">
                        <div className="flex items-center gap-2">
                          <div className="size-2 rounded-full bg-amber-500" />
                          <span>قيد الانتظار</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="مكتمل">
                        <div className="flex items-center gap-2">
                          <div className="size-2 rounded-full bg-emerald-500" />
                          <span>مكتمل</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="ملغي">
                        <div className="flex items-center gap-2">
                          <div className="size-2 rounded-full bg-rose-500" />
                          <span>ملغي</span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          )}
        </ScrollLockWrapper>

        <div className="flex gap-4 pt-6 border-t border-border mt-6">
          {mode === 'add' && (
            <>
              <Button onClick={handleSubmit} className="flex-1 h-12 rounded-xl text-base shadow-lg shadow-primary/20">
                <Plus size={20} className="ml-2" /> حفظ الموعد
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
            <div className="flex gap-3 w-full">
              <Button onClick={handleSubmit} className="flex-1 shadow-lg shadow-primary/20 bg-primary hover:bg-primary/90 h-10 rounded-lg">
                حفظ التغييرات
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                className="flex-1 h-10 rounded-lg"
              >
                إلغاء
              </Button>
            </div>
          )}
          {mode === 'view' && (
            <div className="flex gap-3 w-full">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                className="flex-1 h-10 rounded-lg hover:border-primary/30"
              >
                إغلاق
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AppointmentsDialog;
