


import { FileText, MapPin, Phone, Plus, Save, User, X, AlertCircle } from 'lucide-react';
import { FaCalendarAlt } from 'react-icons/fa';
import { useCallback, useEffect, useRef, useState } from 'react';
import { DatePicker } from '../../components/ui/DatePicker';
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

import { createPatient, updatePatient } from '../../api/patientApi';
import type { ApiPatient } from '../../api/patientApi';

import { formatPhoneForPayload, formatPhoneForDisplay } from '../../utils/phone';

interface PatientsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (data: ApiPatient) => void;
  mode: 'add' | 'edit';
  initialData?: ApiPatient | null;
}

const PatientsDialog = ({ isOpen, onClose, onConfirm, mode, initialData }: PatientsDialogProps) => {
  const { t, isAr } = useLanguage();
  const { broadcast } = useBroadcast();
  const T = patientsTranslations;

  const overlayRef = useRef<HTMLDivElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  const [selectedGender, setSelectedGender] = useState<'MALE' | 'FEMALE' | ''>(initialData?.gender || "");
  const [selectedDob, setSelectedDob] = useState<string>(initialData?.dateOfBirth || "");
  const [isClosing, setIsClosing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Sync initialData values when dialog opens or changes
  useEffect(() => {
    if (initialData) {
      setSelectedGender(initialData.gender || "");
      setSelectedDob(initialData.dateOfBirth || "");
    } else {
      setSelectedGender("");
      setSelectedDob("");
    }
    setError(null);
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
    setError(null);

    setLoading(true);
    try {
      const formData = new FormData(e.target as HTMLFormElement);
      const formDataObj = Object.fromEntries(formData.entries());

      // Construct API payload
      const bodyPayload = {
        firstName: String(formDataObj.firstName),
        surName: String(formDataObj.surName),
        lastName: String(formDataObj.lastName),
        phoneNumber: formatPhoneForPayload(String(formDataObj.phoneNumber)),
        gender: (selectedGender || 'MALE') as 'MALE' | 'FEMALE',
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
        responseData = await updatePatient(initialData.uuid, bodyPayload)
        window.showToast?.(t('toast_update_success', T), 'success')
      }

      onConfirm(responseData);
      broadcast({ type: 'DATA_UPDATE', module: 'patients' });
      handleClose();
    } catch (error: any) {
      const msg = error.message || t('error_save', T);
      setError(msg);
      window.showToast?.(msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  const titles = {
    add: t('dialog.title_add', T),
    edit: t('dialog.title_edit', T)
  };
  const descriptions = {
    add: t('dialog.desc_add', T),
    edit: t('dialog.desc_edit', T)
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
            {error && (
              <div className="mb-6 p-4 bg-destructive/10 border border-destructive/20 rounded-xl flex items-center gap-3 text-destructive animate-in fade-in slide-in-from-top-2">
                <AlertCircle className="size-5 shrink-0" />
                <p className="text-sm font-bold">{error}</p>
              </div>
            )}
            <form id="patientForm" onSubmit={handleSubmit} className="flex flex-col gap-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                  name="firstName"
                  defaultValue={initialData?.firstName}
                  required
                  placeholder={t('dialog.first_name_placeholder', T)}
                  icon={<User size={18} />}
                  className="font-bold rounded-xl h-12"
                  dir={isAr ? "rtl" : "ltr"}
                />
                <Input
                  name="surName"
                  defaultValue={initialData?.surName}
                  required
                  placeholder={t('dialog.surname_placeholder', T)}
                  icon={<User size={18} />}
                  className="font-bold rounded-xl h-12"
                  dir={isAr ? "rtl" : "ltr"}
                />
                <Input
                  name="lastName"
                  defaultValue={initialData?.lastName}
                  required
                  placeholder={t('dialog.last_name_placeholder', T)}
                  icon={<User size={18} />}
                  className="font-bold rounded-xl h-12"
                  dir={isAr ? "rtl" : "ltr"}
                />
                <div className="relative">
                  <Input
                    name="phoneNumber"
                    defaultValue={formatPhoneForDisplay(initialData?.phoneNumber || "")}
                    required
                    placeholder="9627XXXXXXXX"
                    dir="ltr"
                    icon={<Phone size={18} />}
                    className="font-bold rounded-xl h-12"
                  />
                  <p className="text-[11px] text-[#0B5A8E] mt-0.5 leading-relaxed font-semibold">
                    {isAr
                      ? "* يرجى إدخال رقم هاتف أردني صحيح (مثال: 962791234567)"
                      : "* Please enter a valid Jordanian phone number (e.g. 962791234567)"
                    }
                  </p>
                </div>
                <Select value={selectedGender} onValueChange={(val) => setSelectedGender(val as 'MALE' | 'FEMALE' | '')} >
                  <SelectTrigger className={cn("rounded-xl h-12 bg-input-background transition-all focus:ring-4 focus:ring-primary/10", (selectedGender) && "text-foreground font-bold")}>
                    <SelectValue placeholder={t('dialog.gender', T)} />
                  </SelectTrigger>
                  <SelectContent className={cn("rounded-xl z-600", isAr ? "text-right" : "text-left")}>
                    <SelectItem value="MALE">{t('dialog.male', T)}</SelectItem>
                    <SelectItem value="FEMALE">{t('dialog.female', T)}</SelectItem>
                  </SelectContent>
                </Select>
                <DatePicker
                  value={selectedDob}
                  useYearSelect={true}
                  onChange={([date]) => setSelectedDob(date ? date.toISOString().split('T')[0] : '')}
                  maxDate={new Date()}
                  placeholder={t('dialog.dob', T)}
                  icon={<FaCalendarAlt size={18} />}
                  className={cn(
                    "w-full font-bold",
                    isAr ? "text-right" : "text-left",
                    loading && "opacity-50 cursor-not-allowed"
                  )}
                />
                <div className="col-span-1 md:col-span-2">
                  <Input
                    name="address"
                    defaultValue={initialData?.address}
                    placeholder={t('dialog.address', T)}
                    icon={<MapPin size={18} />}
                    className="font-bold rounded-xl h-12"
                    dir={isAr ? "rtl" : "ltr"}
                  />
                </div>
                <div className="col-span-1 md:col-span-2 relative group">
                  <textarea
                    name="note"
                    defaultValue={initialData?.note}
                    className={cn(
                      "w-full min-h-24 p-4 rounded-xl border border-border bg-input-background text-sm outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all resize-none disabled:opacity-50 placeholder:text-muted-foreground font-bold",
                      isAr ? "pr-12" : "pl-12"
                    )}
                    placeholder={`${t('dialog.notes', T)} ${isAr ? '(اختياري)' : '(optional)'}`}
                    rows={3}
                    dir={isAr ? "rtl" : "ltr"}
                  />
                  <FileText className={cn("absolute top-4 text-muted-foreground pointer-events-none group-focus-within:text-primary transition-colors size-[18px]", isAr ? "right-4" : "left-4")} />
                </div>
              </div>
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
          </footer>
        </div>
      </div>
    </Portal>
  );
};

export default PatientsDialog;
