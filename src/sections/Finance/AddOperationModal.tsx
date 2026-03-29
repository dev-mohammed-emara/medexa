import { useCallback, useEffect, useRef, useState } from 'react';
import {
  DollarSign,
  Check,
  X,
  FileText
} from 'lucide-react';
import { FaCalendarAlt } from 'react-icons/fa';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '../../components/ui/select';
import Input from '../../components/ui/Input';
import Flatpickr from 'react-flatpickr';
import { Arabic } from 'flatpickr/dist/l10n/ar.js';
import { useLanguage } from '../../contexts/LanguageContext';
import { financeTranslations } from '../../constants/translations/finance';
import { cn } from '../../utils/cn';
import Portal from '../../components/ui/Portal';
import { useBroadcast } from '../../hooks/useBroadcast';
import { appointmentsTranslations } from '../../constants/translations/appointments';

interface OperationData {
  type: string;
  amount: string;
  currency: string;
  date: Date;
  appointment: string;
  notes: string;
}

interface AddOperationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (data: OperationData) => void;
}

const AddOperationModal = ({ isOpen, onClose, onSuccess }: AddOperationModalProps) => {
  const { isAr, t, dir } = useLanguage();
  const { broadcast } = useBroadcast();
  const T = financeTranslations;
  const overlayRef = useRef<HTMLDivElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  const [type, setType] = useState<string>("");
  const [amount, setAmount] = useState<string>("");
  const [currency, setCurrency] = useState<string>("د.أ");
  const [date, setDate] = useState<Date>(new Date());
  const [appointment, setAppointment] = useState<string>("");
  const [notes, setNotes] = useState<string>("");
  const [isClosing, setIsClosing] = useState(false);

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
      window.history.pushState({ modalOpen: true }, '');

      const handlePopState = () => handleClose();
      window.addEventListener('popstate', handlePopState);

      return () => {
        document.body.style.overflow = 'unset';
        window.removeEventListener('popstate', handlePopState);
        if (window.history.state?.modalOpen) window.history.back();
      };
    }
  }, [isOpen, handleClose]);

  if (!isOpen) return null;

  const handleSubmit = () => {
    // Basic validation
    if (!type || !amount || !date) return;

    onSuccess({ type, amount, currency, date, appointment, notes });
    broadcast({ type: 'DATA_UPDATE', module: 'finance' });
    handleClose();
  };

  const isFormValid = !!(type && amount && date);

  return (
    <Portal>
      <div
        ref={overlayRef}
        className={cn(
          "fixed inset-0 z-500 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm",
          isClosing ? "animate-fadeOut" : "animate-fade"
        )}
        dir={dir}
        onClick={(e) => {
          if (e.target === overlayRef.current) handleClose();
        }}
      >
        <div
          ref={modalRef}
          className={cn(
            "bg-white rounded-4xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden relative flex flex-col",
            isClosing ? "animate-scaleDownOut" : "animate-scaleUp"
          )}
        >
          {/* Close Button - Physically Absolute but stays visible */}
          <button
            onClick={handleClose}
            className={cn(
              "absolute top-6 w-11 h-11 flex items-center justify-center rounded-xl bg-muted/40 text-muted-foreground hover:bg-red-50 hover:text-red-500 transition-all active:scale-95 z-20",
              isAr ? "left-6" : "right-6"
            )}
          >
            <X className="size-5" />
          </button>

          {/* Scrollable Content Area */}
          <div
            className="flex-1 overflow-y-auto p-8 pt-12 px-4 xs:px-10 custom-scrollbar overscroll-contain"
            data-lenis-prevent
          >
            {/* Header */}
            <div className="text-center mb-10">
              <div className="flex flex-col items-center gap-4 mb-2">
                <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center shrink-0">
                  <DollarSign className="size-7 text-primary" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-[#1a2b3c]">{t('modal_title', T)}</h2>
                  <p className="text-muted-foreground">{t('modal_desc', T)}</p>
                </div>
              </div>
            </div>

            <div className="space-y-8 pb-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Operation Type */}
                <div className="space-y-2">
                  <label className={cn("block text-sm font-bold text-[#1a2b3c]", isAr ? "mr-1" : "ml-1")}>
                    {t('type_label', T)} <span className="text-destructive">*</span>
                  </label>
                  <Select value={type} onValueChange={setType}>
                    <SelectTrigger className="h-12 rounded-xl bg-muted/30 border-border border">
                      <SelectValue placeholder={t('select_type', T)} />
                    </SelectTrigger>
                    <SelectContent className="z-600">
                      <SelectItem value="دخل">{t('type_income', T)}</SelectItem>
                      <SelectItem value="مصروف">{t('type_expense', T)}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Amount */}
                <div className="space-y-2">
                  <label className={cn("block text-sm font-bold text-[#1a2b3c]", isAr ? "mr-1" : "ml-1")}>
                    {t('amount_label', T)} <span className="text-destructive">*</span>
                  </label>
                  <div className="relative group">
                    <Input
                      type="number"
                      placeholder="0.00"
                      min="0"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className={cn("h-12 bg-muted/30 border-border focus:bg-white text-left", isAr ? "pl-12" : "pr-12")}
                      dir='ltr'
                    />
                    <div className={cn("absolute top-1/2 -translate-y-1/2 text-sm font-bold text-muted-foreground pointer-events-none group-focus-within:text-primary", isAr ? "left-4" : "right-4")}>
                      {currency === 'د.أ' ? t('jod', T) : currency}
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Currency */}
                <div className="space-y-2">
                  <label className={cn("block text-sm font-bold text-[#1a2b3c]", isAr ? "mr-1" : "ml-1")}>{t('table_currency', T)}</label>
                  <Select value={currency} onValueChange={setCurrency}>
                    <SelectTrigger className="h-12 rounded-xl bg-muted/30 border-border border">
                      <SelectValue placeholder={t('jod', T)} />
                    </SelectTrigger>
                    <SelectContent className="z-600">
                      <SelectItem value="د.أ">{t('jod', T)}</SelectItem>
                      <SelectItem value="USD">{t('usd', T)}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Date */}
                <div className="space-y-2">
                  <label className={cn("block text-sm font-bold text-[#1a2b3c]", isAr ? "mr-1" : "ml-1")}>
                    {t('date_label', T)} <span className="text-destructive">*</span>
                  </label>
                  <div className="relative group flex items-center justify-between h-12 bg-muted/30 border border-border rounded-xl px-4 transition-all focus-within:ring-4 focus-within:ring-primary/10 focus-within:bg-white">
                    <Flatpickr
                      value={date}
                      onChange={([d]) => setDate(d)}
                      options={{
                        dateFormat: 'd F Y',
                        locale: isAr ? Arabic : undefined,
                        disableMobile: true
                      }}
                      className={cn("flex-1 bg-transparent border-none outline-none text-sm font-bold h-full", isAr ? "text-right" : "text-left")}
                    />
                    <FaCalendarAlt className="size-4 text-muted-foreground pointer-events-none group-focus-within:text-primary transition-colors" />
                  </div>
                </div>
              </div>

              {/* Related Appointment */}
              <div className="space-y-2">
                <label className={cn("block text-sm font-bold text-[#1a2b3c]", isAr ? "mr-1" : "ml-1")}>{t('related_appt_label', T)}</label>
                <Select value={appointment} onValueChange={setAppointment}>
                  <SelectTrigger className="h-12 rounded-xl bg-muted/30 border-border border">
                    <SelectValue placeholder={t('select_appt', T)} />
                  </SelectTrigger>
                  <SelectContent className="z-600">
                    <SelectItem value="None">{t('no_appt', T)}</SelectItem>
                    <SelectItem value="123">{t('appt_prefix', T)}123 - {t('dialog.patients.ahmed', appointmentsTranslations)}</SelectItem>
                    <SelectItem value="124">{t('appt_prefix', T)}124 - {t('dialog.patients.sara', appointmentsTranslations)}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Notes */}
              <div className="space-y-2">
                <label className={cn("block text-sm font-bold text-[#1a2b3c]", isAr ? "mr-1" : "ml-1")}>{t('table_notes', T)}</label>
                <div className="relative group">
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder={t('notes_placeholder', T)}
                    className={cn(
                      "w-full min-h-[120px] rounded-xl border border-border bg-muted/30 px-4 py-3 text-sm transition-all outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 focus:bg-white resize-none",
                      isAr ? "pl-12" : "pr-12"
                    )}
                  />
                  <FileText className={cn("absolute top-4 size-4 text-muted-foreground pointer-events-none group-focus-within:text-primary", isAr ? "left-4" : "right-4")} />
                </div>
              </div>

              {/* Information Alert */}
              <div className="p-5 bg-primary/5 border border-primary/20 rounded-2xl flex gap-3 mb-2">
                <DollarSign className="size-6 text-primary shrink-0 transition-transform hover:scale-110" />
                <div className={cn("text-xs text-primary/80 leading-relaxed", isAr ? "text-right" : "text-left")}>
                  <p className="font-bold mb-1 text-sm">{t('important_note', T)}</p>
                  <p>{t('disclaimer', T)}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Sticky Footer */}
          <div className="flex gap-4 flex-wrap p-8 border-t border-border bg-white mt-auto shrink-0 z-10">
            <button
              disabled={!isFormValid}
              onClick={handleSubmit}
              className={cn(
                "flex-1 h-12 rounded-xl font-bold flex items-center justify-center gap-2 transition-all duration-300",
                isFormValid
                  ? "bg-primary text-white hover:bg-primary/90 shadow-lg shadow-primary/20"
                  : "bg-muted text-muted-foreground cursor-not-allowed opacity-50"
              )}
            >
              <Check className="size-5" />
              {t('add_btn', T)}
            </button>
            <button
              onClick={handleClose}
              className="flex-1 h-12 rounded-xl border border-border font-bold text-foreground hover:text-white transition-all active:scale-95 flex items-center justify-center gap-2 hover:bg-accent"
            >
              <X className="size-4" />
              {t('cancel', T)}
            </button>
          </div>
        </div>
      </div>
    </Portal>
  );
};

export default AddOperationModal;
