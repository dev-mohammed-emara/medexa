import { useEffect, useState, useRef, useCallback } from 'react';
import { gsap } from 'gsap';
import { CheckCircle2, AlertCircle, X, Info } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info';

interface ToastProps {
  message: string;
  type?: ToastType;
  onClose: () => void;
}

const Toast = ({ message, type = 'success', onClose }: ToastProps) => {
  const toastRef = useRef<HTMLDivElement>(null);

  const hide = useCallback(() => {
    gsap.to(toastRef.current, { 
      y: 20, 
      opacity: 0, 
      scale: 0.95, 
      duration: 0.3, 
      ease: 'power2.in',
      onComplete: onClose 
    });
  }, [onClose]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(toastRef.current, 
        { y: 50, opacity: 0, scale: 0.9 }, 
        { y: 0, opacity: 1, scale: 1, duration: 0.5, ease: 'back.out(1.7)' }
      );
    });

    const timer = setTimeout(() => {
      hide();
    }, 3000);

    return () => {
      ctx.revert();
      clearTimeout(timer);
    };
  }, [hide]);

  const icons = {
    success: <CheckCircle2 className="size-5 text-emerald-500" />,
    error: <AlertCircle className="size-5 text-destructive" />,
    info: <Info className="size-5 text-primary" />
  };

  const styles = {
    success: 'border-emerald-500/20 bg-emerald-50/90 text-emerald-900',
    error: 'border-destructive/20 bg-destructive/5 text-destructive',
    info: 'border-primary/20 bg-primary/5 text-primary'
  };

  return (
    <div 
      ref={toastRef}
      className={`flex items-center gap-3 px-4 py-3 rounded-xl border shadow-lg backdrop-blur-md min-w-[300px] pointer-events-auto ${styles[type]}`}
      dir="rtl"
    >
      {icons[type]}
      <p className="flex-1 text-sm font-bold">{message}</p>
      <button onClick={hide} className="p-1 hover:bg-black/5 rounded-lg transition-colors">
        <X className="size-4 opacity-50" />
      </button>
    </div>
  );
};

export const ToastContainer = () => {
  const [toasts, setToasts] = useState<{ id: number; message: string; type: ToastType }[]>([]);

  useEffect(() => {
    window.showToast = (message: string, type: ToastType = 'success') => {
      const id = Date.now();
      setToasts(prev => [...prev, { id, message, type }]);
    };
  }, []);

  return (
    <div className="fixed top-6 left-1/2 -translate-x-1/2 z-100 flex flex-col gap-2 pointer-events-none">
      {toasts.map(toast => (
        <Toast 
          key={toast.id} 
          message={toast.message} 
          type={toast.type} 
          onClose={() => setToasts(prev => prev.filter(t => t.id !== toast.id))} 
        />
      ))}
    </div>
  );
};

declare global {
  interface Window {
    showToast: (message: string, type?: ToastType) => void;
  }
}
