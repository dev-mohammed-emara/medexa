import Input from '@/components/ui/Input';
import Modal from '@/components/ui/Modal';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Switch } from '@/components/ui/Switch';
import TimePicker from '@/components/ui/TimePicker';
import { profileTranslations } from '@/constants/profile';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { usePreloader } from '@/contexts/PreloaderContext';
import { cn } from '@/utils/cn';
import { Arabic } from "flatpickr/dist/l10n/ar.js";
import "flatpickr/dist/themes/material_blue.css";
import {
  Building2,
  Camera,
  Check,
  Clock,
  Key,
  Mail,
  MapPin,
  Pen,
  Phone,
  Plus,
  Shield,
  User,
  X
} from 'lucide-react';
import { useRef, useState } from 'react';
import Flatpickr from "react-flatpickr";
import { FaCalendarAlt } from 'react-icons/fa';
import EmailChangeDialog from './EmailChangeDialog';

const ProfileView = () => {
  const { profileImage, updateProfileImage } = useAuth();
  const { isLoaded, isExiting } = usePreloader();
  const { dir, isAr, t } = useLanguage();
  const [activeTab, setActiveTab] = useState<'profile' | 'clinic'>('profile');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const T_PAGE = profileTranslations;

  const canAnimate = isLoaded && !isExiting;

  // Removed tab animation on switch as per user request
  const [isEditingHours, setIsEditingHours] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState<{ open: boolean; type: 'hours' | 'general' }>({ open: false, type: 'hours' });

  const handleSaveHours = () => {
    setIsEditingHours(false);
    window.showToast('تم حفظ مواعيد العمل بنجاح', 'success');
  };

  const handleCancelHours = () => {
    setShowConfirmModal({ open: true, type: 'hours' });
  };

  const handleConfirmCancel = () => {
    if (showConfirmModal.type === 'hours') {
      setIsEditingHours(false);
    }
    setShowConfirmModal({ open: false, type: 'hours' });
    window.showToast('تم إلغاء التغييرات', 'info');
  };

  const handleSaveGeneral = () => {
    window.showToast('تم حفظ التغييرات بنجاح', 'success');
  };

  const handleCancelGeneral = () => {
    setShowConfirmModal({ open: true, type: 'general' });
  };

  const [workingHours, setWorkingHours] = useState([
    { day: t('profile.sunday', T_PAGE), active: true, periods: [{ from: '08:00', to: '12:00' }, { from: '16:00', to: '20:00' }] },
    { day: t('profile.monday', T_PAGE), active: true, periods: [{ from: '08:00', to: '18:00' }] },
    { day: t('profile.tuesday', T_PAGE), active: true, periods: [{ from: '08:00', to: '18:00' }] },
    { day: t('profile.wednesday', T_PAGE), active: true, periods: [{ from: '08:00', to: '18:00' }] },
    { day: t('profile.thursday', T_PAGE), active: true, periods: [{ from: '08:00', to: '14:00' }] },
    { day: t('profile.friday', T_PAGE), active: false, periods: [] },
    { day: t('profile.saturday', T_PAGE), active: false, periods: [] },
  ]);

  const [clinicInfo, setClinicInfo] = useState({
    name: 'عيادة النور الطبية',
    specialty: 'طب عام',
    insurance: 'التأمين الوطني الأردني',
    phone: '+962 6 555 1234',
    email: 'info@alnoor-clinic.jo',
    city: 'عمّان',
    area: 'الدوار السابع',
    address: 'عمّان، الدوار السابع، شارع الملكة رانيا العبدالله'
  });

  const [personalPhone, setPersonalPhone] = useState('0789651800');

  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);


  const handleTabChange = (tab: 'profile' | 'clinic') => {
    if (tab === activeTab) return;
    setActiveTab(tab);
  };


  const toggleDay = (index: number) => {
    const newHours = [...workingHours];
    newHours[index].active = !newHours[index].active;
    if (newHours[index].active && newHours[index].periods.length === 0) {
      newHours[index].periods = [{ from: '08:00', to: '18:00' }];
    }
    setWorkingHours(newHours);
  };

  const addPeriod = (dayIndex: number) => {
    const newHours = [...workingHours];
    newHours[dayIndex].periods.push({ from: '08:00', to: '18:00' });
    setWorkingHours(newHours);
  };

  const removePeriod = (dayIndex: number, periodIndex: number) => {
    const newHours = [...workingHours];
    newHours[dayIndex].periods.splice(periodIndex, 1);
    setWorkingHours(newHours);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        updateProfileImage(reader.result as string);
        window.showToast(t('profile.update_photo', T_PAGE), 'success');
      };
      reader.readAsDataURL(file);
    }
  };

  const updatePeriod = (dayIndex: number, periodIndex: number, field: 'from' | 'to', value: string) => {
    const newHours = [...workingHours];
    newHours[dayIndex].periods[periodIndex][field] = value;
    setWorkingHours(newHours);
  };

  return (
    <div className="space-y-6" dir={dir}>
      <div className={cn(
        "profile-header opacity-0",
        canAnimate && "animate-fadeDown animate-delay-100"
      )}>
        <h1 className="text-3xl mb-1 font-bold">{t('profile.profile', T_PAGE)}</h1>
        <p className="text-muted-foreground">{t('profile.manage_profile', T_PAGE)}</p>
      </div>

      {/* Tabs */}
      <div
        className={cn(
          "profile-tabs inline-flex items-center bg-muted/50 p-1.5 rounded-xl border border-border shadow-sm opacity-0",
          canAnimate && "animate-fadeUp animate-delay-200"
        )}
      >
        <button
          onClick={() => handleTabChange('profile')}
          className={cn(
            "relative px-6 py-2.5 rounded-lg text-sm transition-all duration-300 flex items-center gap-2",
            activeTab === 'profile' ? "text-primary font-semibold" : "text-muted-foreground hover:text-foreground font-normal"
          )}
        >
          {activeTab === 'profile' && (
            <div className="absolute inset-0 bg-white rounded-lg shadow-md animate-in fade-in zoom-in-95 duration-200" />
          )}
          <span className="relative z-10 flex items-center gap-2">
            <User size={16} />
            {t('profile.profile', T_PAGE)}
          </span>
        </button>
        <button
          onClick={() => handleTabChange('clinic')}
          className={cn(
            "relative px-6 py-2.5 rounded-lg text-sm transition-all duration-300 flex items-center gap-2",
            activeTab === 'clinic' ? "text-primary font-semibold" : "text-muted-foreground hover:text-foreground font-normal"
          )}
        >
          {activeTab === 'clinic' && (
            <div className="absolute inset-0 bg-white rounded-lg shadow-md animate-in fade-in zoom-in-95 duration-200" />
          )}
          <span className="relative z-10 flex items-center gap-2">
            <Building2 size={16} />
            {t('profile.clinic_profile', T_PAGE)}
          </span>
        </button>
      </div>

      <div className={cn(
        "profile-content space-y-6 opacity-0",
        canAnimate && "animate-fadeUp animate-delay-300"
      )}>
        {activeTab === 'profile' ? (
          <>
            {/* Profile Card */}
            <div data-slot="card" className="tab-pane text-card-foreground flex flex-col sm:flex-row items-center justify-between gap-6 rounded-xl border p-8 bg-linear-to-br from-white via-white to-primary/5 border-border shadow-lg hover:shadow-xl transition-all duration-300">
              <div className={cn("flex-1 text-center font-bold", isAr ? "sm:text-right" : "sm:text-left")}>
                <h2 className="text-3xl mb-2 font-bold text-foreground">{'أحمد الحشيكا'}</h2>
                <div className="flex flex-col gap-2">
                  <div className={cn("flex items-center justify-center", isAr ? "sm:justify-start" : "sm:justify-end")}>
                    <span className="inline-flex items-center justify-center rounded-md border text-xs font-medium bg-primary/10 text-primary border-primary/20 px-3 py-1 gap-1">
                      <Shield size={14} className={isAr ? "ml-1" : "mr-1"} />
                      {t('profile.clinic_owner', T_PAGE)}
                    </span>
                  </div>
                  <div className={cn("flex items-center justify-center text-muted-foreground", isAr ? "sm:justify-start" : "sm:justify-end")}>
                    <Mail size={16} className={isAr ? "ml-2" : "mr-2"} />
                    <span>dr.ahmed@medexa.com</span>
                  </div>
                  <div className={cn("flex items-center justify-center text-muted-foreground", isAr ? "sm:justify-start" : "sm:justify-end")}>
                    <Phone size={16} className={isAr ? "ml-2" : "mr-2"} />
                    <span dir="ltr">0789651800</span>
                  </div>
                </div>
              </div>

              <div
                className="relative group cursor-pointer hover:scale-110 transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)]"
                onClick={() => fileInputRef.current?.click()}
              >
                <div className="w-32 h-32 rounded-full border-4 border-primary shadow-lg overflow-hidden shrink-0 bg-linear-to-br from-primary to-secondary">
                  {profileImage ? (
                    <img src={profileImage} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-white text-4xl font-bold">
                      {t('common.name').replace(/^د\.\s*/, '').charAt(0)}
                    </div>
                  )}
                </div>
                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  accept="image/*"
                  onChange={handleFileChange}
                />
                <div className="absolute bottom-0 left-0 p-3 bg-primary rounded-full shadow-lg border-2 border-primary text-white group-hover:bg-white group-hover:text-primary transition-all duration-500 ease-out z-10">
                  <Camera size={24} />
                </div>
                <div className="absolute inset-0 bg-black/40 rounded-full opacity-0  group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center pointer-events-none">
                  <Pen size={24} className="text-white" />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Personal Information */}
              <div data-slot="card" className="tab-pane  bg-white rounded-xl border p-6 border-border shadow-lg hover:shadow-xl transition-all duration-300 h-full">
                <h3 className="text-xl mb-6 font-bold">{t('profile.personal_info', T_PAGE)}</h3>
                <div className="space-y-5">
                  <div className="flex flex-col gap-2">
                    <label className={cn("text-sm font-semibold text-foreground/80", isAr ? "pr-1" : "pl-1")}>{t('common.name')}</label>
                    <Input defaultValue={'أحمد الحشيكا'} className="h-11 bg-muted/30 border-border focus:border-primary focus:bg-white transition-all font-bold" />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className={cn("text-sm font-semibold text-foreground/80", isAr ? "pr-1" : "pl-1")}>{t('common.email')}</label>
                    <div className="flex gap-2">
                      <Input readOnly value="dr.ahmed@medexa.com" className="flex-1 h-11 bg-muted/50 border-border cursor-not-allowed text-muted-foreground" />
                      <button
                        onClick={() => setIsEmailModalOpen(true)}
                        className="h-11 px-4 border border-primary/30 rounded-md text-primary hover:bg-primary/5 transition-all flex items-center gap-2 text-sm font-medium"
                      >
                        <Key size={16} />
                        {t('common.change')}
                      </button>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className={cn("text-sm font-semibold text-foreground/80", isAr ? "pr-1" : "pl-1")}>{t('common.phone')}</label>
                    <Input
                      value={personalPhone}
                      onChange={(e) => setPersonalPhone(e.target.value.replace(/\D/g, ''))}
                      dir="ltr"
                      className={cn("h-11 bg-muted/30 border-border focus:border-primary focus:bg-white transition-all font-bold", isAr ? "text-right" : "text-left")}
                    />
                  </div>
                  <div className="flex flex-col gap-6">
                    <div className="flex flex-col gap-2">
                      <label className={cn("text-sm font-semibold text-foreground/80", isAr ? "pr-1" : "pl-1")}>{t('common.gender')}</label>
                      <Select defaultValue="ذكر">
                        <SelectTrigger className="h-11 bg-muted/30 border-border font-bold">
                          <SelectValue placeholder={t('common.gender')} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="ذكر">{t('common.male')}</SelectItem>
                          <SelectItem value="أنثى">{t('common.female')}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className={cn("text-sm font-semibold text-foreground/80", isAr ? "pr-1" : "pl-1")}>{t('common.birth_date')}</label>
                      <div className="relative">
                        <FaCalendarAlt
                          size={16}
                          className={cn("absolute top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none z-10", isAr ? "left-5" : "right-5")}
                        />
                        <Flatpickr
                          value="1985-05-15"
                          className={cn("flex h-11 w-full rounded-xl border border-border bg-muted/30 pr-3 py-2 text-sm font-bold focus:border-primary focus:bg-white transition-all outline-none", isAr ? "pl-10" : "pr-10")}
                          options={{
                            locale: Arabic,
                            dateFormat: "d F Y",
                            disableMobile: true
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Account Information */}
              <div data-slot="card" className="tab-pane  bg-white rounded-xl border p-6 border-border shadow-lg hover:shadow-xl transition-all duration-300 h-full">
                <h3 className="text-xl mb-6 font-bold">{t('profile.account_info', T_PAGE)}</h3>
                <div className="space-y-5">
                  <div className="p-4 bg-muted/30 rounded-lg border border-border">
                    <label className="text-xs text-muted-foreground mb-1 block">{t('common.role')}</label>
                    <div className="flex items-center gap-2">
                      <Shield size={18} className="text-primary" />
                      <span className="text-base font-bold text-foreground">{t('profile.clinic_owner', T_PAGE)}</span>
                    </div>
                  </div>
                  <div className="p-4 bg-muted/30 rounded-lg border border-border">
                    <label className="text-xs text-muted-foreground mb-1 block">{t('common.status')}</label>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-secondary rounded-full animate-pulse" />
                      <span className="text-base text-secondary font-bold">{t('common.active')}</span>
                    </div>
                  </div>
                  <div className="p-4 bg-muted/30 rounded-lg border border-border">
                    <label className="text-xs text-muted-foreground mb-1 block">{t('common.last_login')}</label>
                    <div className="flex items-center gap-2">
                      <Clock size={18} className="text-muted-foreground" />
                      <span className="text-base font-bold text-foreground">{t('common.today')}, 10:30 {t('common.am')}</span>
                    </div>
                  </div>
                  <div className="p-4 bg-muted/30 rounded-lg border border-border">
                    <label className="text-xs text-muted-foreground mb-1 block">{t('common.join_date')}</label>
                    <div className="flex items-center justify-between">
                      <span className="text-base font-bold text-foreground">15 Jan 2025</span>
                      <FaCalendarAlt size={16} className="text-muted-foreground" />
                    </div>
                  </div>
                  <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
                    <label className="text-xs text-primary mb-1 block">{t('common.user_id')}</label>
                    <span className="text-sm font-mono text-primary font-bold">USR-2026-0001</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Working Hours */}
            <div data-slot="card" className="tab-pane  bg-white rounded-xl border p-6 border-border shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                    <Clock size={24} className="text-primary" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">{t('common.working_hours')}</h3>
                    <p className="text-sm text-muted-foreground">{t('common.working_days')}</p>
                  </div>
                </div>
                {!isEditingHours && (
                  <button
                    onClick={() => setIsEditingHours(true)}
                    className="h-10 px-4 border border-primary/30 rounded-md text-primary hover:bg-primary/5 transition-all flex items-center gap-2 text-sm font-medium"
                  >
                    <Pen size={16} />
                    {t('common.edit_working_hours')}
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {workingHours.map((day, dIdx) => (
                  <div
                    key={day.day}
                    className={cn(
                      "p-4 rounded-lg border transition-all duration-300",
                      day.active
                        ? "bg-muted/20 border-border hover:border-primary/30"
                        : "bg-destructive/5 border-destructive/20"
                    )}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <div className={cn("w-2 h-2 rounded-full", day.active ? "bg-secondary" : "bg-destructive/50")} />
                        <span className={cn("font-bold text-sm", !day.active && "text-destructive")}>{day.day}</span>
                      </div>
                      {isEditingHours && (
                        <Switch
                          checked={day.active}
                          onCheckedChange={() => toggleDay(dIdx)}
                          className="scale-90"
                        />
                      )}
                    </div>

                    <div className="flex flex-col gap-2">
                      {day.active ? (
                        <>
                          {day.periods.map((period, pIdx) => (
                            <div key={pIdx} className="flex items-center gap-2">
                              {isEditingHours ? (
                                <div className="flex items-center gap-1.5 w-full">
                                  <TimePicker
                                    noClock
                                    value={period.from}
                                    onChange={(val) => updatePeriod(dIdx, pIdx, 'from', val)}
                                    className="h-8 py-0 px-2 min-w-0 flex-1 border-muted bg-white shadow-none focus-within:ring-0"
                                  />
                                  <span className="text-muted-foreground text-xs">→</span>
                                  <TimePicker
                                    noClock
                                    value={period.to}
                                    onChange={(val) => updatePeriod(dIdx, pIdx, 'to', val)}
                                    className="h-8 py-0 px-2 min-w-0 flex-1 border-muted bg-white shadow-none focus-within:ring-0"
                                  />
                                  <button
                                    onClick={() => removePeriod(dIdx, pIdx)}
                                    className="p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-md transition-all shrink-0"
                                  >
                                    <X size={12} />
                                  </button>
                                </div>
                              ) : (
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                  <Clock size={14} />
                                  <span>{period.from} → {period.to}</span>
                                </div>
                              )}
                            </div>
                          ))}
                          {isEditingHours && (
                            <button
                              onClick={() => addPeriod(dIdx)}
                              className="w-full h-9 mt-2 flex items-center justify-center gap-2 rounded-md border border-dashed border-border bg-transparent text-xs text-muted-foreground hover:bg-muted/50 transition-all"
                            >
                              <Plus size={14} />
                              {t('common.add_period')}
                            </button>
                          )}
                        </>
                      ) : (
                        <div className="flex items-center gap-2 text-sm">
                          <span className="text-destructive/70 font-medium italic">{t('common.holiday')}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {isEditingHours && (
                <div className="flex gap-3 justify-end mt-8 pt-6 border-t border-border">
                  <button
                    onClick={handleCancelHours}
                    className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all duration-300 border bg-background text-foreground hover:bg-accent hover:text-white hover:border-accent h-9 px-6 py-2"
                  >
                    <X size={16} className="ml-1" />
                    إلغاء
                  </button>
                  <button
                    onClick={handleSaveHours}
                    className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all duration-300 text-primary-foreground bg-primary hover:bg-primary/90 h-9 px-6 py-2 shadow-lg shadow-primary/20 hover:shadow-primary/30"
                  >
                    <Check size={16} className="ml-1" />
                    حفظ التعديلات
                  </button>
                </div>
              )}
            </div>
          </>
        ) : (
          <>
            {/* Clinic Card */}
            <div data-slot="card" className="tab-pane  text-card-foreground flex flex-col gap-6 rounded-xl border p-8 bg-linear-to-br from-white via-white to-secondary/5 border-border shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="flex items-center gap-6">
                <div className="w-24 h-24 bg-linear-to-br from-primary to-secondary rounded-2xl flex items-center justify-center shadow-lg shrink-0">
                  <Building2 size={40} className="text-white" />
                </div>
                <div className="flex-1">
                  <h2 className="text-3xl mb-2 font-bold">{clinicInfo.name}</h2>
                  <div className="flex items-center gap-3">
                    <span className="inline-flex items-center justify-center rounded-md border text-xs font-medium bg-secondary/10 text-secondary border-secondary/20 px-3 py-1">
                      {clinicInfo.specialty}
                    </span>
                    <div className="flex items-center gap-2 text-muted-foreground text-sm">
                      <MapPin size={16} />
                      <span>{clinicInfo.city}، {t('profile.jordan', T_PAGE)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Clinic Info Form */}
            <div data-slot="card" className="tab-pane  bg-white rounded-xl border p-6 border-border shadow-lg hover:shadow-xl transition-all duration-300">
              <h3 className="text-xl mb-6 font-bold">{t('profile.clinic_info', T_PAGE)}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-semibold">{t('profile.clinic_name', T_PAGE)}</label>
                  <Input
                    value={clinicInfo.name}
                    onChange={(e) => setClinicInfo({ ...clinicInfo, name: e.target.value })}
                    className="h-11 bg-muted/30 border-border focus:border-primary focus:bg-white transition-all font-bold"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-semibold">{t('profile.specialty', T_PAGE)}</label>
                  <Input
                    value={clinicInfo.specialty}
                    onChange={(e) => setClinicInfo({ ...clinicInfo, specialty: e.target.value })}
                    className="h-11 bg-muted/30 border-border focus:border-primary focus:bg-white transition-all font-bold"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-semibold">{t('profile.insurance', T_PAGE)}</label>
                  <Input
                    value={clinicInfo.insurance}
                    onChange={(e) => setClinicInfo({ ...clinicInfo, insurance: e.target.value })}
                    placeholder={t('profile.insurance_placeholder', T_PAGE)}
                    className="h-11 bg-muted/30 border-border focus:border-primary focus:bg-white transition-all font-bold"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-semibold">{t('common.phone')}</label>
                  <Input
                    value={clinicInfo.phone}
                    dir="ltr"
                    onChange={(e) => setClinicInfo({ ...clinicInfo, phone: e.target.value.replace(/\D/g, '') })}
                    className={cn("h-11 bg-muted/30 border-border focus:border-primary focus:bg-white transition-all font-bold", isAr ? "text-right" : "text-left")}
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-semibold">{t('common.email')}</label>
                  <Input
                    value={clinicInfo.email}
                    onChange={(e) => setClinicInfo({ ...clinicInfo, email: e.target.value })}
                    className="h-11 bg-muted/30 border-border focus:border-primary focus:bg-white transition-all font-bold"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-semibold">{t('profile.city', T_PAGE)}</label>
                  <Input
                    value={clinicInfo.city}
                    onChange={(e) => setClinicInfo({ ...clinicInfo, city: e.target.value })}
                    className="h-11 bg-muted/30 border-border focus:border-primary focus:bg-white transition-all font-bold"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-semibold">{t('profile.area', T_PAGE)}</label>
                  <Input
                    value={clinicInfo.area}
                    onChange={(e) => setClinicInfo({ ...clinicInfo, area: e.target.value })}
                    className="h-11 bg-muted/30 border-border focus:border-primary focus:bg-white transition-all font-bold"
                  />
                </div>
                <div className="flex flex-col gap-2 md:col-span-2">
                  <label className="text-sm font-semibold">{t('profile.full_address', T_PAGE)}</label>
                  <Input
                    value={clinicInfo.address}
                    onChange={(e) => setClinicInfo({ ...clinicInfo, address: e.target.value })}
                    className="h-11 bg-muted/30 border-border focus:border-primary focus:bg-white transition-all font-bold"
                  />
                </div>
              </div>
            </div>
          </>
        )}

        <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-border">
          <button
            onClick={activeTab === 'profile' ? handleCancelGeneral : () => window.showToast(t('cancel_success'), 'info')}
            className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all duration-300 border bg-background text-foreground hover:bg-accent hover:text-white hover:border-accent h-11 px-8"
          >
            {t('common.cancel')}
          </button>
          <button
            onClick={activeTab === 'profile' ? handleSaveGeneral : () => window.showToast(t('save_clinic_success'), 'success')}
            className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all duration-300 text-primary-foreground bg-primary hover:bg-primary/90 h-11 px-8 shadow-lg shadow-primary/20 hover:shadow-primary/30"
          >
            <Check size={18} className={isAr ? "ml-1" : "mr-1"} />
            {t('common.save_changes')}
          </button>
        </div>

        <Modal
          isOpen={showConfirmModal.open}
          onClose={() => setShowConfirmModal({ ...showConfirmModal, open: false })}
          onConfirm={handleConfirmCancel}
          title={t('profile.discard_change_q', T_PAGE)}
          message={t('profile.discard_confirm_msg', T_PAGE)}
          confirmText={t('profile.discard_btn', T_PAGE)}
          cancelText={t('common.cancel')}
          variant="danger"
        />

        {/* Change Email Dialog */}
        <EmailChangeDialog
           isOpen={isEmailModalOpen}
           onClose={() => setIsEmailModalOpen(false)}
        />
      </div>
    </div>
  );
};



export default ProfileView;
