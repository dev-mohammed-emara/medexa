import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import "flatpickr/dist/flatpickr.css";
import { Arabic } from "flatpickr/dist/l10n/ar.js";
import { Clock, DollarSign, Phone, Plus, Stethoscope, User, X } from 'lucide-react';
import { FaCalendarAlt } from 'react-icons/fa';
import { useCallback, useEffect, useRef, useState } from 'react';
import Flatpickr from "react-flatpickr";
import { Button } from '../../components/ui/Button';
import ScrollLockWrapper from '../../components/ui/ScrollLockWrapper';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import { useLanguage } from '../../contexts/LanguageContext'
import { appointmentsTranslations } from '../../constants/translations/appointments';
import TimePicker from '../../components/ui/TimePicker';
import { cn } from '../../utils/cn';
import { statusConfig } from './constants';
import Portal from '../../components/ui/Portal';
import { enUS } from 'date-fns/locale';

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
  const { isAr, dir, t } = useLanguage();
  const T = appointmentsTranslations;
  const currentLocale = isAr ? ar : enUS;
  const overlayRef = useRef<HTMLDivElement>(null);
  const [isClosing, setIsClosing] = useState(false);

  // Form States
  const [selectedDate, setSelectedDate] = useState<string>(
    initialData?.date ? (typeof initialData.date === 'string' ? initialData.date : initialData.date.toISOString().split('T')[0]) : ""
  );
  const [selectedTime, setSelectedTime] = useState<string>(initialData?.time || "");
  const [selectedStatus, setSelectedStatus] = useState(initialData?.status || 'pending');
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

    window.showToast?.(mode === 'add' ? t('toast_save_success', T) : t('toast_update_success', T));
    handleClose();
  };

  const titles = { add: t('dialog.title_add', T), edit: t('dialog.title_edit', T), view: t('dialog.title_view', T) };
  const descriptions = {
    add: t('dialog.desc_add', T),
    edit: t('dialog.desc_edit', T),
    view: t('dialog.desc_view', T)
  };

  return (
    <Portal>
      <div
        ref={overlayRef}
        className={cn(
          "fixed inset-0 z-500 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4",
          isClosing ? "animate-fadeOut" : "animate-fade"
        )}
        dir={dir}
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
            className={cn(
              "absolute top-6 p-2 rounded-full hover:bg-muted transition-colors opacity-70 hover:opacity-100 outline-none z-20",
              isAr ? "right-6" : "left-6"
            )}
          >
            <X className="size-5" />
            <span className="sr-only">Close</span>
          </button>

          <div data-slot="dialog-header" className="flex flex-col gap-2 text-center mb-6">
            <h2 data-slot="dialog-title" className="text-2xl font-bold text-foreground">
              {titles[mode]}
            </h2>
            <p className="text-muted-foreground text-sm">{descriptions[mode]}</p>
          </div>

          <ScrollLockWrapper className="flex-1 overflow-y-auto pr-1 no-scrollbar">
            {mode === 'view' ? (
              <div className="space-y-4 py-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 font-medium text-muted-foreground text-xs">{t('dialog.patient', T)}</label>
                    <div className="flex items-center gap-2">
                      <User className="size-4 text-primary" />
                      <span className="font-medium">{initialData?.patientName || (isAr ? "محمد العمري" : "Mohammed Al-Omari")}</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="flex items-center gap-2 font-medium text-muted-foreground text-xs">{t('dialog.phone', T)}</label>
                    <div className="flex items-center gap-2" dir="ltr">
                      <Phone className="size-4 text-primary" />
                      <span className="font-medium">+962 79 123 4567</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="flex items-center gap-2 font-medium text-muted-foreground text-xs">{t('dialog.doctor', T)}</label>
                    <div className="flex items-center gap-2">
                      <Stethoscope className="size-4 text-primary" />
                      <span className="font-medium">{initialData?.doctorName || (isAr ? "د. ليلى الخطيب" : "Dr. Layla Al-Khatib")}</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="flex items-center gap-2 font-medium text-muted-foreground text-xs">{t('dialog.time', T)}</label>
                    <div className="flex items-center gap-2">
                      <Clock className="size-4 text-primary" />
                      <span className="font-medium">{initialData?.time || "10:00"}</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="flex items-center gap-2 font-medium text-muted-foreground text-xs">{t('dialog.status', T)}</label>
                    {(() => {
                      const status = initialData?.status || 'pending';
                      const config = statusConfig[status] || statusConfig[isAr ? 'قيد الانتظار' : 'pending'];
                      return (
                        <span className={cn(
                          "inline-flex items-center justify-center rounded-lg px-3 py-1 text-xs font-bold w-fit border-2 shadow-sm transition-all animate-in fade-in zoom-in duration-300",
                          config.bg,
                          config.text,
                          config.border
                        )}>
                           <div className={cn("size-1.5 rounded-full", isAr ? "ml-1.5" : "mr-1.5", config.dotColor)} />
                          {status === 'قيد الانتظار' ? t('dialog.status_pending', T) : 
                           status === 'مكتمل' ? t('dialog.status_completed', T) : 
                           status === 'ملغي' ? t('dialog.status_canceled', T) :
                           status}
                        </span>
                      );
                    })()}
                  </div>

                  <div className="space-y-2">
                    <label className="flex items-center gap-2 font-medium text-muted-foreground text-xs">{t('dialog.fee', T)}</label>
                    <div className="flex items-center gap-2">
                      <DollarSign className="size-4 text-primary" />
                      <span className="font-medium">25 {t('dialog.currency', T)}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="flex items-center gap-2 font-medium text-muted-foreground text-xs">{t('dialog.patient_notes', T)}</label>
                  <div className="p-3 bg-muted/30 rounded-lg border border-border min-h-[60px]">
                    <p className="text-sm">{initialData?.patientNotes || t('dialog.no_notes', T)}</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="flex items-center gap-2 font-medium text-muted-foreground text-xs">{t('dialog.doctor_notes', T)}</label>
                  <div className="p-3 bg-muted/30 rounded-lg border border-border min-h-[60px]">
                    <p className="text-sm">{initialData?.doctorNotes || t('dialog.no_notes', T)}</p>
                  </div>
                </div>
              </div>
            ) : mode === 'edit' ? (
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">{t('dialog.status', T)}</label>
                  <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                    <SelectTrigger className={cn("rounded-xl h-12 bg-input-background transition-all focus:ring-4 focus:ring-primary/10", (selectedStatus) && "text-foreground font-bold")}>
                      <SelectValue placeholder={t('dialog.status', T)} />
                    </SelectTrigger>
                    <SelectContent className={cn("rounded-xl z-600", isAr ? "text-right" : "text-left")}>
                      <SelectItem value="قيد الانتظار" hidden={!isAr}>
                        <div className="flex items-center gap-2">
                          <div className="size-2 rounded-full bg-amber-500" />
                          <span>قيد الانتظار</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="pending" hidden={isAr}>
                        <div className="flex items-center gap-2">
                          <div className="size-2 rounded-full bg-amber-500" />
                          <span>Pending</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="مكتمل" hidden={!isAr}>
                        <div className="flex items-center gap-2">
                          <div className="size-2 rounded-full bg-emerald-500" />
                          <span>مكتمل</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="completed" hidden={isAr}>
                        <div className="flex items-center gap-2">
                          <div className="size-2 rounded-full bg-emerald-500" />
                          <span>Completed</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="ملغي" hidden={!isAr}>
                        <div className="flex items-center gap-2">
                          <div className="size-2 rounded-full bg-rose-500" />
                          <span>ملغي</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="canceled" hidden={isAr}>
                        <div className="flex items-center gap-2">
                          <div className="size-2 rounded-full bg-rose-500" />
                          <span>Canceled</span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            ) : (
              <div className="space-y-6 py-2">
                <div className="md:grid flex flex-col  md:grid-cols-2 gap-6">
                  <div className="flex flex-col gap-2">
                    <label className={cn("text-sm font-semibold text-foreground/80", isAr ? "pr-1" : "pl-1")}>{t('dialog.patient', T)}</label>
                    <Select value={selectedPatient} onValueChange={setSelectedPatient}>
                      <SelectTrigger className={cn("rounded-xl h-12 bg-input-background transition-all focus:ring-4 focus:ring-primary/10", (selectedPatient) && "text-foreground font-bold")}>
                        <SelectValue placeholder={t('dialog.select_patient', T)} />
                      </SelectTrigger>
                      <SelectContent className={cn("rounded-xl z-600", isAr ? "text-right" : "text-left")} >
                        <SelectItem value="محمد أحمد">{isAr ? "محمد أحمد" : "Mohammed Ahmed"}</SelectItem>
                        <SelectItem value="سارة علي">{isAr ? "سارة علي" : "Sara Ali"}</SelectItem>
                        <SelectItem value="ياسين محمود">{isAr ? "ياسين محمود" : "Yassin Mahmoud"}</SelectItem>
                        <SelectItem value="ليلى حسن">{isAr ? "ليلى حسن" : "Layla Hassan"}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className={cn("text-sm font-semibold text-foreground/80", isAr ? "pr-1" : "pl-1")}>{t('dialog.doctor', T)}</label>
                    <Select value={selectedDoctor} onValueChange={setSelectedDoctor}>
                      <SelectTrigger className={cn("rounded-xl h-12 bg-input-background transition-all focus:ring-4 focus:ring-primary/10", (selectedDoctor) && "text-foreground font-bold")}>
                        <SelectValue placeholder={t('dialog.select_doctor', T)} />
                      </SelectTrigger>
                      <SelectContent className={cn("rounded-xl z-600", isAr ? "text-right" : "text-left")} >
                        <SelectItem value="د. أحمد علي">{isAr ? "د. أحمد علي" : "Dr. Ahmed Ali"}</SelectItem>
                        <SelectItem value="د. سامي يوسف">{isAr ? "د. سامي يوسف" : "Dr. Sami Youssef"}</SelectItem>
                        <SelectItem value="د. ليلى خالد">{isAr ? "د. ليلى خالد" : "Dr. Layla Khaled"}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className={cn("text-sm font-semibold text-foreground/80", isAr ? "pr-1" : "pl-1")}>{t('dialog.date', T)}</label>
                    <div className={cn("relative group flex items-center justify-between h-12 bg-input-background border border-border rounded-xl px-4 focus-within:ring-4 focus-within:ring-primary/10 transition-all", isAr ? "flex-row" : "flex-row-reverse")}>
                      <Flatpickr
                        value={selectedDate}
                        onChange={([date]) => setSelectedDate(date ? date.toISOString().split('T')[0] : '')}
                        options={{
                          locale: isAr ? Arabic : undefined,
                          dateFormat: "d F Y",
                           disableMobile: true,
                          minDate: "today",
                          formatDate: (date: Date) => format(date, "d MMMM yyyy", { locale: currentLocale })
                        }}
                        placeholder={t('dialog.select_date', T)}
                        className={cn("flex-1 bg-transparent border-none outline-none font-bold h-full text-base md:text-sm", isAr ? "text-right" : "text-left")}
                      />
                      <FaCalendarAlt className="text-muted-foreground pointer-events-none group-focus-within:text-primary transition-colors size-[18px]" />
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className={cn("text-sm font-semibold text-foreground/80", isAr ? "pr-1" : "pl-1")}>{isAr ? "الوقت" : "Time"}</label>
                    <div className="relative group">
                      <TimePicker
                        value={selectedTime}
                        onChange={setSelectedTime}
                        className={cn("w-full h-12 bg-input-background justify-center xs:justify-end border border-border rounded-xl transition-all outline-none focus-within:border-primary focus-within:ring-4 focus-within:ring-primary/10", isAr ? "text-right" : "text-left")}
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 col-span-2">
                    <label className={cn("text-sm font-semibold text-foreground/80 col-span-2", isAr ? "pr-1" : "pl-1")}>{t('dialog.status', T)}</label>
                    <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                      <SelectTrigger className={cn("rounded-xl h-12 bg-input-background transition-all focus:ring-4 focus:ring-primary/10", (selectedStatus) && "text-foreground font-bold")}>
                        <SelectValue placeholder={t('dialog.status', T)} />
                      </SelectTrigger>
                      <SelectContent className={cn("rounded-xl z-600", isAr ? "text-right" : "text-left")}>
                        <SelectItem value="قيد الانتظار" hidden={!isAr}>
                          <div className="flex items-center gap-2">
                            <div className="size-2 rounded-full bg-amber-500" />
                            <span>قيد الانتظار</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="pending" hidden={isAr}>
                          <div className="flex items-center gap-2">
                            <div className="size-2 rounded-full bg-amber-500" />
                            <span>Pending</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="مكتمل" hidden={!isAr}>
                          <div className="flex items-center gap-2">
                            <div className="size-2 rounded-full bg-emerald-500" />
                            <span>مكتمل</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="completed" hidden={isAr}>
                          <div className="flex items-center gap-2">
                            <div className="size-2 rounded-full bg-emerald-500" />
                            <span>Completed</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="ملغي" hidden={!isAr}>
                          <div className="flex items-center gap-2">
                            <div className="size-2 rounded-full bg-rose-500" />
                            <span>ملغي</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="canceled" hidden={isAr}>
                          <div className="flex items-center gap-2">
                            <div className="size-2 rounded-full bg-rose-500" />
                            <span>Canceled</span>
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
                  <Plus size={20} className={isAr ? "ml-2" : "mr-2"} /> {t('dialog.save', T)}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleClose}
                  className="flex-1 h-12 rounded-xl text-base"
                >
                  {t('dialog.cancel', T)}
                </Button>
              </>
            )}
            {mode === 'edit' && (
              <div className="flex gap-3 w-full">
                <Button onClick={handleSubmit} className="flex-1 shadow-lg shadow-primary/20 bg-primary hover:bg-primary/90 h-10 rounded-lg">
                  {t('dialog.save_changes', T)}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleClose}
                  className="flex-1 h-10 rounded-lg"
                >
                  {t('dialog.cancel', T)}
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
                  {t('dialog.close', T)}
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </Portal>
  );
};

export default AppointmentsDialog;
