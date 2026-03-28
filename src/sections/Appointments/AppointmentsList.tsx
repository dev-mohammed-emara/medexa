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
import { ChevronRight, ChevronLeft, Plus, Clock, Trash2, User, Stethoscope, Eye, SquarePen, X, Smartphone, MoveHorizontal } from 'lucide-react';
import { FaCalendarAlt } from 'react-icons/fa';
import { useEffect, useRef, useState, useCallback } from 'react';
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
import { useLanguage } from '../../contexts/LanguageContext';
import { appointmentsTranslations } from '../../constants/translations/appointments';
import { enUS } from 'date-fns/locale';
import AppointmentsDialog, { type Appointment } from './AppointmentsDialog';
import { statusConfig } from './constants';
import { useBroadcast } from '../../hooks/useBroadcast';

// Mock data for appointments
const INITIAL_APPOINTMENTS: Appointment[] = [
  { id: 1, date: new Date(2026, 2, 2), time: '10:00', patientName: 'أحمد محمد', doctorName: 'د. أحمد علي', status: 'مكتمل' },
  { id: 2, date: new Date(2026, 2, 2), time: '11:30', patientName: 'سارة أحمد', doctorName: 'د. ليلى خالد', status: 'مكتمل' },
  { id: 3, date: new Date(2026, 2, 6), time: '09:00', patientName: 'محمود علي', doctorName: 'د. أحمد علي', status: 'مكتمل' },
  { id: 4, date: new Date(2026, 2, 6), time: '14:00', patientName: 'ليلى يوسف', doctorName: 'د. ليلى خالد', status: 'ملغي' },
  { id: 5, date: new Date(2026, 2, 10), time: '10:00', patientName: 'خالد عمر', doctorName: 'د. سامي يوسف', status: 'مكتمل' },
  { id: 6, date: new Date(2026, 2, 10), time: '11:00', patientName: 'منى عبدالله', doctorName: 'د. أحمد علي', status: 'قيد الانتظار' },
  { id: 7, date: new Date(2026, 2, 15), time: '09:30', patientName: 'أحمد محمد', doctorName: 'د. ليلى خالد', status: 'مكتمل' },
  { id: 8, date: new Date(2026, 2, 15), time: '16:00', patientName: 'سارة أحمد', doctorName: 'د. سامي يوسف', status: 'ملغي' },
  { id: 9, date: new Date(2026, 2, 20), time: '13:00', patientName: 'محمود علي', doctorName: 'د. أحمد علي', status: 'مكتمل' },
  { id: 10, date: new Date(2026, 2, 20), time: '15:00', patientName: 'ليلى يوسف', doctorName: 'د. ليلى خالد', status: 'مكتمل' },
  { id: 11, date: new Date(2026, 2, 21), time: '10:30', patientName: 'خالد عمر', doctorName: 'د. سامي يوسف', status: 'مكتمل' },
  { id: 12, date: new Date(2026, 2, 24), time: '09:00', patientName: 'منى عبدالله', doctorName: 'د. أحمد علي', status: 'مكتمل' },
  { id: 13, date: new Date(2026, 2, 25), time: '14:30', patientName: 'أحمد محمد', doctorName: 'د. ليلى خالد', status: 'مكتمل' },
  { id: 14, date: new Date(2026, 2, 26), time: '11:00', patientName: 'سارة أحمد', doctorName: 'د. سامي يوسف', status: 'مكتمل' },
  { id: 15, date: new Date(2026, 2, 27), patientName: 'محمود علي', doctorName: 'د. سامي يوسف', time: '10:30', status: 'مكتمل' },
  { id: 16, date: new Date(2026, 2, 27), patientName: 'ليلى يوسف', doctorName: 'د. أحمد علي', time: '12:00', status: 'مكتمل' },
  { id: 17, date: new Date(2026, 2, 27), patientName: 'خالد عمر', doctorName: 'د. ليلى خالد', time: '14:00', status: 'قيد الانتظار' },
  { id: 18, date: new Date(2026, 2, 28), patientName: 'منى عبدالله', doctorName: 'د. سامي يوسف', time: '09:30', status: 'قيد الانتظار' },
];

const AppointmentsList = () => {
  const { isAr, t } = useLanguage();
  const T = appointmentsTranslations;
  const currentLocale = isAr ? ar : enUS;
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

  // Cross-tab broadcast: serialize appointments for broadcasting
  const serializeAppointments = (apps: Appointment[]) =>
    apps.map(a => ({ ...a, date: a.date instanceof Date ? a.date.toISOString() : String(a.date) }));

  const { broadcast } = useBroadcast((event) => {
    if (event.type === 'APPOINTMENTS_UPDATE') {
      // Incoming sync from another tab — rehydrate dates
      setAppointments(event.appointments.map(a => ({ ...a, date: new Date(a.date) })));
    }
  });

  // Helper to update appointments and broadcast to other tabs
  const updateAndBroadcast = (updater: (prev: Appointment[]) => Appointment[]) => {
    setAppointments(prev => {
      const next = updater(prev);
      broadcast({ type: 'APPOINTMENTS_UPDATE', appointments: serializeAppointments(next) });
      return next;
    });
  };

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

  // Drag and Drop States
  const [draggedApp, setDraggedApp] = useState<Appointment | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [dropTargetDate, setDropTargetDate] = useState<Date | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const scrollSpeed = useRef(0);

  // Auto-scroll loop effect
  useEffect(() => {
    if (!draggedApp) {
      scrollSpeed.current = 0;
      return;
    }

    let animationFrameId: number;
    const scroll = () => {
      if (scrollContainerRef.current && scrollSpeed.current !== 0) {
        scrollContainerRef.current.scrollLeft += scrollSpeed.current;
      }
      animationFrameId = requestAnimationFrame(scroll);
    };

    animationFrameId = requestAnimationFrame(scroll);
    return () => cancelAnimationFrame(animationFrameId);
  }, [draggedApp]);

  const handleAutoScroll = useCallback((clientX: number) => {
    if (!scrollContainerRef.current || !draggedApp) {
      scrollSpeed.current = 0;
      return;
    }

    const container = scrollContainerRef.current;
    const rect = container.getBoundingClientRect();
    const edgeSize = 80; // Distance from edge to start scrolling
    const maxSpeed = 15;

    // Relative position within the container
    if (clientX < rect.left + edgeSize) {
      // Near left edge
      const factor = Math.max(0, (rect.left + edgeSize - clientX) / edgeSize);
      scrollSpeed.current = -maxSpeed * factor;
    } else if (clientX > rect.right - edgeSize) {
      // Near right edge
      const factor = Math.max(0, (clientX - (rect.right - edgeSize)) / edgeSize);
      scrollSpeed.current = maxSpeed * factor;
    } else {
      scrollSpeed.current = 0;
    }
  }, [draggedApp]);

  const handleDragStart = (e: React.DragEvent, app: Appointment) => {
    // Custom drag ghosting
    const emptyImg = new Image();
    emptyImg.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
    e.dataTransfer.setDragImage(emptyImg, 0, 0);
    
    setDraggedApp(app);
    e.dataTransfer.setData('appId', app.id.toString());
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, date: Date) => {
    e.preventDefault();
    setMousePos({ x: e.clientX, y: e.clientY });
    handleAutoScroll(e.clientX);
    setDropTargetDate(date);
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, newDate: Date) => {
    e.preventDefault();
    const appId = parseInt(e.dataTransfer.getData('appId'));
    const app = draggedApp || appointments.find(a => a.id === appId);

    if (app) {
      if (isSameDay(app.date, newDate)) {
         window.showToast?.(isAr ? 'الموعد موجود بالفعل في هذا اليوم' : 'Appointment is already on this day', 'error');
      } else {
        updateAndBroadcast(prev => prev.map(a => 
          a.id === app.id ? { ...a, date: newDate } : a
        ));
        window.showToast?.(isAr ? 'تم نقل الموعد بنجاح' : 'Appointment moved successfully', 'success');
      }
    }

    setDraggedApp(null);
    setDropTargetDate(null);
  };

  const handleDragEnd = () => {
    setDraggedApp(null);
    setDropTargetDate(null);
  };

  const handleTouchStart = (e: React.TouchEvent, app: Appointment) => {
    setDraggedApp(app);
    setMousePos({ x: e.touches[0].clientX, y: e.touches[0].clientY });
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!draggedApp) return;
    
    // Update preview position
    const touch = e.touches[0];
    setMousePos({ x: touch.clientX, y: touch.clientY });
    handleAutoScroll(touch.clientX);

    // Find if floating over a day
    const target = document.elementFromPoint(touch.clientX, touch.clientY);
    const dayElement = target?.closest('[data-date]');
    if (dayElement) {
      const dateStr = dayElement.getAttribute('data-date');
      if (dateStr) {
        setDropTargetDate(new Date(dateStr));
      }
    } else {
      setDropTargetDate(null);
    }
  };

  const handleTouchEnd = () => {
    if (!draggedApp) return;

    if (dropTargetDate) {
      if (isSameDay(draggedApp.date, dropTargetDate)) {
        window.showToast?.(isAr ? 'الموعد موجود بالفعل في هذا اليوم' : 'Appointment is already on this day', 'error');
      } else {
        updateAndBroadcast(prev => prev.map(a => 
          a.id === draggedApp.id ? { ...a, date: dropTargetDate } : a
        ));
        window.showToast?.(isAr ? 'تم نقل الموعد بنجاح' : 'Appointment moved successfully', 'success');
      }
    }

    setDraggedApp(null);
    setDropTargetDate(null);
  };

  useEffect(() => {
    if (!draggedApp) return;

    const handleGlobalMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
      handleAutoScroll(e.clientX);
    };

    const handleGlobalTouchMove = (e: TouchEvent) => {
      setMousePos({ x: e.touches[0].clientX, y: e.touches[0].clientY });
      handleAutoScroll(e.touches[0].clientX);
    };

    window.addEventListener('mousemove', handleGlobalMouseMove);
    window.addEventListener('touchmove', handleGlobalTouchMove, { passive: false });
    
    return () => {
      window.removeEventListener('mousemove', handleGlobalMouseMove);
      window.removeEventListener('touchmove', handleGlobalTouchMove);
    };
  }, [draggedApp, handleAutoScroll]);

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
  const startDate = startOfWeek(monthStart, { locale: currentLocale });
  const endDate = endOfWeek(monthEnd, { locale: currentLocale });

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
        status: data.status || 'pending',
      };
      updateAndBroadcast(prev => [...prev, newApp]);
    } else if (dialogMode === 'edit' && currentAppointment) {
      updateAndBroadcast(prev => prev.map(a => a.id === currentAppointment.id ? { ...a, ...data } : a));
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
      updateAndBroadcast(prev => prev.filter(a => a.id !== appointmentToDelete.id));
      window.showToast?.(t('toast_delete_success', T));
    }
    setIsDeleteModalOpen(false);
  };

  const years = Array.from({ length: 10 }, (_, i) => (getYear(new Date()) - 5 + i).toString());
  const months = Array.from({ length: 12 }, (_, i) => ({
    label: format(new Date(2026, i, 1), 'MMMM', { locale: currentLocale }),
    value: i.toString()
  }));


  return (
    <section className="space-y-6" dir={isAr ? "rtl" : "ltr"}>
      {/* Page Header */}
      <header className={cn(
        "flex flex-col md:flex-row md:items-center md:justify-between gap-4 opacity-0",
        canAnimate && "animate-fadeDown animate-delay-100"
      )}>
        <div className="text-start">
          <h1 className="text-3xl mb-1 font-extrabold">{t('page_title', T)}</h1>
          <p className="text-muted-foreground">{t('page_desc', T)}</p>
        </div>

        <div className="flex items-center flex-wrap gap-3">
          <Select value={selectedDoctor} onValueChange={setSelectedDoctor}>
            <SelectTrigger className="w-56 h-10 bg-white border-border shadow-xs">
              <SelectValue placeholder={t('select_doctor', T)} />
            </SelectTrigger>
            <SelectContent smallZ={true}>
              <SelectItem value="all">{t('all_doctors', T)}</SelectItem>
              <SelectItem value="1">د. أحمد علي</SelectItem>
              <SelectItem value="2">د. سامي يوسف</SelectItem>
              <SelectItem value="3">د. ليلى خالد</SelectItem>
            </SelectContent>
          </Select>

          <Button
            className="h-10 px-6 rounded-xl"
            onClick={() => handleOpenDialog('add')}
          >
            <Plus className={cn("size-4", isAr ? "ml-2" : "mr-2")} />
            {t('add_appointment', T)}
          </Button>
        </div>
      </header>

      {/* Calendar Grid Container */}
      <section className={cn("flex justify-between flex-col md:flex-row items-start ", selectedDate ? "gap-6" : "gap-0")}>
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
          <header className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-4">
            <div className="flex items-center gap-2 order-2 sm:order-1 py-1">
              <Button
                variant="outline"
                size="icon"
                onClick={nextMonth}
                className="size-10 px-2.5 rounded-xl hover:-translate-y-1 duration-200 hover:bg-primary/5 hover:border-primary/30 transition-all shadow-xs"
              >
                {isAr ? <ChevronRight className="size-5" /> : <ChevronLeft className="size-5" />}
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={prevMonth}
                className="size-10 px-2.5 hover:-translate-y-1 duration-200 rounded-xl hover:bg-primary/5 hover:border-primary/30 transition-all shadow-xs"
              >
                {isAr ? <ChevronLeft className="size-5" /> : <ChevronRight className="size-5" />}
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
          </header>

          {/* Mobile Swipe Indicator */}
          <aside className="md:hidden flex items-center justify-center gap-3 mb-4 py-2 px-4 rounded-full bg-muted/30 text-muted-foreground/80 text-xs font-bold ring-1 ring-border/50 animate-pulse backdrop-blur-xs">
            <Smartphone className="size-3.5" />
            <span>{t('mobile_swipe', T)}</span>
            <MoveHorizontal className={cn("size-3.5", isAr ? "rotate-0" : "rotate-180")} />
          </aside>

          <div 
            ref={scrollContainerRef}
            className="overflow-x-auto pb-2 scrollbar-none md:scrollbar-auto"
          >
            <div className="min-w-[800px] w-full lg:min-w-0">
              {/* Day Headers */}
              <figure className="grid grid-cols-7 gap-3 mb-2">
                {[t('days.sun', T), t('days.mon', T), t('days.tue', T), t('days.wed', T), t('days.thu', T), t('days.fri', T), t('days.sat', T)].map((day) => (
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
                      onDragOver={(e) => handleDragOver(e, date)}
                      onDrop={(e) => handleDrop(e, date)}
                      data-date={date.toISOString()}
                      className={cn(
                        "min-h-[100px] p-2 rounded-xl border-2 transition-all duration-300 cursor-pointer group relative touch-none",
                        isSelected ? "border-primary bg-primary/10 shadow-lg shadow-primary/20" :
                        isToday ? "border-primary/50 bg-primary/5 shadow-md shadow-primary/5" :
                        "border-border bg-muted/20 hover:border-primary/50 hover:bg-muted/40 hover:shadow-md",
                        dropTargetDate && isSameDay(date, dropTargetDate) && "border-dashed border-primary ring-4 ring-primary/10 scale-[1.02] z-30"
                      )}
                    >
                      <div className="flex flex-col h-full relative z-10">
                        <div className={cn(
                          "text-sm mb-2 font-medium transition-colors",
                          isSelected || isToday ? "text-primary font-bold" : "text-foreground group-hover:text-primary"
                        )}>
                          {format(date, 'd', { locale: currentLocale })}
                        </div>

                        <div className="space-y-1 flex-1">
                          {dayAppointments.slice(0, 2).map((app) => {
                            const config = statusConfig[app.status] || statusConfig[isAr ? 'قيد الانتظار' : 'pending'];
                            return (
                              <div
                                key={app.id}
                                draggable
                                onDragStart={(e) => handleDragStart(e, app)}
                                onDragEnd={handleDragEnd}
                                onTouchStart={(e) => handleTouchStart(e, app)}
                                onTouchMove={handleTouchMove}
                                onTouchEnd={handleTouchEnd}
                                className={cn(
                                  "text-xs p-1.5 rounded-lg border shadow-sm cursor-grab active:cursor-grabbing transition-all duration-200 hover:scale-[1.02] relative z-20 group/app touch-none",
                                  draggedApp?.id === app.id ? "opacity-30 scale-95" : "opacity-100",
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
                              {t('more', T).replace('{n}', (dayAppointments.length - 2).toString())}
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

        <section
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
              <header className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold">
                  {format(selectedDate || lastSelectedDate!, isAr ? 'EEEE، d MMMM' : 'EEEE, d MMMM', { locale: currentLocale })}
                </h3>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleCloseDetail}
                  className="size-8 px-2 rounded-full hover:bg-rose-50 hover:text-rose-600 transition-colors"
                >
                  <X className="size-4" />
                </Button>
              </header>

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
                            <article
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
                                  <figure className="flex items-center gap-2">
                                    <Clock className={cn("size-4", config.iconColor)} />
                                    <figcaption className={cn("text-sm font-bold", config.text)}>{app.time}</figcaption>
                                  </figure>
                                  <span className={cn(
                                    "inline-flex items-center justify-center rounded-lg px-2 py-0.5 text-[10px] font-bold w-fit whitespace-nowrap shrink-0 border shadow-sm transition-all duration-300",
                                    config.bg,
                                    config.text,
                                    config.border
                                  )}>
                                    <div className={cn("size-1 rounded-full", isAr ? "ml-1" : "mr-1", config.dotColor)} />
                                    {app.status === 'قيد الانتظار' ? t('dialog.status_pending', T) : 
                                     app.status === 'مكتمل' ? t('dialog.status_completed', T) : 
                                     app.status === 'ملغي' ? t('dialog.status_canceled', T) :
                                     app.status}
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

                                <div className={cn("flex gap-2 pt-2", isAr ? "flex-row" : "flex-row-reverse")}>
                                  <button
                                    onClick={() => handleOpenDialog('view', app)}
                                    className="inline-flex items-center justify-center whitespace-nowrap font-medium transition-all duration-300 border bg-background text-foreground hover:bg-accent hover:text-accent-foreground rounded-md gap-1.5 px-3 flex-1 h-8 text-xs hover:border-primary/30 hover:shadow-lg hover:-translate-y-0.5"
                                  >
                                    <Eye className={cn("size-3.5", isAr ? "ml-1" : "mr-1")} /> {t('actions.view', T)}
                                  </button>
                                  <button
                                    onClick={() => handleOpenDialog('edit', app)}
                                    className="inline-flex items-center justify-center whitespace-nowrap font-medium transition-all duration-300 border bg-background text-foreground hover:bg-accent hover:text-accent-foreground rounded-md gap-1.5 px-3 flex-1 h-8 text-xs hover:border-primary/30 hover:shadow-lg hover:-translate-y-0.5"
                                  >
                                    <SquarePen className={cn("size-3.5", isAr ? "ml-1" : "mr-1")} /> {t('actions.edit', T)}
                                  </button>
                                  <button
                                    onClick={() => handleDeleteAppointment(app.id)}
                                    className="inline-flex items-center justify-center whitespace-nowrap font-medium transition-all duration-300 border bg-background text-destructive hover:bg-destructive/10 rounded-md gap-1.5 px-3 h-8 text-xs hover:border-primary/30 hover:shadow-lg hover:-translate-y-0.5 shrink-0"
                                  >
                                    <Trash2 className="size-3.5" />
                                  </button>
                                </div>
                              </div>
                            </article>
                          );
                        })
                    ) : (
                      <div className="text-center py-12 text-muted-foreground flex flex-col items-center gap-3">
                        <FaCalendarAlt className="size-12 opacity-10" />
                        <p className="text-sm">{t('no_appointments', T)}</p>
                      </div>
                    )}
                  </div>
                </ScrollLockWrapper>
              </div>
            </article>
          )}
        </section>
      </section>

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
        title={t('delete_confirm_title', T)}
        message={t('delete_confirm_msg', T).replace('{name}', appointmentToDelete?.patientName || '')}
        confirmText={t('delete', T)}
        cancelText={t('cancel', T)}
        variant="danger"
      />

      {/* Drag Preview Portal */}
      {draggedApp && (
        <div 
          className="fixed pointer-events-none z-150 transition-transform duration-75"
          style={{ 
            left: mousePos.x, 
            top: mousePos.y, 
            transform: 'translate(-50%, -50%) rotate(3deg)',
            width: '160px'
          }}
        >
          <article
            className={cn(
              "text-xs p-3 rounded-xl border-2 shadow-2xl backdrop-blur-sm",
              statusConfig[draggedApp.status]?.bg || "bg-white",
              statusConfig[draggedApp.status]?.border || "border-primary/20",
              statusConfig[draggedApp.status]?.text || "text-foreground"
            )}
          >
            <div className="flex items-center gap-2 mb-1">
              <Clock className="size-3.5" />
              <span className="font-bold">{draggedApp.time}</span>
            </div>
            <div className="font-bold truncate">{draggedApp.patientName}</div>
            <div className="text-[10px] opacity-70 truncate">{draggedApp.doctorName}</div>
          </article>
        </div>
      )}
    </section>
  );
};

export default AppointmentsList;
