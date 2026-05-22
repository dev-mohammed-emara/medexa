import { AlertCircle, CheckCircle2, Info, X } from 'lucide-react';
import { useEffect, useState } from 'react';

export type ToastType = 'success' | 'error' | 'info';

interface ToastProps {
  message: string;
  type?: ToastType;
  stackIndex: number;
  onClose: () => void;
}

const Toast = ({ message, type = 'success', stackIndex, onClose }: ToastProps) => {
  const [mounted, setMounted] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setMounted(true);
    }, 16); // 1 frame delay to animate from initial state

    const hideTimeout = setTimeout(() => {
      handleClose();
    }, 2000); // auto dismiss after 2 seconds

    return () => {
      clearTimeout(timeout);
      clearTimeout(hideTimeout);
    };
  }, []);

  const handleClose = () => {
    setIsExiting(true);
    setTimeout(() => {
      onClose();
    }, 250); // transition duration
  };

  const icons = {
    success: <CheckCircle2 className="size-5 text-emerald-500 shrink-0" />,
    error: <AlertCircle className="size-5 text-destructive shrink-0" />,
    info: <Info className="size-5 text-primary shrink-0" />
  };

  const styles = {
    success: 'border-emerald-500/20 bg-emerald-50/90 text-emerald-900',
    error: 'border-destructive/20 bg-destructive/5 text-destructive',
    info: 'border-primary/20 bg-primary/5 text-primary'
  };

  // Stack index 0 is top card, 1 is secondary, 2 is tertiary
  const scale = Math.max(0.7, 1 - stackIndex * 0.05);
  let opacity = Math.max(0, 1 - stackIndex * 0.15);
  let transform = `translateY(${-stackIndex * 10}px) scale(${scale})`;

  if (!mounted) {
    transform = `translateY(40px) scale(0.9)`;
    opacity = 0;
  } else if (isExiting) {
    transform = `translateY(-40px) scale(0.9)`;
    opacity = 0;
  }

  const stackStyle: React.CSSProperties = {
    transform,
    opacity,
    zIndex: 1000 - stackIndex,
    pointerEvents: (stackIndex === 0 && !isExiting) ? 'auto' : 'none',
    transition: 'all 250ms cubic-bezier(0.16, 1, 0.3, 1)',
  };

  return (
    <div
      style={stackStyle}
      className={`absolute w-full max-w-[340px] min-w-[300px] flex items-center gap-3 px-4 py-3 rounded-xl border shadow-lg backdrop-blur-md ${styles[type]}`}
      dir="rtl"
    >
      {icons[type]}
      <p className="flex-1 text-sm font-bold truncate leading-relaxed">{message}</p>
      <button 
        onClick={handleClose} 
        className="p-1 hover:bg-black/5 rounded-lg transition-colors cursor-pointer shrink-0"
      >
        <X className="size-4 opacity-50" />
      </button>
    </div>
  );
};

export const ToastContainer = () => {
  const [toasts, setToasts] = useState<{ id: number; message: string; type: ToastType }[]>([]);

  useEffect(() => {
    window.showToast = (message: string, type: ToastType = 'success') => {
      setToasts(prev => {
        const id = Date.now() + Math.random();
        return [...prev, { id, message, type }];
      });
    };
  }, []);

  // Display only the last 3 toasts
  const activeToasts = toasts;

  return (
    <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[999999] pointer-events-none w-full max-w-[360px] flex justify-center items-start h-24">
      {activeToasts.map((toast, index) => {
        const stackIndex = activeToasts.length - 1 - index;
        return (
          <Toast
            key={toast.id}
            message={toast.message}
            type={toast.type}
            stackIndex={stackIndex}
            onClose={() => setToasts(prev => prev.filter(t => t.id !== toast.id))}
          />
        );
      })}
    </div>
  );
};

declare global {
  interface Window {
    showToast: (message: string, type?: ToastType) => void;
  }
}

