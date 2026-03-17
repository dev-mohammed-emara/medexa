import { gsap } from 'gsap';
import { AlertTriangle } from 'lucide-react';
import { useEffect, useRef } from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText: string;
  cancelText: string;
  variant?: 'danger' | 'primary';
}

const Modal = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText,
  cancelText,
  variant = 'primary'
}: ModalProps) => {
  const overlayRef = useRef<HTMLDivElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      const ctx = gsap.context(() => {
        gsap.fromTo(overlayRef.current,
          { opacity: 0 },
          { opacity: 1, duration: 0.3 }
        );
        gsap.fromTo(modalRef.current,
          { scale: 0.9, opacity: 0, y: 20 },
          { scale: 1, opacity: 1, y: 0, duration: 0.4, ease: 'back.out(1.7)' }
        );
      });
      return () => {
        ctx.revert();
        document.body.style.overflow = 'unset';
      };
    }
  }, [isOpen]);

  const handleClose = () => {
    gsap.to(modalRef.current, { scale: 0.9, opacity: 0, y: 10, duration: 0.2 });
    gsap.to(overlayRef.current, { opacity: 0, duration: 0.2, onComplete: onClose });
  };

  if (!isOpen) return null;

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-200 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
      dir="rtl"
    >
      <div
        ref={modalRef}
        className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden"
      >
        <div className="p-6">
          <div className="flex justify-center items-center mb-6">
            <div className={`p-3 rounded-2xl ${variant === 'danger' ? 'bg-destructive/10 text-destructive' : 'bg-primary/10 text-primary'}`}>
              <AlertTriangle className="size-6" />
            </div>

          </div>

          <h3 className="text-xl text-center font-bold text-[#1a2b3c] mb-2">{title}</h3>
          <p className="text-muted-foreground text-center text-pretty mb-8 leading-relaxed">
            {message}
          </p>

          <div className="flex gap-3">
            <button
              onClick={onConfirm}
              className={`flex-1 h-12 rounded-xl font-bold transition-all duration-300 ${
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
  );
};

export default Modal;
