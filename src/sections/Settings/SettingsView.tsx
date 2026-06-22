import { useState, useEffect } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '../../components/ui/select';
import { usePreloader } from '../../contexts/PreloaderContext';
import { useLanguage } from '../../contexts/LanguageContext';

import { settingsTranslations } from '../../constants/settings';
import { navTranslations } from '../../constants/nav';
import { Switch } from '../../components/ui/Switch';
import { cn } from '../../utils/cn';
import Modal from '../../components/ui/Modal';
import { getCookie } from '../../utils/cookie';
import { apiFetch } from '../../utils/apiFetch';
import Input from '../../components/ui/Input';
import TimePicker from '../../components/ui/TimePicker';
import {
  Settings as SettingsIcon,
  Globe,
  DollarSign,
  Plus,
  Trash2,
  Check,
  Clock,
  Pen,
  X
} from 'lucide-react';
import { FaCalendarAlt } from 'react-icons/fa';

interface WorkingPeriod {
  id: string;
  from: string;
  to: string;
}

interface WorkingDay {
  id: string;
  name: string;
  isActive: boolean;
  periods: WorkingPeriod[];
  isEditing?: boolean;
  originalPeriods?: WorkingPeriod[];
  originalActive?: boolean;
}

const INITIAL_DAYS: WorkingDay[] = [
  { id: 'sun', name: 'الأحد', isActive: true, periods: [{ id: '1', from: '08:00', to: '18:00' }] },
  { id: 'mon', name: 'الاثنين', isActive: true, periods: [{ id: '1', from: '08:00', to: '18:00' }] },
  { id: 'tue', name: 'الثلاثاء', isActive: true, periods: [{ id: '1', from: '08:00', to: '18:00' }] },
  { id: 'wed', name: 'الأربعاء', isActive: true, periods: [{ id: '1', from: '08:00', to: '18:00' }] },
  { id: 'thu', name: 'الخميس', isActive: true, periods: [{ id: '1', from: '08:00', to: '18:00' }] },
  { id: 'fri', name: 'الجمعة', isActive: false, periods: [] },
  { id: 'sat', name: 'السبت', isActive: false, periods: [] },
];

const ID_TO_SERVER_DAY: { [key: string]: string } = {
  sun: 'SUNDAY',
  mon: 'MONDAY',
  tue: 'TUESDAY',
  wed: 'WEDNESDAY',
  thu: 'THURSDAY',
  fri: 'FRIDAY',
  sat: 'SATURDAY'
};

interface SettingsViewProps {
  hideHeader?: boolean;
  className?: string;
  activeTab?: 'profile' | 'clinic';
}

const SettingsView = ({ hideHeader, className }: SettingsViewProps = {}) => {
  const { isLoaded, isExiting } = usePreloader();
  const canAnimate = isLoaded && !isExiting;
  const { language, setLanguage, isAr, t, dir } = useLanguage();
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);

  const T_PAGE = settingsTranslations;
  const T_NAV = navTranslations;

  // Form State
  const [currency, setCurrency] = useState('JOD');
  const [appointmentPeriod, setAppointmentPeriod] = useState(30);
  const [appointmentPeriodError, setAppointmentPeriodError] = useState<string | null>(null);
  const [days, setDays] = useState<WorkingDay[]>(INITIAL_DAYS);

  const [isEditingSchedule, setIsEditingSchedule] = useState(false);
  const [scheduleErrors, setScheduleErrors] = useState<Record<string, string[]>>({});

  const [savedCurrency, setSavedCurrency] = useState('JOD');
  const [savedLanguage, setSavedLanguage] = useState(language);
  const [savedAppointmentPeriod, setSavedAppointmentPeriod] = useState(30);
  const [savedDays, setSavedDays] = useState<WorkingDay[]>(INITIAL_DAYS);



  useEffect(() => {
    let cancelled = false;

    const loadClinicMe = async () => {
      try {
        const token = getCookie('token');
        const headers = {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        };
        const response = await apiFetch('/api/clinic/me', {
          method: 'GET',
          headers
        });
        if (response.ok) {
          const data = await response.json();
          if (!cancelled && data.settings) {
            setCurrency(data.settings.defaultCurrency || 'JOD');
            setSavedCurrency(data.settings.defaultCurrency || 'JOD');
            setAppointmentPeriod(data.settings.defaultAppointmentPeriod || 30);
            setSavedAppointmentPeriod(data.settings.defaultAppointmentPeriod || 30);
          }
        }
      } catch (err) {
        console.error('Error loading clinic settings:', err);
      }
    };
    loadClinicMe();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    let cancelled = false;

    setIsEditingSchedule(false);
    setScheduleErrors({});
    const loadSchedule = async () => {
      try {
        const token = getCookie('token');
        const headers = {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        };
        const response = await apiFetch('/api/clinicschedule/me', {
          method: 'GET',
          headers
        });
        if (response.ok) {
          const data = await response.json();
          const schedules = data.schedules || [];

          const mappedDays = INITIAL_DAYS.map(day => {
            const serverDayName = ID_TO_SERVER_DAY[day.id];
            const serverDay = schedules.find((s: any) => s.dayOfWeek === serverDayName);
            if (serverDay && serverDay.timeSlots && serverDay.timeSlots.length > 0) {
              const periods = serverDay.timeSlots.map((slot: any, idx: number) => ({
                id: (idx + 1).toString(),
                from: slot.startTime.substring(0, 5), // "09:00:00" -> "09:00"
                to: slot.endTime.substring(0, 5)
              }));
              return {
                ...day,
                isActive: true,
                periods
              };
            }
            return {
              ...day,
              isActive: false,
              periods: []
            };
          });

          if (!cancelled) {
            setDays(mappedDays);
            setSavedDays(JSON.parse(JSON.stringify(mappedDays)));
          }
        }
      } catch (err) {
        console.error('Error fetching schedule in settings:', err);
      }
    };
    loadSchedule();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Animations are handled via Tailwind classes to match Appointments page style

  const toggleDay = (id: string) => {
    setScheduleErrors({});
    setDays(prev => prev.map(day => {
      if (day.id === id) {
        const newState = !day.isActive;
        return {
          ...day,
          isActive: newState,
          periods: newState && day.periods.length === 0 ? [{ id: Date.now().toString(), from: '08:00', to: '18:00' }] : day.periods
        };
      }
      return day;
    }));
  };

  const addPeriod = (dayId: string) => {
    setScheduleErrors({});
    setDays(prev => prev.map(day => {
      if (day.id === dayId) {
        const lastPeriod = day.periods[day.periods.length - 1];
        let newPeriod;
        if (lastPeriod) {
          const from = lastPeriod.to;
          const [hStr, mStr] = from.split(':');
          let h = parseInt(hStr) + 2;
          if (h >= 24) h = h % 24;
          const to = `${h.toString().padStart(2, '0')}:${mStr || '00'}`;
          newPeriod = { id: Date.now().toString(), from, to };
        } else {
          newPeriod = { id: Date.now().toString(), from: '08:00', to: '10:00' };
        }
        return {
          ...day,
          periods: [...day.periods, newPeriod]
        };
      }
      return day;
    }));
  };

  const removePeriod = (dayId: string, periodId: string) => {
    setScheduleErrors({});
    setDays(prev => prev.map(day => {
      if (day.id === dayId) {
        return {
          ...day,
          periods: day.periods.filter(p => p.id !== periodId)
        };
      }
      return day;
    }));
  };

  const updatePeriod = (dayId: string, periodId: string, field: 'from' | 'to', value: string) => {
    setScheduleErrors({});
    setDays(prev => prev.map(day => {
      if (day.id === dayId) {
        return {
          ...day,
          periods: day.periods.map(p => p.id === periodId ? { ...p, [field]: value } : p)
        };
      }
      return day;
    }));
  };

  const workingDaysCount = days.filter(d => d.isActive).length;
  const offDaysCount = days.length - workingDaysCount;

  const [cancelingSection, setCancelingSection] = useState<'clinic' | 'general' | 'working' | null>(null);

  const handleSaveGeneralSettings = async () => {
    setAppointmentPeriodError(null);
    try {
      const token = getCookie('token');
      const headers = {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      };

      const response = await apiFetch('/api/clinic/setting', {
        method: 'PATCH',
        headers,
        body: JSON.stringify({
          defaultCurrency: currency,
          defaultAppointmentPeriod: appointmentPeriod
        })
      });

      if (response.ok) {
        setSavedCurrency(currency);
        setSavedLanguage(language);
        setSavedAppointmentPeriod(appointmentPeriod);
        window.showToast(t('common.settings_saved'), 'success');
      } else {
        let errMsg = 'Failed to save settings';
        try {
          const errData = await response.json();
          errMsg = errData.message || errData.error || errMsg;
        } catch (e) { /* ignore */ }
        setAppointmentPeriodError(errMsg);
        window.showToast(errMsg, 'error');
      }
    } catch (err: any) {
      console.error(err);
      setAppointmentPeriodError(err.message || 'Error saving settings');
      window.showToast(err.message || 'Error saving settings', 'error');
    }
  };

  const handleSaveSchedule = async () => {
    setScheduleErrors({});
    const token = getCookie('token');
    const headers = {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    };

    const schedulesPayload = days.map((day) => {
      const serverDayName = ID_TO_SERVER_DAY[day.id];
      if (!day.isActive || day.periods.length === 0) {
        return null;
      }
      return {
        dayOfWeek: serverDayName,
        timeSlots: day.periods.map(p => ({
          startTime: `${p.from}:00`,
          endTime: `${p.to}:00`
        }))
      };
    }).filter(Boolean);

    try {
      const response = await apiFetch('/api/clinicschedule/assignschedule', {
        method: 'PUT',
        headers,
        body: JSON.stringify({ schedules: schedulesPayload })
      });

      if (response.ok) {
        const data = await response.json();
        setDays(prev => prev.map(d => ({
          ...d,
          originalPeriods: JSON.parse(JSON.stringify(d.periods)),
          originalActive: d.isActive
        })));
        setIsEditingSchedule(false);
        window.showToast(data.message || t('common.settings_saved'), 'success');
      } else {
        let errMsg = 'Failed to assign clinic schedule';
        try {
          const errData = await response.json();
          if (errData.details && Array.isArray(errData.details)) {
            const dayErrors: Record<string, string[]> = {};
            const dayNames = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];

            errData.details.forEach((d: any) => {
              if (d.message) {
                const foundDay = dayNames.find(dayName => d.message.includes(dayName));
                if (foundDay) {
                  const dayId = Object.keys(ID_TO_SERVER_DAY).find(key => ID_TO_SERVER_DAY[key] === foundDay) || foundDay;
                  if (!dayErrors[dayId]) dayErrors[dayId] = [];
                  dayErrors[dayId].push(d.message);
                } else {
                  if (!dayErrors['GENERAL']) dayErrors['GENERAL'] = [];
                  dayErrors['GENERAL'].push(d.message);
                }
              }
            });

            if (Object.keys(dayErrors).length > 0) {
              setScheduleErrors(dayErrors);
              errMsg = 'Validation failed. Please correct the highlighted days.';
            } else {
              errMsg = errData.message || errData.error || errMsg;
            }
          } else if (errData.message && errData.message !== "validation failed") {
            errMsg = errData.message;
          } else {
            errMsg = errData.message || errData.error || errMsg;
          }
        } catch (e) { /* ignore */ }
        window.showToast(errMsg, 'error');
      }
    } catch (err: any) {
      console.error(err);
      window.showToast(err.message || 'Error saving clinic schedule', 'error');
    }
  };

  const handleCancelSchedule = () => {
    setScheduleErrors({});
    setDays(prev => prev.map(d => ({
      ...d,
      periods: JSON.parse(JSON.stringify(d.originalPeriods || [])),
      isActive: d.originalActive ?? false
    })));
    setIsEditingSchedule(false);
    window.showToast(t('common.settings_canceled'), 'info');
  };

  const handleCancelClick = (section: 'clinic' | 'general' | 'working') => {
    setCancelingSection(section);
    setIsCancelModalOpen(true);
  };

  const handleCancelConfirm = () => {
    if (cancelingSection === 'clinic') {
      // Section is currently disabled
    } else if (cancelingSection === 'general') {
      setCurrency(savedCurrency);
      setLanguage(savedLanguage);
      setAppointmentPeriod(savedAppointmentPeriod);
    } else if (cancelingSection === 'working') {
      setDays(JSON.parse(JSON.stringify(savedDays)));
    }

    setIsCancelModalOpen(false);
    setCancelingSection(null);
    window.showToast(t('common.settings_canceled'), 'success');
  };

  return (
    <section className={cn("space-y-8", className)} dir={dir}>
      {!hideHeader && (
          <header className={cn(
          "flex flex-col gap-2  mb-6 ",
          canAnimate && "animate-fadeDown animate-delay-100"
        )}>
          <h1 className="text-3xl font-bold mb-1">{t('settings.settings', T_PAGE)}</h1>
          <p className="text-muted-foreground">{t('settings.manage_settings', T_PAGE)}</p>
        </header>
      )}

      <div className="grid grid-cols-1 gap-8">
      
        {/* General Settings Card */}
        <article className={cn(
          "bg-white rounded-xl border border-border p-4 sm:p-8 shadow-sm hover:shadow-md transition-all duration-300 opacity-0",
          canAnimate && "animate-fadeUp animate-delay-300"
        )}>
          <figure className="flex items-center gap-4 mb-8">
            <div className="w-14 h-14 bg-secondary/10 rounded-2xl flex items-center justify-center shrink-0">
              <SettingsIcon className="size-7 text-secondary" />
            </div>
            <figcaption>
              <h3 className="text-xl font-bold">{t('settings.general_settings', T_PAGE)}</h3>
              <p className="text-sm text-muted-foreground">{t('settings.general_settings_desc', T_PAGE)}</p>
            </figcaption>
          </figure>

          <div className="grid grid-cols-1 md:grid-cols-2  lg:grid-cols-3 gap-6">
            <div className="space-y-2">
              <label className={cn("text-sm font-bold text-[#1a2b3c] flex items-center gap-2", isAr ? "mr-1" : "ml-1")}>
                <Globe className="size-4 text-primary" />
                {t('settings.language', T_PAGE)}
              </label>
              <Select value={language} onValueChange={(val: 'ar' | 'en') => setLanguage(val)}>
                <SelectTrigger className="h-12 rounded-xl bg-muted/30 border-border focus:bg-white transition-all">
                  <SelectValue placeholder={t('settings.select_language', T_PAGE)} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ar">{t('settings.arabic', T_PAGE)}</SelectItem>
                  <SelectItem value="en">{t('settings.english', T_PAGE)}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className={cn("text-sm font-bold text-[#1a2b3c] flex items-center gap-2", isAr ? "mr-1" : "ml-1")}>
                <DollarSign className="size-4 text-secondary" />
                {t('settings.default_currency', T_PAGE)}
              </label>
              <Select value={currency} onValueChange={setCurrency}>
                <SelectTrigger className="h-12 rounded-xl bg-muted/30 border-border focus:bg-white transition-all">
                  <SelectValue placeholder={t('settings.select_currency', T_PAGE)} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="JOD">{t('settings.jod', T_PAGE)}</SelectItem>
                  <SelectItem value="USD">{t('settings.usd', T_PAGE)}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className={cn("text-sm font-bold text-[#1a2b3c] flex items-center gap-2", isAr ? "mr-1" : "ml-1")}>
                <Clock className="size-4 text-accent" />
                {isAr ? 'مدة الموعد الافتراضية' : 'Default Appointment Period'}
              </label>
              <Input
                type="tel"
                error={appointmentPeriodError || undefined}
                value={appointmentPeriod}
                onChange={(e) => {
                  let val = e.target.value.replace(/\D/g, '');
                  if (parseInt(val) > 240) val = '240';
                  if (appointmentPeriodError) setAppointmentPeriodError(null);
                  setAppointmentPeriod(Number(val));
                }}
                dir="ltr"
                className={cn(
                  "h-12 bg-muted/30 border-border focus:bg-white focus:border-primary transition-all duration-300 font-bold",
                  isAr ? "text-right" : "text-left"
                )}
                placeholder={isAr ? "بالدقائق" : "in minutes"}
              />
              <p className={cn("text-[13px] text-muted-foreground font-medium", isAr ? "pr-1" : "pl-1")}>
                {isAr ? 'متوسط مدة الموعد بالدقائق لحجز المواعيد' : 'Average appointment duration in minutes'}
              </p>
            </div>
          </div>

          <SectionActions
            onSave={handleSaveGeneralSettings}
            onCancel={() => handleCancelClick('general')}
            cancelLabel={t('settings.cancel_changes', T_PAGE)}
            saveLabel={t('settings.save_settings', T_PAGE)}
          />
        </article>

        {/* Working Hours Card */}
        <article className={cn(
          "bg-white rounded-xl border border-border p-4 sm:p-8 shadow-sm hover:shadow-md transition-all duration-300 opacity-0",
          canAnimate && "animate-fadeUp animate-delay-400"
        )}>
          <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
            <figure className="flex items-center gap-4">
              <div className="w-14 h-14 bg-accent/10 rounded-2xl flex items-center justify-center shrink-0">
                <FaCalendarAlt className="size-7 text-accent" />
              </div>
              <figcaption>
                <h3 className="text-xl font-bold">{t('common.working_hours')}</h3>
                <p className="text-sm text-muted-foreground">{t('settings.working_hours_desc', T_PAGE)}</p>
              </figcaption>
            </figure>
            {!isEditingSchedule ? (
              <button
                onClick={() => setIsEditingSchedule(true)}
                className="h-10 px-4 rounded-xl border border-primary/30 text-primary bg-primary/5 hover:bg-primary/10 transition-all font-bold flex items-center gap-2 text-sm shrink-0"
              >
                <Pen className="size-4" />
                {isAr ? 'تعديل الجدول' : 'Modify Schedule'}
              </button>
            ) : (
              <div className="flex gap-2 shrink-0 flex-wrap">
                <button
                  onClick={handleCancelSchedule}
                  className="h-10 px-4 rounded-xl border border-border text-foreground bg-white hover:bg-muted transition-all font-bold flex items-center gap-2 text-sm"
                >
                  <X className="size-4" />
                  {t('settings.cancel_changes', T_PAGE)}
                </button>
                <button
                  onClick={handleSaveSchedule}
                  className="h-10 px-4 rounded-xl bg-primary text-white hover:bg-primary/90 transition-all font-bold flex items-center gap-2 text-sm shadow-lg shadow-primary/20"
                >
                  <Check className="size-4" />
                  {t('settings.save_settings', T_PAGE)}
                </button>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {days.map((day) => (
              <div
                key={day.id}
                className={cn(
                  "rounded-2xl border transition-all duration-300 flex flex-col justify-between min-h-[180px]",
                  day.isActive
                    ? "bg-primary/5 border-gray-200"
                    : "bg-destructive/5 border-destructive/20"
                )}
              >
                <div className="p-6 flex-wrap flex items-center justify-between gap-6 list-none outline-none">
                  <div className="flex items-center justify-between w-full gap-6">
                    <div className="min-w-[100px]">
                      <p className="text-lg font-bold">{t(`nav.days.${day.id}`, T_NAV)}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <p
                        className={cn(
                          "text-sm font-bold",
                          day.isActive ? "text-emerald-500" : "text-destructive"
                        )}
                      >
                        {day.isActive ? t('settings.working_day', T_PAGE) : t('settings.holiday', T_PAGE)}
                      </p>
                      {isEditingSchedule && (
                        <Switch
                          checked={day.isActive}
                          onCheckedChange={() => toggleDay(day.id)}
                        />
                      )}
                    </div>
                  </div>
                </div>

                <div className="px-6 pb-6 space-y-3">
                  {day.isActive ? (
                    <>
                      {day.periods.map((period) => (
                        <div key={period.id} className="flex items-center gap-4 bg-white/60 p-3 rounded-xl border border-gray-200 animate-in fade-in slide-in-from-top-1">
                          <div className="flex flex-wrap justify-center special:justify-start items-center gap-6 flex-1 ">
                            <div className="flex items-center gap-3 flex-1 w-full">
                              <label className="text-sm font-medium text-muted-foreground whitespace-nowrap">{t('common.from')}</label>
                              {isEditingSchedule ? (
                                <TimePicker
                                  value={period.from}
                                  onChange={(val) => updatePeriod(day.id, period.id, 'from', val)}
                                  className="h-10 xs:h-8 w-full flex-1 border border-muted bg-white shadow-none focus-within:ring-1 focus-within:ring-primary rounded-md text-sm min-w-[80px]"
                                  noClock
                                />
                              ) : (
                                <span className="font-bold text-sm text-foreground">{period.from}</span>
                              )}
                            </div>
                            <div className="flex items-center gap-3 flex-1 w-full">
                              <label className="text-sm font-medium text-muted-foreground whitespace-nowrap">{t('common.to')}</label>
                              {isEditingSchedule ? (
                                <TimePicker
                                  value={period.to}
                                  onChange={(val) => updatePeriod(day.id, period.id, 'to', val)}
                                  className="h-10 xs:h-8 w-full flex-1 border border-muted bg-white shadow-none focus-within:ring-1 focus-within:ring-primary rounded-md text-sm min-w-[80px]"
                                  noClock
                                />
                              ) : (
                                <span className="font-bold text-sm text-foreground">{period.to}</span>
                              )}
                            </div>
                          </div>
                          {isEditingSchedule && day.periods.length > 1 && (
                            <button
                              onClick={() => removePeriod(day.id, period.id)}
                              className="p-2 text-destructive hover:bg-destructive/10 rounded-xl transition-colors"
                            >
                              <Trash2 className="size-4" />
                            </button>
                          )}
                        </div>
                      ))}
                      {isEditingSchedule && (
                        <button
                          onClick={() => addPeriod(day.id)}
                          className="w-full inline-flex items-center justify-center gap-2 h-9 px-4 rounded-xl border border-dashed border-primary/30 bg-transparent text-primary hover:bg-primary/5 transition-all font-bold text-sm mt-2"
                        >
                          <Plus className="size-4" />
                          {t('settings.add_period', T_PAGE)}
                        </button>
                      )}
                    </>
                  ) : (
                    <div className="text-sm text-destructive italic p-2 bg-destructive/5 rounded-xl border border-dashed border-destructive/10 text-center font-bold">
                      {isAr ? "عطلة رسمية" : "Holiday"}
                    </div>
                  )}

                  {scheduleErrors[day.id] && scheduleErrors[day.id].length > 0 && (
                    <div className="mt-2 flex flex-col gap-1 p-2 bg-destructive/10 border border-destructive/20 rounded-md">
                      {scheduleErrors[day.id].map((err, i) => (
                        <p key={i} className="text-xs text-destructive font-bold">{err}</p>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {scheduleErrors['GENERAL'] && scheduleErrors['GENERAL'].length > 0 && (
            <div className="col-span-full mt-4 p-4 bg-destructive/10 border border-destructive/20 rounded-xl">
              <h4 className="text-sm font-bold text-destructive mb-2">Schedule Errors</h4>
              <ul className="list-disc pl-5 flex flex-col gap-1">
                {scheduleErrors['GENERAL'].map((err, i) => (
                  <li key={i} className="text-sm text-destructive font-bold">{err}</li>
                ))}
              </ul>
            </div>
          )}

          <figure className="mt-8 text-center xs:text-start text-pretty flex-wrap gap-4 p-4 xs:p-6 bg-white rounded-2xl border border-gray-200 flex items-center justify-between">
            <div className="flex items-center flex-col  xs:flex-row gap-4">
              <Clock className="size-6 text-primary" />
              <figcaption className={cn("text-muted-foreground max-xs:text-center", isAr ? "text-right" : "text-left")}>
                {t('common.working_days')}: <span className="text-primary font-bold">{workingDaysCount} {t('common.days')}</span>
                <span className="mx-2 opacity-30 text-muted-foreground">|</span>
                {t('common.off_days')}: <span className="text-destructive font-bold">{offDaysCount} {t('common.days')}</span>
              </figcaption>
            </div>
            <p className="text-xs text-muted-foreground italic">{t('settings.working_hours_note', T_PAGE)}</p>
          </figure>
        </article>

      </div>

      <Modal
        isOpen={isCancelModalOpen}
        onClose={() => setIsCancelModalOpen(false)}
        onConfirm={handleCancelConfirm}
        title={t('settings.cancel_changes', T_PAGE)}
        message={t('settings.cancel_confirm_msg', T_PAGE)}
        confirmText={t('settings.cancel_btn', T_PAGE)}
        cancelText={t('settings.back_btn', T_PAGE)}
        variant="danger"
      />
    </section>
  );
};

export default SettingsView;

interface SectionActionsProps {
  onSave: () => void;
  onCancel: () => void;
  cancelLabel: string;
  saveLabel: string;
}

const SectionActions = ({ onSave, onCancel, cancelLabel, saveLabel }: SectionActionsProps) => (
  <div className="flex justify-center xs:justify-end flex-wrap gap-3 mt-8 pt-6 border-t border-gray-200">
    <button
      onClick={onCancel}
      className="h-10 px-6 rounded-xl border border-border font-bold text-foreground hover:bg-accent hover:text-white transition-all active:scale-95 text-sm"
    >
      {cancelLabel}
    </button>
    <button
      onClick={onSave}
      className="h-10 px-6 rounded-xl bg-primary text-white font-bold hover:bg-primary/90 shadow-lg shadow-primary/20 transition-all active:scale-95 flex items-center gap-2 text-sm"
    >
      <Check className="size-4" />
      {saveLabel}
    </button>
  </div>
);

