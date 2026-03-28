import { useRef, useState } from 'react';
import Input from '../../components/ui/Input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from '../../components/ui/select';
import { usePreloader } from '../../contexts/PreloaderContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { commonTranslations } from '../../constants/common';
import { settingsTranslations } from '../../constants/settings';
import { navTranslations } from '../../constants/nav';
import { Switch } from '../../components/ui/Switch';
import { cn } from '../../utils/cn';
import Modal from '../../components/ui/Modal';
import TimePicker from '../../components/ui/TimePicker';
import {
  Building2,
  Settings as SettingsIcon,
  Globe,
  DollarSign,
  Plus,
  Trash2,
  Check,
  Clock
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

const SettingsView = () => {
  const { isLoaded, isExiting } = usePreloader();
  const canAnimate = isLoaded && !isExiting;
  const { language, setLanguage, isAr, t, dir } = useLanguage();
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);

  const T_COMMON = commonTranslations;
  const T_PAGE = settingsTranslations;
  const T_NAV = navTranslations;

  // Form State
  const [clinicName, setClinicName] = useState('Clinic Al-Noor');
  const [phone, setPhone] = useState('0789651800');
  const [email, setEmail] = useState('info@medexa-clinic.jo');
  const [address, setAddress] = useState('Amman - Khalda');
  const [currency, setCurrency] = useState('JOD');
  const [days, setDays] = useState<WorkingDay[]>(INITIAL_DAYS);
  const [emailError, setEmailError] = useState(false);
  const [nameError, setNameError] = useState(false);
  const [phoneError, setPhoneError] = useState(false);

  const emailRef = useRef<HTMLDivElement>(null);
  const nameRef = useRef<HTMLDivElement>(null);
  const phoneRef = useRef<HTMLDivElement>(null);

  // Animations are handled via Tailwind classes to match Appointments page style

  const toggleDay = (id: string) => {
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
    setDays(prev => prev.map(day => {
      if (day.id === dayId) {
        return {
          ...day,
          periods: [...day.periods, { id: Date.now().toString(), from: '08:00', to: '18:00' }]
        };
      }
      return day;
    }));
  };

  const removePeriod = (dayId: string, periodId: string) => {
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

  const validateEmail = (email: string) => {
    return /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email);
  };

  const scrollToError = (ref: React.RefObject<HTMLDivElement | null>) => {
    if (ref.current) {
      ref.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  const handleSave = () => {
    let hasError = false;

    if (!clinicName.trim()) {
      setNameError(true);
      if (!hasError) scrollToError(nameRef);
      hasError = true;
    } else {
      setNameError(false);
    }

    if (phone.length < 8) {
      setPhoneError(true);
      if (!hasError) scrollToError(phoneRef);
      hasError = true;
    } else {
      setPhoneError(false);
    }

    if (!validateEmail(email)) {
      setEmailError(true);
      if (!hasError) scrollToError(emailRef);
      hasError = true;
    } else {
      setEmailError(false);
    }

    if (hasError) {
      window.showToast(t('common.fix_errors'), 'error');
      return;
    }

    // In a real app, you'd send data to API here
    window.showToast(t('common.settings_saved'), 'success');
  };

  const handleCancelConfirm = () => {
    setIsCancelModalOpen(false);
    setEmailError(false);
    // Reset state here if needed
    window.showToast(t('common.settings_canceled'), 'success');
  };

  const workingDaysCount = days.filter(d => d.isActive).length;
  const offDaysCount = days.length - workingDaysCount;

  return (
    <section className="space-y-8 pb-12" dir={dir}>
          <header className={cn(
            "flex flex-col gap-2  mb-6 ",
            canAnimate && "animate-fadeDown animate-delay-100"
          )}>
            <h1 className="text-3xl font-bold mb-1">{t('settings.settings', T_PAGE)}</h1>
            <p className="text-muted-foreground">{t('settings.manage_settings', T_PAGE)}</p>
          </header>

      <div className="grid grid-cols-1 gap-8">
        {/* Clinic Information Card */}
        <article className={cn(
          "bg-white rounded-3xl border border-border p-4 sm:p-8 shadow-sm hover:shadow-md transition-all duration-300 opacity-0",
          canAnimate && "animate-fadeUp animate-delay-200"
        )}>
          <figure className="flex items-center gap-4 mb-8">
            <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center shrink-0">
              <Building2 className="size-7 text-primary" />
            </div>
            <figcaption>
              <h3 className="text-xl font-bold">{t('settings.clinic_info', T_PAGE)}</h3>
              <p className="text-sm text-muted-foreground">{t('settings.clinic_info_desc', T_PAGE)}</p>
            </figcaption>
          </figure>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2" ref={nameRef}>
              <label className={cn("text-sm font-bold text-[#1a2b3c] flex items-center gap-2", isAr ? "mr-1" : "ml-1")}>
                {t('common.clinic_name', T_COMMON)}
              </label>
              <Input
                value={clinicName}
                onChange={(e) => {
                  setClinicName(e.target.value);
                  if (nameError) setNameError(false);
                }}
                className={cn(
                  "h-12 bg-muted/30 border-border focus:bg-white focus:border-primary transition-all duration-300",
                  nameError && "border-destructive focus:border-destructive focus:ring-destructive/10"
                )}
              />
              {nameError && (
                <p className={cn("text-xs text-destructive font-bold", isAr ? "mr-1" : "ml-1")}>{t('common.required_field', T_COMMON)}</p>
              )}
            </div>
            <div className="space-y-2" ref={phoneRef}>
              <label className={cn("text-sm font-bold text-[#1a2b3c] flex items-center gap-2", isAr ? "mr-1" : "ml-1")}>
                {t('common.phone_number', T_COMMON)}
              </label>
              <Input
                type="tel"
                value={phone}
                onChange={(e) => {
                  setPhone(e.target.value);
                  if (phoneError) setPhoneError(false);
                }}
                dir="ltr"
                className={cn(
                  "h-12 bg-muted/30 border-border focus:bg-white focus:border-primary transition-all duration-300",
                  isAr ? "text-right" : "text-left",
                  phoneError && "border-destructive focus:border-destructive focus:ring-destructive/10"
                )}
              />
              {phoneError && (
                <p className={cn("text-xs text-destructive font-bold", isAr ? "mr-1" : "ml-1")}>{t('settings.phone_number_error', T_PAGE)}</p>
              )}
            </div>
            <div className="space-y-2" ref={emailRef}>
              <label className={cn("text-sm font-bold text-[#1a2b3c] flex items-center gap-2", isAr ? "mr-1" : "ml-1")}>
                {t('common.email', T_COMMON)}
              </label>
              <Input
                value={email}
                type="email"
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (emailError) setEmailError(false);
                }}
                className={cn(
                  "h-12 bg-muted/30 border-border focus:bg-white focus:border-primary transition-all duration-300",
                  emailError && "border-destructive focus:border-destructive focus:ring-destructive/10"
                )}
                placeholder="example@email.com"
              />
              {emailError && (
                <p className={cn("text-xs text-destructive font-bold", isAr ? "mr-1" : "ml-1")}>{t('settings.email_error', T_PAGE)}</p>
              )}
            </div>
            <div className="space-y-2">
              <label className={cn("text-sm font-bold text-[#1a2b3c] flex items-center gap-2", isAr ? "mr-1" : "ml-1")}>
                {t('common.address', T_COMMON)}
              </label>
              <Input
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="h-12 bg-muted/30 border-border focus:bg-white focus:border-primary transition-all duration-300"
              />
            </div>
          </div>
        </article>

        {/* General Settings Card */}
        <article className={cn(
          "bg-white rounded-3xl border border-border p-4 sm:p-8 shadow-sm hover:shadow-md transition-all duration-300 opacity-0",
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
          </div>
        </article>

        {/* Working Hours Card */}
        <article className={cn(
          "bg-white rounded-3xl border border-border p-4 sm:p-8 shadow-sm hover:shadow-md transition-all duration-300 opacity-0",
          canAnimate && "animate-fadeUp animate-delay-400"
        )}>
          <figure className="flex items-center gap-4 mb-8">
            <div className="w-14 h-14 bg-accent/10 rounded-2xl flex items-center justify-center shrink-0">
              <FaCalendarAlt className="size-7 text-accent" />
            </div>
            <figcaption>
              <h3 className="text-xl font-bold">{t('common.working_hours')}</h3>
              <p className="text-sm text-muted-foreground">{t('settings.working_hours_desc', T_PAGE)}</p>
            </figcaption>
          </figure>

          <div className="space-y-4">
            {days.map((day) => (
              <details
                key={day.id}
                open={day.isActive}
                className={cn(
                  "rounded-2xl border transition-all duration-300 overflow-hidden",
                  day.isActive
                    ? "bg-primary/5 border-primary/20"
                    : "bg-muted/20 border-border opacity-70"
                )}
              >
                <summary className="p-6 flex-wrap flex items-center justify-between gap-6 cursor-pointer list-none outline-none">
                  <div className="flex items-center gap-6">
                    <div className="min-w-[100px]">
                      <p className="text-lg font-bold">{t(`nav.days.${day.id}`, T_NAV)}</p>
                    </div>
                    <div className="flex items-center gap-3" onClick={(e) => e.stopPropagation()}>
                      <p
                        className={cn(
                          "text-sm font-bold",
                          day.isActive ? "text-emerald-500" : "text-muted-foreground"
                        )}
                      >
                        {day.isActive ? t('settings.working_day', T_PAGE) : t('settings.holiday', T_PAGE)}
                      </p>
                      <Switch
                        checked={day.isActive}
                        onCheckedChange={() => toggleDay(day.id)}
                      />
                    </div>
                  </div>

                  {day.isActive && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        addPeriod(day.id);
                      }}
                      className="inline-flex items-center justify-center gap-2 h-9 px-4 rounded-lg border border-primary/30 bg-background text-primary hover:bg-primary/10 transition-all font-bold text-sm"
                    >
                      <Plus className="size-4" />
                      {t('settings.add_period', T_PAGE)}
                    </button>
                  )}
                </summary>

                {day.isActive && (
                  <div className="px-6 pb-6 space-y-3">
                    {day.periods.map((period) => (
                      <div key={period.id} className="flex items-center gap-4 bg-white/60 p-3 rounded-xl border border-border/50 animate-in fade-in slide-in-from-top-1">
                        <div className="flex flex-wrap justify-center special:justify-start items-center gap-6 flex-1 ">
                          <div className="flex items-center gap-3">
                            <label className="text-sm font-medium text-muted-foreground">{t('common.from')}</label>
                            <TimePicker
                              value={period.from}
                              onChange={(val) => updatePeriod(day.id, period.id, 'from', val)}
                              className="h-10 xs:h-8 w-full xs:w-37 border-border"
                            />
                          </div>
                          <div className="flex items-center gap-3">
                            <label className="text-sm font-medium text-muted-foreground">{t('common.to')}</label>
                            <TimePicker
                              value={period.to}
                              onChange={(val) => updatePeriod(day.id, period.id, 'to', val)}
                              className="h-10 xs:h-8 w-full xs:w-37  border-border"
                            />
                          </div>
                        </div>
                        {day.periods.length > 1 && (
                          <button
                            onClick={() => removePeriod(day.id, period.id)}
                            className="p-2 text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                          >
                            <Trash2 className="size-4" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </details>
            ))}
          </div>

          <figure className="mt-8 text-center xs:text-start text-pretty flex-wrap gap-4 p-4 xs:p-6 bg-linear-to-br from-primary/5 to-secondary/5 rounded-2xl border border-primary/10 flex items-center justify-between">
            <div className="flex items-center flex-col xs:flex-row gap-4">
              <Clock className="size-6 text-primary" />
              <figcaption className={cn("text-muted-foreground", isAr ? "text-right" : "text-left")}>
                {t('common.working_days')}: <span className="text-primary font-bold">{workingDaysCount} {t('common.days')}</span>
                <span className="mx-2 opacity-30 text-muted-foreground">|</span>
                {t('common.off_days')}: <span className="text-destructive font-bold">{offDaysCount} {t('common.days')}</span>
              </figcaption>
            </div>
            <p className="text-xs text-muted-foreground italic">{t('settings.working_hours_note', T_PAGE)}</p>
          </figure>
        </article>

        {/* Footer Actions */}
        <footer className={cn(
          "flex justify-center xs:justify-end flex-wrap gap-4 mt-4 opacity-0",
          canAnimate && "animate-fadeUp animate-delay-500"
        )}>
          <button
            onClick={() => setIsCancelModalOpen(true)}
            className="h-12 px-10 w-full rounded-xl xs:w-auto border border-border font-bold text-foreground hover:bg-accent hover:text-white transition-all active:scale-95"
          >
            {t('settings.cancel_changes', T_PAGE)}
          </button>
          <button
            onClick={handleSave}
            className="h-12 px-10 rounded-xl w-full justify-center xs:w-auto whitespace-nowrap bg-primary text-white font-bold hover:bg-primary/90 shadow-lg shadow-primary/20 transition-all active:scale-95 flex items-center gap-2"
          >
            <Check className="size-5" />
            {t('settings.save_settings', T_PAGE)}
          </button>
        </footer>
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
