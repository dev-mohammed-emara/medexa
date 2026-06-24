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
import { profileTranslations } from '@/constants/profile';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { usePreloader } from '@/contexts/PreloaderContext';
import { cn } from '@/utils/cn';

import { Mail, Phone, User, Camera, Building2, Clock, Key, MapPin, Pen, Plus, Shield, Stethoscope, X, Check } from 'lucide-react';
import { formatDateDisplay, formatTimeDisplay } from '../../utils/date';

import { getErrorMessage } from '../../utils/error';
import { useEffect, useRef, useState } from 'react';
import { FaCalendarAlt } from 'react-icons/fa';
import { useSearchParams } from 'react-router-dom';
import SettingsView from '../Settings/SettingsView';
import EmailChangeDialog from './EmailChangeDialog';
import PasswordChangeDialog from './PasswordChangeDialog';
import { getCookie } from '@/utils/cookie';
import { apiFetch } from '@/utils/apiFetch';
import { formatPhoneForPayload, formatPhoneForDisplay } from '@/utils/phone';
import { format } from 'date-fns';
import { DatePicker } from '@/components/ui/DatePicker';

import TimePicker from '@/components/ui/TimePicker';
import { useExitAnimation } from '@/hooks/useExitAnimation';

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
  const { profileImage, updateProfileImage, user, updateUser, hasPermission, hasRole } = useAuth();
  const { isLoaded, isExiting } = usePreloader();
  const { dir, isAr, t } = useLanguage();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTab = searchParams.get('tab') === 'clinic' && hasPermission('MANAGE_CLINIC') ? 'clinic' : 'profile';
  const [activeTab, setActiveTab] = useState<'profile' | 'clinic'>(initialTab);

  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam === 'clinic') {
      if (hasPermission('MANAGE_CLINIC')) {
        setActiveTab('clinic');
      } else {
        setSearchParams({ tab: 'profile' }, { replace: true });
        setActiveTab('profile');
      }
    } else {
      setActiveTab('profile');
    }
  }, [searchParams, hasPermission, setSearchParams]);

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
    defaultAppointmentPeriod: '30',
    joinedDate: ''
  });
  const [personalPhone, setPersonalPhone] = useState(user?.phoneNumber || '');

  const loadDoctorData = async (isCancelled?: () => boolean) => {
    try {
      const isSecretary = hasRole('ROLE_SECRETARY');
      const data: any = isSecretary ? await fetchSecretaryMe() : await fetchDoctorMe();
      if (isCancelled?.()) return;
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
          defaultAppointmentPeriod: (!isSecretary && (data.defaultAppointmentPeriod || 30).toString()) || '30',
          joinedDate: (data.user?.user_created_at || data.user?.createdAt || data.user_created_at || data.createdAt) 
            ? formatDateDisplay(data.user?.user_created_at || data.user?.createdAt || data.user_created_at || data.createdAt) 
            : ''
        });
        setPersonalPhone(formatPhoneForDisplay(data.user.phoneNumber || ''));

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

  const [appointmentPeriodError, setAppointmentPeriodError] = useState<string | null>(null);

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
      if (!personalPhone) setPersonalPhone(formatPhoneForDisplay(user.phoneNumber || ''));
    }
  }, [user, personalInfo.firstName, personalPhone]);

  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);

  const handleSaveGeneral = async () => {
    try {
      const isSecretary = hasRole('ROLE_SECRETARY');
      if (isSecretary) {
        await updateSecretaryMe({
          user: {
            firstName: personalInfo.firstName,
            surName: personalInfo.surName,
            lastName: personalInfo.lastName,
            phoneNumber: formatPhoneForPayload(personalPhone),
            gender: personalInfo.gender as 'MALE' | 'FEMALE',
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
            phoneNumber: formatPhoneForPayload(personalPhone),
            gender: personalInfo.gender as 'MALE' | 'FEMALE',
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
        phoneNumber: formatPhoneForPayload(personalPhone),
        gender: personalInfo.gender,
        dateOfBirth: personalInfo.dateOfBirth
      });
      setIsEditingProfile(false);
      window.showToast(t('profile.general_saved', T_PAGE), 'success');
    } catch (e: any) {
      window.showToast(e.message || 'Failed to update profile', 'error');
    }
  };

  const handleCancelGeneral = () => {
    loadDoctorData();
    setIsEditingProfile(false);
    window.showToast(t('profile.changes_canceled', T_PAGE), 'info');
  };

  const handleSaveAppointmentPeriod = async () => {
    setAppointmentPeriodError(null);
    try {
      const res = await updateDoctorAppointmentPeriod(parseInt(personalInfo.defaultAppointmentPeriod) || 30);
      setIsEditingAppointment(false);
      window.showToast(res.message || 'Appointment period updated successfully', 'success');
      loadDoctorData();
    } catch (e: any) {
      setAppointmentPeriodError(e.message || 'Failed to update appointment period');
      window.showToast(e.message || 'Failed to update appointment period', 'error');
      setTimeout(() => {
        document.getElementById('appointment-period-input')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 100);
    }
  };

  const handleCancelAppointmentPeriod = () => {
    setAppointmentPeriodError(null);
    loadDoctorData();
    setIsEditingAppointment(false);
    window.showToast(t('profile.changes_canceled', T_PAGE), 'info');
  };

  const [isEditingSchedule, setIsEditingSchedule] = useState(false);
  const [scheduleErrors, setScheduleErrors] = useState<Record<string, string[]>>({});
  const [workingHours, setWorkingHours] = useState<Array<{
    dayOfWeek: string;
    active: boolean;
    periods: Array<{ from: string; to: string }>;
    originalPeriods: Array<{ from: string; to: string }>;
    originalActive: boolean;
  }>>([
    { dayOfWeek: 'SUNDAY', active: false, periods: [], originalPeriods: [], originalActive: false },
    { dayOfWeek: 'MONDAY', active: false, periods: [], originalPeriods: [], originalActive: false },
    { dayOfWeek: 'TUESDAY', active: false, periods: [], originalPeriods: [], originalActive: false },
    { dayOfWeek: 'WEDNESDAY', active: false, periods: [], originalPeriods: [], originalActive: false },
    { dayOfWeek: 'THURSDAY', active: false, periods: [], originalPeriods: [], originalActive: false },
    { dayOfWeek: 'FRIDAY', active: false, periods: [], originalPeriods: [], originalActive: false },
    { dayOfWeek: 'SATURDAY', active: false, periods: [], originalPeriods: [], originalActive: false },
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
  const [originalInsuranceUuids, setOriginalInsuranceUuids] = useState<Set<string>>(new Set());

  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isEditingAppointment, setIsEditingAppointment] = useState(false);
  const [isEditingClinicInfo, setIsEditingClinicInfo] = useState(false);
  const [isEditingInsurance, setIsEditingInsurance] = useState(false);

  const { shouldRender: showProfileActions, isExiting: isProfileExiting } = useExitAnimation(isEditingProfile, 300);
  const { shouldRender: showAppointmentActions, isExiting: isAppointmentExiting } = useExitAnimation(isEditingAppointment, 300);
  const { shouldRender: showClinicActions, isExiting: isClinicExiting } = useExitAnimation(isEditingClinicInfo, 300);
  const { shouldRender: showInsuranceActions, isExiting: isInsuranceExiting } = useExitAnimation(isEditingInsurance, 300);
  const { shouldRender: showScheduleActions, isExiting: isScheduleExiting } = useExitAnimation(isEditingSchedule, 300);

  const loadSchedule = async (isCancelled?: () => boolean) => {
    if (hasRole('ROLE_SECRETARY')) return;
    try {
      const response = await apiFetch('/api/doctorschedule/me', {
        method: 'GET',
        headers: getHeaders()
      });
      if (response.ok) {
        const data = await response.json();
        if (isCancelled?.()) return;
        const schedules = data.schedules || [];

        setWorkingHours(prev => prev.map(day => {
          const serverDay = schedules.find((s: any) => s.dayOfWeek === day.dayOfWeek);
          const parsedPeriods = serverDay?.timeSlots?.map((slot: any) => ({
            from: formatTimeDisplay(slot.startTime),
            to: formatTimeDisplay(slot.endTime)
          })) || [];
          return {
            dayOfWeek: day.dayOfWeek,
            active: !!serverDay,
            periods: parsedPeriods,
            originalPeriods: [...parsedPeriods],
            originalActive: !!serverDay
          };
        }));
        setIsEditingSchedule(false);
      }
    } catch (err) {
      console.error('Error fetching schedule:', err);
    }
  };

  const loadClinicData = async (isCancelled?: () => boolean) => {
    try {
      const clinicData = await fetchClinicMe();
      if (isCancelled?.()) return;
      setClinicInfo({
        uuid: clinicData.uuid || '',
        name: clinicData.name || '',
        medicalCategory: clinicData.medicalCategory || '',
        country: clinicData.country || '',
        city: clinicData.city || '',
        address: clinicData.address || '',
        phoneNumber: formatPhoneForDisplay(clinicData.phoneNumber || ''),
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

  const loadInsurances = async (isCancelled?: () => boolean) => {
    try {
      const insuranceData = await fetchInsurances();
      if (isCancelled?.()) return;
      setInsurances(insuranceData);
    } catch (error) {
      console.error('Failed to load insurances:', error);
      window.showToast('Failed to load insurances', 'error');
    }
  };

  const loadClinicInsurances = async (isCancelled?: () => boolean) => {
    try {
      const response = await apiFetch('/api/clinic/insurance', {
        method: 'GET',
        headers: getHeaders()
      });
      if (response.ok) {
        const data = await response.json();
        if (isCancelled?.()) return;
        const uuids = new Set<string>(data.map((ins: any) => ins.uuid));
        setClinicInsuranceUuids(uuids);
        setOriginalInsuranceUuids(uuids);
      } else {
        console.error('Failed to load clinic insurances');
      }
    } catch (error) {
      console.error('Error loading clinic insurances:', error);
    }
  };

  // Fetch clinic data, insurances, active clinic insurances, schedules, and doctor data when component mounts
  useEffect(() => {
    let cancelled = false;
    const isCancelled = () => cancelled;

    if (hasPermission('ROLE_CLINIC_OWNER')) {
      loadClinicData(isCancelled);
      loadInsurances(isCancelled);
      loadClinicInsurances(isCancelled);
    }
    loadDoctorData(isCancelled);

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    let cancelled = false;
    loadSchedule(() => cancelled);
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleToggleInsurance = (uuid: string) => {
    setClinicInsuranceUuids(prev => {
      const next = new Set(prev);
      if (next.has(uuid)) {
        next.delete(uuid);
      } else {
        next.add(uuid);
      }
      return next;
    });
  };

  const handleSaveInsurances = async () => {
    try {
      const response = await apiFetch('/api/insurance/clinic', {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ insuranceUuids: Array.from(clinicInsuranceUuids) })
      });

      if (response.ok) {
        const data = await response.json();
        setOriginalInsuranceUuids(new Set(clinicInsuranceUuids));
        setIsEditingInsurance(false);
        window.showToast(data.message || 'Insurances assigned successfully', 'success');
      } else {
        let errMsg = 'Failed to assign insurances';
        try {
          const errData = await response.json();
          errMsg = getErrorMessage(errData, errMsg);
        } catch (e) { /* ignore */ }
        window.showToast(errMsg, 'error');
      }
    } catch (error: any) {
      console.error('Error saving insurances:', error);
      window.showToast(error.message || 'Error communicating with server', 'error');
    }
  };

  const handleCancelInsurances = () => {
    setClinicInsuranceUuids(new Set(originalInsuranceUuids));
    setIsEditingInsurance(false);
    window.showToast(t('profile.changes_canceled', T_PAGE), 'info');
  };

  const handleSaveClinic = async () => {
    try {
      const payload = {
        name: clinicInfo.name,
        medicalCategory: clinicInfo.medicalCategory,
        country: clinicInfo.country,
        city: clinicInfo.city,
        address: clinicInfo.address,
        phoneNumber: formatPhoneForPayload(clinicInfo.phoneNumber),
        email: clinicInfo.email
      };

      const updatedClinic = await updateClinicMe(payload);
      setClinicInfo({
        uuid: updatedClinic.uuid || '',
        name: updatedClinic.name || '',
        medicalCategory: updatedClinic.medicalCategory || '',
        country: updatedClinic.country || '',
        city: updatedClinic.city || '',
        address: updatedClinic.address || '',
        phoneNumber: formatPhoneForDisplay(updatedClinic.phoneNumber || ''),
        email: updatedClinic.email || '',
        status: updatedClinic.status || 'PENDING',
        settings: {
          defaultCurrency: updatedClinic.settings?.defaultCurrency || 'JOD',
          defaultAppointmentPeriod: updatedClinic.settings?.defaultAppointmentPeriod || 30
        }
      });
      setIsEditingClinicInfo(false);
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
      setIsEditingClinicInfo(false);
      window.showToast(t('profile.changes_canceled', T_PAGE), 'info');
    } catch (error) {
      console.error('Failed to reload clinic data on cancel:', error);
    }
  };

  const handleTabChange = (tab: 'profile' | 'clinic') => {
    if (tab === activeTab) return;
    setActiveTab(tab);
    setIsEditingSchedule(false);
    setScheduleErrors({});
    setSearchParams({ tab }, { replace: true });
  };

  const toggleDay = (index: number) => {
    setScheduleErrors({});
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
    setScheduleErrors({});
    setWorkingHours(prev => prev.map((day, idx) => {
      if (idx === dayIndex) {
        const lastPeriod = day.periods[day.periods.length - 1];
        let newPeriod;
        if (lastPeriod) {
          const from = lastPeriod.to;
          const [hStr, mStr] = from.split(':');
          let h = parseInt(hStr) + 2;
          if (h >= 24) h = h % 24;
          const to = `${h.toString().padStart(2, '0')}:${mStr || '00'}`;
          newPeriod = { from, to };
        } else {
          newPeriod = { from: '08:00', to: '18:00' };
        }
        return {
          ...day,
          periods: [...day.periods, newPeriod]
        };
      }
      return day;
    }));
  };

  const removePeriod = (dayIndex: number, periodIndex: number) => {
    setScheduleErrors({});
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
    setScheduleErrors({});
    const newHours = [...workingHours];
    newHours[dayIndex].periods[periodIndex][field] = value;
    setWorkingHours(newHours);
  };

  const handleSaveSchedule = async () => {
    setScheduleErrors({});

    let hasLocalErrors = false;
    const localErrors: Record<string, string[]> = {};

    const timeToMins = (time: string) => {
      const [h, m] = time.split(':').map(Number);
      return h * 60 + m;
    };

    workingHours.forEach(day => {
      if (!day.active || day.periods.length === 0) return;
      for (let i = 0; i < day.periods.length; i++) {
        const p1 = day.periods[i];
        const p1From = timeToMins(p1.from);
        const p1To = timeToMins(p1.to);
        
        if (p1From >= p1To) {
          if (!localErrors[day.dayOfWeek]) localErrors[day.dayOfWeek] = [];
          if (!localErrors[day.dayOfWeek].includes("End time must be after start time.")) {
            localErrors[day.dayOfWeek].push("End time must be after start time.");
          }
          hasLocalErrors = true;
        }

        for (let j = i + 1; j < day.periods.length; j++) {
          const p2 = day.periods[j];
          const p2From = timeToMins(p2.from);
          const p2To = timeToMins(p2.to);

          if (Math.max(p1From, p2From) < Math.min(p1To, p2To)) {
            if (!localErrors[day.dayOfWeek]) localErrors[day.dayOfWeek] = [];
            if (!localErrors[day.dayOfWeek].includes("Time periods cannot overlap or be identical.")) {
              localErrors[day.dayOfWeek].push("Time periods cannot overlap or be identical.");
            }
            hasLocalErrors = true;
          }
        }
      }
    });

    if (hasLocalErrors) {
      setScheduleErrors(localErrors);
      const firstDay = Object.keys(localErrors)[0];
      setTimeout(() => {
        document.getElementById(`schedule-error-${firstDay}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 100);
      window.showToast("Validation failed. Please fix overlapping times.", "error");
      return;
    }

    // Construct the entire schedules list to send to the backend
    const schedulesPayload = workingHours.map(currentDay => {
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
      const response = await apiFetch('/api/doctorschedule/assignschedule', {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify({ schedules: schedulesPayload })
      });

      if (response.ok) {
        const data = await response.json();
        setWorkingHours(prev => prev.map(d => ({
          ...d,
          originalPeriods: [...d.periods],
          originalActive: d.active
        })));
        setIsEditingSchedule(false);
        window.showToast(data.message || 'Schedule Assigned Successfully', 'success');
      } else {
        let errMsg = 'Failed to assign schedule';
        try {
          const errData = await response.json();
          if (errData.details && Array.isArray(errData.details)) {
            const dayErrors: Record<string, string[]> = {};
            const days = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];

            errData.details.forEach((d: any) => {
              if (d.message) {
                const foundDay = days.find(day => d.message.includes(day));
                if (foundDay) {
                  if (!dayErrors[foundDay]) dayErrors[foundDay] = [];
                  dayErrors[foundDay].push(d.message);
                } else {
                  if (!dayErrors['GENERAL']) dayErrors['GENERAL'] = [];
                  dayErrors['GENERAL'].push(d.message);
                }
              }
            });

            if (Object.keys(dayErrors).length > 0) {
              setScheduleErrors(dayErrors);
              errMsg = 'Validation failed. Please correct the highlighted days.';
              setTimeout(() => {
                const firstDay = Object.keys(dayErrors)[0];
                document.getElementById(`schedule-error-${firstDay}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
              }, 100);
            } else {
              errMsg = getErrorMessage(errData, errMsg);
            }
          } else {
            errMsg = getErrorMessage(errData, errMsg);
          }
        } catch (e) { /* ignore */ }
        window.showToast(errMsg, 'error');
      }
    } catch (err: any) {
      console.error(err);
      window.showToast(err.message || 'Error saving schedule', 'error');
    }
  };

  const handleCancelSchedule = () => {
    setScheduleErrors({});
    setWorkingHours(prev => prev.map(d => ({
      ...d,
      periods: [...d.originalPeriods],
      active: d.originalActive
    })));
    setIsEditingSchedule(false);
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
        {hasPermission('MANAGE_CLINIC') && (
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
            <div data-slot="card" className="tab-pane text-card-foreground flex flex-col-reverse sm:flex-row items-center justify-between gap-6 rounded-xl border p-8 bg-white border-border shadow-lg hover:shadow-xl transition-all duration-300">
              <div className={cn("flex-1 text-center font-bold", isAr ? "sm:text-right" : "sm:text-left")}>
                <h2 className="text-3xl mb-2 font-bold text-foreground">
                  {user
                    ? `${(hasRole('ROLE_SECRETARY')) ? '' : (isAr ? 'د. ' : 'Dr. ')}${user.firstName} ${user.lastName}`
                    : t('profile.doctor_name_val', T_PAGE)}
                </h2>
                <div className="flex flex-col gap-2">
                  <div className={cn("flex items-center justify-center", isAr ? "sm:justify-end" : "sm:justify-start")}>
                    <span className="inline-flex items-center justify-center rounded-xl border text-xs font-medium bg-primary/10 text-primary border-gray-200 px-3 py-1 gap-1">
                      {user?.role === 'ROLE_CLINIC_OWNER' || user?.roles?.includes('ROLE_CLINIC_OWNER') ? (
                        <>
                          <Shield size={14} className={isAr ? "ml-1" : "mr-1"} />
                          {t('profile.clinic_owner', T_PAGE)}
                        </>
                      ) : user?.role === 'ROLE_DOCTOR' || user?.roles?.includes('ROLE_DOCTOR') ? (
                        <>
                          <Stethoscope size={14} className={isAr ? "ml-1" : "mr-1"} />
                          {isAr ? "طبيب" : "Doctor"}
                        </>
                      ) : (
                        <>
                          <User size={14} className={isAr ? "ml-1" : "mr-1"} />
                          {isAr ? "سكرتير" : "Secretary"}
                        </>
                      )}
                    </span>
                  </div>
                  <div className={cn("flex items-center justify-center text-muted-foreground", isAr ? "sm:justify-end" : "sm:justify-start")}>
                    <Mail size={16} className={isAr ? "ml-2" : "mr-2"} />
                    <span>{user ? user.email : "dr.ahmed@medexa.com"}</span>
                  </div>
                  <div className={cn("flex items-center justify-center text-muted-foreground", isAr ? "sm:justify-end" : "sm:justify-start")}>
                    <Phone size={16} className={isAr ? "ml-2" : "mr-2"} />
                    <span dir="ltr">{user ? formatPhoneForDisplay(user.phoneNumber) : "0789651800"}</span>
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
              <div data-slot="card" className={cn("tab-pane flex flex-col rounded-xl border p-6 shadow-lg hover:shadow-xl transition-all duration-300 h-full", isEditingProfile ? "ring-2 ring-yellow-400 border-yellow-400 bg-yellow-50/20" : "bg-white border-border")}>
                <div className="flex justify-between mb-8 items-center gap-4 mb-4 flex-wrap">
                  <h3 className="text-xl  font-bold">{t('profile.personal_info', T_PAGE)}</h3>
                  <div className="flex gap-2 items-center">
                    {!isEditingProfile && !showProfileActions && (
                      <button
                        onClick={() => setIsEditingProfile(true)}
                        className="h-11 px-4 border border-primary/30 rounded-xl text-primary bg-primary/5 hover:bg-primary/10 transition-all flex items-center gap-2 text-sm font-bold animate-in fade-in duration-300"
                      >
                        <Pen size={16} />
                        {isAr ? 'تعديل البيانات' : 'Modify Profile'}
                      </button>
                    )}
                    <button
                      onClick={() => setIsPasswordModalOpen(true)}
                        className="h-11 px-4 border border-primary/30 rounded-xl text-primary bg-primary/5 hover:bg-primary/10 transition-all flex items-center gap-2 text-sm font-bold animate-in fade-in duration-300"
                    >
                      <Key size={16} />
                      {t('profile.change_password', T_PAGE)}
                    </button>
                  </div>
                </div>

                <div className="space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    <div className="flex flex-col gap-2">
                      <label className={cn("text-sm font-semibold text-foreground/80", isAr ? "pr-1" : "pl-1")}>{t('common.first_name')}</label>
                      <Input
                        name="firstName"
                        value={personalInfo.firstName}
                        onChange={(e) => setPersonalInfo(p => ({ ...p, firstName: e.target.value }))}
                        icon={<User size={18} />}
                        className={cn(
                          "h-11 border-border transition-all font-bold",
                          isEditingProfile ? "bg-muted/30 focus:border-primary focus:bg-white" : "bg-muted/50 cursor-not-allowed text-muted-foreground"
                        )}
                        readOnly={!isEditingProfile}
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className={cn("text-sm font-semibold text-foreground/80", isAr ? "pr-1" : "pl-1")}>{t('common.surname')}</label>
                      <Input
                        name="surName"
                        value={personalInfo.surName}
                        onChange={(e) => setPersonalInfo(p => ({ ...p, surName: e.target.value }))}
                        icon={<User size={18} />}
                        className={cn(
                          "h-11 border-border transition-all font-bold",
                          isEditingProfile ? "bg-muted/30 focus:border-primary focus:bg-white" : "bg-muted/50 cursor-not-allowed text-muted-foreground"
                        )}
                        readOnly={!isEditingProfile}
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className={cn("text-sm font-semibold text-foreground/80", isAr ? "pr-1" : "pl-1")}>{t('common.last_name')}</label>
                      <Input
                        name="lastName"
                        value={personalInfo.lastName}
                        onChange={(e) => setPersonalInfo(p => ({ ...p, lastName: e.target.value }))}
                        icon={<User size={18} />}
                        className={cn(
                          "h-11 border-border transition-all font-bold",
                          isEditingProfile ? "bg-muted/30 focus:border-primary focus:bg-white" : "bg-muted/50 cursor-not-allowed text-muted-foreground"
                        )}
                        readOnly={!isEditingProfile}
                      />
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className={cn("text-sm font-semibold text-foreground/80", isAr ? "pr-1" : "pl-1")}>{t('common.email')}</label>
                    <div className="flex gap-2">
                      <Input readOnly value={personalInfo.email} className="flex-1 h-11 bg-muted/50 border-border cursor-not-allowed text-muted-foreground" />
                      <button
                        onClick={() => setIsEmailModalOpen(true)}
                        className="h-11 px-4 border border-primary/30 rounded-xl text-primary bg-primary/5 hover:bg-primary/10 transition-all flex items-center gap-2 text-sm font-bold animate-in fade-in duration-300"
                      >
                        <Key size={16} />
                        {t('common.change')}
                      </button>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className={cn("text-sm font-semibold text-foreground/80", isAr ? "pr-1" : "pl-1")}>{t('common.phone')}</label>
                    <Input
                      name="phone"
                      backendField="phoneNumber"
                      value={personalPhone}
                      onChange={(e) => setPersonalPhone(e.target.value.replace(/\D/g, ''))}
                      dir="ltr"
                      className={cn(
                        "h-11 border-border transition-all font-bold",
                        isEditingProfile ? "bg-muted/30 focus:border-primary focus:bg-white" : "bg-muted/50 cursor-not-allowed text-muted-foreground",
                        isAr ? "text-right" : "text-left"
                      )}
                      readOnly={!isEditingProfile}
                    />
                  </div>
                  <div className="flex flex-col gap-6">
                    <div className="flex flex-col gap-2">
                      <label className={cn("text-sm font-semibold text-foreground/80", isAr ? "pr-1" : "pl-1")}>{t('common.gender')}</label>
                      <Select disabled={!isEditingProfile} name="gender"  value={personalInfo.gender} onValueChange={(val) => setPersonalInfo(p => ({ ...p, gender: val }))}>
                        <SelectTrigger className={cn(
                          "h-11 border-border font-bold",
                          isEditingProfile ? "bg-muted/30 focus:border-primary focus:bg-white" : "bg-muted/50 cursor-not-allowed text-muted-foreground"
                        )}>
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
                      {isEditingProfile ? (
                        <div className="relative group flex items-center justify-between h-11 bg-muted/30 focus-within:bg-white border border-border rounded-xl px-4 transition-all focus-within:ring-4 focus-within:ring-primary/10">
                          <DatePicker
                            value={personalInfo.dateOfBirth ? new Date(personalInfo.dateOfBirth) : new Date()}
                            useYearSelect={true}
                            onChange={([d]) => { if (d) setPersonalInfo({ ...personalInfo, dateOfBirth: format(d, 'yyyy-MM-dd') }) }}
                            maxDate={new Date()}
                            placeholder={isAr ? "اختر التاريخ" : "Select date"}
                            className={cn("flex-1 bg-transparent border-none outline-none text-sm font-bold h-full", isAr ? "text-right" : "text-left")}
                          />
                          <FaCalendarAlt className="size-4 text-muted-foreground pointer-events-none group-focus-within:text-primary transition-colors" />
                        </div>
                      ) : (
                        <Input
                          readOnly
                          value={personalInfo.dateOfBirth || (isAr ? '[غير محدد]' : '[Not detected]')}
                          icon={<FaCalendarAlt size={18} />}
                          className="h-11 bg-muted/50 border-border cursor-not-allowed text-muted-foreground font-bold"
                          dir="ltr"
                        />
                      )}
                    </div>
                  </div>

                  {/* Doctor Info Fields (Specialty, Summary) */}
                  {!hasRole('ROLE_SECRETARY') && (
                    <div className="flex flex-col gap-6 pt-4 border-t border-border mt-2">
                      <div className="flex flex-col gap-2">
                        <label className={cn("text-sm font-semibold text-foreground/80", isAr ? "pr-1" : "pl-1")}>{isAr ? 'التخصص الطبي' : 'Specialty'}</label>
                        <Input
                          name="specialty"
                          value={personalInfo.specialty}
                          onChange={(e) => setPersonalInfo(p => ({ ...p, specialty: e.target.value }))}
                          className={cn(
                            "h-11 border-border transition-all font-bold",
                            isEditingProfile ? "bg-muted/30 focus:border-primary focus:bg-white" : "bg-muted/50 cursor-not-allowed text-muted-foreground"
                          )}
                          readOnly={!isEditingProfile}
                        />
                      </div>
                      <div className="flex flex-col gap-2">
                        <label className={cn("text-sm font-semibold text-foreground/80", isAr ? "pr-1" : "pl-1")}>{isAr ? 'نبذة تعريفية' : 'Summary'}</label>
                        <Input
                          name="summary"
                          value={personalInfo.summary}
                          onChange={(e) => setPersonalInfo(p => ({ ...p, summary: e.target.value }))}
                          className={cn(
                            "h-11 border-border transition-all font-bold",
                            isEditingProfile ? "bg-muted/30 focus:border-primary focus:bg-white" : "bg-muted/50 cursor-not-allowed text-muted-foreground"
                          )}
                          readOnly={!isEditingProfile}
                        />
                      </div>
                    </div>
                  )}
                </div>
                {showProfileActions && (
                  <div className={cn("flex justify-end gap-3 mt-auto pt-6 duration-300", isProfileExiting ? "animate-out fade-out slide-out-to-bottom-2" : "animate-in fade-in slide-in-from-bottom-2")}>
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
                )}
              </div>

              <div className="flex flex-col gap-6">
                {/* Account Information */}
                <div data-slot="card" className="tab-pane flex flex-col bg-white rounded-xl border p-6 border-border shadow-lg hover:shadow-xl transition-all duration-300 h-fit">
                  <h3 className="text-xl mb-6 font-bold">{t('profile.account_info', T_PAGE)}</h3>
                  <div className="space-y-5">
                    <div className="p-4 bg-muted/30 rounded-xl border border-border">
                      <label className="text-xs text-muted-foreground mb-1 block">{t('common.role')}</label>
                      <div className="flex items-center gap-2">
                        {user?.role === 'ROLE_CLINIC_OWNER' || user?.roles?.includes('ROLE_CLINIC_OWNER') ? (
                          <>
                            <Shield size={18} className="text-primary" />
                            <span className="text-base font-bold text-foreground">{t('profile.clinic_owner', T_PAGE)}</span>
                          </>
                        ) : user?.role === 'ROLE_DOCTOR' || user?.roles?.includes('ROLE_DOCTOR') ? (
                          <>
                            <Stethoscope size={18} className="text-primary" />
                            <span className="text-base font-bold text-foreground">{isAr ? "طبيب" : "Doctor"}</span>
                          </>
                        ) : (
                          <>
                            <User size={18} className="text-primary" />
                            <span className="text-base font-bold text-foreground">{isAr ? "سكرتير" : "Secretary"}</span>
                          </>
                        )}
                      </div>
                    </div>
                    <div className="p-4 bg-muted/30 rounded-xl border border-border">
                      <label className="text-xs text-muted-foreground mb-1 block">{t('common.status')}</label>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-secondary rounded-full animate-pulse" />
                        <span className="text-base text-secondary font-bold">{t('common.active')}</span>
                      </div>
                    </div>
                    {/* <div className="p-4 bg-muted/30 rounded-xl border border-border">
                      <label className="text-xs text-muted-foreground mb-1 block">{t('common.last_login')}</label>
                      <div className="flex items-center gap-2">
                        <Clock size={18} className="text-muted-foreground" />
                        <span className="text-base font-bold text-foreground">{t('common.today')}, 10:30 {t('common.am')}</span>
                      </div>
                    </div> */}
                    <div className="p-4 bg-muted/30 rounded-xl border border-border">
                      <label className="text-xs text-muted-foreground mb-1 block">{t('common.join_date')}</label>
                      <div className="flex items-center justify-between">
                        <span className="text-base font-bold text-foreground" dir="ltr">{personalInfo.joinedDate || '-'}</span>
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
                {(user?.role === 'ROLE_DOCTOR' || user?.role === 'ROLE_CLINIC_OWNER' || user?.roles?.includes('ROLE_DOCTOR') || user?.roles?.includes('ROLE_CLINIC_OWNER')) && (
                  <div data-slot="card" className={cn("tab-pane h-full flex flex-col rounded-xl border p-6 shadow-lg hover:shadow-xl transition-all duration-300", isEditingAppointment ? "ring-2 ring-inset ring-yellow-400 border-yellow-400 bg-yellow-50/20" : "bg-white border-border")}>
                    <div className="flex justify-between items-center mb-8 gap-4 flex-wrap">
                      <h3 className="text-xl font-bold">{isAr ? 'إعدادات المواعيد' : 'Appointment Settings'}</h3>
                      {!isEditingAppointment && !showAppointmentActions && (
                        <button
                          onClick={() => setIsEditingAppointment(true)}
                          className="h-11 px-4 border border-primary/30 rounded-xl text-primary bg-primary/5 hover:bg-primary/10 transition-all flex items-center gap-2 text-sm font-bold animate-in fade-in duration-300"
                        >
                          <Pen size={16} />
                          {isAr ? 'تعديل الإعدادات' : 'Modify Settings'}
                        </button>
                      )}
                    </div>
                    <div className="space-y-5">
                      <div className="flex flex-col gap-2">
                        <label className={cn("text-sm font-semibold text-foreground/80", isAr ? "pr-1" : "pl-1")}>{isAr ? 'مدة الموعد الافتراضية (بالدقائق)' : 'Default Appointment Period (mins)'}</label>
                        <Input
                          id="appointment-period-input"
                          type="tel"
                          error={appointmentPeriodError || undefined}
                          value={personalInfo.defaultAppointmentPeriod}
                          onChange={(e) => {
                            let val = e.target.value.replace(/\D/g, '');
                            if (parseInt(val) > 240) val = '240';
                            if (appointmentPeriodError) setAppointmentPeriodError(null);
                            setPersonalInfo(p => ({ ...p, defaultAppointmentPeriod: val }))
                          }}
                          dir="ltr"
                          className={cn(
                            "h-11 border-border transition-all font-bold",
                            isEditingAppointment ? "bg-muted/30 focus:border-primary focus:bg-white" : "bg-muted/50 cursor-not-allowed text-muted-foreground",
                            isAr ? "text-right" : "text-left"
                          )}
                          readOnly={!isEditingAppointment}
                        />
                      </div>
                      <div className="mt-8 flex-1 border-2 border-dashed border-primary/40 bg-primary/5 rounded-xl flex items-center justify-center p-6 text-center shadow-inner">
                        <div className="flex flex-col items-center gap-2">
                          <Clock size={24} className="text-primary/70" />
                          <p className="text-primary font-bold text-sm md:text-base">
                            {isAr ? 'تغييرات وقت موعد الطبيب' : 'Doctor Appointment Time Changes'}                          </p>
                        </div>
                      </div>
                    </div>
                    {showAppointmentActions && (
                      <div className={cn("flex justify-end gap-3 mt-auto pt-6 duration-300", isAppointmentExiting ? "animate-out fade-out slide-out-to-bottom-2" : "animate-in fade-in slide-in-from-bottom-2")}>
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
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Working Hours */}
            {(hasRole('ROLE_DOCTOR') || hasRole('ROLE_CLINIC_OWNER')) && (
              <div data-slot="card" className={cn("tab-pane rounded-xl border p-6 shadow-lg hover:shadow-xl transition-all duration-300", isEditingSchedule ? "ring-2 ring-inset ring-yellow-400 border-yellow-400 bg-yellow-50/20" : "bg-white border-border")}>
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
                  {!isEditingSchedule && !showScheduleActions ? (
                    <button
                      onClick={() => setIsEditingSchedule(true)}
                      className="h-10 px-4 rounded-xl border border-primary/30 text-primary bg-primary/5 hover:bg-primary/10 transition-all font-semibold flex items-center gap-2 text-sm animate-in fade-in duration-300"
                    >
                      <Pen size={16} />
                      {isAr ? 'تعديل الجدول' : 'Modify Schedule'}
                    </button>
                  ) : null}
                  {showScheduleActions && (
                    <div className={cn("flex gap-2 duration-300", isScheduleExiting ? "animate-out fade-out slide-out-to-top-2" : "animate-in fade-in slide-in-from-top-2")}>
                      <button
                        onClick={handleCancelSchedule}
                        className="h-10 px-4 rounded-xl border border-border text-foreground bg-white hover:bg-muted transition-all font-semibold flex items-center gap-2 text-sm"
                      >
                        <X size={16} />
                        {t('common.cancel')}
                      </button>
                      <button
                        onClick={handleSaveSchedule}
                        className="h-10 px-4 rounded-xl bg-primary text-white hover:bg-primary/90 transition-all font-semibold flex items-center gap-2 text-sm shadow-lg shadow-primary/20"
                      >
                        <Check size={16} />
                        {t('common.save_changes')}
                      </button>
                    </div>
                  )}
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

                          {isEditingSchedule && (
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
                                  {isEditingSchedule ? (
                                    <div className="flex items-center gap-1.5 w-full animate-in fade-in slide-in-from-top-1 duration-300">
                                      <TimePicker
                                        value={period.from}
                                        onChange={(val) => updatePeriod(dIdx, pIdx, 'from', val)}
                                        className="h-8 py-0 px-2 flex-1 border border-muted bg-white shadow-none focus-within:ring-1 focus-within:ring-primary rounded-md text-sm min-w-0"
                                        noClock
                                      />
                                      <span className="text-muted-foreground text-xs">—</span>
                                      <TimePicker
                                        value={period.to}
                                        onChange={(val) => updatePeriod(dIdx, pIdx, 'to', val)}
                                        className="h-8 py-0 px-2 flex-1 border border-muted bg-white shadow-none focus-within:ring-1 focus-within:ring-primary rounded-md text-sm min-w-0"
                                        noClock
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
                                      <span>{period.from} — {period.to}</span>
                                    </div>
                                  )}
                                </div>
                              ))}
                              {isEditingSchedule && (
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

                          {scheduleErrors[day.dayOfWeek] && scheduleErrors[day.dayOfWeek].length > 0 && (
                            <div id={`schedule-error-${day.dayOfWeek}`} className="mt-2 flex flex-col gap-1 p-2 bg-destructive/10 border border-destructive/20 rounded-md">
                              {scheduleErrors[day.dayOfWeek].map((err, i) => (
                                <p key={i} className="text-xs text-destructive font-medium">{err}</p>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}

                  {scheduleErrors['GENERAL'] && scheduleErrors['GENERAL'].length > 0 && (
                    <div id="schedule-error-GENERAL" className="col-span-full mt-4 p-4 bg-destructive/10 border border-destructive/20 rounded-xl">
                      <h4 className="text-sm font-bold text-destructive mb-2">Schedule Errors</h4>
                      <ul className="list-disc pl-5 flex flex-col gap-1">
                        {scheduleErrors['GENERAL'].map((err, i) => (
                          <li key={i} className="text-sm text-destructive">{err}</li>
                        ))}
                      </ul>
                    </div>
                  )}
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
                <div className="flex sm:flex-row flex-col max-sm:justify-center max-sm:text-center  items-center gap-6">
                  <div className="w-24 h-24 bg-gradient-to-r from-[#0B5A8E] to-[#3FB8AF] rounded-2xl flex items-center justify-center shadow-lg shrink-0">
                    <Building2 size={40} className="text-white" />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-3xl mb-2 font-bold">{clinicInfo.name || 'Clinic Name'}</h2>
                    <div className="flex items-center gap-3 flex-wrap max-sm:justify-center max-sm:text-center  ">
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
                      <p className="text-xs text-muted-foreground font-bold flex max-sm:justify-center max-sm:text-center  items-center gap-2">
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
              <div data-slot="card" className={cn("tab-pane rounded-xl border p-6 shadow-lg hover:shadow-xl transition-all duration-300", isEditingClinicInfo ? "ring-2 ring-yellow-400 border-yellow-400 bg-yellow-50/20" : "bg-white border-border")}>
                <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
                  <h3 className="text-xl font-bold">{t('profile.clinic_info', T_PAGE)}</h3>
                  {!isEditingClinicInfo && !showClinicActions && (
                    <button
                      onClick={() => setIsEditingClinicInfo(true)}
                      className="h-10 px-4 rounded-xl border border-primary/30 text-primary bg-primary/5 hover:bg-primary/10 transition-all font-bold flex items-center gap-2 text-sm shrink-0 animate-in fade-in duration-300"
                    >
                      <Pen className="size-4" />
                      {isAr ? 'تعديل البيانات' : 'Modify Clinic Info'}
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-semibold">{t('profile.clinic_name', T_PAGE)}</label>
                    <Input
                      value={clinicInfo.name}
                      onChange={(e) => setClinicInfo({ ...clinicInfo, name: e.target.value })}
                      className={cn(
                        "h-11 border-border transition-all duration-300 font-bold",
                        isEditingClinicInfo ? "bg-muted/30 focus:bg-white focus:border-primary" : "bg-muted/50 cursor-not-allowed text-muted-foreground"
                      )}
                      readOnly={!isEditingClinicInfo}
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-semibold">{t('profile.specialty', T_PAGE)}</label>
                    <Input
                      value={clinicInfo.medicalCategory}
                      onChange={(e) => setClinicInfo({ ...clinicInfo, medicalCategory: e.target.value })}
                      className={cn(
                        "h-11 border-border transition-all duration-300 font-bold",
                        isEditingClinicInfo ? "bg-muted/30 focus:bg-white focus:border-primary" : "bg-muted/50 cursor-not-allowed text-muted-foreground"
                      )}
                      readOnly={!isEditingClinicInfo}
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-semibold">{t('common.phone')}</label>
                    <Input
                      value={clinicInfo.phoneNumber}
                      dir="ltr"
                      onChange={(e) => setClinicInfo({ ...clinicInfo, phoneNumber: e.target.value })}
                      className={cn(
                        "h-11 border-border transition-all duration-300 font-bold",
                        isEditingClinicInfo ? "bg-muted/30 focus:bg-white focus:border-primary" : "bg-muted/50 cursor-not-allowed text-muted-foreground",
                        isAr ? "text-right" : "text-left"
                      )}
                      readOnly={!isEditingClinicInfo}
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-semibold">{t('common.email')}</label>
                    <Input
                      value={clinicInfo.email}
                      onChange={(e) => setClinicInfo({ ...clinicInfo, email: e.target.value })}
                      className={cn(
                        "h-11 border-border transition-all duration-300 font-bold",
                        isEditingClinicInfo ? "bg-muted/30 focus:bg-white focus:border-primary" : "bg-muted/50 cursor-not-allowed text-muted-foreground"
                      )}
                      readOnly={!isEditingClinicInfo}
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-semibold">{t('profile.city', T_PAGE)}</label>
                    <Input
                      value={clinicInfo.city}
                      onChange={(e) => setClinicInfo({ ...clinicInfo, city: e.target.value })}
                      className={cn(
                        "h-11 border-border transition-all duration-300 font-bold",
                        isEditingClinicInfo ? "bg-muted/30 focus:bg-white focus:border-primary" : "bg-muted/50 cursor-not-allowed text-muted-foreground"
                      )}
                      readOnly={!isEditingClinicInfo}
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-semibold">{t('profile.country', T_PAGE)}</label>
                    <Input
                      value={clinicInfo.country}
                      onChange={(e) => setClinicInfo({ ...clinicInfo, country: e.target.value })}
                      className={cn(
                        "h-11 border-border transition-all duration-300 font-bold",
                        isEditingClinicInfo ? "bg-muted/30 focus:bg-white focus:border-primary" : "bg-muted/50 cursor-not-allowed text-muted-foreground"
                      )}
                      readOnly={!isEditingClinicInfo}
                    />
                  </div>
                  <div className="flex flex-col gap-2 md:col-span-2">
                    <label className="text-sm font-semibold">{t('profile.full_address', T_PAGE)}</label>
                    <Input
                      value={clinicInfo.address}
                      onChange={(e) => setClinicInfo({ ...clinicInfo, address: e.target.value })}
                      className={cn(
                        "h-11 border-border transition-all duration-300 font-bold",
                        isEditingClinicInfo ? "bg-muted/30 focus:bg-white focus:border-primary" : "bg-muted/50 cursor-not-allowed text-muted-foreground"
                      )}
                      readOnly={!isEditingClinicInfo}
                    />
                  </div>
                </div>

                {showClinicActions && (
                  <div className={cn("flex justify-end gap-3 mt-6 pt-6 border-t border-border duration-300", isClinicExiting ? "animate-out fade-out slide-out-to-bottom-2" : "animate-in fade-in slide-in-from-bottom-2")}>
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
                )}
              </div>

              {/* Insurance Section */}
              <div data-slot="card" className={cn("tab-pane rounded-xl border p-6 shadow-lg hover:shadow-xl transition-all duration-300", isEditingInsurance ? "ring-2 ring-yellow-400 border-yellow-400 bg-yellow-50/20" : "bg-white border-border")}>
                <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-secondary/10 rounded-xl flex items-center justify-center">
                      <Shield size={24} className="text-secondary" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold">{t('profile.insurance_section', T_PAGE)}</h3>
                      <p className="text-sm text-muted-foreground">{t('profile.insurance_section_desc', T_PAGE)}</p>
                    </div>
                  </div>
                  {!isEditingInsurance && !showInsuranceActions && (
                    <button
                      onClick={() => setIsEditingInsurance(true)}
                      className="h-10 px-4 rounded-xl border border-secondary/30 text-secondary bg-secondary/5 hover:bg-secondary/10 transition-all font-bold flex items-center gap-2 text-sm shrink-0 animate-in fade-in duration-300"
                    >
                      <Pen className="size-4" />
                      {isAr ? 'تعديل التأمين' : 'Modify Insurance'}
                    </button>
                  )}
                </div>

                {insurances.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {insurances.map((ins) => {
                      const isActive = clinicInsuranceUuids.has(ins.uuid);
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
                              onCheckedChange={() => handleToggleInsurance(ins.uuid)}
                              className="scale-90"
                              disabled={!isEditingInsurance}
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

                {showInsuranceActions && (
                  <div className={cn("flex justify-end gap-3 mt-6 pt-6 border-t border-border duration-300", isInsuranceExiting ? "animate-out fade-out slide-out-to-bottom-2" : "animate-in fade-in slide-in-from-bottom-2")}>
                    <button
                      onClick={handleCancelInsurances}
                      className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-medium transition-all duration-300 border bg-background text-foreground hover:bg-accent hover:text-white hover:border-accent h-10 px-6"
                    >
                      {t('common.cancel')}
                    </button>
                    <button
                      onClick={handleSaveInsurances}
                      className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-medium transition-all duration-300 text-primary-foreground bg-primary hover:bg-primary/90 h-10 px-6 shadow-lg shadow-primary/20 hover:shadow-primary/30"
                    >
                      <Check size={16} className={isAr ? "ml-1" : "mr-1"} />
                      {t('common.save_changes')}
                    </button>
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

