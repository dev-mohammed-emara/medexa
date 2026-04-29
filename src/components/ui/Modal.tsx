import { AlertTriangle } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import Portal from './Portal';
import { cn } from '../../utils/cn';

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

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';

      // Push state to history to handle mobile back button
      window.history.pushState({ modalOpen: true }, '');

      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') handleClose();
        if (e.key === 'Enter' && !isConfirmDisabled) onConfirm();
      };

      const handlePopState = () => {
        handleClose();
      };

      window.addEventListener('keydown', handleKeyDown);
      window.addEventListener('popstate', handlePopState);

      return () => {
        document.body.style.overflow = 'unset';
        window.removeEventListener('keydown', handleKeyDown);
        window.removeEventListener('popstate', handlePopState);
        
        // If the modal is closed manually (not via back button), clear the pushed state
        if (window.history.state?.modalOpen) {
          window.history.back();
        }
      };
    }
  }, [isOpen, onConfirm, handleClose]);

  if (!isOpen) return null;

  return (
    <Portal>
      <div
        ref={overlayRef}
        className={cn(
          "fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm",
          isClosing ? "animate-fadeOut" : "animate-fade"
        )}
        dir="rtl"
        onClick={(e) => e.target === overlayRef.current && handleClose()}
      >
        <div
          ref={modalRef}
          className={cn(
            "bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden",
            isClosing ? "animate-scaleDownOut" : "animate-scaleUp"
          )}
        >
          <div className="p-6">
            <header data-slot="dialog-header" className="flex flex-col gap-2 items-center text-center mb-6">
              <div className={`p-3 rounded-2xl ${variant === 'danger' ? 'bg-destructive/10 text-destructive' : 'bg-primary/10 text-primary'}`}>
                <AlertTriangle className="size-6" />
              </div>
            </header>

            <h3 className="text-xl text-center font-bold text-[#1a2b3c] mb-2">{title}</h3>
            {message && (
              <p className="text-muted-foreground text-center text-pretty mb-8 leading-relaxed">
                {message}
              </p>
            )}

            {children && (
              <div className="mb-8">
                {children}
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={onConfirm}
                disabled={isConfirmDisabled}
                className={`flex-1 h-12 rounded-xl font-bold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed ${
                  variant === 'danger'
                  ? 'bg-destructive text-white hover:bg-destructive/90 shadow-lg shadow-destructive/20'
                  : 'bg-primary text-white hover:bg-primary/90 shadow-lg shadow-primary/20'
                }`}
              >
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
      </div>
    </Portal>
  );
};

export default Modal;
