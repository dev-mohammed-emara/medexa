import { format } from 'date-fns';


import { Clock, DollarSign, Phone, Plus, Stethoscope, User, X, Check, AlertCircle } from 'lucide-react';
import { TbCancel } from 'react-icons/tb';
import { FaCalendarAlt } from 'react-icons/fa';
import { useCallback, useEffect, useRef, useState } from 'react';
import { DatePicker } from '../../components/ui/DatePicker';
import { Button } from '../../components/ui/Button';
import ScrollLockWrapper from '../../components/ui/ScrollLockWrapper';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import { useLanguage } from '../../contexts/LanguageContext'
import { appointmentsTranslations } from '../../constants/translations/appointments';
import TimePicker from '../../components/ui/TimePicker';
import { cn } from '../../utils/cn';
import { statusConfig } from './constants';
import Portal from '../../components/ui/Portal';


import { fetchDoctors } from '../../api/doctorApi';
import { fetchPatients } from '../../api/patientApi';
import { getCookie } from '../../utils/cookie';
import { useAuth } from '../../contexts/AuthContext';
import { getErrorMessage } from '../../utils/error';
import { apiFetch } from '../../utils/apiFetch';

export interface Appointment {
  id: number | string;
  uuid?: string;
  patientName: string;
  doctorName: string;
  date: Date | string;
  time: string;
  endTime?: string;
  appointmentType?: string;
  status: string;
  patientNotes?: string;
  doctorNotes?: string;
  patientId?: string;
  doctorId?: string;
  canceledBy?: 'doctor' | 'patient' | 'secretary' | '';
  cancellationReason?: string;
  color?: 'amber' | 'emerald' | 'rose' | 'blue';
}

interface AppointmentsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (data: Partial<Appointment>) => void;
  mode: 'add' | 'edit' | 'view';
  initialData?: Appointment | null;
  doctorsList?: any[];
  onCancel?: (app: Appointment) => void;
  onComplete?: (app: Appointment) => void;
}

const AppointmentsDialog = ({ isOpen, onClose, onConfirm, mode, initialData, doctorsList: doctorsListProp, onCancel, onComplete }: AppointmentsDialogProps) => {
  const { isAr, dir, t } = useLanguage();
  const { user } = useAuth();
  const hasManageMedicalRecords = user?.permissions?.includes('MANAGE_MEDICAL_RECORDS') || user?.role === 'ROLE_CLINIC_OWNER' || user?.role === 'ROLE_DOCTOR' || user?.roles?.includes('ROLE_DOCTOR');
  const T = appointmentsTranslations;

  const overlayRef = useRef<HTMLDivElement>(null);  
  const [isClosing, setIsClosing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Safely parse yyyy-MM-dd string to local Date object to prevent timezone shifting
  const parseLocalDate = (dateStr: string) => {
    if (!dateStr) return undefined;
    const datePart = dateStr.split('T')[0];
    const parts = datePart.split('-');
    if (parts.length !== 3) return undefined;
    const [year, month, day] = parts.map(Number);
    return new Date(year, month - 1, day);
  };

  // Form States
  const [selectedDate, setSelectedDate] = useState<string>(
    initialData?.date ? (typeof initialData.date === 'string' ? initialData.date : initialData.date.toISOString().split('T')[0]) : ""
  );
  const [selectedTime, setSelectedTime] = useState<string>(initialData?.time || "");
  const [selectedEndTime, setSelectedEndTime] = useState<string>(initialData?.endTime || "");
  const [selectedAppointmentType, setSelectedAppointmentType] = useState<string>(initialData?.appointmentType || "");
  const [selectedStatus, setSelectedStatus] = useState(initialData?.status || 'pending');
  const [selectedDoctor, setSelectedDoctor] = useState(initialData?.doctorId || "");
  const [selectedPatient, setSelectedPatient] = useState(initialData?.patientId || "");
  const [doctorNotes, setDoctorNotes] = useState(initialData?.doctorNotes || "");
  const [patientNotes, setPatientNotes] = useState(initialData?.patientNotes || "");

  const [fetchedDetails, setFetchedDetails] = useState<any>(null);

  useEffect(() => {
    let cancelled = false;
    const appointmentUuid = initialData?.uuid || initialData?.id;
    if (isOpen && appointmentUuid && (mode === 'view' || mode === 'edit')) {
      const loadDetails = async () => {
        try {
          const token = getCookie('token');
          const res = await apiFetch(`/api/appointment/${appointmentUuid}`, {
            headers: {
              ...(token ? { 'Authorization': `Bearer ${token}` } : {})
            }
          });
          if (res.ok) {
            const data = await res.json();
            if (!cancelled) {
              setFetchedDetails(data);
              if (data.appointmentDate) {
                setSelectedDate(data.appointmentDate);
              }
            if (data.appointmentStartTime) {
              setSelectedTime(data.appointmentStartTime);
            }
            if (data.appointmentEndTime) {
              setSelectedEndTime(data.appointmentEndTime);
            }
            if (data.doctor?.uuid) {
              setSelectedDoctor(data.doctor.uuid);
            }
            if (data.patient?.uuid) {
              setSelectedPatient(data.patient.uuid);
            }
            if (data.doctorNote !== undefined) {
              setDoctorNotes(data.doctorNote || "");
            }
            if (data.patientNote !== undefined) {
              setPatientNotes(data.patientNote || "");
            }
            if (data.status) {
              setSelectedStatus(data.status.toLowerCase());
            }
            if (data.appointmentTypeUuid) {
              setSelectedAppointmentType(data.appointmentTypeUuid);
            }
          }
        }
      } catch (e) {
        console.error("Failed to load appointment details:", e);
      }
      };
      loadDetails();
    } else {
      if (!cancelled) {
        setFetchedDetails(null);
        setSelectedDate(initialData?.date ? (typeof initialData.date === 'string' ? initialData.date : initialData.date.toISOString().split('T')[0]) : "");
        setSelectedTime(initialData?.time || "");
        setSelectedEndTime(initialData?.endTime || "");
        setSelectedAppointmentType(initialData?.appointmentType || "");
        setSelectedStatus(initialData?.status || 'pending');
        setSelectedDoctor(initialData?.doctorId || "");
        setSelectedPatient(initialData?.patientId || "");
        setDoctorNotes(initialData?.doctorNotes || "");
        setPatientNotes(initialData?.patientNotes || "");
      }
    }
    if (!cancelled) setError(null);
    return () => {
      cancelled = true;
    };
  }, [isOpen, initialData, mode]);



  // API Dropdown states
  const [doctorsList, setDoctorsList] = useState<any[]>([]);
  const [patientsList, setPatientsList] = useState<any[]>([]);
  const [appointmentTypesList, setAppointmentTypesList] = useState<any[]>([]);

  // Fetch API dropdowns
  useEffect(() => {
    let cancelled = false;
    if (isOpen) {
      const loadDropdownData = async () => {
        try {
          if (doctorsListProp && doctorsListProp.length > 0) {
            if (!cancelled) setDoctorsList(doctorsListProp);
          } else {
            const docData = await fetchDoctors({ size: 100 });
            if (!cancelled) {
              if (docData.content && docData.content.length > 0) {
                setDoctorsList(docData.content);
              } else {
                setDoctorsList([]);
              }
            }
          }
        } catch (e) {
          console.error('Failed to load doctors in modal:', e);
          setDoctorsList([]);
        }

        try {
          if (patientsList.length === 0) {
            const patData = await fetchPatients({ size: 100 });
            if (!cancelled) {
              if (patData.content && patData.content.length > 0) {
                setPatientsList(patData.content);
              } else {
                setPatientsList([]);
              }
            }
          }
        } catch (e) {
          console.error('Failed to load patients in modal:', e);
          setPatientsList([]);
        }

        try {
          if (appointmentTypesList.length === 0) {
            const token = getCookie('token');
            const res = await apiFetch('/api/appointment-type', {
              headers: {
                ...(token ? { 'Authorization': `Bearer ${token}` } : {})
              }
            });
          if (res.ok) {
            const data = await res.json();
            if (!cancelled) setAppointmentTypesList(data || []);
          } else {
            if (!cancelled) {
              // Fallback default list
            setAppointmentTypesList([]);
          }
            }
          }
        } catch (err) {
          if (!cancelled) {
            setAppointmentTypesList([]);
          }
        }
      };
      loadDropdownData();
    }
    return () => {
      cancelled = true;
    };
  }, [isOpen, isAr, doctorsListProp, appointmentTypesList.length, patientsList.length]);

  const handleClose = useCallback(() => {
    setIsClosing(true);
    setTimeout(() => {
      setIsClosing(false);
      onClose();
    }, 400);
  }, [onClose]);

  const historyPushed = useRef(false);
  const dialogId = useRef<number | null>(null);
  if (dialogId.current === null) {
    dialogId.current = Date.now();
  }

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';

      if (!historyPushed.current) {
        window.history.pushState({ dialogOpen: true, dialogId: dialogId.current }, '');
        historyPushed.current = true;
      }

      const handlePopState = (e: PopStateEvent) => {
        if (!e.state || e.state.dialogId !== dialogId.current) {
          handleClose();
        }
      };

      window.addEventListener('popstate', handlePopState);
      return () => {
        document.body.style.overflow = 'unset';
        window.removeEventListener('popstate', handlePopState);
      };
    }
  }, [isOpen, handleClose]);

  // Handle history back when manually closed
  useEffect(() => {
    if (isClosing && historyPushed.current) {
      if (window.history.state?.dialogOpen && window.history.state?.dialogId === dialogId.current) {
        window.history.back();
      }
      historyPushed.current = false;
    }
  }, [isClosing]);


  if (!isOpen) return null;

  const handleSubmit = async (e: React.BaseSyntheticEvent) => {
    e.preventDefault();
    setError(null);
    if (mode === 'view') {
      handleClose();
      return;
    }

    if (!selectedDate || !selectedTime || !selectedPatient || !selectedDoctor) {
      setError(isAr ? "يرجى ملء جميع الحقول المطلوبة" : "Please fill all required fields");
      return;
    }

    const isEdit = mode === 'edit';
    const appointmentUuid = initialData?.uuid || initialData?.id;
    const url = isEdit ? `/api/appointment/${appointmentUuid}` : '/api/appointment';
    const method = isEdit ? 'PUT' : 'POST';

    const formatTime = (time: string | undefined | null) => {
      if (!time) return undefined;
      return time.length === 5 ? `${time}:00` : time;
    };

    const payload: any = {
      appointmentDate: selectedDate,
      appointmentStartTime: formatTime(selectedTime),
      patientNote: patientNotes || "",
      doctorNote: doctorNotes || ""
    };

    if (!isEdit) {
      payload.patientUuid = selectedPatient;
      payload.doctorUuid = selectedDoctor;
    }

    if (selectedAppointmentType) {
      payload.appointmentTypeUuid = selectedAppointmentType;
      // When appointment type is sent, explicitly nullify end time to avoid ambiguity
      if (isEdit) payload.appointmentEndTime = null;
    } else {
      // Explicitly nullify appointment type if not selected
      if (isEdit) payload.appointmentTypeUuid = null;
      if (selectedEndTime) {
        payload.appointmentEndTime = formatTime(selectedEndTime);
      } else if (isEdit) {
        payload.appointmentEndTime = null;
      }
    }

    try {
      const token = getCookie('token');
      const response = await apiFetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        const responseData = await response.json();
        onConfirm(responseData);
        window.showToast?.(mode === 'add' ? t('toast_save_success', T) : t('toast_update_success', T));
        handleClose();
      } else {
        let errMsg = 'Failed to save appointment';
        try {
          const errData = await response.json();
          errMsg = getErrorMessage(errData, errMsg);
        } catch (e) { }
        setError(errMsg);
        window.showToast?.(errMsg, 'error');
      }
    } catch (error: any) {
      console.error('Error adding/updating appointment:', error);
      const msg = error.message || 'Error communicating with server';
      setError(msg);
      window.showToast?.(msg, 'error');
    }
  };

  const titles = { add: t('dialog.title_add', T), edit: t('dialog.title_edit', T), view: t('dialog.title_view', T) };
  const descriptions = {
    add: t('dialog.desc_add', T),
    edit: t('dialog.desc_edit', T),
    view: t('dialog.desc_view', T)
  };

  return (
    <Portal>
      <div
        ref={overlayRef}
        className={cn(
          "fixed inset-0 z-500 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4",
          isClosing ? "animate-fadeOut" : "animate-fade"
        )}
        dir={dir}
        onClick={(e) => e.target === overlayRef.current && handleClose()}
      >
          <div
            role="dialog"
            className={cn(
              "bg-background relative w-full rounded-2xl border p-8 shadow-2xl max-w-2xl max-h-[90vh] flex flex-col overflow-hidden",
              isClosing ? "animate-scaleDownOut" : "animate-scaleUp"
            )}
          >
          <button
            onClick={handleClose}
            type="button"
            className={cn(
              "absolute top-6 p-2 rounded-full hover:bg-muted transition-colors opacity-70 hover:opacity-100 outline-none z-20",
              !isAr ? "right-6" : "left-6"
            )}
          >
            <X className="size-5" />
            <span className="sr-only">Close</span>
          </button>

          <div data-slot="dialog-header" className={cn("flex flex-col gap-2  mb-6", isAr ? "items-start" : "items-end")}>
            <h2 data-slot="dialog-title" className="text-2xl font-bold text-foreground">
              {titles[mode]}
            </h2>
            <p className="text-muted-foreground text-sm">{descriptions[mode]}</p>
          </div>

          <ScrollLockWrapper className="flex-1 overflow-y-auto pr-1 no-scrollbar">
            {error && (
              <div className="mb-6 p-4 bg-destructive/10 border border-destructive/20 rounded-xl flex items-center gap-3 text-destructive animate-in fade-in slide-in-from-top-2">
                <AlertCircle className="size-5 shrink-0" />
                <p className="text-sm font-bold">{error}</p>
              </div>
            )}
            
            {mode === 'view' ? (
              <div className="space-y-4 py-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 font-medium text-muted-foreground text-xs">{t('dialog.patient', T)}</label>
                    <div className="flex items-center gap-2">
                      <User className="size-4 text-primary" />
                      <span className="font-medium">
                        {fetchedDetails?.patient?.name || (() => {
                          const patient = initialData?.patientName || 'ahmed';
                          const key = `dialog.patients.${patient}`;
                          const translated = t(key, T);
                          return translated === key ? patient : translated;
                        })()}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="flex items-center gap-2 font-medium text-muted-foreground text-xs">
                      {t('dialog.phone', T)}
                    </label>
                    <div className="flex items-center">
                      <div className="flex items-center gap-2" dir="ltr">
                        <Phone className="size-4 text-primary" />
                        <span className="font-medium">{fetchedDetails?.patient?.phoneNumber || "+962 79 123 4567"}</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="flex items-center gap-2 font-medium text-muted-foreground text-xs">{t('dialog.doctor', T)}</label>
                    <div className="flex items-center gap-2">
                      <Stethoscope className="size-4 text-primary" />
                      <span className="font-medium">
                        {fetchedDetails?.doctor?.name || (() => {
                          const doctor = initialData?.doctorName || 'ahmed';
                          const key = `dialog.doctors.${doctor}`;
                          const translated = t(key, T);
                          return translated === key ? doctor : translated;
                        })()}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="flex items-center gap-2 font-medium text-muted-foreground text-xs">{t('dialog.time', T)}</label>
                    <div className="flex items-center gap-2">
                      <Clock className="size-4 text-primary" />
                      <span className="font-medium">{fetchedDetails?.appointmentStartTime || initialData?.time || "10:00"}</span>
                    </div>
                  </div>

                  {(fetchedDetails?.appointmentEndTime || initialData?.endTime) && (
                    <div className="space-y-2">
                      <label className="flex items-center gap-2 font-medium text-muted-foreground text-xs">{t('dialog.end_time', T)}</label>
                      <div className="flex items-center gap-2">
                        <Clock className="size-4 text-primary" />
                        <span className="font-medium">{fetchedDetails?.appointmentEndTime || initialData?.endTime}</span>
                      </div>
                    </div>
                  )}

                  {(fetchedDetails?.appointmentType?.name || fetchedDetails?.appointmentType || initialData?.appointmentType) && (
                    <div className="space-y-2">
                      <label className="flex items-center gap-2 font-medium text-muted-foreground text-xs">{t('dialog.appointment_type', T)}</label>
                      <div className="flex items-center gap-2">
                        <Stethoscope className="size-4 text-primary" />
                        <span className="font-medium">
                          {fetchedDetails?.appointmentType?.name || 
                           t(`dialog.types.${fetchedDetails?.appointmentType || initialData?.appointmentType}`, T) || 
                           fetchedDetails?.appointmentType || 
                           initialData?.appointmentType}
                        </span>
                      </div>
                    </div>
                  )}

                  <div className="space-y-2">
                    <label className="flex items-center gap-2 font-medium text-muted-foreground text-xs">{t('dialog.status', T)}</label>
                    {(() => {
                      const status = (fetchedDetails?.status || initialData?.status || 'pending').toLowerCase();
                      const config = statusConfig[status?.toLowerCase()] || statusConfig['pending'];
                      return (
                        <span className={cn(
                           "inline-flex items-center justify-center rounded-lg px-3 py-1 text-xs font-bold w-fit border-2 shadow-sm transition-all animate-in fade-in zoom-in duration-300",
                          config.bg,
                          config.text,
                          config.border
                        )}>
                           <div className={cn("size-1.5 rounded-full", isAr ? "ml-1.5" : "mr-1.5", config.dotColor)} />
                          {status === 'pending' ? t('dialog.status_pending', T) :
                           status === 'completed' ? t('dialog.status_completed', T) :
                           status === 'canceled' ? t('dialog.status_canceled', T) :
                           status}
                        </span>
                      );
                    })()}
                  </div>

                  <div className="space-y-2">
                    <label className="flex items-center gap-2 font-medium text-muted-foreground text-xs">{t('dialog.fee', T)}</label>
                    <div className="flex items-center gap-2">
                      <DollarSign className="size-4 text-primary" />
                      <span className="font-medium">{fetchedDetails?.examinationFee !== undefined ? fetchedDetails.examinationFee : 25} {t('dialog.currency', T)}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="flex items-center gap-2 font-medium text-muted-foreground text-xs">{t('dialog.patient_notes', T)}</label>
                  <div className="p-3 bg-muted/30 rounded-lg border border-border min-h-[60px]">
                    <p className="text-sm">{fetchedDetails?.patientNote || initialData?.patientNotes || t('dialog.no_notes', T)}</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="flex items-center gap-2 font-medium text-muted-foreground text-xs">{t('dialog.doctor_notes', T)}</label>
                  <div className="p-3 bg-muted/30 rounded-lg border border-border min-h-[60px]">
                    <p className="text-sm">{fetchedDetails?.doctorNote || initialData?.doctorNotes || t('dialog.no_notes', T)}</p>
                  </div>
                </div>

                {((fetchedDetails?.status || initialData?.status) === 'canceled' || (fetchedDetails?.status || initialData?.status) === 'CANCELED') && (
                  <div className="mt-6 p-4 rounded-xl border-2 border-dashed border-rose-200 bg-rose-50/30 space-y-4 animate-in fade-in slide-in-from-top-4 duration-500 shadow-sm">
                    <div className="flex items-center gap-2 text-rose-600 font-bold text-sm">
                      <X className="size-4" />
                      {t('canceled_by', T)}: {(fetchedDetails?.cancelledBy || fetchedDetails?.canceledBy) === 'DOCTOR' || (fetchedDetails?.cancelledBy || fetchedDetails?.canceledBy) === 'doctor' ? t('cancelers.doctor', T) :
                                               (fetchedDetails?.cancelledBy || fetchedDetails?.canceledBy) === 'PATIENT' || (fetchedDetails?.cancelledBy || fetchedDetails?.canceledBy) === 'patient' ? t('cancelers.patient', T) :
                                               (fetchedDetails?.cancelledBy || fetchedDetails?.canceledBy) === 'SECRETARY' || (fetchedDetails?.cancelledBy || fetchedDetails?.canceledBy) === 'secretary' ? t('cancelers.secretary', T) :
                                               (fetchedDetails?.cancelledBy || fetchedDetails?.canceledBy || initialData?.canceledBy || (isAr ? "غير محدد" : "Not specified"))}
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-rose-600/70">{t('reason', T)}</label>
                      <p className="text-sm text-rose-700 bg-white/50 p-3 rounded-lg border border-rose-100 italic">
                        {t(`cancel_reasons.${fetchedDetails?.cancellationReason || initialData?.cancellationReason}`, T) || fetchedDetails?.cancellationReason || initialData?.cancellationReason || (isAr ? "لا يوجد سبب محدد" : "No specific reason provided")}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            ) : mode === 'edit' ? (
              <div className="space-y-4 py-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-2">
                    <label className={cn("text-sm font-semibold text-foreground/80", isAr ? "pr-1" : "pl-1")}>{t('dialog.date', T)} <span className="text-destructive">*</span></label>
                    <div className={cn("relative group flex items-center justify-between h-12 bg-input-background border border-border rounded-xl px-4 focus-within:ring-4 focus-within:ring-primary/10 transition-all", isAr ? "flex-row" : "flex-row-reverse")}>
                      <DatePicker name="parseLocalDate" value={parseLocalDate(selectedDate)}
                        useYearSelect={true}
                        onChange={([date]) => setSelectedDate(date ? format(date, 'yyyy-MM-dd') : '')}
                        placeholder={t('dialog.select_date', T)}
                        className={cn("flex-1 bg-transparent border-none outline-none font-bold h-full text-base md:text-sm", isAr ? "text-right" : "text-left")}
                      />
                      <FaCalendarAlt className="text-muted-foreground pointer-events-none group-focus-within:text-primary transition-colors size-[18px]" />
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className={cn("text-sm font-semibold text-foreground/80", isAr ? "pr-1" : "pl-1")}>{t('dialog.time', T)} <span className="text-destructive">*</span></label>
                    <div className="relative group">
                      <TimePicker
                        value={selectedTime}
                        onChange={setSelectedTime}
                        className={cn("w-full h-12 bg-input-background justify-center xs:justify-end border border-border rounded-xl transition-all outline-none focus-within:border-primary focus-within:ring-4 focus-within:ring-primary/10", isAr ? "text-right" : "text-left")}
                      />
                    </div>
                  </div>

                  {!selectedAppointmentType && (
                    <div className="flex flex-col gap-2">
                      <label className={cn("text-sm font-semibold text-foreground/80", isAr ? "pr-1" : "pl-1")}>{t('dialog.end_time', T)} <span className="text-xs font-normal text-muted-foreground mx-1">{isAr ? "(اختياري)" : "(optional)"}</span></label>
                      <div className="relative group">
                        <TimePicker
                          value={selectedEndTime}
                          onChange={setSelectedEndTime}
                          className={cn("w-full h-12 bg-input-background justify-center xs:justify-end border border-border rounded-xl transition-all outline-none focus-within:border-primary focus-within:ring-4 focus-within:ring-primary/10", isAr ? "text-right" : "text-left")}
                        />
                      </div>
                    </div>
                  )}

                  <div className="flex flex-col gap-2 col-span-1 md:col-span-2">
                    <label className={cn("text-sm font-semibold text-foreground/80", isAr ? "pr-1" : "pl-1")}>{t('dialog.appointment_type', T)} <span className="text-xs font-normal text-muted-foreground mx-1">{isAr ? "(اختياري)" : "(optional)"}</span></label>
                    <div className="flex items-center gap-2">
                      <div className="flex-1">
                        <Select name="selectedAppointmentType" value={selectedAppointmentType} onValueChange={setSelectedAppointmentType}>
                          <SelectTrigger className={cn("rounded-xl h-12 bg-input-background transition-all focus:ring-4 focus:ring-primary/10 w-full", (selectedAppointmentType) && "text-foreground font-bold")}>
                            <SelectValue placeholder={t('dialog.select_type', T)} />
                          </SelectTrigger>
                          <SelectContent className={cn("rounded-xl z-600", isAr ? "text-right" : "text-left")} >
                            {appointmentTypesList.map((type) => (
                              <SelectItem key={type.uuid} value={type.uuid}>
                                {type.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      {selectedAppointmentType && (
                        <button 
                          type="button" 
                          onClick={() => setSelectedAppointmentType("")}
                          className="shrink-0 h-12 px-3 rounded-xl border border-destructive/20 text-destructive hover:bg-destructive/10 transition-colors flex items-center justify-center bg-input-background"
                          title={isAr ? "إزالة نوع الموعد" : "Remove Appointment Type"}
                        >
                          <TbCancel className="size-5" />
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="mt-2 p-3 bg-blue-50/50 border border-blue-100 rounded-lg text-xs text-blue-800 space-y-1 col-span-1 md:col-span-2">
                    <p className="font-semibold flex items-center gap-1"><AlertCircle className="size-3"/> {isAr ? 'كيفية حساب مدة الموعد:' : 'How appointment duration is calculated:'}</p>
                    <ul className={cn("list-disc space-y-1 text-blue-700/80", isAr ? "pr-4" : "pl-4")}>
                      <li>{isAr ? 'إذا تم اختيار نوع الموعد، يتم استخدام مدته (ويتم إخفاء وتجاهل وقت الانتهاء).' : 'If Appointment Type is selected, its duration is used (end time is ignored and hidden).'}</li>
                      <li>{isAr ? 'إذا لم يتم اختيار نوع الموعد، يتم استخدام وقت الانتهاء.' : 'If no Appointment Type, End Time is used.'}</li>
                      <li>{isAr ? 'إذا لم يتم تحديد وقت الانتهاء، يتم استخدام مدة كشفية الطبيب الافتراضية.' : 'If End Time is not set, Doctor Default Clinic Period is used.'}</li>
                      <li>{isAr ? 'إذا لم يكن للطبيب مدة افتراضية، يتم استخدام المدة الافتراضية للعيادة.' : 'If no Doctor Default Period, Clinic Default Period is used.'}</li>
                    </ul>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">{t('dialog.doctor_notes', T)} <span className="text-xs font-normal text-muted-foreground mx-1">{isAr ? "(اختياري)" : "(optional)"}</span></label>
                  <textarea
                    value={doctorNotes}
                    onChange={(e) => setDoctorNotes(e.target.value)}
                    placeholder={t('dialog.doctor_notes', T)}
                    className={cn(
                      "w-full min-h-[100px] p-4 rounded-xl border border-border bg-input-background focus:ring-4 focus:ring-primary/10 transition-all outline-none font-medium text-sm resize-none",
                      isAr ? "text-right" : "text-left"
                    )}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">{t('dialog.patient_notes', T)} <span className="text-xs font-normal text-muted-foreground mx-1">{isAr ? "(اختياري)" : "(optional)"}</span></label>
                  <textarea
                    value={patientNotes}
                    onChange={(e) => setPatientNotes(e.target.value)}
                    placeholder={t('dialog.patient_notes', T)}
                    className={cn(
                      "w-full min-h-[100px] p-4 rounded-xl border border-border bg-input-background focus:ring-4 focus:ring-primary/10 transition-all outline-none font-medium text-sm resize-none",
                      isAr ? "text-right" : "text-left"
                    )}
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-6 py-2">
                <div className="md:grid flex flex-col md:grid-cols-2 gap-6">
                  <div className="flex flex-col gap-2">
                    <label className={cn("text-sm font-semibold text-foreground/80", isAr ? "pr-1" : "pl-1")}>{t('dialog.patient', T)}</label>
                    <Select name="selectedPatient" value={selectedPatient} onValueChange={setSelectedPatient}>
                      <SelectTrigger className={cn("rounded-xl h-12 bg-input-background transition-all focus:ring-4 focus:ring-primary/10", (selectedPatient) && "text-foreground font-bold")}>
                        <SelectValue placeholder={t('dialog.select_patient', T)} />
                      </SelectTrigger>
                      <SelectContent className={cn("rounded-xl z-600", isAr ? "text-right" : "text-left")} >
                        {patientsList.map((pat) => (
                          <SelectItem key={pat.uuid} value={pat.uuid}>
                            {`${pat.firstName} ${pat.lastName}`}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className={cn("text-sm font-semibold text-foreground/80", isAr ? "pr-1" : "pl-1")}>{t('dialog.doctor', T)}</label>
                    <Select name="selectedDoctor" value={selectedDoctor} onValueChange={setSelectedDoctor}>
                      <SelectTrigger className={cn("rounded-xl h-12 bg-input-background transition-all focus:ring-4 focus:ring-primary/10", (selectedDoctor) && "text-foreground font-bold")}>
                        <SelectValue placeholder={t('dialog.select_doctor', T)} />
                      </SelectTrigger>
                      <SelectContent className={cn("rounded-xl z-600", isAr ? "text-right" : "text-left")} >
                        {doctorsList.map((doc) => (
                          <SelectItem key={doc.uuid} value={doc.uuid}>
                            {doc.user ? `${doc.user.firstName} ${doc.user.lastName}` : doc.uuid}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className={cn("text-sm font-semibold text-foreground/80", isAr ? "pr-1" : "pl-1")}>{t('dialog.date', T)}</label>
                    <div className={cn("relative group flex items-center justify-between h-12 bg-input-background border border-border rounded-xl px-4 focus-within:ring-4 focus-within:ring-primary/10 transition-all", isAr ? "flex-row" : "flex-row-reverse")}>
                      <DatePicker name="parseLocalDate" value={parseLocalDate(selectedDate)}
                        onChange={([date]) => setSelectedDate(date ? format(date, 'yyyy-MM-dd') : '')}
                        placeholder={t('dialog.select_date', T)}
                        className={cn("flex-1 bg-transparent border-none outline-none font-bold h-full text-base md:text-sm", isAr ? "text-right" : "text-left")}
                      />
                      <FaCalendarAlt className="text-muted-foreground pointer-events-none group-focus-within:text-primary transition-colors size-[18px]" />
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className={cn("text-sm font-semibold text-foreground/80", isAr ? "pr-1" : "pl-1")}>{t('dialog.time', T)} <span className="text-destructive">*</span></label>
                    <div className="relative group">
                      <TimePicker
                        value={selectedTime}
                        onChange={setSelectedTime}
                        className={cn("w-full h-12 bg-input-background justify-center xs:justify-end border border-border rounded-xl transition-all outline-none focus-within:border-primary focus-within:ring-4 focus-within:ring-primary/10", isAr ? "text-right" : "text-left")}
                      />
                    </div>
                  </div>

                  {!selectedAppointmentType && (
                    <div className="flex flex-col gap-2">
                      <label className={cn("text-sm font-semibold text-foreground/80", isAr ? "pr-1" : "pl-1")}>{t('dialog.end_time', T)} <span className="text-xs font-normal text-muted-foreground mx-1">{isAr ? "(اختياري)" : "(optional)"}</span></label>
                      <div className="relative group">
                        <TimePicker
                          value={selectedEndTime}
                          onChange={setSelectedEndTime}
                          className={cn("w-full h-12 bg-input-background justify-center xs:justify-end border border-border rounded-xl transition-all outline-none focus-within:border-primary focus-within:ring-4 focus-within:ring-primary/10", isAr ? "text-right" : "text-left")}
                        />
                      </div>
                    </div>
                  )}

                  <div className="flex flex-col gap-2 col-span-1 md:col-span-2">
                    <label className={cn("text-sm font-semibold text-foreground/80", isAr ? "pr-1" : "pl-1")}>{t('dialog.appointment_type', T)} <span className="text-xs font-normal text-muted-foreground mx-1">{isAr ? "(اختياري)" : "(optional)"}</span></label>
                    <div className="flex items-center gap-2">
                      <div className="flex-1">
                        <Select name="selectedAppointmentType" value={selectedAppointmentType} onValueChange={setSelectedAppointmentType}>
                          <SelectTrigger className={cn("rounded-xl h-12 bg-input-background transition-all focus:ring-4 focus:ring-primary/10 w-full", (selectedAppointmentType) && "text-foreground font-bold")}>
                            <SelectValue placeholder={t('dialog.select_type', T)} />
                          </SelectTrigger>
                          <SelectContent className={cn("rounded-xl z-600", isAr ? "text-right" : "text-left")} >
                            {appointmentTypesList.map((type) => (
                              <SelectItem key={type.uuid} value={type.uuid}>
                                {type.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      {selectedAppointmentType && (
                        <button 
                          type="button" 
                          onClick={() => setSelectedAppointmentType("")}
                          className="shrink-0 h-12 px-3 rounded-xl border border-destructive/20 text-destructive hover:bg-destructive/10 transition-colors flex items-center justify-center bg-input-background"
                          title={isAr ? "إزالة نوع الموعد" : "Remove Appointment Type"}
                        >
                          <TbCancel className="size-5" />
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="mt-2 p-3 bg-blue-50/50 border border-blue-100 rounded-lg text-xs text-blue-800 space-y-1 col-span-1 md:col-span-2">
                    <p className="font-semibold flex items-center gap-1"><AlertCircle className="size-3"/> {isAr ? 'كيفية حساب مدة الموعد:' : 'How appointment duration is calculated:'}</p>
                    <ul className={cn("list-disc space-y-1 text-blue-700/80", isAr ? "pr-4" : "pl-4")}>
                      <li>{isAr ? 'إذا تم اختيار نوع الموعد، يتم استخدام مدته (ويتم إخفاء وتجاهل وقت الانتهاء).' : 'If Appointment Type is selected, its duration is used (end time is ignored and hidden).'}</li>
                      <li>{isAr ? 'إذا لم يتم اختيار نوع الموعد، يتم استخدام وقت الانتهاء.' : 'If no Appointment Type, End Time is used.'}</li>
                      <li>{isAr ? 'إذا لم يتم تحديد وقت الانتهاء، يتم استخدام مدة كشفية الطبيب الافتراضية.' : 'If End Time is not set, Doctor Default Clinic Period is used.'}</li>
                      <li>{isAr ? 'إذا لم يكن للطبيب مدة افتراضية، يتم استخدام المدة الافتراضية للعيادة.' : 'If no Doctor Default Period, Clinic Default Period is used.'}</li>
                    </ul>
                  </div>

                  {mode !== 'add' && (
                    <div className="flex flex-col gap-2 col-span-1 md:col-span-2">
                      <label className={cn("text-sm font-semibold text-foreground/80", isAr ? "pr-1" : "pl-1")}>{t('dialog.status', T)}</label>
                      <Select name="selectedStatus" value={selectedStatus} onValueChange={setSelectedStatus}>
                        <SelectTrigger className={cn("rounded-xl h-12 bg-input-background transition-all focus:ring-4 focus:ring-primary/10", (selectedStatus) && "text-foreground font-bold")}>
                          <SelectValue placeholder={t('dialog.status', T)} />
                        </SelectTrigger>
                        <SelectContent className={cn("rounded-xl z-600", isAr ? "text-right" : "text-left")}>
                          <SelectItem value="pending">
                            <div className="flex items-center gap-2">
                              <div className="size-2 rounded-full bg-amber-500" />
                              <span>{t('dialog.status_pending', T)}</span>
                            </div>
                          </SelectItem>
                          <SelectItem value="completed">
                            <div className="flex items-center gap-2">
                              <div className="size-2 rounded-full bg-emerald-500" />
                              <span>{t('dialog.status_completed', T)}</span>
                            </div>
                          </SelectItem>
                          <SelectItem value="canceled">
                            <div className="flex items-center gap-2">
                              <div className="size-2 rounded-full bg-rose-500" />
                              <span>{t('dialog.status_canceled', T)}</span>
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  <div className="flex flex-col gap-2 col-span-1 md:col-span-2">
                    <label className={cn("text-sm font-semibold text-foreground/80", isAr ? "pr-1" : "pl-1")}>{t('dialog.doctor_notes', T)} <span className="text-xs font-normal text-muted-foreground mx-1">{isAr ? "(اختياري)" : "(optional)"}</span></label>
                    <textarea
                      value={doctorNotes}
                      onChange={(e) => setDoctorNotes(e.target.value)}
                      placeholder={t('dialog.doctor_notes', T)}
                      className={cn(
                        "w-full min-h-[100px] p-4 rounded-xl border border-border bg-input-background focus:ring-4 focus:ring-primary/10 transition-all outline-none font-medium text-sm resize-none",
                        isAr ? "text-right" : "text-left"
                      )}
                    />
                  </div>

                  <div className="flex flex-col gap-2 col-span-1 md:col-span-2">
                    <label className={cn("text-sm font-semibold text-foreground/80", isAr ? "pr-1" : "pl-1")}>{t('dialog.patient_notes', T)} <span className="text-xs font-normal text-muted-foreground mx-1">{isAr ? "(اختياري)" : "(optional)"}</span></label>
                    <textarea
                      value={patientNotes}
                      onChange={(e) => setPatientNotes(e.target.value)}
                      placeholder={t('dialog.patient_notes', T)}
                      className={cn(
                        "w-full min-h-[100px] p-4 rounded-xl border border-border bg-input-background focus:ring-4 focus:ring-primary/10 transition-all outline-none font-medium text-sm resize-none",
                        isAr ? "text-right" : "text-left"
                      )}
                    />
                  </div>
                </div>
              </div>
            )}
          </ScrollLockWrapper>

          <div className="flex gap-4 pt-6 border-t border-border mt-6">
            {mode === 'add' && (
              <>
                <Button onClick={handleSubmit} className="flex-1 h-12 rounded-xl text-base shadow-lg shadow-primary/20">
                  <Plus size={20} className={isAr ? "ml-2" : "mr-2"} /> {t('dialog.save', T)}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleClose}
                  className="flex-1 h-12 rounded-xl text-base"
                >
                  {t('dialog.cancel', T)}
                </Button>
              </>
            )}
            {mode === 'view' && (
              <div className="flex gap-3 w-full">
                {hasManageMedicalRecords && initialData?.status === 'pending' && onComplete && (
                  <Button
                    type="button"
                    onClick={() => {
                      if (initialData) onComplete(initialData);
                    }}
                    className="flex-1 h-10 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-200/50"
                  >
                    <Check className={cn("size-4", isAr ? "ml-2" : "mr-2")} />
                    {isAr ? "إكمال الموعد" : "Complete Appointment"}
                  </Button>
                )}
                {initialData?.status === 'pending' && onCancel && (
                  <Button
                    type="button"
                    onClick={() => {
                      if (initialData) onCancel(initialData);
                    }}
                    className="flex-1 h-10 rounded-lg bg-rose-600 hover:bg-rose-700 text-white shadow-lg shadow-rose-200/50"
                  >
                    <TbCancel className={cn("size-4.5", isAr ? "ml-2" : "mr-2")} />
                    {t('actions.delete', T)}
                  </Button>
                )}
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleClose}
                  className="flex-1 h-10 rounded-lg hover:border-primary/30"
                >
                  {t('dialog.close', T)}
                </Button>
              </div>
            )}
            {mode === 'edit' && (
              <div className="flex gap-3 w-full">
                <Button onClick={handleSubmit} className="flex-2 shadow-lg shadow-primary/20 bg-primary hover:bg-primary/90 h-10 rounded-lg">
                  {t('dialog.save_changes', T)}
                </Button>
                {hasManageMedicalRecords && initialData?.status === 'pending' && onComplete && (
                  <Button
                    type="button"
                    onClick={() => {
                      if (initialData) onComplete(initialData);
                    }}
                    className="flex-1 h-10 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-200/50"
                  >
                    <Check className={cn("size-4", isAr ? "ml-2" : "mr-2")} />
                    {isAr ? "إكمال الموعد" : "Complete"}
                  </Button>
                )}
                {initialData?.status === 'pending' && onCancel && (
                  <Button
                    type="button"
                    onClick={() => {
                      if (initialData) onCancel(initialData);
                    }}
                    className="flex-1 h-10 rounded-lg bg-rose-600 hover:bg-rose-700 text-white shadow-lg shadow-rose-200/50"
                  >
                    <TbCancel className={cn("size-4.5", isAr ? "ml-2" : "mr-2")} />
                    {t('actions.delete', T)}
                  </Button>
                )}
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleClose}
                  className="flex-1 h-10 rounded-lg"
                >
                  {t('dialog.cancel', T)}
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </Portal>
  );
};

export default AppointmentsDialog;
