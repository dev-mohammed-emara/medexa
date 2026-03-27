import { gsap } from 'gsap';
import { useEffect, useRef, useState } from 'react';
import Input from '../../components/ui/Input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from '../../components/ui/select';
import { usePreloader } from '../../contexts/PreloaderContext';
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
  const containerRef = useRef<HTMLDivElement>(null);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);

  // Form State
  const [clinicName, setClinicName] = useState('عيادة النور الطبية');
  const [phone, setPhone] = useState('0789651800');
  const [email, setEmail] = useState('info@medexa-clinic.jo');
  const [address, setAddress] = useState('عمّان - خلدا');
  const [language, setLanguage] = useState('ar');
  const [currency, setCurrency] = useState('JOD');
  const [days, setDays] = useState<WorkingDay[]>(INITIAL_DAYS);
  const [emailError, setEmailError] = useState(false);
  const [nameError, setNameError] = useState(false);
  const [phoneError, setPhoneError] = useState(false);

  const emailRef = useRef<HTMLDivElement>(null);
  const nameRef = useRef<HTMLDivElement>(null);
  const phoneRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isLoaded && !isExiting) {
      const cards = containerRef.current?.querySelectorAll('[data-slot="card"]');
      if (cards) {
        gsap.fromTo(cards,
          { y: 15, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.5, stagger: 0.08, ease: 'power2.out', delay: 0.1 }
        );
      }
      const title = containerRef.current?.querySelector('.header-content');
      if (title) {
        gsap.fromTo(title,
          { x: -15, opacity: 0 },
          { x: 0, opacity: 1, duration: 0.5, ease: 'power2.out' }
        );
      }
    }
  }, [isLoaded, isExiting]);

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
      window.showToast('يرجى تصحيح الأخطاء قبل الحفظ', 'error');
      return;
    }

    // In a real app, you'd send data to API here
    window.showToast('تم حفظ الإعدادات بنجاح', 'success');
  };

  const handleCancelConfirm = () => {
    setIsCancelModalOpen(false);
    setEmailError(false);
    // Reset state here if needed
    window.showToast('تم إلغاء التغييرات بنجاح', 'success');
  };

  const workingDaysCount = days.filter(d => d.isActive).length;
  const offDaysCount = days.length - workingDaysCount;

  return (
    <section ref={containerRef} className="space-y-8 pb-12" dir="rtl">
          <header data-slot="dialog-header" className="flex flex-col gap-2 text-center mb-6">
            <h1 className="text-3xl font-bold mb-1">الإعدادات</h1>
            <p className="text-muted-foreground">إدارة إعدادات العيادة والنظام</p>
          </header>

      <div className="grid grid-cols-1 gap-8">
        {/* Clinic Information Card */}
        <article data-slot="card" className="bg-white rounded-3xl border border-border p-4 sm:p-8 shadow-sm hover:shadow-md transition-all duration-300 opacity-0 transform translate-y-4">
          <figure className="flex items-center gap-4 mb-8">
            <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center shrink-0">
              <Building2 className="size-7 text-primary" />
            </div>
            <figcaption>
              <h3 className="text-xl font-bold">معلومات العيادة</h3>
              <p className="text-sm text-muted-foreground">البيانات الأساسية للعيادة التي تظهر في التقارير</p>
            </figcaption>
          </figure>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2" ref={nameRef}>
              <label className="text-sm font-bold text-[#1a2b3c] mr-1 flex items-center gap-2">
                اسم العيادة
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
                <p className="text-xs text-destructive font-bold mr-1">هذا الحقل مطلوب</p>
              )}
            </div>
            <div className="space-y-2" ref={phoneRef}>
              <label className="text-sm font-bold text-[#1a2b3c] mr-1 flex items-center gap-2">
                رقم الهاتف
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
                  "h-12 bg-muted/30 border-border focus:bg-white focus:border-primary transition-all duration-300 text-right",
                  phoneError && "border-destructive focus:border-destructive focus:ring-destructive/10"
                )}
              />
              {phoneError && (
                <p className="text-xs text-destructive font-bold mr-1">يرجى إدخال رقم هاتف صحيح (8 أرقام على الأقل)</p>
              )}
            </div>
            <div className="space-y-2" ref={emailRef}>
              <label className="text-sm font-bold text-[#1a2b3c] mr-1 flex items-center gap-2">
                البريد الإلكتروني
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
                <p className="text-xs text-destructive font-bold mr-1">يرجى إدخال بريد إلكتروني صحيح</p>
              )}
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-[#1a2b3c] mr-1 flex items-center gap-2">
                العنوان
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
        <article data-slot="card" className="bg-white rounded-3xl border border-border p-4 sm:p-8 shadow-sm hover:shadow-md transition-all duration-300 opacity-0 transform translate-y-4">
          <figure className="flex items-center gap-4 mb-8">
            <div className="w-14 h-14 bg-secondary/10 rounded-2xl flex items-center justify-center shrink-0">
              <SettingsIcon className="size-7 text-secondary" />
            </div>
            <figcaption>
              <h3 className="text-xl font-bold">الإعدادات العامة</h3>
              <p className="text-sm text-muted-foreground">تفضيلات اللغة والعملة الافتراضية للنظام</p>
            </figcaption>
          </figure>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-[#1a2b3c] mr-1 flex items-center gap-2">
                <Globe className="size-4 text-primary" />
                اللغة
              </label>
              <Select value={language} onValueChange={setLanguage}>
                <SelectTrigger className="h-12 rounded-xl bg-muted/30 border-border focus:bg-white transition-all">
                  <SelectValue placeholder="اختر اللغة" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ar">العربية</SelectItem>
                  <SelectItem value="en">English</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-[#1a2b3c] mr-1 flex items-center gap-2">
                <DollarSign className="size-4 text-secondary" />
                العملة الافتراضية
              </label>
              <Select value={currency} onValueChange={setCurrency}>
                <SelectTrigger className="h-12 rounded-xl bg-muted/30 border-border focus:bg-white transition-all">
                  <SelectValue placeholder="اختر العملة" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="JOD">دينار أردني (د.أ)</SelectItem>
                  <SelectItem value="USD">دولار أمريكي (USD)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </article>

        {/* Working Hours Card */}
        <article data-slot="card" className="bg-white rounded-3xl border border-border p-4 sm:p-8 shadow-sm hover:shadow-md transition-all duration-300 opacity-0 transform translate-y-4">
          <figure className="flex items-center gap-4 mb-8">
            <div className="w-14 h-14 bg-accent/10 rounded-2xl flex items-center justify-center shrink-0">
              <FaCalendarAlt className="size-7 text-accent" />
            </div>
            <figcaption>
              <h3 className="text-xl font-bold">أيام وساعات العمل</h3>
              <p className="text-sm text-muted-foreground">جدول العمل الأسبوعي وساعات استقبال المرضى</p>
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
                      <p className="text-lg font-bold">{day.name}</p>
                    </div>
                    <div className="flex items-center gap-3" onClick={(e) => e.stopPropagation()}>
                      <p
                        className={cn(
                          "text-sm font-bold",
                          day.isActive ? "text-emerald-500" : "text-muted-foreground"
                        )}
                      >
                        {day.isActive ? 'يوم عمل' : 'عطلة'}
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
                      إضافة فترة
                    </button>
                  )}
                </summary>

                {day.isActive && (
                  <div className="px-6 pb-6 space-y-3">
                    {day.periods.map((period) => (
                      <div key={period.id} className="flex items-center gap-4 bg-white/60 p-3 rounded-xl border border-border/50 animate-in fade-in slide-in-from-top-1">
                        <div className="flex flex-wrap justify-center special:justify-start items-center gap-6 flex-1 ">
                          <div className="flex items-center gap-3">
                            <label className="text-sm font-medium text-muted-foreground">من</label>
                            <TimePicker
                              value={period.from}
                              onChange={(val) => updatePeriod(day.id, period.id, 'from', val)}
                              className="h-10 xs:h-8 w-full xs:w-28 border-border"
                            />
                          </div>
                          <div className="flex items-center gap-3">
                            <label className="text-sm font-medium text-muted-foreground">إلى</label>
                            <TimePicker
                              value={period.to}
                              onChange={(val) => updatePeriod(day.id, period.id, 'to', val)}
                              className="h-10 xs:h-8 w-full xs:w-28  border-border"
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
              <figcaption className="text-muted-foreground">
                أيام العمل: <span className="text-primary font-bold">{workingDaysCount} أيام</span>
                <span className="mx-2 opacity-30 text-muted-foreground">|</span>
                أيام العطل: <span className="text-destructive font-bold">{offDaysCount} أيام</span>
              </figcaption>
            </div>
            <p className="text-xs text-muted-foreground italic">سيتم تطبيق هذه الأوقات على نظام المواعيد والحجز</p>
          </figure>
        </article>

        {/* Footer Actions */}
        <footer className="flex justify-center xs:justify-end flex-wrap  gap-4 mt-4">
          <button
            onClick={() => setIsCancelModalOpen(true)}
            className="h-12 px-10 w-full rounded-xl xs:w-auto border border-border font-bold text-foreground hover:bg-accent hover:text-white transition-all active:scale-95"
          >
            إلغاء
          </button>
          <button
            onClick={handleSave}
            className="h-12 px-10 rounded-xl w-full justify-center xs:w-auto whitespace-nowrap bg-primary text-white font-bold hover:bg-primary/90 shadow-lg shadow-primary/20 transition-all active:scale-95 flex items-center gap-2"
          >
            <Check className="size-5" />
            حفظ الإعدادات
          </button>
        </footer>
      </div>

      <Modal
        isOpen={isCancelModalOpen}
        onClose={() => setIsCancelModalOpen(false)}
        onConfirm={handleCancelConfirm}
        title="إلغاء التغييرات"
        message="هل أنت متأكد من رغبتك في إلغاء التغييرات؟ لن يتم حفظ أي تعديلات قمت بها."
        confirmText="نعم، إلغاء"
        cancelText="تراجع"
        variant="danger"
      />
    </section>
  );
};

export default SettingsView;
