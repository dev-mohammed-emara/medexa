import { useRef, useState } from 'react';
import {
  User,
  Building2,
  Shield,
  Mail,
  Phone,
  Camera,
  Pen,
  Key,
  Clock,
  Check,
  X,
  Plus,
  MapPin
} from 'lucide-react';
import { cn } from '@/utils/cn';
import Input from '@/components/ui/Input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Switch } from '@/components/ui/Switch';
import Flatpickr from "react-flatpickr";
import "flatpickr/dist/themes/material_blue.css";
import { Arabic } from "flatpickr/dist/l10n/ar.js";
import TimePicker from '@/components/ui/TimePicker';
import Modal from '@/components/ui/Modal';
import EmailChangeDialog from './EmailChangeDialog';
import { FaCalendarAlt } from 'react-icons/fa';
import { useAuth } from '@/contexts/AuthContext';

const ProfileView = () => {
  const { profileImage, updateProfileImage } = useAuth();
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeTab, setActiveTab] = useState<'profile' | 'clinic'>('profile');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Removed entrance animations as requested

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
    { day: 'الأحد', active: true, periods: [{ from: '08:00', to: '12:00' }, { from: '16:00', to: '20:00' }] },
    { day: 'الاثنين', active: true, periods: [{ from: '08:00', to: '18:00' }] },
    { day: 'الثلاثاء', active: true, periods: [{ from: '08:00', to: '18:00' }] },
    { day: 'الأربعاء', active: true, periods: [{ from: '08:00', to: '18:00' }] },
    { day: 'الخميس', active: true, periods: [{ from: '08:00', to: '14:00' }] },
    { day: 'الجمعة', active: false, periods: [] },
    { day: 'السبت', active: false, periods: [] },
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

  // Removed active tab animation as requested

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
        window.showToast('تم تحديث صورة الملف الشخصي بنجاح', 'success');
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
    <div ref={containerRef} className="space-y-6" dir="rtl">
      <div>
        <h1 className="text-3xl mb-1 font-bold">الملف الشخصي</h1>
        <p className="text-muted-foreground">إدارة المعلومات الشخصية ومعلومات العيادة</p>
      </div>

      {/* Tabs */}
      <div
        className="inline-flex items-center bg-muted/50 p-1.5 rounded-xl border border-border shadow-sm"
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
            الملف الشخصي
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
            ملف العيادة
          </span>
        </button>
      </div>

      <div className="space-y-6">
        {activeTab === 'profile' ? (
          <>
            {/* Profile Card */}
            <div data-slot="card" className="text-card-foreground flex flex-col sm:flex-row items-center justify-between gap-6 rounded-xl border p-8 bg-linear-to-br from-white via-white to-primary/5 border-border shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="flex-1 text-center sm:text-right">
                <h2 className="text-3xl mb-2 font-bold text-foreground">د. أحمد الحشايكة</h2>
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-center sm:justify-start gap-2">
                    <span className="inline-flex items-center justify-center rounded-md border text-xs font-medium bg-primary/10 text-primary border-primary/20 px-3 py-1 gap-1">
                      <Shield size={14} className="ml-1" />
                      مالك العيادة
                    </span>
                  </div>
                  <div className="flex items-center justify-center sm:justify-start gap-2 text-muted-foreground">
                    <Mail size={16} />
                    <span>ahmad@ahmad.com</span>
                  </div>
                  <div className="flex items-center justify-center sm:justify-start gap-2 text-muted-foreground">
                    <Phone size={16} />
                    <span dir="ltr" className="text-right">0789651800</span>
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
                      {"د. أحمد الحشايكة".replace(/^د\.\s*/, '').charAt(0)}
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
                <div className="absolute inset-0 bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center pointer-events-none">
                  <Pen size={24} className="text-white" />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Personal Information */}
              <div data-slot="card" className="bg-white rounded-xl border p-6 border-border shadow-lg hover:shadow-xl transition-all duration-300 h-full">
                <h3 className="text-xl mb-6 font-bold">المعلومات الشخصية</h3>
                <div className="space-y-5">
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-semibold text-foreground/80 pr-1">الاسم الكامل</label>
                    <Input defaultValue="د. أحمد السعيد" className="h-11 bg-muted/30 border-border focus:border-primary focus:bg-white transition-all font-bold" />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-semibold text-foreground/80 pr-1">البريد الإلكتروني</label>
                    <div className="flex gap-2">
                      <Input readOnly value="ahmad.alsaeed@medexa.jo" className="flex-1 h-11 bg-muted/50 border-border cursor-not-allowed text-muted-foreground" />
                      <button
                        onClick={() => setIsEmailModalOpen(true)}
                        className="h-11 px-4 border border-primary/30 rounded-md text-primary hover:bg-primary/5 transition-all flex items-center gap-2 text-sm font-medium"
                      >
                        <Key size={16} />
                        تغيير
                      </button>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-semibold text-foreground/80 pr-1">رقم الهاتف</label>
                    <Input
                      value={personalPhone}
                      onChange={(e) => setPersonalPhone(e.target.value.replace(/\D/g, ''))}
                      dir="ltr"
                      className="h-11 bg-muted/30 border-border focus:border-primary focus:bg-white transition-all text-right font-bold"
                    />
                  </div>
                  <div className="flex flex-col gap-6">
                    <div className="flex flex-col gap-2">
                      <label className="text-sm font-semibold text-foreground/80 pr-1">الجنس</label>
                      <Select defaultValue="ذكر">
                        <SelectTrigger className="h-11 bg-muted/30 border-border font-bold">
                          <SelectValue placeholder="اختر الجنس" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="ذكر">ذكر</SelectItem>
                          <SelectItem value="أنثى">أنثى</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="text-sm font-semibold text-foreground/80 pr-1">تاريخ الميلاد</label>
                      <div className="relative">
                        <FaCalendarAlt
                          size={16}
                          className="absolute left-5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none z-10"
                        />
                        <Flatpickr
                          value="1985-05-15"
                          className="flex h-11 w-full rounded-xl border border-border bg-muted/30 pl-10 pr-3 py-2 text-sm font-bold focus:border-primary focus:bg-white transition-all outline-none"
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
              <div data-slot="card" className="bg-white rounded-xl border p-6 border-border shadow-lg hover:shadow-xl transition-all duration-300 h-full">
                <h3 className="text-xl mb-6 font-bold">معلومات الحساب</h3>
                <div className="space-y-5">
                  <div className="p-4 bg-muted/30 rounded-lg border border-border">
                    <label className="text-xs text-muted-foreground mb-1 block">الدور</label>
                    <div className="flex items-center gap-2">
                      <Shield size={18} className="text-primary" />
                      <span className="text-base font-bold text-foreground">مالك العيادة</span>
                    </div>
                  </div>
                  <div className="p-4 bg-muted/30 rounded-lg border border-border">
                    <label className="text-xs text-muted-foreground mb-1 block">الحالة</label>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-secondary rounded-full animate-pulse" />
                      <span className="text-base text-secondary font-bold">نشط</span>
                    </div>
                  </div>
                  <div className="p-4 bg-muted/30 rounded-lg border border-border">
                    <label className="text-xs text-muted-foreground mb-1 block">آخر تسجيل دخول</label>
                    <div className="flex items-center gap-2">
                      <Clock size={18} className="text-muted-foreground" />
                      <span className="text-base font-bold text-foreground">اليوم، 10:30 صباحاً</span>
                    </div>
                  </div>
                  <div className="p-4 bg-muted/30 rounded-lg border border-border">
                    <label className="text-xs text-muted-foreground mb-1 block">تاريخ الانضمام</label>
                    <div className="flex items-center justify-between">
                      <span className="text-base font-bold text-foreground">15 يناير 2025</span>
                      <FaCalendarAlt size={16} className="text-muted-foreground" />
                    </div>
                  </div>
                  <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
                    <label className="text-xs text-primary mb-1 block">معرّف المستخدم</label>
                    <span className="text-sm font-mono text-primary font-bold">USR-2026-0001</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Working Hours */}
            <div data-slot="card" className="bg-white rounded-xl border p-6 border-border shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                    <Clock size={24} className="text-primary" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">مواعيد العمل</h3>
                    <p className="text-sm text-muted-foreground">جدول ساعات العمل الأسبوعي</p>
                  </div>
                </div>
                {!isEditingHours && (
                  <button
                    onClick={() => setIsEditingHours(true)}
                    className="h-10 px-4 border border-primary/30 rounded-md text-primary hover:bg-primary/5 transition-all flex items-center gap-2 text-sm font-medium"
                  >
                    <Pen size={16} />
                    تعديل مواعيد العمل
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
                              إضافة فترة
                            </button>
                          )}
                        </>
                      ) : (
                        <div className="flex items-center gap-2 text-sm">
                          <span className="text-destructive/70 font-medium italic">عطلة</span>
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
            <div data-slot="card" className="text-card-foreground flex flex-col gap-6 rounded-xl border p-8 bg-linear-to-br from-white via-white to-secondary/5 border-border shadow-lg hover:shadow-xl transition-all duration-300">
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
                      <span>{clinicInfo.city}، الأردن</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Clinic Info Form */}
            <div data-slot="card" className="bg-white rounded-xl border p-6 border-border shadow-lg hover:shadow-xl transition-all duration-300">
              <h3 className="text-xl mb-6 font-bold">معلومات العيادة</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-semibold">اسم العيادة</label>
                  <Input
                    value={clinicInfo.name}
                    onChange={(e) => setClinicInfo({ ...clinicInfo, name: e.target.value })}
                    className="h-11 bg-muted/30 border-border focus:border-primary focus:bg-white transition-all font-bold"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-semibold">التخصص</label>
                  <Input
                    value={clinicInfo.specialty}
                    onChange={(e) => setClinicInfo({ ...clinicInfo, specialty: e.target.value })}
                    className="h-11 bg-muted/30 border-border focus:border-primary focus:bg-white transition-all font-bold"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-semibold">اسم التأمين</label>
                  <Input
                    value={clinicInfo.insurance}
                    onChange={(e) => setClinicInfo({ ...clinicInfo, insurance: e.target.value })}
                    placeholder="اسم شركة التأمين"
                    className="h-11 bg-muted/30 border-border focus:border-primary focus:bg-white transition-all font-bold"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-semibold">رقم الهاتف</label>
                  <Input
                    value={clinicInfo.phone}
                    dir="ltr"
                    onChange={(e) => setClinicInfo({ ...clinicInfo, phone: e.target.value.replace(/\D/g, '') })}
                    className="h-11 bg-muted/30 border-border focus:border-primary focus:bg-white transition-all text-right font-bold"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-semibold">البريد الإلكتروني</label>
                  <Input
                    value={clinicInfo.email}
                    onChange={(e) => setClinicInfo({ ...clinicInfo, email: e.target.value })}
                    className="h-11 bg-muted/30 border-border focus:border-primary focus:bg-white transition-all font-bold"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-semibold">المدينة</label>
                  <Input
                    value={clinicInfo.city}
                    onChange={(e) => setClinicInfo({ ...clinicInfo, city: e.target.value })}
                    className="h-11 bg-muted/30 border-border focus:border-primary focus:bg-white transition-all font-bold"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-semibold">المنطقة</label>
                  <Input
                    value={clinicInfo.area}
                    onChange={(e) => setClinicInfo({ ...clinicInfo, area: e.target.value })}
                    className="h-11 bg-muted/30 border-border focus:border-primary focus:bg-white transition-all font-bold"
                  />
                </div>
                <div className="flex flex-col gap-2 md:col-span-2">
                  <label className="text-sm font-semibold">العنوان الكامل</label>
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
            onClick={activeTab === 'profile' ? handleCancelGeneral : () => window.showToast('تم إلغاء التغييرات', 'info')}
            className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all duration-300 border bg-background text-foreground hover:bg-accent hover:text-white hover:border-accent h-11 px-8"
          >
            إلغاء
          </button>
          <button
            onClick={activeTab === 'profile' ? handleSaveGeneral : () => window.showToast('تم حفظ بيانات العيادة بنجاح', 'success')}
            className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all duration-300 text-primary-foreground bg-primary hover:bg-primary/90 h-11 px-8 shadow-lg shadow-primary/20 hover:shadow-primary/30"
          >
             <Check size={18} className="ml-1" />
            حفظ التغييرات
          </button>
        </div>

        <Modal
          isOpen={showConfirmModal.open}
          onClose={() => setShowConfirmModal({ ...showConfirmModal, open: false })}
          onConfirm={handleConfirmCancel}
          title="تجاهل التغيير؟"
          message="هل أنت متأكد من تجاهل التغييرات؟"
          confirmText="نعم، تجاهل"
          cancelText="إلغاء"
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
