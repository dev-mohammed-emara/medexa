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
import { ChevronRight, ChevronLeft, Plus, Clock, User, Stethoscope, Eye, SquarePen, X, Smartphone, MoveHorizontal, Check } from 'lucide-react';
import { FaCalendarAlt } from 'react-icons/fa';
import { TbCancel } from 'react-icons/tb';
import { useEffect, useRef, useState, useCallback } from 'react';
import { useMediaQuery } from 'react-responsive';
import { Button } from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
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
import { fetchDoctors } from '../../api/doctorApi';
import { getCookie } from '../../utils/cookie';
// Mock data for appointments
const INITIAL_APPOINTMENTS: Appointment[] = [
  { id: 1, date: new Date(2026, 2, 2), time: '10:00', patientName: 'ahmed', doctorName: 'ahmed', status: 'completed' },
  { id: 2, date: new Date(2026, 2, 2), time: '11:30', patientName: 'sara', doctorName: 'layla', status: 'completed' },
  { id: 3, date: new Date(2026, 2, 6), time: '09:00', patientName: 'mahmoud', doctorName: 'ahmed', status: 'completed' },
  { id: 4, date: new Date(2026, 2, 6), time: '14:00', patientName: 'layla', doctorName: 'layla', status: 'canceled', canceledBy: 'doctor', cancellationReason: 'emergency' },
  { id: 5, date: new Date(2026, 2, 10), time: '10:00', patientName: 'khaled', doctorName: 'sami', status: 'completed' },
  { id: 6, date: new Date(2026, 2, 10), time: '11:00', patientName: 'muna', doctorName: 'ahmed', status: 'pending' },
  { id: 7, date: new Date(2026, 2, 15), time: '09:30', patientName: 'ahmed', doctorName: 'layla', status: 'completed' },
  { id: 8, date: new Date(2026, 2, 15), time: '16:00', patientName: 'sara', doctorName: 'sami', status: 'canceled', canceledBy: 'patient', cancellationReason: 'unexpected_travel' },
  { id: 9, date: new Date(2026, 2, 20), time: '13:00', patientName: 'mahmoud', doctorName: 'ahmed', status: 'completed' },
  { id: 10, date: new Date(2026, 2, 20), time: '15:00', patientName: 'layla', doctorName: 'layla', status: 'completed' },
  { id: 11, date: new Date(2026, 2, 21), time: '10:30', patientName: 'khaled', doctorName: 'sami', status: 'completed' },
  { id: 12, date: new Date(2026, 2, 24), time: '09:00', patientName: 'muna', doctorName: 'ahmed', status: 'completed' },
  { id: 13, date: new Date(2026, 2, 25), time: '14:30', patientName: 'ahmed', doctorName: 'layla', status: 'completed' },
  { id: 14, date: new Date(2026, 2, 26), time: '11:00', patientName: 'sara', doctorName: 'sami', status: 'completed' },
  { id: 15, date: new Date(2026, 2, 27), patientName: 'mahmoud', doctorName: 'sami', time: '10:30', status: 'completed' },
  { id: 16, date: new Date(2026, 2, 27), patientName: 'layla', doctorName: 'ahmed', time: '12:00', status: 'completed' },
  { id: 17, date: new Date(2026, 2, 27), patientName: 'khaled', doctorName: 'layla', time: '14:00', status: 'canceled', canceledBy: 'secretary', cancellationReason: 'reschedule' },
  { id: 18, date: new Date(2026, 2, 28), patientName: 'muna', doctorName: 'sami', time: '09:30', status: 'canceled', canceledBy: 'doctor', cancellationReason: 'emergency' },
];

const AppointmentsList = () => {
  const { isAr, t } = useLanguage();
  const T = appointmentsTranslations;
  const currentLocale = isAr ? ar : enUS;
  const { isLoaded, isExiting } = usePreloader();
  const canAnimate = isLoaded && !isExiting;

  const { isCollapsed, setIsCollapsed, previousCollapsedState, setPreviousCollapsedState } = useSidebar();
  const handleCloseDialog = useCallback(() => setIsDialogOpen(false), []);
  const handleCloseDeleteModal = useCallback(() => setIsDeleteModalOpen(false), []);
  const isMediumScreen = useMediaQuery({ query: '(min-width: 1024px) and (max-width: 1279px)' });

  const [currentDate, setCurrentDate] = useState(new Date(2026, 2, 27));
  const [selectedDoctor, setSelectedDoctor] = useState('all');
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [lastSelectedDate, setLastSelectedDate] = useState<Date | null>(null);

  // Data State
  const [appointments, setAppointments] = useState<Appointment[]>(INITIAL_APPOINTMENTS);
  const [doctorsList, setDoctorsList] = useState<any[]>([]);

  // Load doctors for filter select
  useEffect(() => {
    const loadDoctors = async () => {
      try {
        const res = await fetchDoctors({ size: 100 });
        if (res.content && res.content.length > 0) {
          setDoctorsList(res.content);
        } else {
          setDoctorsList([
            { uuid: '33c044ef-e69e-4dbb-839d-402f06ad0201', user: { firstName: 'Ahmad', lastName: 'Masri' } },
            { uuid: 'doctor-sami-uuid', user: { firstName: 'Sami', lastName: 'Sami' } },
            { uuid: 'doctor-layla-uuid', user: { firstName: 'Layla', lastName: 'Layla' } }
          ]);
        }
      } catch (err) {
        console.error('Failed to load doctors in list:', err);
        setDoctorsList([
          { uuid: '33c044ef-e69e-4dbb-839d-402f06ad0201', user: { firstName: 'Ahmad', lastName: 'Masri' } },
          { uuid: 'doctor-sami-uuid', user: { firstName: 'Sami', lastName: 'Sami' } },
          { uuid: 'doctor-layla-uuid', user: { firstName: 'Layla', lastName: 'Layla' } }
        ]);
      }
    };
    loadDoctors();
  }, []);

  // Fetch calendar appointments
  const loadCalendarAppointments = useCallback(async () => {
    try {
      const month = getMonth(currentDate) + 1;
      const year = getYear(currentDate);
      const queryParams = new URLSearchParams();
      queryParams.append('month', String(month));
      queryParams.append('year', String(year));
      if (selectedDoctor && selectedDoctor !== 'all') {
        queryParams.append('doctorId', selectedDoctor);
      }

      const token = getCookie('token');
      const response = await fetch(`/api/appointment/calendar?${queryParams.toString()}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        }
      });

      if (response.ok) {
        const data = await response.json();
        const mapped = data.flatMap((dayData: any) => {
          return dayData.appointments.map((app: any) => ({
            id: app.uuid,
            uuid: app.uuid,
            date: new Date(dayData.date),
            time: app.appointmentStartTime,
            endTime: app.appointmentEndTime,
            patientName: app.patientName,
            doctorName: app.doctorName,
            status: app.status.toLowerCase(),
            patientId: app.patientUuid || '',
            doctorId: app.doctorUuid || '',
          }));
        });
        setAppointments([...mapped, ...INITIAL_APPOINTMENTS]);
      } else {
        setAppointments(INITIAL_APPOINTMENTS);
      }
    } catch (error) {
      console.error('Error fetching calendar appointments:', error);
      setAppointments(INITIAL_APPOINTMENTS);
    }
  }, [currentDate, selectedDoctor]);

  useEffect(() => {
    loadCalendarAppointments();
  }, [loadCalendarAppointments]);

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
  const [canceledBy, setCanceledBy] = useState('');
  const [cancellationReason, setCancellationReason] = useState('');

  // Complete Appointment Modal State
  const [isCompleteModalOpen, setIsCompleteModalOpen] = useState(false);
  const [appointmentToComplete, setAppointmentToComplete] = useState<Appointment | null>(null);
  const [completeData, setCompleteData] = useState({
    byWho: '',
    diagnosis: '',
    treatmentPlan: '',
    doctorNotes: '',
    attachments: ''
  });

  // Height and Scroll tracking for the detail sidebar
  const calendarRef = useRef<HTMLElement>(null);
  const detailSidebarRef = useRef<HTMLDivElement>(null);

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

  const handleOpenDialog = useCallback((mode: 'add' | 'edit' | 'view', app?: Appointment) => {
    setDialogMode(mode);
    setCurrentAppointment(app || null);
    setIsDialogOpen(true);
  }, []);

  const handleConfirmAppointment = useCallback((_data: Partial<Appointment>) => {
    loadCalendarAppointments();
    setIsDialogOpen(false);
  }, [loadCalendarAppointments]);

  const handleDeleteAppointment = useCallback((appId: string | number) => {
    const app = appointments.find(a => a.id === appId);
    if (app) {
      setAppointmentToDelete(app);
      setCanceledBy('');
      setCancellationReason('');
      setIsDeleteModalOpen(true);
    }
  }, [appointments]);

  const confirmDelete = () => {
    if (appointmentToDelete) {
      updateAndBroadcast(prev => prev.map(a =>
        a.id === appointmentToDelete.id
          ? { ...a, status: 'canceled', canceledBy: canceledBy as any, cancellationReason }
          : a
      ));
      window.showToast?.(t('toast_delete_success', T));
      // Removed setIsDialogOpen(false) to keep the underlying modal open as requested
    }
    setIsDeleteModalOpen(false);
  };

  const handleOpenCompleteModal = (app: Appointment) => {
    setAppointmentToComplete(app);
    setCompleteData({
      byWho: app.doctorName,
      diagnosis: '',
      treatmentPlan: '',
      doctorNotes: '',
      attachments: ''
    });
    setIsCompleteModalOpen(true);
  };

  const confirmComplete = () => {
    if (appointmentToComplete) {
      updateAndBroadcast(prev => prev.map(a =>
        a.id === appointmentToComplete.id
          ? {
            ...a,
            status: 'completed',
            medicalRecord: completeData, // Assuming we want to store this
            doctorNotes: completeData.doctorNotes || a.doctorNotes // Update notes if provided
          }
          : a
      ));
      window.showToast?.(t('toast_complete_success', T), 'success');
    }
    setIsCompleteModalOpen(false);
    setAppointmentToComplete(null);
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
              {doctorsList.map((doc) => (
                <SelectItem key={doc.uuid} value={doc.uuid}>
                  {doc.user ? `${doc.user.firstName} ${doc.user.lastName}` : doc.uuid}
                </SelectItem>
              ))}
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
      <section className={cn("flex justify-between flex-col lg:flex-row items-start", selectedDate ? "gap-6" : "gap-0")}>
        <article
          ref={calendarRef}
          data-slot="card"
          className={cn(
            "transition-[width] duration-700 ease-in-out will-change-[width] flex flex-col gap-6 rounded-2xl border shadow-xl p-6 bg-white border-border opacity-0",
            selectedDate ? "lg:w-[67%] w-full" : "w-full",
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
                        "min-h-[100px] p-2 rounded-xl border-2 transition-all duration-300 cursor-pointer group relative touch-pan-y",
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
                            const config = statusConfig[app.status] || statusConfig['pending'];
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
                                  "text-xs p-1.5 rounded-lg border shadow-sm cursor-grab active:cursor-grabbing transition-all duration-200 hover:scale-[1.02] relative z-20 group/app touch-pan-y",
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
                                <div className="truncate text-[10px] mt-0.5 font-bold">
                                  {(() => {
                                    const key = `dialog.patients.${app.patientName}`;
                                    const translated = t(key, T);
                                    return translated === key ? app.patientName : translated;
                                  })()}
                                </div>
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
            "lg:sticky lg:top-0 self-start z-20 h-fit",
            !selectedDate ? "w-0 opacity-0 pointer-events-none invisible" : "w-full lg:w-[33%] opacity-100 visible transition-all duration-700 ease-in-out",
            "max-lg:w-full"
          )}
        >
          {(selectedDate || lastSelectedDate) && (
            <article
              data-slot="card"
              className={cn(
                "flex flex-col w-full gap-6 rounded-2xl border shadow-xl p-6 bg-white border-border transition-all duration-500",
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

              <div className="overflow-visible">
                <div
                  className="py-1 w-full detail-sidebar-scroll custom-scrollbar overflow-y-auto"
                  style={{ maxHeight: `calc(100vh - 250px)` }}
                >
                  <div className="space-y-4">
                    {appointments.filter(app => isSameDay(app.date, selectedDate || lastSelectedDate!)).length > 0 ? (
                      appointments
                        .filter(app => isSameDay(app.date, selectedDate || lastSelectedDate!))
                        .map((app) => {
                          const config = statusConfig[app.status] || statusConfig['pending'];

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
                                    {app.status === 'pending' ? t('dialog.status_pending', T) :
                                     app.status === 'completed' ? t('dialog.status_completed', T) :
                                     app.status === 'canceled' ? t('dialog.status_canceled', T) :
                                     app.status}
                                  </span>
                                </div>

                                <div className="space-y-2">
                                  <div className="flex items-center gap-2">
                                    <User className="size-3.5 text-muted-foreground" />
                                    <span className="text-sm font-medium">
                                      {(() => {
                                        const key = `dialog.patients.${app.patientName}`;
                                        const translated = t(key, T);
                                        return translated === key ? app.patientName : translated;
                                      })()}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <Stethoscope className="size-3.5 text-muted-foreground" />
                                    <span className="text-sm text-muted-foreground">
                                      {(() => {
                                        const key = `dialog.doctors.${app.doctorName}`;
                                        const translated = t(key, T);
                                        return translated === key ? app.doctorName : translated;
                                      })()}
                                    </span>
                                  </div>
                                </div>

                                <div className={cn("flex flex-wrap gap-2 pt-2", isAr ? "flex-row" : "flex-row-reverse")}>
                                  <button
                                    onClick={(e) => { e.stopPropagation(); handleOpenDialog('view', app); }}
                                    className="inline-flex items-center justify-center whitespace-nowrap font-medium transition-all duration-300 border bg-background text-foreground hover:bg-accent hover:text-accent-foreground rounded-md gap-1.5 px-3 flex-1 h-8 text-xs hover:border-primary/30 hover:shadow-lg hover:-translate-y-0.5"
                                  >
                                    <Eye className={cn("size-3.5", isAr ? "ml-1" : "mr-1")} /> {t('actions.view', T)}
                                  </button>
                                  {app.status === 'pending' && (
                                    <>
                                      <button
                                        onClick={(e) => { e.stopPropagation(); handleOpenDialog('edit', app); }}
                                        className="inline-flex items-center justify-center whitespace-nowrap font-medium transition-all duration-300 border bg-background text-foreground hover:bg-accent hover:text-accent-foreground rounded-md gap-1.5 px-3 flex-1 h-8 text-xs hover:border-primary/30 hover:shadow-lg hover:-translate-y-0.5"
                                      >
                                        <SquarePen className={cn("size-3.5", isAr ? "ml-1" : "mr-1")} /> {t('actions.edit', T)}
                                      </button>
                                      <button
                                        onClick={(e) => { e.stopPropagation(); handleOpenCompleteModal(app); }}
                                        className="inline-flex items-center justify-center whitespace-nowrap font-medium transition-all duration-300 border bg-emerald-600 text-white hover:bg-emerald-700 rounded-md p-2 size-8 text-xs shadow-sm hover:shadow-emerald-200/50 hover:-translate-y-0.5"
                                      >
                                        <Check className="size-4" />
                                      </button>
                                      <button
                                        onClick={(e) => { e.stopPropagation(); handleDeleteAppointment(app.id); }}
                                        className="inline-flex items-center justify-center whitespace-nowrap font-medium transition-all duration-300 border border-rose-200 bg-rose-600 text-white hover:bg-rose-700 rounded-md p-2 size-8 text-xs shadow-sm hover:shadow-rose-200/50 hover:-translate-y-0.5 shrink-0"
                                      >
                                        <TbCancel className="size-4" />
                                      </button>
                                    </>
                                  )}
                                </div>

                                {app.status === 'canceled' && (
                                  <div className="mt-2 p-3 rounded-lg bg-rose-50 border-2 border-dashed border-rose-200 space-y-2 animate-in fade-in duration-300 shadow-sm">
                                    <div className="flex items-center gap-1.5 text-[10px] font-bold text-rose-600">
                                      <X className="size-3" />
                                      {t('canceled_by', T)}: {app.canceledBy === 'doctor' ? t('cancelers.doctor', T) :
                                                              app.canceledBy === 'patient' ? t('cancelers.patient', T) :
                                                              app.canceledBy === 'secretary' ? t('cancelers.secretary', T) :
                                                              (app.canceledBy || (isAr ? "غير محدد" : "Not specified"))}
                                    </div>
                                    <p className="text-[10px] text-rose-700 leading-relaxed italic bg-white/60 p-2 rounded-md border border-rose-100/50">
                                      {t(`cancel_reasons.${app.cancellationReason}`, T) || app.cancellationReason || (isAr ? "لا يوجد سبب محدد" : "No specific reason provided")}
                                    </p>
                                  </div>
                                )}
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
                </div>
              </div>
            </article>
          )}
        </section>
      </section>

      <AppointmentsDialog
        key={currentAppointment?.id || 'new'}
        isOpen={isDialogOpen}
        onClose={handleCloseDialog}
        onConfirm={handleConfirmAppointment}
        mode={dialogMode}
        initialData={currentAppointment}
        onComplete={handleOpenCompleteModal}
        onCancel={(app) => {
          setAppointmentToDelete(app);
          setCanceledBy('');
          setCancellationReason('');
          setIsDeleteModalOpen(true);
        }}
      />

      <Modal
        isOpen={isDeleteModalOpen}
        onClose={handleCloseDeleteModal}
        onConfirm={confirmDelete}
        title={t('delete_confirm_title', T)}
        message={t('delete_confirm_msg', T).replace('{name}', (() => {
          const key = `dialog.patients.${appointmentToDelete?.patientName}`;
          const translated = t(key, T);
          return translated === key ? (appointmentToDelete?.patientName || '') : translated;
        })())}
        confirmText={t('delete', T)}
        cancelText={t('cancel', T)}
        variant="danger"
        isConfirmDisabled={!canceledBy || !cancellationReason.trim()}
      >
        <div className="space-y-4 mt-6">
          <div className="space-y-2">
            <label className="text-sm font-bold text-foreground/80 px-1 block text-start">
              {t('canceled_by', T)} <span className="text-destructive">*</span>
            </label>
            <Select value={canceledBy} onValueChange={setCanceledBy}>
              <SelectTrigger className="h-12 rounded-xl bg-muted/20 border-border">
                <SelectValue placeholder={t('select_canceler', T)} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="doctor">{t('cancelers.doctor', T)}</SelectItem>
                <SelectItem value="patient">{t('cancelers.patient', T)}</SelectItem>
                <SelectItem value="secretary">{t('cancelers.secretary', T)}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-foreground/80 px-1 block text-start">
              {t('reason', T)} <span className="text-destructive">*</span>
            </label>
            <textarea
              value={cancellationReason}
              onChange={(e) => setCancellationReason(e.target.value)}
              placeholder={t('enter_reason', T)}
              className={cn(
                "w-full h-[100px] p-4 rounded-xl border border-border bg-muted/20 text-sm outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all resize-none disabled:opacity-50 placeholder:text-muted-foreground font-bold",
                isAr ? "text-right" : "text-left"
              )}
              dir={isAr ? 'rtl' : 'ltr'}
            />
          </div>
        </div>
      </Modal>

      {/* Complete Appointment Modal */}
      <Modal
        isOpen={isCompleteModalOpen}
        onClose={() => setIsCompleteModalOpen(false)}
        onConfirm={confirmComplete}
        title={t('complete_confirm_title', T)}
        confirmText={t('complete', T)}
        cancelText={t('cancel', T)}
        variant="primary"
        isConfirmDisabled={!completeData.byWho || !completeData.diagnosis.trim() || !completeData.treatmentPlan.trim()}
      >
        <div className="space-y-4 mt-6">
          <p className="text-muted-foreground text-sm mb-4">
            {t('complete_confirm_msg', T).replace('{name}', (() => {
              const key = `dialog.patients.${appointmentToComplete?.patientName}`;
              const translated = t(key, T);
              return translated === key ? (appointmentToComplete?.patientName || '') : translated;
            })())}
          </p>

          <div className="space-y-2">
            <label className="text-sm font-bold text-foreground/80 px-1 block text-start">
              {t('by_who', T)} <span className="text-destructive">*</span>
            </label>
            <Select value={completeData.byWho} onValueChange={(val) => setCompleteData(prev => ({ ...prev, byWho: val }))}>
              <SelectTrigger className="h-12 rounded-xl bg-muted/20 border-border shadow-xs">
                <SelectValue placeholder={t('select_doctor', T)} />
              </SelectTrigger>
              <SelectContent className="z-[2000]">
                <SelectItem value="ahmed">{t('dialog.doctors.ahmed', T)}</SelectItem>
                <SelectItem value="sami">{t('dialog.doctors.sami', T)}</SelectItem>
                <SelectItem value="layla">{t('dialog.doctors.layla', T)}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-foreground/80 px-1 block text-start">
              {t('diagnosis', T)} <span className="text-destructive">*</span>
            </label>
            <textarea
              value={completeData.diagnosis}
              onChange={(e) => setCompleteData(prev => ({ ...prev, diagnosis: e.target.value }))}
              placeholder={t('diagnosis', T)}
              className={cn(
                "w-full min-h-[80px] p-4 rounded-xl border border-border bg-muted/20 focus:ring-4 focus:ring-primary/10 transition-all outline-none font-medium text-sm resize-none",
                isAr ? "text-right" : "text-left"
              )}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-foreground/80 px-1 block text-start">
              {t('treatment_plan', T)} <span className="text-destructive">*</span>
            </label>
            <textarea
              value={completeData.treatmentPlan}
              onChange={(e) => setCompleteData(prev => ({ ...prev, treatmentPlan: e.target.value }))}
              placeholder={t('treatment_plan', T)}
              className={cn(
                "w-full min-h-[80px] p-4 rounded-xl border border-border bg-muted/20 focus:ring-4 focus:ring-primary/10 transition-all outline-none font-medium text-sm resize-none",
                isAr ? "text-right" : "text-left"
              )}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-foreground/80 px-1 block text-start">
              {t('dialog.doctor_notes', T)}
            </label>
            <textarea
              value={completeData.doctorNotes}
              onChange={(e) => setCompleteData(prev => ({ ...prev, doctorNotes: e.target.value }))}
              placeholder={t('dialog.doctor_notes', T)}
              className={cn(
                "w-full min-h-[80px] p-4 rounded-xl border border-border bg-muted/20 focus:ring-4 focus:ring-primary/10 transition-all outline-none font-medium text-sm resize-none",
                isAr ? "text-right" : "text-left"
              )}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-foreground/80 px-1 block text-start">
              {t('attachments', T)}
            </label>
            <div className="h-12 rounded-xl bg-muted/10 border-2 border-dashed border-border flex items-center justify-center text-muted-foreground text-xs italic">
              {t('attachments', T)}
            </div>
          </div>
        </div>
      </Modal>


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
            <div className="font-bold truncate">
              {(() => {
                const key = `dialog.patients.${draggedApp.patientName}`;
                const translated = t(key, T);
                return translated === key ? draggedApp.patientName : translated;
              })()}
            </div>
            <div className="text-[10px] opacity-70 truncate">
              {(() => {
                const key = `dialog.doctors.${draggedApp.doctorName}`;
                const translated = t(key, T);
                return translated === key ? draggedApp.doctorName : translated;
              })()}
            </div>
          </article>
        </div>
      )}
    </section>
  );
};

export default AppointmentsList;
