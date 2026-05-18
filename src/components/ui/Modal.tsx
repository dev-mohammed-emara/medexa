import { AlertTriangle, Check } from 'lucide-react';
import { IoMdCheckmarkCircleOutline } from "react-icons/io";
import { useCallback, useEffect, useRef, useState } from 'react';
import Portal from './Portal';
import { cn } from '../../utils/cn';
import ScrollLockWrapper from './ScrollLockWrapper';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message?: string;
  confirmText: string;
  cancelText: string;
  variant?: 'danger' | 'primary';
  children?: React.ReactNode;
  isConfirmDisabled?: boolean;
}

const Modal = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText,
  cancelText,
  variant = 'primary',
  children,
  isConfirmDisabled = false
}: ModalProps) => {
  const overlayRef = useRef<HTMLDivElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const [isClosing, setIsClosing] = useState(false);

  const handleClose = useCallback(() => {
    setIsClosing(true);
    setTimeout(() => {
      setIsClosing(false);
      onClose();
    }, 400);
  }, [onClose]);

  const historyPushed = useRef(false);
  const modalId = useRef(Date.now());

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';

      if (!historyPushed.current) {
        window.history.pushState({ modalOpen: true, modalId: modalId.current }, '');
        historyPushed.current = true;
      }

      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') handleClose();
        if (e.key === 'Enter' && !isConfirmDisabled) onConfirm();
      };

      const handlePopState = (e: PopStateEvent) => {
        if (!e.state || e.state.modalId !== modalId.current) {
          handleClose();
        }
      };

      window.addEventListener('keydown', handleKeyDown);
      window.addEventListener('popstate', handlePopState);

      return () => {
        document.body.style.overflow = 'unset';
        window.removeEventListener('keydown', handleKeyDown);
        window.removeEventListener('popstate', handlePopState);
      };
    }
  }, [isOpen, onConfirm, handleClose, isConfirmDisabled]);

  useEffect(() => {
    if (isClosing && historyPushed.current) {
      if (window.history.state?.modalOpen && window.history.state?.modalId === modalId.current) {
        window.history.back();
      }
      historyPushed.current = false;
    }
  }, [isClosing]);

  if (!isOpen) return null;

  return (
    <Portal>
      <div
        ref={overlayRef}
        className={cn(
          "fixed inset-0 z-1000 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm",
          isClosing ? "animate-fadeOut" : "animate-fade"
        )}
        dir="rtl"
        onClick={(e) => e.target === overlayRef.current && handleClose()}
      >
        <div
          ref={modalRef}
          className={cn(
            "bg-white rounded-3xl shadow-2xl w-full max-h-[90vh] flex flex-col overflow-hidden",
            variant === 'danger' ? "max-w-[400px]" : "max-w-2xl",
            isClosing ? "animate-scaleDownOut" : "animate-scaleUp"
          )}
        >
          <ScrollLockWrapper className="flex-1 overflow-y-auto p-6 scrollbar-hide">
            <header data-slot="dialog-header" className="flex flex-col gap-2 items-center text-center mb-6">
              <div className={`p-3 rounded-2xl ${variant === 'danger' ? 'bg-destructive/10 text-destructive' : 'bg-emerald-100 text-emerald-600'}`}>
                {variant === 'danger' ? <AlertTriangle className="size-6" /> : <IoMdCheckmarkCircleOutline className="size-6" />}
              </div>
            </header>

            <h3 className="text-xl text-center font-bold text-[#1a2b3c] mb-2">{title}</h3>
            {message && (
              <p className="text-muted-foreground text-center text-pretty mb-8 leading-relaxed">
                {message}
              </p>
            )}

            {children && (
              <div className="mb-4">
                {children}
              </div>
            )}
          </ScrollLockWrapper>

          <div className="p-6 pt-2 bg-white border-t border-border flex gap-3">
            <button
              onClick={onConfirm}
              disabled={isConfirmDisabled}
              className={`flex-1 h-12 rounded-xl font-bold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 ${
                variant === 'danger'
                ? 'bg-destructive text-white hover:bg-destructive/90 shadow-lg shadow-destructive/20'
                : 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-lg shadow-emerald-200/50'
              }`}
            >
              {variant !== 'danger' && <Check className="size-4" />}
              {confirmText}
            </button>
            <button
              onClick={handleClose}
              className="flex-1 h-12 rounded-xl border border-border font-bold hover:bg-slate-50 transition-all"
            >
              {cancelText}
            </button>
          </div>
        </div>
      </div>
    </Portal>
  );
};

export default Modal;
