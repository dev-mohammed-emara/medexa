import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import "flatpickr/dist/flatpickr.css";
import { Arabic } from "flatpickr/dist/l10n/ar.js";
import { FileText, MapPin, Phone, Plus, Printer, Save, User, X } from 'lucide-react';
import { FaCalendarAlt } from 'react-icons/fa';
import { useCallback, useEffect, useRef, useState } from 'react';
import Flatpickr from "react-flatpickr";
import { Button } from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import ScrollLockWrapper from '../../components/ui/ScrollLockWrapper';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import { useBroadcast } from '../../hooks/useBroadcast';
import { cn } from '../../utils/cn';
import Portal from '../../components/ui/Portal';
import { useLanguage } from '../../contexts/LanguageContext';
import { patientsTranslations } from '../../constants/translations/patients';
import { enUS } from 'date-fns/locale';
import { createPatient, updatePatient } from '../../api/patientApi';
import type { ApiPatient } from '../../api/patientApi';

interface PatientsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (data: ApiPatient) => void;
  mode: 'add' | 'edit' | 'view';
  initialData?: ApiPatient | null;
}

const PatientsDialog = ({ isOpen, onClose, onConfirm, mode, initialData }: PatientsDialogProps) => {
  const { t, isAr } = useLanguage();
  const { broadcast } = useBroadcast();
  const T = patientsTranslations;
  const currentLocale = isAr ? ar : enUS;
  const overlayRef = useRef<HTMLDivElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  const [selectedGender, setSelectedGender] = useState(initialData?.gender || "");
  const [selectedDob, setSelectedDob] = useState<string>(initialData?.dateOfBirth || "");
  const [isClosing, setIsClosing] = useState(false);
  const [loading, setLoading] = useState(false);

  // Sync initialData values when dialog opens or changes
  useEffect(() => {
    if (initialData) {
      setSelectedGender(initialData.gender || "");
      setSelectedDob(initialData.dateOfBirth || "");
    } else {
      setSelectedGender("");
      setSelectedDob("");
    }
  }, [initialData, isOpen]);

  const handleClose = useCallback(() => {
    setIsClosing(true);
    setTimeout(() => {
      setIsClosing(false);
      onClose();
    }, 400);
  }, [onClose]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      const handlePopState = () => handleClose();
      window.addEventListener('popstate', handlePopState);
      return () => {
        document.body.style.overflow = 'unset';
        window.removeEventListener('popstate', handlePopState);
      };
    }
  }, [isOpen, handleClose]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === 'view') {
      handleClose();
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData(e.target as HTMLFormElement);
      const formDataObj = Object.fromEntries(formData.entries());

      const formatPhone = (phoneStr: string) => {
        let cleaned = phoneStr.trim().replace(/[\s\-\(\)]/g, '');
        if (cleaned.startsWith('00')) {
          cleaned = '+' + cleaned.substring(2);
        }
        if (!cleaned.startsWith('+')) {
          cleaned = '+' + cleaned;
        }
        return cleaned;
      };

      // Construct API payload
      const bodyPayload = {
        firstName: String(formDataObj.firstName),
        surName: String(formDataObj.surName),
        lastName: String(formDataObj.lastName),
        phoneNumber: formatPhone(String(formDataObj.phoneNumber)),
        gender: selectedGender || 'MALE',
        dateOfBirth: selectedDob || '1990-01-01',
        address: String(formDataObj.address || ''),
        note: String(formDataObj.note || '')
      }

      let responseData: ApiPatient
      if (mode === 'add') {
        responseData = await createPatient(bodyPayload)
        window.showToast?.(t('toast_add_success', T), 'success')
      } else {
        // Edit mode (PUT)
        if (!initialData?.uuid) {
          throw new Error('Missing patient UUID for update')
        }
        responseData = await updatePatient(initialData.uuid, {
          ...bodyPayload,
          uuid: initialData.uuid
        })
        window.showToast?.(t('toast_update_success', T), 'success')
      }

      onConfirm(responseData);
      broadcast({ type: 'DATA_UPDATE', module: 'patients' });
      handleClose();
    } catch (error: any) {
      console.error(error)
      window.showToast?.(error.message || t('error_save', T), 'error')
    } finally {
      setLoading(false);
    }
  };

  const titles = {
    add: t('dialog.title_add', T),
    edit: t('dialog.title_edit', T),
    view: t('dialog.title_view', T)
  };
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
        dir={isAr ? "rtl" : "ltr"}
        onClick={(e) => e.target === overlayRef.current && !loading && handleClose()}
      >
        <div
          ref={modalRef}
          role="dialog"
          className={cn(
            "bg-background relative w-full rounded-2xl border p-8 shadow-2xl max-w-2xl max-h-[90vh] flex flex-col",
            isClosing ? "animate-scaleDownOut" : "animate-scaleUp"
          )}
        >
          <button
            onClick={handleClose}
            disabled={loading}
            type="button"
            className={cn("absolute top-6 p-2 rounded-full hover:bg-muted transition-colors opacity-70 hover:opacity-100 outline-none z-20", isAr ? "right-6" : "left-6")}
          >
            <X className="size-5" />
            <span className="sr-only">{t('dialog.close', T)}</span>
          </button>

          <header data-slot="dialog-header" className="flex flex-col gap-2 text-center mb-6">
            <h2 data-slot="dialog-title" className="text-2xl font-bold text-foreground">
              {titles[mode]}
            </h2>
            <p className="text-muted-foreground text-sm">{descriptions[mode]}</p>
          </header>

          <ScrollLockWrapper className="z-500 overflow-visible overflow-y-auto pr-1 no-scrollbar">
            <form id="patientForm" onSubmit={handleSubmit} className="py-2" autoComplete="off">
              <article className="space-y-6">
                {/* Name Fields - Three Columns */}
                <div className="grid grid-cols-1 md:grid-cols-2  lg:grid-cols-3 gap-4">
                  <div className="flex flex-col gap-2">
                    <label className={cn("text-sm font-semibold text-foreground/80", isAr ? "pr-1" : "pl-1")}>{t('dialog.first_name', T)}</label>
                    <Input
                      name="firstName"
                      defaultValue={initialData?.firstName}
                      required
                      disabled={mode === 'view'}
                      placeholder={t('dialog.first_name_placeholder', T)}
                      icon={<User size={18} />}
                      className="font-bold rounded-xl h-12"
                      dir={isAr ? "rtl" : "ltr"}
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className={cn("text-sm font-semibold text-foreground/80", isAr ? "pr-1" : "pl-1")}>{t('dialog.surname', T)}</label>
                    <Input
                      name="surName"
                      defaultValue={initialData?.surName}
                      required
                      disabled={mode === 'view'}
                      placeholder={t('dialog.surname_placeholder', T)}
                      icon={<User size={18} />}
                      className="font-bold rounded-xl h-12"
                      dir={isAr ? "rtl" : "ltr"}
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className={cn("text-sm font-semibold text-foreground/80", isAr ? "pr-1" : "pl-1")}>{t('dialog.last_name', T)}</label>
                    <Input
                      name="lastName"
                      defaultValue={initialData?.lastName}
                      required
                      disabled={mode === 'view'}
                      placeholder={t('dialog.last_name_placeholder', T)}
                      icon={<User size={18} />}
                      className="font-bold rounded-xl h-12"
                      dir={isAr ? "rtl" : "ltr"}
                    />
                  </div>
                </div>

                <div className="flex flex-col xs:grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Phone */}
                  <div className="flex flex-col gap-2">
                    <label className={cn("text-sm font-semibold text-foreground/80", isAr ? "pr-1" : "pl-1")}>{t('dialog.phone', T)}</label>
                    <Input
                      name="phoneNumber"
                      defaultValue={initialData?.phoneNumber || ""}
                      required
                      disabled={mode === 'view'}
                      placeholder="9627XXXXXXXX"
                      dir="ltr"
                      icon={<Phone size={18} />}
                      className="font-bold rounded-xl h-12"
                    />
                    {mode !== 'view' && (
                      <p className="text-[11px] text-[#0B5A8E] mt-0.5 leading-relaxed font-semibold">
                        {isAr
                          ? "* يرجى إدخال رقم هاتف أردني صحيح (مثال: 962791234567)"
                          : "* Please enter a valid Jordanian phone number (e.g. 962791234567)"
                        }
                      </p>
                    )}
                  </div>

                  {/* Gender */}
                  <div className="flex flex-col gap-2">
                    <label className={cn("text-sm font-semibold text-foreground/80", isAr ? "pr-1" : "pl-1")}>{t('dialog.gender', T)}</label>
                    <Select value={selectedGender} onValueChange={setSelectedGender} disabled={mode === 'view'}>
                      <SelectTrigger className={cn("rounded-xl h-12 bg-input-background transition-all focus:ring-4 focus:ring-primary/10", (selectedGender) && "text-foreground font-bold")}>
                        <SelectValue placeholder={t('dialog.gender', T)} />
                      </SelectTrigger>
                      <SelectContent className={cn("rounded-xl z-600", isAr ? "text-right" : "text-left")}>
                        <SelectItem value="MALE">{t('dialog.male', T)}</SelectItem>
                        <SelectItem value="FEMALE">{t('dialog.female', T)}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* DOB */}
                  <div className="flex flex-col gap-2">
                    <label className={cn("text-sm font-semibold text-foreground/80", isAr ? "pr-1" : "pl-1")}>{t('dialog.dob', T)}</label>
                    <div className={cn("relative group flex items-center justify-between h-12 bg-input-background border border-border rounded-xl px-4 transition-all focus-within:ring-4 focus-within:ring-primary/10", isAr ? "flex-row" : "flex-row-reverse")}>
                      <Flatpickr
                        value={selectedDob}
                        onChange={([date]) => setSelectedDob(date ? date.toISOString().split('T')[0] : '')}
                        disabled={mode === 'view'}
                        options={{
                          locale: isAr ? Arabic : undefined,
                          dateFormat: "d F Y",
                          disableMobile: true,
                          maxDate: "today",
                          formatDate: (date: Date) => format(date, "d MMMM yyyy", { locale: currentLocale })
                        }}
                        placeholder={t('dialog.dob', T)}
                        className={cn(
                          "flex-1 bg-transparent border-none outline-none font-bold h-full text-base md:text-sm",
                          isAr ? "text-right" : "text-left",
                          (mode === 'view' || loading) && "opacity-50 cursor-not-allowed"
                        )}
                      />
                      <FaCalendarAlt className="text-muted-foreground pointer-events-none group-focus-within:text-primary transition-colors size-[18px]" />
                    </div>
                  </div>

                  {/* Address */}
                  <div className="flex flex-col gap-2">
                    <label className={cn("text-sm font-semibold text-foreground/80", isAr ? "pr-1" : "pl-1")}>{t('dialog.address', T)}</label>
                    <Input
                      name="address"
                      defaultValue={initialData?.address}
                      disabled={mode === 'view'}
                      placeholder={t('dialog.address', T)}
                      icon={<MapPin size={18} />}
                      className="font-bold rounded-xl h-12"
                      dir={isAr ? "rtl" : "ltr"}
                    />
                  </div>

                  {/* Notes */}
                  <div className="flex flex-col gap-2 col-span-2">
                    <label className={cn("text-sm font-semibold text-foreground/80", isAr ? "pr-1" : "pl-1")}>{t('dialog.notes', T)}</label>
                    <div className="relative group">
                      <textarea
                        name="note"
                        defaultValue={initialData?.note}
                        disabled={mode === 'view'}
                        className={cn(
                          "w-full min-h-24 p-4 rounded-xl border border-border bg-input-background text-sm outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all resize-none disabled:opacity-50 placeholder:text-muted-foreground font-bold",
                          isAr ? "pr-12" : "pl-12"
                        )}
                        placeholder={t('dialog.notes', T)}
                        rows={3}
                        dir={isAr ? "rtl" : "ltr"}
                      />
                      <FileText className={cn("absolute top-4 text-muted-foreground pointer-events-none group-focus-within:text-primary transition-colors size-[18px]", isAr ? "right-4" : "left-4")} />
                    </div>
                  </div>
                </div>
              </article>
            </form>
          </ScrollLockWrapper>

          <footer className="flex gap-4 pt-6 border-t border-border mt-6">
            {mode === 'add' && (
              <>
                <Button type="submit" form="patientForm" disabled={loading} className="flex-1 h-12 rounded-xl text-base shadow-lg shadow-primary/20">
                  <Plus size={20} className={isAr ? "ml-2" : "mr-2"} /> {loading ? t('loading', T) : t('dialog.add', T)}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  disabled={loading}
                  onClick={handleClose}
                  className="flex-1 h-12 rounded-xl text-base"
                >
                  {t('cancel', T)}
                </Button>
              </>
            )}
            {mode === 'edit' && (
              <>
                <Button type="submit" form="patientForm" disabled={loading} className="flex-1 h-12 rounded-xl text-base shadow-lg shadow-primary/20">
                  <Save size={20} className={isAr ? "ml-2" : "mr-2"} /> {loading ? t('loading', T) : t('dialog.save', T)}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  disabled={loading}
                  onClick={handleClose}
                  className="flex-1 h-12 rounded-xl text-base"
                >
                  {t('cancel', T)}
                </Button>
              </>
            )}
            {mode === 'view' && (
              <>
                <Button type="button" onClick={() => window.print()} className="flex-1 h-12 rounded-xl text-base shadow-lg shadow-primary/20">
                  <Printer size={20} className={isAr ? "ml-2" : "mr-2"} /> {t('dialog.print', T) || 'طباعة'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleClose}
                  className="flex-1 h-12 rounded-xl text-base"
                >
                  {t('dialog.close', T)}
                </Button>
              </>
            )}
          </footer>
        </div>
      </div>
    </Portal>
  );
};

export default PatientsDialog;
