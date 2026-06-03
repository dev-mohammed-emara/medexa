import { AlertTriangle, Check } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { IoMdCheckmarkCircleOutline } from "react-icons/io";
import { cn } from '../../utils/cn';
import Portal from './Portal';
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
  footer?: React.ReactNode;
  isConfirmDisabled?: boolean;
  hideFooter?: boolean;
  showCloseButton?: boolean;
  hideHeaderIcon?: boolean;
  maxWidth?: string;
  contentClassName?: string;
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
  footer,
  isConfirmDisabled = false,
  hideFooter = false,
  showCloseButton = false,
  hideHeaderIcon = false,
  maxWidth,
  contentClassName,
}: ModalProps) => {
  const overlayRef = useRef<HTMLDivElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const [isClosing, setIsClosing] = useState(false);
  const modalId = useRef(Date.now());
  const titleId = useRef(`modal-title-${modalId.current}`);
  const descriptionId = useRef(`modal-desc-${modalId.current}`);

  const handleClose = useCallback(() => {
    setIsClosing(true);
    setTimeout(() => {
      setIsClosing(false);
      onClose();
    }, 400);
  }, [onClose]);

  const historyPushed = useRef(false);

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
        data-state={isClosing ? 'closed' : 'open'}
        data-slot="dialog-overlay"
        aria-hidden="true"
        className={cn(
          "fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50",
          isClosing ? "animate-fadeOut" : "animate-fade"
        )}
        dir="rtl"
        onClick={(e) => e.target === overlayRef.current && handleClose()}
      >
        <div
          ref={modalRef}
          role="dialog"
          aria-labelledby={titleId.current}
          aria-describedby={message ? descriptionId.current : undefined}
          data-state={isClosing ? 'closed' : 'open'}
          data-slot="dialog-content"
          tabIndex={-1}
          className={cn(
            "relative bg-white rounded-3xl shadow-2xl w-full max-h-[90vh] flex flex-col overflow-hidden",
            variant === 'danger' ? "max-w-[400px]" : (maxWidth || "max-w-2xl"),
            isClosing ? "animate-scaleDownOut" : "animate-scaleUp",
            contentClassName
          )}
        >
          <ScrollLockWrapper className="relative flex-1 overflow-y-auto p-6 scrollbar-hide">
            {!hideHeaderIcon && (
              <header data-slot="dialog-header" className="flex flex-col gap-2 items-center text-center mb-6">
                <div className={`p-3 rounded-2xl ${variant === 'danger' ? 'bg-destructive/10 text-destructive' : 'bg-emerald-100 text-emerald-600'}`}>
                  {variant === 'danger' ? <AlertTriangle className="size-6" /> : <IoMdCheckmarkCircleOutline className="size-6" />}
                </div>
              </header>
            )}

            {title && (
              <div className={cn(
                "flex flex-col gap-2 mb-6",
                variant === 'danger' ? "items-center text-center" : "items-start text-start"
              )}>
                <h3 id={titleId.current} className="text-2xl font-semibold text-[#1A2B3C]">
                  {title}
                </h3>
                {message && (
                  <p id={descriptionId.current} className="text-sm text-gray-500 text-balance">
                    {message}
                  </p>
                )}
              </div>
            )}

            {showCloseButton && (
              <button
                type="button"
                onClick={handleClose}
                className="ring-offset-background focus:ring-ring  absolute top-6 left-6 rounded-xs opacity-70 transition-opacity hover:opacity-100 focus:ring-2 focus:ring-offset-2 focus:outline-none disabled:pointer-events-none"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-x size-6">
                  <path d="M18 6 6 18" />
                  <path d="m6 6 12 12" />
                </svg>
                <span className="sr-only">Close</span>
              </button>
            )}

          {children && (
              <div className={cn(!hideFooter && !footer && "mb-4")}>
                {children}
              </div>
            )}
          </ScrollLockWrapper>

          {footer && footer}

          {!hideFooter && (
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
          )}
        </div>
      </div>
    </Portal>
  );
};

export default Modal;
