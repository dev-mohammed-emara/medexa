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
import type { Patient } from '../../constants/Patients_dummy';
import { useBroadcast } from '../../hooks/useBroadcast';
import { cn } from '../../utils/cn';
import Portal from '../../components/ui/Portal';
import { useLanguage } from '../../contexts/LanguageContext';
import { patientsTranslations } from '../../constants/translations/patients';
import { enUS } from 'date-fns/locale';

interface PatientsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (data: Partial<Patient>) => void;
  mode: 'add' | 'edit' | 'view';
  initialData?: Patient | null;
}

const PatientsDialog = ({ isOpen, onClose, onConfirm, mode, initialData }: PatientsDialogProps) => {
  const { t, isAr } = useLanguage();
  const { broadcast } = useBroadcast();
  const T = patientsTranslations;
  const currentLocale = isAr ? ar : enUS;
  const overlayRef = useRef<HTMLDivElement>(null);
  const [isClosing, setIsClosing] = useState(false);
  const [selectedGender, setSelectedGender] = useState((isAr ? initialData?.gender_ar : initialData?.gender_en) || "");
  const [selectedDob, setSelectedDob] = useState<string>(initialData?.dob || "");

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === 'view') {
      handleClose();
      return;
    }
    const formData = new FormData(e.target as HTMLFormElement);
    const formDataObj = Object.fromEntries(formData.entries());

    const fName = (formDataObj['first_name_ar'] || formDataObj['first_name_en'] || '') as string;
    const sName = (formDataObj['surname_ar'] || formDataObj['surname_en'] || '') as string;
    const lName = (formDataObj['last_name_ar'] || formDataObj['last_name_en'] || '') as string;

    onConfirm({
      ...initialData,
      first_name_ar: isAr ? formDataObj['first_name_ar'] as string : initialData?.first_name_ar || '',
      surname_ar: isAr ? formDataObj['surname_ar'] as string : initialData?.surname_ar || '',
      last_name_ar: isAr ? formDataObj['last_name_ar'] as string : initialData?.last_name_ar || '',
      first_name_en: !isAr ? formDataObj['first_name_en'] as string : initialData?.first_name_en || '',
      surname_en: !isAr ? formDataObj['surname_en'] as string : initialData?.surname_en || '',
      last_name_en: !isAr ? formDataObj['last_name_en'] as string : initialData?.last_name_en || '',
      name_ar: isAr ? `${fName} ${sName} ${lName}` : initialData?.name_ar || '',
      name_en: !isAr ? `${fName} ${sName} ${lName}` : initialData?.name_en || '',
      phone: formDataObj['phone'] as string,
      gender_ar: isAr ? selectedGender : initialData?.gender_ar || '',
      gender_en: !isAr ? selectedGender : initialData?.gender_en || '',
      dob: selectedDob,
      address_ar: isAr ? formDataObj['address'] as string : initialData?.address_ar || '',
      address_en: !isAr ? formDataObj['address'] as string : initialData?.address_en || '',
      notes_ar: isAr ? formDataObj['notes'] as string : initialData?.notes_ar || '',
      notes_en: !isAr ? formDataObj['notes'] as string : initialData?.notes_en || '',
      age: calculateAge(selectedDob) || initialData?.age || 0,
    });
    broadcast({ type: 'DATA_UPDATE', module: 'patients' });
    handleClose();
  };

  const calculateAge = (dob: string) => {
    if (!dob) return 0;
    const birthDate = new Date(dob);
    if (isNaN(birthDate.getTime())) return 0;
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
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
        onClick={(e) => e.target === overlayRef.current && handleClose()}
      >
        <div
          role="dialog"
          className={cn(
            "bg-background relative w-full rounded-2xl border p-8 shadow-2xl max-w-2xl max-h-[90vh] flex flex-col",
            isClosing ? "animate-scaleDownOut" : "animate-scaleUp"
          )}
        >
          <button
            onClick={handleClose}
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
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex flex-col gap-2">
                    <label className={cn("text-sm font-semibold text-foreground/80", isAr ? "pr-1" : "pl-1")}>{t('dialog.first_name', T)}</label>
                    <Input
                      name={isAr ? "first_name_ar" : "first_name_en"}
                      defaultValue={isAr ? initialData?.first_name_ar : initialData?.first_name_en}
                      required
                      disabled={mode === 'view'}
                      placeholder={t('dialog.first_name_placeholder', T)}
                      icon={<User size={18} />}
                      className="font-bold rounded-xl h-12"
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className={cn("text-sm font-semibold text-foreground/80", isAr ? "pr-1" : "pl-1")}>{t('dialog.surname', T)}</label>
                    <Input
                      name={isAr ? "surname_ar" : "surname_en"}
                      defaultValue={isAr ? initialData?.surname_ar : initialData?.surname_en}
                      required
                      disabled={mode === 'view'}
                      placeholder={t('dialog.surname_placeholder', T)}
                      icon={<User size={18} />}
                      className="font-bold rounded-xl h-12"
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className={cn("text-sm font-semibold text-foreground/80", isAr ? "pr-1" : "pl-1")}>{t('dialog.last_name', T)}</label>
                    <Input
                      name={isAr ? "last_name_ar" : "last_name_en"}
                      defaultValue={isAr ? initialData?.last_name_ar : initialData?.last_name_en}
                      required
                      disabled={mode === 'view'}
                      placeholder={t('dialog.last_name_placeholder', T)}
                      icon={<User size={18} />}
                      className="font-bold rounded-xl h-12"
                    />
                  </div>
                </div>

                <div className="flex flex-col xs:grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Phone */}
                  <div className="flex flex-col gap-2">
                    <label className={cn("text-sm font-semibold text-foreground/80", isAr ? "pr-1" : "pl-1")}>{t('dialog.phone', T)}</label>
                    <Input
                      name="phone"
                      defaultValue={initialData?.phone || ""}
                      required
                      disabled={mode === 'view'}
                      placeholder="07XXXXXXXX"
                      dir="ltr"
                      icon={<Phone size={18} />}
                      className="font-bold rounded-xl h-12"
                    />
                  </div>

                  {/* Gender */}
                  <div className="flex flex-col gap-2">
                    <label className={cn("text-sm font-semibold text-foreground/80", isAr ? "pr-1" : "pl-1")}>{t('dialog.gender', T)}</label>
                    <Select value={selectedGender} onValueChange={setSelectedGender} disabled={mode === 'view'}>
                      <SelectTrigger className={cn("rounded-xl h-12 bg-input-background transition-all focus:ring-4 focus:ring-primary/10", ((isAr ? initialData?.gender_ar : initialData?.gender_en) || selectedGender) && "text-foreground font-bold")}>
                        <SelectValue placeholder={t('dialog.gender', T)} />
                      </SelectTrigger>
                      <SelectContent className={cn("rounded-xl z-600", isAr ? "text-right" : "text-left")}>
                        <SelectItem value="ذكر">{t('dialog.male', T)}</SelectItem>
                        <SelectItem value="أنثى">{t('dialog.female', T)}</SelectItem>
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
                          mode === 'view' && "opacity-50 cursor-not-allowed"
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
                      defaultValue={isAr ? initialData?.address_ar : initialData?.address_en}
                      disabled={mode === 'view'}
                      placeholder={t('dialog.address', T)}
                      icon={<MapPin size={18} />}
                      className="font-bold rounded-xl h-12"
                    />
                  </div>

                  {/* Notes */}
                  <div className="flex flex-col gap-2 col-span-2">
                    <label className={cn("text-sm font-semibold text-foreground/80", isAr ? "pr-1" : "pl-1")}>{t('dialog.notes', T)}</label>
                    <div className="relative group">
                      <textarea
                        name="notes"
                        defaultValue={isAr ? initialData?.notes_ar : initialData?.notes_en}
                        disabled={mode === 'view'}
                        className={cn(
                          "w-full min-h-24 p-4 rounded-xl border border-border bg-input-background text-sm outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all resize-none disabled:opacity-50 placeholder:text-muted-foreground font-bold",
                          isAr ? "pr-12" : "pl-12"
                        )}
                        placeholder={t('dialog.notes', T)}
                        rows={3}
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
                <Button type="submit" form="patientForm" className="flex-1 h-12 rounded-xl text-base shadow-lg shadow-primary/20">
                  <Plus size={20} className={isAr ? "ml-2" : "mr-2"} /> {t('dialog.add', T)}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleClose}
                  className="flex-1 h-12 rounded-xl text-base"
                >
                  {t('cancel', T)}
                </Button>
              </>
            )}
            {mode === 'edit' && (
              <>
                <Button type="submit" form="patientForm" className="flex-1 h-12 rounded-xl text-base shadow-lg shadow-primary/20">
                  <Save size={20} className={isAr ? "ml-2" : "mr-2"} /> {t('dialog.save', T)}
                </Button>
                <Button
                  type="button"
                  variant="outline"
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
