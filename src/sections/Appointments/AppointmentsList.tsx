import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  getMonth,
  getYear,
  isSameDay,
  isSameMonth,
  setMonth,
  setYear,
  startOfMonth,
  startOfWeek,
  subMonths
} from 'date-fns';
import { ar } from 'date-fns/locale';
import { Calendar, ChevronRight, ChevronLeft, Plus, Clock, Trash2, User, Stethoscope, Eye, SquarePen, X, Smartphone, MoveHorizontal } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useMediaQuery } from 'react-responsive';
import { Button } from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import ScrollLockWrapper from '../../components/ui/ScrollLockWrapper';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';
import { usePreloader } from '../../contexts/PreloaderContext';
import { useSidebar } from '../../contexts/SidebarContext';
import { cn } from '../../utils/cn';
import AppointmentsDialog, { type Appointment } from './AppointmentsDialog';
import { statusConfig } from './constants';

// Mock data for appointments
const INITIAL_APPOINTMENTS: Appointment[] = [
  { id: 1, date: new Date(2026, 2, 2), time: '10:00', patientName: 'محمد أحمد', doctorName: 'د. أحمد علي', status: 'مكتمل' },
  { id: 2, date: new Date(2026, 2, 2), time: '11:30', patientName: 'ليلى سليم', doctorName: 'د. ليلى خالد', status: 'مكتمل' },
  { id: 3, date: new Date(2026, 2, 6), time: '09:00', patientName: 'أحمد كمال', doctorName: 'د. أحمد علي', status: 'مكتمل' },
  { id: 4, date: new Date(2026, 2, 6), time: '14:00', patientName: 'فاطمة الزهراء', doctorName: 'د. ليلى خالد', status: 'ملغي' },
  { id: 5, date: new Date(2026, 2, 10), time: '10:00', patientName: 'يوسف محمود', doctorName: 'د. سامي يوسف', status: 'مكتمل' },
  { id: 6, date: new Date(2026, 2, 10), time: '11:00', patientName: 'مريم سعيد', doctorName: 'د. أحمد علي', status: 'قيد الانتظار' },
  { id: 7, date: new Date(2026, 2, 15), time: '09:30', patientName: 'خالد ناصر', doctorName: 'د. ليلى خالد', status: 'مكتمل' },
  { id: 8, date: new Date(2026, 2, 15), time: '16:00', patientName: 'سارة علي', doctorName: 'د. سامي يوسف', status: 'ملغي' },
  { id: 9, date: new Date(2026, 2, 20), time: '13:00', patientName: 'عائشة فهد', doctorName: 'د. أحمد علي', status: 'مكتمل' },
  { id: 10, date: new Date(2026, 2, 20), time: '15:00', patientName: 'محمد جاسم', doctorName: 'د. ليلى خالد', status: 'مكتمل' },
  { id: 11, date: new Date(2026, 2, 21), time: '10:30', patientName: 'عمر الشريف', doctorName: 'د. سامي يوسف', status: 'مكتمل' },
  { id: 12, date: new Date(2026, 2, 24), time: '09:00', patientName: 'هبة خالد', doctorName: 'د. أحمد علي', status: 'مكتمل' },
  { id: 13, date: new Date(2026, 2, 25), time: '14:30', patientName: 'زياد عمر', doctorName: 'د. ليلى خالد', status: 'مكتمل' },
  { id: 14, date: new Date(2026, 2, 27), patientName: 'عمر الشريف', doctorName: 'د. سامي يوسف', time: '10:30', status: 'مكتمل' },
  { id: 15, date: new Date(2026, 2, 27), patientName: 'فهد محمد', doctorName: 'د. أحمد علي', time: '12:00', status: 'قيد الانتظار' },
];

const AppointmentsList = () => {
  const { isLoaded, isExiting } = usePreloader();
  const canAnimate = isLoaded && !isExiting;

  const { isCollapsed, setIsCollapsed, previousCollapsedState, setPreviousCollapsedState } = useSidebar();
  const isMediumScreen = useMediaQuery({ query: '(min-width: 1024px) and (max-width: 1279px)' });

  const [currentDate, setCurrentDate] = useState(new Date(2026, 2, 27));
  const [selectedDoctor, setSelectedDoctor] = useState('all');
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [lastSelectedDate, setLastSelectedDate] = useState<Date | null>(null);

  // Data State
  const [appointments, setAppointments] = useState<Appointment[]>(INITIAL_APPOINTMENTS);

  // Dialog States
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<'add' | 'edit' | 'view'>('add');
  const [currentAppointment, setCurrentAppointment] = useState<Appointment | null>(null);

  // Delete Modal State
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [appointmentToDelete, setAppointmentToDelete] = useState<Appointment | null>(null);

  // Height and Scroll tracking for the detail sidebar
  const calendarRef = useRef<HTMLElement>(null);
  const detailSidebarRef = useRef<HTMLDivElement>(null);
  const [gridHeight, setGridHeight] = useState<number>(600);

  useEffect(() => {
    if (!calendarRef.current) return;
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setGridHeight(entry.contentRect.height);
      }
    });
    observer.observe(calendarRef.current);
    return () => observer.disconnect();
  }, [selectedDate]);

  // Sync last selected date for exit animation
  if (selectedDate && selectedDate !== lastSelectedDate) {
    setLastSelectedDate(selectedDate);
  }

  const handleDateSelect = (date: Date) => {
    const isResponsiveRange = window.innerWidth >= 768 && window.innerWidth < 1280;

    if (!selectedDate && isResponsiveRange && !isCollapsed) {
      setPreviousCollapsedState(isCollapsed);
      setIsCollapsed(true);
    }
    setSelectedDate(date);

    if (window.innerWidth < 768) {
      setTimeout(() => {
        detailSidebarRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 400);
    }
  };

  const handleCloseDetail = () => {
    setSelectedDate(null);
    if (isMediumScreen && previousCollapsedState !== null) {
      setIsCollapsed(previousCollapsedState);
      setPreviousCollapsedState(null);
    }
  };

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart, { locale: ar });
  const endDate = endOfWeek(monthEnd, { locale: ar });

  const calendarDays = eachDayOfInterval({
    start: startDate,
    end: endDate,
  });

  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));
  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));

  const handleYearChange = (year: string) => {
    setCurrentDate(setYear(currentDate, parseInt(year)));
  };

  const handleMonthChange = (monthIdx: string) => {
    setCurrentDate(setMonth(currentDate, parseInt(monthIdx)));
  };

  const handleOpenDialog = (mode: 'add' | 'edit' | 'view', app?: Appointment) => {
    setDialogMode(mode);
    setCurrentAppointment(app || null);
    setIsDialogOpen(true);
  };

  const handleConfirmAppointment = (data: Partial<Appointment>) => {
    if (dialogMode === 'add') {
      const newApp: Appointment = {
        id: Date.now(),
        patientName: data.patientName || '',
        doctorName: data.doctorName || '',
        date: new Date(data.date as string),
        time: data.time || '',
        status: data.status || 'قيد الانتظار',
      };
      setAppointments(prev => [...prev, newApp]);
    } else if (dialogMode === 'edit' && currentAppointment) {
      setAppointments(prev => prev.map(a => a.id === currentAppointment.id ? { ...a, ...data } : a));
    }
    setIsDialogOpen(false);
  };

  const handleDeleteAppointment = (appId: number) => {
    const app = appointments.find(a => a.id === appId);
    if (app) {
      setAppointmentToDelete(app);
      setIsDeleteModalOpen(true);
    }
  };

  const confirmDelete = () => {
    if (appointmentToDelete) {
      setAppointments(prev => prev.filter(a => a.id !== appointmentToDelete.id));
      window.showToast?.('تم حذف الموعد بنجاح');
    }
    setIsDeleteModalOpen(false);
  };

  const years = Array.from({ length: 10 }, (_, i) => (getYear(new Date()) - 5 + i).toString());
  const months = Array.from({ length: 12 }, (_, i) => ({
    label: format(new Date(2026, i, 1), 'MMMM', { locale: ar }),
    value: i.toString()
  }));


  return (
    <div className="space-y-6" dir="rtl">
      {/* Page Header */}
      <section className={cn(
        "flex flex-col md:flex-row md:items-center md:justify-between gap-4 opacity-0",
        canAnimate && "animate-fadeDown animate-delay-100"
      )}>
        <div>
          <h1 className="text-3xl mb-1 font-extrabold">إدارة المواعيد</h1>
          <p className="text-muted-foreground">تقويم المواعيد الطبية ومتابعة المرضى</p>
        </div>

        <div className="flex items-center gap-3">
          <Select value={selectedDoctor} onValueChange={setSelectedDoctor}>
            <SelectTrigger className="w-56 h-10 bg-white border-border shadow-xs">
              <SelectValue placeholder="اختر الطبيب" />
            </SelectTrigger>
            <SelectContent smallZ={true}>
              <SelectItem value="all">جميع الأطباء</SelectItem>
              <SelectItem value="1">د. أحمد علي</SelectItem>
              <SelectItem value="2">د. سامي يوسف</SelectItem>
              <SelectItem value="3">د. ليلى خالد</SelectItem>
            </SelectContent>
          </Select>

          <Button
            className="h-10 px-6 rounded-xl"
            onClick={() => handleOpenDialog('add')}
          >
            <Plus className="size-4 ml-2" />
            إضافة موعد
          </Button>
        </div>
      </section>

      {/* Calendar Grid Container */}
      <div className={cn("flex justify-between flex-col md:flex-row items-start ", selectedDate ? "gap-6" : "gap-0")}>
        <article
          ref={calendarRef}
          data-slot="card"
          className={cn(
            "transition-[width] duration-700 ease-in-out will-change-[width] flex flex-col gap-6 rounded-2xl border shadow-xl p-6 bg-white border-border opacity-0",
            selectedDate ? "md:w-[67%] w-full" : "w-full",
            canAnimate && "animate-fadeUp animate-delay-200"
          )}
        >
          {/* Calendar Header Controls */}
          <section className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-4">
            <div className="flex items-center gap-2 order-2 sm:order-1 py-1">
              <Button
                variant="outline"
                size="icon"
                onClick={nextMonth}
                className="size-10 px-2.5 rounded-xl hover:-translate-y-1 duration-200 hover:bg-primary/5 hover:border-primary/30 transition-all shadow-xs"
              >
                <ChevronRight className="size-5" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={prevMonth}
                className="size-10 px-2.5 hover:-translate-y-1 duration-200 rounded-xl hover:bg-primary/5 hover:border-primary/30 transition-all shadow-xs"
              >
                <ChevronLeft className="size-5" />
              </Button>
            </div>

            <div className="flex items-center gap-2 order-2">
              <Select value={getMonth(currentDate).toString()} onValueChange={handleMonthChange}>
                <SelectTrigger className="w-36 h-10 bg-white border-border shadow-xs font-bold text-foreground">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent smallZ={true}>
                  {months.map(m => (
                    <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={getYear(currentDate).toString()} onValueChange={handleYearChange}>
                <SelectTrigger className="w-28 h-10 bg-white border-border shadow-xs font-bold text-foreground">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent smallZ={true}>
                  {years.map(y => (
                    <SelectItem key={y} value={y}>{y}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </section>

          {/* Mobile Swipe Indicator */}
          <div className="md:hidden flex items-center justify-center gap-3 mb-4 py-2 px-4 rounded-full bg-muted/30 text-muted-foreground/80 text-xs font-bold ring-1 ring-border/50 animate-pulse backdrop-blur-xs">
            <Smartphone className="size-3.5" />
            <span>اسحب لليسار أو اليمين لتصفح التقويم</span>
            <MoveHorizontal className="size-3.5" />
          </div>

          <div className="overflow-x-auto pb-2 scrollbar-none md:scrollbar-auto">
            <div className="min-w-[800px] w-full lg:min-w-0">
              {/* Day Headers */}
              <figure className="grid grid-cols-7 gap-3 mb-2">
                {['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'].map((day) => (
                  <div key={day} className="text-center py-3">
                    <span className="text-sm font-bold text-muted-foreground/80 tracking-wide uppercase">{day}</span>
                  </div>
                ))}
              </figure>

              {/* Month Days Grid */}
              <section className="grid grid-cols-7 gap-3">
                {calendarDays.map((date) => {
                  const dayAppointments = appointments.filter(app => isSameDay(app.date, date));
                  const isCurrentMonth = isSameMonth(date, monthStart);
                  const isToday = isSameDay(date, new Date());
                  const isSelected = selectedDate && isSameDay(date, selectedDate);

                  if (!isCurrentMonth) {
                    return (
                      <div
                        key={date.toString()}
                        className="min-h-[100px] p-2 rounded-xl border-2 border-transparent bg-muted/5 opacity-5"
                        aria-hidden="true"
                        role="presentation"
                      />
                    );
                  }

                  return (
                    <article
                      key={date.toString()}
                      onClick={() => handleDateSelect(date)}
                      className={cn(
                        "min-h-[100px] p-2 rounded-xl border-2 transition-all duration-300 cursor-pointer group relative",
                        isSelected ? "border-primary bg-primary/10 shadow-lg shadow-primary/20" :
                        isToday ? "border-primary/50 bg-primary/5 shadow-md shadow-primary/5" :
                        "border-border bg-muted/20 hover:border-primary/50 hover:bg-muted/40 hover:shadow-md"
                      )}
                    >
                      <div className="flex flex-col h-full relative z-10">
                        <div className={cn(
                          "text-sm mb-2 font-medium transition-colors",
                          isSelected || isToday ? "text-primary font-bold" : "text-foreground group-hover:text-primary"
                        )}>
                          {format(date, 'd')}
                        </div>

                        <div className="space-y-1 flex-1">
                          {dayAppointments.slice(0, 2).map((app) => {
                            const config = statusConfig[app.status] || statusConfig['قيد الانتظار'];
                            return (
                              <div
                                key={app.id}
                                className={cn(
                                  "text-xs p-1.5 rounded-lg border shadow-sm hover:shadow-md transition-all duration-200 hover:scale-[1.02] relative z-20 group/app",
                                  config.bg,
                                  config.border,
                                  config.text
                                )}
                              >
                                <div className="flex items-center gap-1">
                                  <div className={cn("w-1.5 h-1.5 rounded-full transition-transform duration-300 group-hover/app:scale-125", config.dotColor)} />
                                  <span className="truncate font-medium">{app.time}</span>
                                </div>
                                <div className="truncate text-[10px] mt-0.5 font-bold">{app.patientName}</div>
                              </div>
                            );
                          })}
                          {dayAppointments.length > 2 && (
                            <div className="text-[10px] text-muted-foreground text-center mt-1">
                              +{dayAppointments.length - 2} أخرى
                            </div>
                          )}
                        </div>
                      </div>
                    </article>
                  );
                })}
              </section>
            </div>
          </div>
        </article>

        <div
          ref={detailSidebarRef}
          className={cn(
            "transition-all duration-700 ease-in-out flex flex-col items-end",
            !selectedDate ? "w-0 opacity-0 pointer-events-none" : "w-full lg:w-[33%] opacity-100",
            "max-md:w-full max-sm:w-full"
          )}
        >
          {(selectedDate || lastSelectedDate) && (
            <article
              data-slot="card"
              className={cn(
                "flex flex-col w-full gap-6 rounded-2xl border shadow-xl p-6 bg-white border-border sticky top-6 lg:top-24 transition-all duration-500 scroll-mt-32",
                "lg:w-full lg:min-w-[300px]",
                selectedDate ? "flex animate-fadeRight" : "hidden animate-fadeOutRight",
              )}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold">
                  {format(selectedDate || lastSelectedDate!, 'EEEE، d MMMM', { locale: ar })}
                </h3>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleCloseDetail}
                  className="size-8 px-2 rounded-full hover:bg-rose-50 hover:text-rose-600 transition-colors"
                >
                  <X className="size-4" />
                </Button>
              </div>

              <div data-lenis-prevent>
                <ScrollLockWrapper
                  className="py-1 w-full detail-sidebar-scroll custom-scrollbar"
                  style={{ maxHeight: `${gridHeight - 72}px` }}
                >
                  <div className="space-y-4">
                    {appointments.filter(app => isSameDay(app.date, selectedDate || lastSelectedDate!)).length > 0 ? (
                      appointments
                        .filter(app => isSameDay(app.date, selectedDate || lastSelectedDate!))
                        .map((app) => {
                          const config = statusConfig[app.status] || statusConfig['قيد الانتظار'];

                          return (
                            <div
                              key={app.id}
                              data-slot="card"
                              className={cn(
                                "flex flex-col gap-6 rounded-xl duration-300 p-4 border-2 transition-all hover:shadow-md",
                                config.bg,
                                config.border
                              )}
                            >
                              <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-2">
                                    <Clock className={cn("size-4", config.iconColor)} />
                                    <span className={cn("text-sm font-bold", config.text)}>{app.time}</span>
                                  </div>
                                  <span className={cn(
                                    "inline-flex items-center justify-center rounded-lg px-2 py-0.5 text-[10px] font-bold w-fit whitespace-nowrap shrink-0 border shadow-sm transition-all duration-300",
                                    config.bg,
                                    config.text,
                                    config.border
                                  )}>
                                    <div className={cn("size-1 rounded-full ml-1", config.dotColor)} />
                                    {app.status}
                                  </span>
                                </div>

                                <div className="space-y-2">
                                  <div className="flex items-center gap-2">
                                    <User className="size-3.5 text-muted-foreground" />
                                    <span className="text-sm font-medium">{app.patientName}</span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <Stethoscope className="size-3.5 text-muted-foreground" />
                                    <span className="text-sm text-muted-foreground">{app.doctorName}</span>
                                  </div>
                                </div>

                                <div className="flex gap-2 pt-2">
                                  <button
                                    onClick={() => handleOpenDialog('view', app)}
                                    className="inline-flex items-center justify-center whitespace-nowrap font-medium transition-all duration-300 border bg-background text-foreground hover:bg-accent hover:text-accent-foreground rounded-md gap-1.5 px-3 flex-1 h-8 text-xs hover:border-primary/30 hover:shadow-lg hover:-translate-y-0.5"
                                  >
                                    <Eye className="size-3.5 ml-1" /> عرض
                                  </button>
                                  <button
                                    onClick={() => handleOpenDialog('edit', app)}
                                    className="inline-flex items-center justify-center whitespace-nowrap font-medium transition-all duration-300 border bg-background text-foreground hover:bg-accent hover:text-accent-foreground rounded-md gap-1.5 px-3 flex-1 h-8 text-xs hover:border-primary/30 hover:shadow-lg hover:-translate-y-0.5"
                                  >
                                    <SquarePen className="size-3.5 ml-1" /> تعديل
                                  </button>
                                  <button
                                    onClick={() => handleDeleteAppointment(app.id)}
                                    className="inline-flex items-center justify-center whitespace-nowrap font-medium transition-all duration-300 border bg-background text-destructive hover:bg-destructive/10 rounded-md gap-1.5 px-3 h-8 text-xs hover:border-primary/30 hover:shadow-lg hover:-translate-y-0.5 shrink-0"
                                  >
                                    <Trash2 className="size-3.5" />
                                  </button>
                                </div>
                              </div>
                            </div>
                          );
                        })
                    ) : (
                      <div className="text-center py-12 text-muted-foreground flex flex-col items-center gap-3">
                        <Calendar className="size-12 opacity-10" />
                        <p className="text-sm">لا توجد مواعيد في هذا اليوم</p>
                      </div>
                    )}
                  </div>
                </ScrollLockWrapper>
              </div>
            </article>
          )}
        </div>
      </div>

      <AppointmentsDialog
        key={currentAppointment?.id || 'new'}
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onConfirm={handleConfirmAppointment}
        mode={dialogMode}
        initialData={currentAppointment}
      />

      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={confirmDelete}
        title="حذف الموعد"
        message={`هل أنت متأكد من حذف موعد ${appointmentToDelete?.patientName || ''}؟ لن يمكنك التراجع عن هذا الإجراء.`}
        confirmText="حذف الموعد"
        cancelText="إلغاء"
        variant="danger"
      />
    </div>
  );
};

export default AppointmentsList;
