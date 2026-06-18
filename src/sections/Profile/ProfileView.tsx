import { fetchClinicMe, fetchInsurances, updateClinicMe } from '@/api/clinicApi';
import { fetchDoctorMe, updateDoctorMe, updateDoctorAppointmentPeriod } from '@/api/doctorApi';
import { fetchSecretaryMe, updateSecretaryMe } from '@/api/secretaryApi';
import Input from '@/components/ui/Input';
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
import { useEffect, useRef, useState } from 'react';
import Flatpickr from "react-flatpickr";
import { FaCalendarAlt } from 'react-icons/fa';
import { useSearchParams } from 'react-router-dom';
import SettingsView from '../Settings/SettingsView';
import EmailChangeDialog from './EmailChangeDialog';
import PasswordChangeDialog from './PasswordChangeDialog';
import { getCookie } from '@/utils/cookie';
import { format } from 'date-fns';

const DAY_MAPPING: { [key: string]: { labelKey: string, index: number } } = {
  SUNDAY: { labelKey: 'profile.sunday', index: 0 },
  MONDAY: { labelKey: 'profile.monday', index: 1 },
  TUESDAY: { labelKey: 'profile.tuesday', index: 2 },
  WEDNESDAY: { labelKey: 'profile.wednesday', index: 3 },
  THURSDAY: { labelKey: 'profile.thursday', index: 4 },
  FRIDAY: { labelKey: 'profile.friday', index: 5 },
  SATURDAY: { labelKey: 'profile.saturday', index: 6 }
};

const ProfileView = () => {
  const { profileImage, updateProfileImage, user, updateUser, hasPermission } = useAuth();
  const { isLoaded, isExiting } = usePreloader();
  const { dir, isAr, t } = useLanguage();
  const [searchParams] = useSearchParams();
  const initialTab = searchParams.get('tab') === 'clinic' ? 'clinic' : 'profile';
  const [activeTab, setActiveTab] = useState<'profile' | 'clinic'>(initialTab);

  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam === 'clinic') {
      setActiveTab('clinic');
    } else {
      setActiveTab('profile');
    }
  }, [searchParams]);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const T_PAGE = profileTranslations;

  const canAnimate = isLoaded && !isExiting;

  const getHeaders = () => {
    const token = getCookie('token')
    return {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    }
  }

  // Personal Info States
  const [personalInfo, setPersonalInfo] = useState({
    uuid: '',
    firstName: user?.firstName || '',
    surName: user?.surName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    gender: user?.gender || 'MALE',
    dateOfBirth: user?.dateOfBirth || '',
    specialty: '',
    summary: '',
    defaultAppointmentPeriod: '30'
  });
  const [personalPhone, setPersonalPhone] = useState(user?.phoneNumber || '');

  const loadDoctorData = async () => {
    try {
      const isSecretary = user?.role === 'ROLE_SECRETARY';
      const data: any = isSecretary ? await fetchSecretaryMe() : await fetchDoctorMe();
      if (data && data.user) {
        setPersonalInfo({
          uuid: data.uuid || '',
          firstName: data.user.firstName || '',
          surName: data.user.surName || '',
          lastName: data.user.lastName || '',
          email: data.user.email || '',
          gender: data.user.gender || 'MALE',
          dateOfBirth: data.user.dateOfBirth || '',
          specialty: (!isSecretary && data.specialty) || '',
          summary: (!isSecretary && data.summary) || '',
          defaultAppointmentPeriod: (!isSecretary && (data.defaultAppointmentPeriod || 30).toString()) || '30'
        });
        setPersonalPhone(data.user.phoneNumber || '');

        updateUser({
          uuid: data.uuid || '',
          firstName: data.user.firstName || '',
          surName: data.user.surName || '',
          lastName: data.user.lastName || '',
          email: data.user.email || '',
          phoneNumber: data.user.phoneNumber || '',
          gender: data.user.gender || 'MALE',
          dateOfBirth: data.user.dateOfBirth || '',
          status: data.user.status || 'WAITING_VERIFICATION',
          role: data.user.role || (isSecretary ? 'ROLE_SECRETARY' : 'ROLE_CLINIC_OWNER'),
          permissions: data.user.permissions || []
        });
      }
    } catch (e) {
      console.error('Failed to load user profile data:', e);
    }
  };

  // Sync personal info when user changes (fallback)
  useEffect(() => {
    if (user && !personalInfo.firstName) {
      setPersonalInfo(p => ({
        ...p,
        firstName: user.firstName || '',
        surName: user.surName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        gender: user.gender || 'MALE',
        dateOfBirth: user.dateOfBirth || ''
      }));
      if (!personalPhone) setPersonalPhone(user.phoneNumber || '');
    }
  }, [user]);

  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);

  const handleSaveGeneral = async () => {
    try {
      const isSecretary = user?.role === 'ROLE_SECRETARY';
      if (isSecretary) {
        await updateSecretaryMe({
          user: {
            firstName: personalInfo.firstName,
            surName: personalInfo.surName,
            lastName: personalInfo.lastName,
            phoneNumber: personalPhone,
            gender: personalInfo.gender,
            dateOfBirth: personalInfo.dateOfBirth,
            permissions: user?.permissions || []
          }
        });
      } else {
        await updateDoctorMe({
          user: {
            firstName: personalInfo.firstName,
            surName: personalInfo.surName,
            lastName: personalInfo.lastName,
            phoneNumber: personalPhone,
            gender: personalInfo.gender,
            dateOfBirth: personalInfo.dateOfBirth,
          },
          specialty: personalInfo.specialty,
          summary: personalInfo.summary
        });
      }
      updateUser({
        firstName: personalInfo.firstName,
        surName: personalInfo.surName,
        lastName: personalInfo.lastName,
        phoneNumber: personalPhone,
        gender: personalInfo.gender as any,
        dateOfBirth: personalInfo.dateOfBirth
      });
      window.showToast(t('profile.general_saved', T_PAGE), 'success');
    } catch (e: any) {
      window.showToast(e.message || 'Failed to update profile', 'error');
    }
  };

  const handleCancelGeneral = () => {
    loadDoctorData();
    window.showToast(t('profile.changes_canceled', T_PAGE), 'info');
  };

  const handleSaveAppointmentPeriod = async () => {
    try {
      const res = await updateDoctorAppointmentPeriod(parseInt(personalInfo.defaultAppointmentPeriod) || 30);
      window.showToast(res.message || 'Appointment period updated successfully', 'success');
      loadDoctorData();
    } catch (e: any) {
      window.showToast(e.message || 'Failed to update appointment period', 'error');
    }
  };

  const handleCancelAppointmentPeriod = () => {
    loadDoctorData();
    window.showToast(t('profile.changes_canceled', T_PAGE), 'info');
  };

  // Schedule / Working Hours State
  const [workingHours, setWorkingHours] = useState<Array<{
    dayOfWeek: string;
    active: boolean;
    periods: Array<{ from: string; to: string }>;
    isEditing: boolean;
    originalPeriods: Array<{ from: string; to: string }>;
    originalActive: boolean;
  }>>([
    { dayOfWeek: 'SUNDAY', active: false, periods: [], isEditing: false, originalPeriods: [], originalActive: false },
    { dayOfWeek: 'MONDAY', active: false, periods: [], isEditing: false, originalPeriods: [], originalActive: false },
    { dayOfWeek: 'TUESDAY', active: false, periods: [], isEditing: false, originalPeriods: [], originalActive: false },
    { dayOfWeek: 'WEDNESDAY', active: false, periods: [], isEditing: false, originalPeriods: [], originalActive: false },
    { dayOfWeek: 'THURSDAY', active: false, periods: [], isEditing: false, originalPeriods: [], originalActive: false },
    { dayOfWeek: 'FRIDAY', active: false, periods: [], isEditing: false, originalPeriods: [], originalActive: false },
    { dayOfWeek: 'SATURDAY', active: false, periods: [], isEditing: false, originalPeriods: [], originalActive: false },
  ]);

  // Clinic Info State
  const [clinicInfo, setClinicInfo] = useState({
    uuid: '',
    name: '',
    medicalCategory: '',
    country: '',
    city: '',
    address: '',
    phoneNumber: '',
    email: '',
    status: 'PENDING',
    settings: {
      defaultCurrency: 'JOD',
      defaultAppointmentPeriod: 30
    }
  });

  const [insurances, setInsurances] = useState<Array<{ uuid: string; name: string; provider: string }>>([]);
  const [clinicInsuranceUuids, setClinicInsuranceUuids] = useState<Set<string>>(new Set());
  const [togglingInsurances, setTogglingInsurances] = useState<Set<string>>(new Set());

  const loadSchedule = async () => {
    try {
      const endpoint = activeTab === 'clinic' ? '/api/clinicschedule/me' : '/api/doctorschedule/me';
      const response = await fetch(endpoint, {
        method: 'GET',
        headers: getHeaders()
      });
      if (response.ok) {
        const data = await response.json();
        const schedules = data.schedules || [];

        setWorkingHours(prev => prev.map(day => {
          const serverDay = schedules.find((s: any) => s.dayOfWeek === day.dayOfWeek);
          if (serverDay && serverDay.timeSlots && serverDay.timeSlots.length > 0) {
            const periods = serverDay.timeSlots.map((slot: any) => ({
              from: slot.startTime.substring(0, 5), // "09:00:00" -> "09:00"
              to: slot.endTime.substring(0, 5)
            }));
            return {
              ...day,
              active: true,
              periods,
              originalPeriods: [...periods],
              originalActive: true,
              isEditing: false
            };
          }
          return {
            ...day,
            active: false,
            periods: [],
            originalPeriods: [],
            originalActive: false,
            isEditing: false
          };
        }));
      }
    } catch (err) {
      console.error('Error fetching schedule:', err);
    }
  };

  const loadClinicData = async () => {
    try {
      const clinicData = await fetchClinicMe();
      console.log('Clinic data loaded:', clinicData);
      setClinicInfo({
        uuid: clinicData.uuid || '',
        name: clinicData.name || '',
        medicalCategory: clinicData.medicalCategory || '',
        country: clinicData.country || '',
        city: clinicData.city || '',
        address: clinicData.address || '',
        phoneNumber: clinicData.phoneNumber || '',
        email: clinicData.email || '',
        status: clinicData.status || 'PENDING',
        settings: {
          defaultCurrency: clinicData.settings?.defaultCurrency || 'JOD',
          defaultAppointmentPeriod: clinicData.settings?.defaultAppointmentPeriod || 30
        }
      });
    } catch (error) {
      console.error('Failed to load clinic data:', error);
      window.showToast('Failed to load clinic data', 'error');
    }
  };

  const loadInsurances = async () => {
    try {
      const insuranceData = await fetchInsurances();
      setInsurances(insuranceData);
    } catch (error) {
      console.error('Failed to load insurances:', error);
      window.showToast('Failed to load insurances', 'error');
    }
  };

  const loadClinicInsurances = async () => {
    try {
      const response = await fetch('/api/clinic/insurance', {
        method: 'GET',
        headers: getHeaders()
      });
      if (response.ok) {
        const data = await response.json();
        const uuids = new Set<string>(data.map((ins: any) => ins.uuid));
        setClinicInsuranceUuids(uuids);
      } else {
        console.error('Failed to load clinic insurances');
      }
    } catch (error) {
      console.error('Error loading clinic insurances:', error);
    }
  };

  // Fetch clinic data, insurances, active clinic insurances, schedules, and doctor data when component mounts
  useEffect(() => {
    if (hasPermission('ROLE_CLINIC_OWNER')) {
      loadClinicData();
      loadInsurances();
      loadClinicInsurances();
    }
    loadDoctorData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Refetch schedule whenever activeTab changes to keep both tabs fully in sync
  useEffect(() => {
    if (hasPermission('ROLE_CLINIC_OWNER')) {
      loadSchedule();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  const handleToggleInsurance = async (uuid: string) => {
    const isActive = clinicInsuranceUuids.has(uuid);

    // Add to toggling set to show loading/disabled state
    setTogglingInsurances(prev => {
      const next = new Set(prev);
      next.add(uuid);
      return next;
    });

    try {
      const endpoint = '/api/insurance/clinic';
      const method = isActive ? 'DELETE' : 'POST';
      const response = await fetch(endpoint, {
        method,
        headers: getHeaders(),
        body: JSON.stringify({ insuranceUuids: [uuid] })
      });

      if (response.ok) {
        const data = await response.json();
        // Update the clinicInsuranceUuids state upon successful response ONLY
        setClinicInsuranceUuids(prev => {
          const next = new Set(prev);
          if (isActive) {
            next.delete(uuid);
          } else {
            next.add(uuid);
          }
          return next;
        });
        window.showToast(data.message || (isActive ? 'Insurance unassigned successfully' : 'Insurance assigned successfully'), 'success');
      } else {
        let errMsg = isActive ? 'Failed to remove insurance' : 'Failed to assign insurance';
        try {
          const errData = await response.json();
          errMsg = errData.message || errData.error || errMsg;
        } catch (e) { }
        window.showToast(errMsg, 'error');
      }
    } catch (error: any) {
      console.error('Error toggling insurance:', error);
      window.showToast(error.message || 'Error communicating with server', 'error');
    } finally {
      // Remove from toggling set
      setTogglingInsurances(prev => {
        const next = new Set(prev);
        next.delete(uuid);
        return next;
      });
    }
  };

  const handleSaveClinic = async () => {
    try {
      const payload = {
        name: clinicInfo.name,
        medicalCategory: clinicInfo.medicalCategory,
        country: clinicInfo.country,
        city: clinicInfo.city,
        address: clinicInfo.address,
        phoneNumber: clinicInfo.phoneNumber,
        email: clinicInfo.email
      };

      const updatedClinic = await updateClinicMe(payload);
      console.log('Clinic data updated:', updatedClinic);
      setClinicInfo({
        uuid: updatedClinic.uuid || '',
        name: updatedClinic.name || '',
        medicalCategory: updatedClinic.medicalCategory || '',
        country: updatedClinic.country || '',
        city: updatedClinic.city || '',
        address: updatedClinic.address || '',
        phoneNumber: updatedClinic.phoneNumber || '',
        email: updatedClinic.email || '',
        status: updatedClinic.status || 'PENDING',
        settings: {
          defaultCurrency: updatedClinic.settings?.defaultCurrency || 'JOD',
          defaultAppointmentPeriod: updatedClinic.settings?.defaultAppointmentPeriod || 30
        }
      });
      window.showToast(t('profile.clinic_saved', T_PAGE), 'success');
    } catch (error: any) {
      console.error(error);
      window.showToast(error.message || 'Failed to save clinic details', 'error');
    }
  };

  const handleCancelClinic = async () => {
    try {
      const clinicData = await fetchClinicMe();
      setClinicInfo({
        uuid: clinicData.uuid || '',
        name: clinicData.name || '',
        medicalCategory: clinicData.medicalCategory || '',
        country: clinicData.country || '',
        city: clinicData.city || '',
        address: clinicData.address || '',
        phoneNumber: clinicData.phoneNumber || '',
        email: clinicData.email || '',
        status: clinicData.status || 'PENDING',
        settings: {
          defaultCurrency: clinicData.settings?.defaultCurrency || 'JOD',
          defaultAppointmentPeriod: clinicData.settings?.defaultAppointmentPeriod || 30
        }
      });
      window.showToast(t('profile.changes_canceled', T_PAGE), 'info');
    } catch (error) {
      console.error('Failed to reload clinic data on cancel:', error);
    }
  };

  const handleTabChange = (tab: 'profile' | 'clinic') => {
    if (tab === activeTab) return;
    setActiveTab(tab);
    window.history.replaceState(null, '', `?tab=${tab}`);
  };

  const toggleDay = (index: number) => {
    setWorkingHours(prev => prev.map((day, idx) => {
      if (idx === index) {
        const nextActive = !day.active;
        return {
          ...day,
          active: nextActive,
          periods: nextActive && day.periods.length === 0 ? [{ from: '08:00', to: '18:00' }] : day.periods
        };
      }
      return day;
    }));
  };

  const addPeriod = (dayIndex: number) => {
    setWorkingHours(prev => prev.map((day, idx) => {
      if (idx === dayIndex) {
        return {
          ...day,
          periods: [...day.periods, { from: '08:00', to: '18:00' }]
        };
      }
      return day;
    }));
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

  const handleSaveDaySchedule = async (dayIndex: number) => {
    const day = workingHours[dayIndex];

    // Construct the entire schedules list to send to the backend
    const schedulesPayload = workingHours.map((d, idx) => {
      const currentDay = idx === dayIndex ? day : d;

      if (!currentDay.active || currentDay.periods.length === 0) {
        return null;
      }

      return {
        dayOfWeek: currentDay.dayOfWeek,
        timeSlots: currentDay.periods.map(p => ({
          startTime: `${p.from}:00`,
          endTime: `${p.to}:00`
        }))
      };
    }).filter(Boolean);

    try {
      const endpoint = activeTab === 'clinic' ? '/api/clinicschedule/assignschedule' : '/api/doctorschedule/assignschedule';
      const response = await fetch(endpoint, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify({ schedules: schedulesPayload })
      });

      if (response.ok) {
        const data = await response.json();
        setWorkingHours(prev => prev.map((d, idx) => {
          if (idx === dayIndex) {
            return {
              ...d,
              isEditing: false,
              originalPeriods: [...d.periods],
              originalActive: d.active
            };
          }
          return d;
        }));
        window.showToast(data.message || 'Clinic Schedule Assigned Successfully', 'success');
      } else {
        let errMsg = 'Failed to assign clinic schedule';
        try {
          const errData = await response.json();
          errMsg = errData.message || errData.error || errMsg;
        } catch (e) { }
        window.showToast(errMsg, 'error');
      }
    } catch (err: any) {
      console.error(err);
      window.showToast(err.message || 'Error saving clinic schedule', 'error');
    }
  };

  const handleCancelDaySchedule = (dayIndex: number) => {
    setWorkingHours(prev => prev.map((d, idx) => {
      if (idx === dayIndex) {
        return {
          ...d,
          isEditing: false,
          periods: [...d.originalPeriods],
          active: d.originalActive
        };
      }
      return d;
    }));
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
            "relative px-6 py-2.5 rounded-xl text-sm transition-all duration-300 flex items-center gap-2",
            activeTab === 'profile' ? "text-primary font-semibold" : "text-muted-foreground hover:text-foreground font-normal"
          )}
        >
          {activeTab === 'profile' && (
            <div className="absolute inset-0 bg-white rounded-xl shadow-md animate-in fade-in zoom-in-95 duration-200" />
          )}
          <span className="relative z-10 flex items-center gap-2">
            <User size={16} />
            {t('profile.profile', T_PAGE)}
          </span>
        </button>
        {hasPermission('ROLE_CLINIC_OWNER') && (
          <button
            onClick={() => handleTabChange('clinic')}
            className={cn(
              "relative px-6 py-2.5 rounded-xl text-sm transition-all duration-300 flex items-center gap-2",
              activeTab === 'clinic' ? "text-primary font-semibold" : "text-muted-foreground hover:text-foreground font-normal"
            )}
          >
            {activeTab === 'clinic' && (
              <div className="absolute inset-0 bg-white rounded-xl shadow-md animate-in fade-in zoom-in-95 duration-200" />
            )}
            <span className="relative z-10 flex items-center gap-2">
              <Building2 size={16} />
              {t('profile.clinic_profile', T_PAGE)}
            </span>
          </button>
        )}
      </div>

      <div className={cn(
        "profile-content relative opacity-0",
        canAnimate && "animate-fadeUp animate-delay-300"
      )}>
        <div className={cn(
          "transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] transform",
          activeTab === 'profile'
            ? "relative opacity-100 translate-x-0 z-10"
            : "absolute inset-x-0 top-0 opacity-0 -translate-x-12 -z-10 pointer-events-none"
        )}>
          <div className="space-y-6">
            {/* Profile Card */}
            <div data-slot="card" className="tab-pane text-card-foreground flex flex-col sm:flex-row items-center justify-between gap-6 rounded-xl border p-8 bg-white border-border shadow-lg hover:shadow-xl transition-all duration-300">
              <div className={cn("flex-1 text-center font-bold", isAr ? "sm:text-right" : "sm:text-left")}>
                <h2 className="text-3xl mb-2 font-bold text-foreground">{user ? `د. ${user.firstName} ${user.lastName}` : t('profile.doctor_name_val', T_PAGE)}</h2>
                <div className="flex flex-col gap-2">
                  <div className={cn("flex items-center justify-center", isAr ? "sm:justify-end" : "sm:justify-start")}>
                    <span className="inline-flex items-center justify-center rounded-xl border text-xs font-medium bg-primary/10 text-primary border-gray-200 px-3 py-1 gap-1">
                      <Shield size={14} className={isAr ? "ml-1" : "mr-1"} />
                      {t('profile.clinic_owner', T_PAGE)}
                    </span>
                  </div>
                  <div className={cn("flex items-center justify-center text-muted-foreground", isAr ? "sm:justify-end" : "sm:justify-start")}>
                    <Mail size={16} className={isAr ? "ml-2" : "mr-2"} />
                    <span>{user ? user.email : "dr.ahmed@medexa.com"}</span>
                  </div>
                  <div className={cn("flex items-center justify-center text-muted-foreground", isAr ? "sm:justify-end" : "sm:justify-start")}>
                    <Phone size={16} className={isAr ? "ml-2" : "mr-2"} />
                    <span dir="ltr">{user ? user.phoneNumber : "0789651800"}</span>
                  </div>
                </div>
              </div>

              <div
                className="relative group cursor-pointer hover:scale-110 transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)]"
                onClick={() => fileInputRef.current?.click()}
              >
                <div className="w-32 h-32 rounded-full border-4 border-primary shadow-lg overflow-hidden shrink-0 bg-gradient-to-r from-[#0B5A8E] to-[#3FB8AF]">
                  {profileImage ? (
                    <img src={profileImage} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-white text-4xl font-bold">
                      {isAr ? "أ" : "A"}
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
              <div data-slot="card" className="tab-pane flex flex-col bg-white rounded-xl border p-6 border-border shadow-lg hover:shadow-xl transition-all duration-300 h-full">
                <h3 className="text-xl mb-6 font-bold">{t('profile.personal_info', T_PAGE)}</h3>
                <div className="space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    <div className="flex flex-col gap-2">
                      <label className={cn("text-sm font-semibold text-foreground/80", isAr ? "pr-1" : "pl-1")}>{t('common.first_name')}</label>
                      <Input
                        value={personalInfo.firstName}
                        onChange={(e) => setPersonalInfo(p => ({ ...p, firstName: e.target.value }))}
                        icon={<User size={18} />}
                        className="h-11 bg-muted/30 border-border focus:border-primary focus:bg-white transition-all font-bold"
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className={cn("text-sm font-semibold text-foreground/80", isAr ? "pr-1" : "pl-1")}>{t('common.surname')}</label>
                      <Input
                        value={personalInfo.surName}
                        onChange={(e) => setPersonalInfo(p => ({ ...p, surName: e.target.value }))}
                        icon={<User size={18} />}
                        className="h-11 bg-muted/30 border-border focus:border-primary focus:bg-white transition-all font-bold"
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className={cn("text-sm font-semibold text-foreground/80", isAr ? "pr-1" : "pl-1")}>{t('common.last_name')}</label>
                      <Input
                        value={personalInfo.lastName}
                        onChange={(e) => setPersonalInfo(p => ({ ...p, lastName: e.target.value }))}
                        icon={<User size={18} />}
                        className="h-11 bg-muted/30 border-border focus:border-primary focus:bg-white transition-all font-bold"
                      />
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className={cn("text-sm font-semibold text-foreground/80", isAr ? "pr-1" : "pl-1")}>{t('common.email')}</label>
                    <div className="flex gap-2">
                      <Input readOnly value={personalInfo.email} className="flex-1 h-11 bg-muted/50 border-border cursor-not-allowed text-muted-foreground" />
                      <button
                        onClick={() => setIsEmailModalOpen(true)}
                        className="h-11 px-4 border border-primary/30 rounded-xl text-primary hover:bg-primary/5 transition-all flex items-center gap-2 text-sm font-medium"
                      >
                        <Key size={16} />
                        {t('common.change')}
                      </button>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className={cn("text-sm font-semibold text-foreground/80", isAr ? "pr-1" : "pl-1")}>{t('profile.password', T_PAGE) || 'Password'}</label>
                    <div className="flex gap-2">
                      <Input readOnly type="password" value="********" className="flex-1 h-11 bg-muted/50 border-border cursor-not-allowed text-muted-foreground" />
                      <button
                        onClick={() => setIsPasswordModalOpen(true)}
                        className="h-11 px-4 border border-primary/30 rounded-xl text-primary hover:bg-primary/5 transition-all flex items-center gap-2 text-sm font-medium"
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
                      <Select value={personalInfo.gender} onValueChange={(val) => setPersonalInfo(p => ({ ...p, gender: val }))}>
                        <SelectTrigger className="h-11 bg-muted/30 border-border font-bold">
                          <SelectValue placeholder={t('common.gender')} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="MALE">{t('common.male')}</SelectItem>
                          <SelectItem value="FEMALE">{t('common.female')}</SelectItem>
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
                          value={personalInfo.dateOfBirth}
                          onChange={([date]) => {
                            if (date) {
                              setPersonalInfo(p => ({ ...p, dateOfBirth: format(date, 'yyyy-MM-dd') }));
                            }
                          }}
                          placeholder={isAr ? "اختر التاريخ" : "Select date"}
                          className={cn("flex h-11 w-full rounded-xl border border-border bg-muted/30 px-3 py-2 text-sm font-bold focus:border-primary focus:bg-white transition-all outline-none", isAr ? "pl-10" : "pr-10 text-left!")}
                          options={{
                            locale: isAr ? Arabic : undefined,
                            dateFormat: "d F Y",
                            disableMobile: true
                          }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Doctor Info Fields (Specialty, Summary) */}
                  {user?.role !== 'ROLE_SECRETARY' && (
                    <div className="flex flex-col gap-6 pt-4 border-t border-border mt-2">
                      <div className="flex flex-col gap-2">
                        <label className={cn("text-sm font-semibold text-foreground/80", isAr ? "pr-1" : "pl-1")}>{isAr ? 'التخصص الطبي' : 'Specialty'}</label>
                        <Input
                          value={personalInfo.specialty}
                          onChange={(e) => setPersonalInfo(p => ({ ...p, specialty: e.target.value }))}
                          className="h-11 bg-muted/30 border-border focus:border-primary focus:bg-white transition-all font-bold"
                        />
                      </div>
                      <div className="flex flex-col gap-2">
                        <label className={cn("text-sm font-semibold text-foreground/80", isAr ? "pr-1" : "pl-1")}>{isAr ? 'نبذة تعريفية' : 'Summary'}</label>
                        <Input
                          value={personalInfo.summary}
                          onChange={(e) => setPersonalInfo(p => ({ ...p, summary: e.target.value }))}
                          className="h-11 bg-muted/30 border-border focus:border-primary focus:bg-white transition-all font-bold"
                        />
                      </div>
                    </div>
                  )}
                </div>
                <div className="flex justify-end gap-3 mt-auto pt-6 ">
                  <button
                    onClick={handleCancelGeneral}
                    className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-medium transition-all duration-300 border bg-background text-foreground hover:bg-accent hover:text-white hover:border-accent h-10 px-6"
                  >
                    {t('common.cancel')}
                  </button>
                  <button
                    onClick={handleSaveGeneral}
                    className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-medium transition-all duration-300 text-primary-foreground bg-primary hover:bg-primary/90 h-10 px-6 shadow-lg shadow-primary/20 hover:shadow-primary/30"
                  >
                    <Check size={16} className={isAr ? "ml-1" : "mr-1"} />
                    {t('common.save_changes')}
                  </button>
                </div>
              </div>

              <div className="flex flex-col gap-6">
                {/* Account Information */}
                <div data-slot="card" className="tab-pane flex flex-col bg-white rounded-xl border p-6 border-border shadow-lg hover:shadow-xl transition-all duration-300 h-fit">
                  <h3 className="text-xl mb-6 font-bold">{t('profile.account_info', T_PAGE)}</h3>
                  <div className="space-y-5">
                    <div className="p-4 bg-muted/30 rounded-xl border border-border">
                      <label className="text-xs text-muted-foreground mb-1 block">{t('common.role')}</label>
                      <div className="flex items-center gap-2">
                        <Shield size={18} className="text-primary" />
                        <span className="text-base font-bold text-foreground">{t('profile.clinic_owner', T_PAGE)}</span>
                      </div>
                    </div>
                    <div className="p-4 bg-muted/30 rounded-xl border border-border">
                      <label className="text-xs text-muted-foreground mb-1 block">{t('common.status')}</label>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-secondary rounded-full animate-pulse" />
                        <span className="text-base text-secondary font-bold">{t('common.active')}</span>
                      </div>
                    </div>
                    <div className="p-4 bg-muted/30 rounded-xl border border-border">
                      <label className="text-xs text-muted-foreground mb-1 block">{t('common.last_login')}</label>
                      <div className="flex items-center gap-2">
                        <Clock size={18} className="text-muted-foreground" />
                        <span className="text-base font-bold text-foreground">{t('common.today')}, 10:30 {t('common.am')}</span>
                      </div>
                    </div>
                    <div className="p-4 bg-muted/30 rounded-xl border border-border">
                      <label className="text-xs text-muted-foreground mb-1 block">{t('common.join_date')}</label>
                      <div className="flex items-center justify-between">
                        <span className="text-base font-bold text-foreground">15 Jan 2025</span>
                        <FaCalendarAlt size={16} className="text-muted-foreground" />
                      </div>
                    </div>
                    <div className="p-4 bg-primary/5 rounded-xl border border-gray-200">
                      <label className="text-xs text-primary mb-1 block">{t('common.user_id')}</label>
                      <span className="text-sm font-mono text-primary font-bold">{personalInfo.uuid || 'USR-2026-0001'}</span>
                    </div>
                  </div>
                </div>

                {/* Appointment Period Settings */}
                {user?.role !== 'ROLE_SECRETARY' && (
                  <div data-slot="card" className="tab-pane h-full flex flex-col bg-white rounded-xl border p-6 border-border shadow-lg hover:shadow-xl transition-all duration-300 h-fit">
                    <h3 className="text-xl mb-6 font-bold">{isAr ? 'إعدادات المواعيد' : 'Appointment Settings'}</h3>
                    <div className="space-y-5">
                      <div className="flex flex-col gap-2">
                        <label className={cn("text-sm font-semibold text-foreground/80", isAr ? "pr-1" : "pl-1")}>{isAr ? 'مدة الموعد الافتراضية (بالدقائق)' : 'Default Appointment Period (mins)'}</label>
                        <Input
                          type="tel"
                          value={personalInfo.defaultAppointmentPeriod}
                          onChange={(e) => setPersonalInfo(p => ({ ...p, defaultAppointmentPeriod: e.target.value.replace(/\D/g, '') }))}
                          dir="ltr"
                          className={cn("h-11 bg-muted/30 border-border focus:border-primary focus:bg-white transition-all font-bold", isAr ? "text-right" : "text-left")}
                        />
                      </div>
                    </div>
                    <div className="flex justify-end gap-3 mt-auto pt-6 ">
                      <button
                        onClick={handleCancelAppointmentPeriod}
                        className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-medium transition-all duration-300 border bg-background text-foreground hover:bg-accent hover:text-white hover:border-accent h-10 px-6"
                      >
                        {t('common.cancel')}
                      </button>
                      <button
                        onClick={handleSaveAppointmentPeriod}
                        className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-medium transition-all duration-300 text-primary-foreground bg-primary hover:bg-primary/90 h-10 px-6 shadow-lg shadow-primary/20 hover:shadow-primary/30"
                      >
                        <Check size={16} className={isAr ? "ml-1" : "mr-1"} />
                        {t('common.save_changes')}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Working Hours */}
            {user?.role !== 'ROLE_SECRETARY' && (
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
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {workingHours.map((day, dIdx) => (
                    <div
                      key={day.dayOfWeek}
                      className={cn(
                        "p-4 rounded-xl border transition-all duration-300 flex flex-col justify-between min-h-[180px]",
                        day.active
                          ? "bg-muted/20 border-border hover:border-primary/30"
                          : "bg-destructive/5 border-destructive/20"
                      )}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <div className={cn("w-2 h-2 rounded-full", day.active ? "bg-secondary" : "bg-destructive/50")} />
                            <span className={cn("font-bold text-sm", !day.active && "text-destructive")}>
                              {t(DAY_MAPPING[day.dayOfWeek].labelKey, T_PAGE)}
                            </span>
                          </div>

                          {!day.isEditing ? (
                            <button
                              onClick={() => {
                                setWorkingHours(prev => prev.map((d, idx) => {
                                  if (idx === dIdx) {
                                    return {
                                      ...d,
                                      isEditing: true,
                                      originalPeriods: [...d.periods],
                                      originalActive: d.active
                                    };
                                  }
                                  return d;
                                }));
                              }}
                              className="p-1.5 text-primary hover:bg-primary/5 rounded-lg transition-all"
                              aria-label="Edit day schedule"
                            >
                              <Pen size={14} />
                            </button>
                          ) : (
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
                                  {day.isEditing ? (
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
                                        className="p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-xl transition-all shrink-0"
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
                              {day.isEditing && (
                                <button
                                  onClick={() => addPeriod(dIdx)}
                                  className="w-full h-8 mt-2 flex items-center justify-center gap-2 rounded-xl border border-dashed border-border bg-transparent text-xs text-muted-foreground hover:bg-muted/50 transition-all"
                                >
                                  <Plus size={12} />
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

                      {day.isEditing && (
                        <div className="flex gap-2 justify-end mt-4 pt-3 border-t border-gray-200">
                          <button
                            onClick={() => handleCancelDaySchedule(dIdx)}
                            className="h-8 px-3 rounded-lg border border-border text-xs text-foreground bg-white hover:bg-muted transition-all font-semibold flex items-center gap-1"
                          >
                            <X size={12} />
                            {t('common.cancel')}
                          </button>
                          <button
                            onClick={() => handleSaveDaySchedule(dIdx)}
                            className="h-8 px-3 rounded-lg bg-primary text-white text-xs hover:bg-primary/90 transition-all font-semibold flex items-center gap-1"
                          >
                            <Check size={12} />
                            {t('common.save')}
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {hasPermission('ROLE_CLINIC_OWNER') && (
          <div className={cn(
            "transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] transform",
            activeTab === 'clinic'
              ? "relative opacity-100 translate-x-0 z-10"
              : "absolute inset-x-0 top-0 opacity-0 translate-x-12 -z-10 pointer-events-none"
          )}>
            <div className="space-y-6">
              {/* Clinic Card */}
              <div data-slot="card" className="tab-pane  text-card-foreground flex flex-col gap-6 rounded-xl border p-8 bg-white border-border shadow-lg hover:shadow-xl transition-all duration-300">
                <div className="flex items-center gap-6">
                  <div className="w-24 h-24 bg-gradient-to-r from-[#0B5A8E] to-[#3FB8AF] rounded-2xl flex items-center justify-center shadow-lg shrink-0">
                    <Building2 size={40} className="text-white" />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-3xl mb-2 font-bold">{clinicInfo.name || 'Clinic Name'}</h2>
                    <div className="flex items-center gap-3 flex-wrap">
                      <span className="inline-flex items-center justify-center rounded-xl border text-xs font-medium bg-secondary/10 text-secondary border-secondary/20 px-3 py-1">
                        {clinicInfo.medicalCategory || 'Medical Category'}
                      </span>
                      <div className="flex items-center gap-2 text-muted-foreground text-sm">
                        <MapPin size={16} />
                        <span>{clinicInfo.city || 'City'}، {clinicInfo.country || 'Country'}</span>
                      </div>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6 mt-4 pt-4 border-t border-border/30">
                      <p className="text-xs text-muted-foreground font-mono">
                        <strong>UUID:</strong> {clinicInfo.uuid}
                      </p>
                      <p className="text-xs text-muted-foreground font-bold flex items-center gap-2">
                        <strong>{isAr ? 'الحالة:' : 'Status:'}</strong>
                        <span className={cn(
                          "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold",
                          clinicInfo.status === 'ACTIVE' ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"
                        )}>
                          {clinicInfo.status || 'PENDING'}
                        </span>
                      </p>
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
                      value={clinicInfo.medicalCategory}
                      onChange={(e) => setClinicInfo({ ...clinicInfo, medicalCategory: e.target.value })}
                      className="h-11 bg-muted/30 border-border focus:border-primary focus:bg-white transition-all font-bold"
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-semibold">{t('common.phone')}</label>
                    <Input
                      value={clinicInfo.phoneNumber}
                      dir="ltr"
                      onChange={(e) => setClinicInfo({ ...clinicInfo, phoneNumber: e.target.value })}
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
                    <label className="text-sm font-semibold">{t('profile.country', T_PAGE)}</label>
                    <Input
                      value={clinicInfo.country}
                      onChange={(e) => setClinicInfo({ ...clinicInfo, country: e.target.value })}
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

                <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-border">
                  <button
                    onClick={handleCancelClinic}
                    className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-medium transition-all duration-300 border bg-background text-foreground hover:bg-accent hover:text-white hover:border-accent h-10 px-6"
                  >
                    {t('common.cancel')}
                  </button>
                  <button
                    onClick={handleSaveClinic}
                    className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-medium transition-all duration-300 text-primary-foreground bg-primary hover:bg-primary/90 h-10 px-6 shadow-lg shadow-primary/20 hover:shadow-primary/30"
                  >
                    <Check size={16} className={isAr ? "ml-1" : "mr-1"} />
                    {t('common.save_changes')}
                  </button>
                </div>
              </div>

              {/* Insurance Section */}
              <div data-slot="card" className="tab-pane bg-white rounded-xl border p-6 border-border shadow-lg hover:shadow-xl transition-all duration-300">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-secondary/10 rounded-xl flex items-center justify-center">
                    <Shield size={24} className="text-secondary" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">{t('profile.insurance_section', T_PAGE)}</h3>
                    <p className="text-sm text-muted-foreground">{t('profile.insurance_section_desc', T_PAGE)}</p>
                  </div>
                </div>

                {insurances.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {insurances.map((ins) => {
                      const isActive = clinicInsuranceUuids.has(ins.uuid);
                      const isToggling = togglingInsurances.has(ins.uuid);
                      return (
                        <div
                          key={ins.uuid}
                          className={cn(
                            "flex items-center justify-between p-4 rounded-xl border transition-all duration-300",
                            isActive
                              ? "bg-secondary/5 border-secondary/20 shadow-sm"
                              : "bg-muted/20 border-border"
                          )}
                        >
                          <div className="flex items-center gap-3">
                            <div className={cn(
                              "w-2 h-2 rounded-full",
                              isActive ? "bg-secondary animate-pulse" : "bg-muted-foreground/40"
                            )} />
                            <div className="flex flex-col">
                              <span className="font-bold text-foreground">{ins.name}</span>
                              <span className="text-xs text-muted-foreground">{ins.provider}</span>
                            </div>
                          </div>

                          <div className="flex items-center gap-3">
                            <span className={cn(
                              "text-xs font-bold",
                              isActive ? "text-secondary" : "text-muted-foreground"
                            )}>
                              {isActive ? t('profile.active', T_PAGE) : (isAr ? "غير نشط" : "Inactive")}
                            </span>
                            <Switch
                              checked={isActive}
                              disabled={isToggling}
                              onCheckedChange={() => handleToggleInsurance(ins.uuid)}
                              className="scale-90"
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="p-8 text-center flex flex-col items-center gap-3 bg-muted/10 rounded-xl border border-dashed border-border mt-4">
                    <div className="size-12 rounded-2xl bg-secondary/10 flex items-center justify-center text-secondary/50">
                      <Shield className="size-6" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-foreground">{isAr ? "لا توجد شركات تأمين" : "No insurance companies"}</p>
                      <p className="text-xs text-muted-foreground">{isAr ? "لم يتم إضافة أي شركات تأمين للنظام بعد" : "No insurance companies have been added to the system yet"}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Settings View */}
              <SettingsView hideHeader={true} className="pb-0" activeTab={activeTab} />
            </div>
          </div>
        )}




        {/* Change Email Dialog */}
        <EmailChangeDialog
          isOpen={isEmailModalOpen}
          onClose={() => setIsEmailModalOpen(false)}
        />
        {/* Change Password Dialog */}
        <PasswordChangeDialog
          isOpen={isPasswordModalOpen}
          onClose={() => setIsPasswordModalOpen(false)}
        />
      </div>
    </div>
  );
};



export default ProfileView;

