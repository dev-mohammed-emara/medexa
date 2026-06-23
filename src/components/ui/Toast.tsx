import { AlertCircle, CheckCircle2, Info, X } from 'lucide-react';
import { useEffect, useState } from 'react';

export type ToastType = 'success' | 'error' | 'info';

interface ToastProps {
  message: string;
  type?: ToastType;
  stackIndex: number;
  expanded: boolean;
  onClose: () => void;
}

const Toast = ({ message, type = 'success', stackIndex, expanded, onClose }: ToastProps) => {
  const [mounted, setMounted] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  const hasModalOpen = typeof document !== 'undefined' ? !!document.querySelector('[role="dialog"]') : false;

  const handleClose = () => {
    setIsExiting(true);
    setTimeout(() => {
      onClose();
    }, 250); // transition duration
  };

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

  const icons = {
    success: <CheckCircle2 className="size-5 text-emerald-500 shrink-0" />,
    error: <AlertCircle className="size-5 text-destructive shrink-0" />,
    info: <Info className="size-5 text-amber-500 shrink-0" />
  };

  const styles = {
    success: 'border-emerald-500/20 bg-emerald-50/90 text-emerald-900',
    error: hasModalOpen 
      ? 'border-destructive/20 bg-white/50 text-destructive' 
      : 'border-destructive/20 bg-destructive/5 text-destructive',
    info: 'border-amber-500/20 bg-amber-50/90 text-amber-900'
  };

  let transform = '';
  let opacity = 1;

  if (expanded) {
    transform = `translateY(0) scale(1)`;
    opacity = 1;
  } else {
    const scale = Math.max(0.7, 1 - stackIndex * 0.05);
    opacity = Math.max(0, 1 - stackIndex * 0.15);
    transform = `translateY(${-stackIndex * 10}px) scale(${scale})`;
  }

  if (!mounted) {
    transform = `translateY(-20px) scale(0.9)`;
    opacity = 0;
  } else if (isExiting) {
    transform = `translateY(-20px) scale(0.9)`;
    opacity = 0;
  }

  const stackStyle: React.CSSProperties = {
    transform,
    opacity,
    zIndex: 1000 - stackIndex,
    pointerEvents: (!isExiting && (expanded || stackIndex === 0)) ? 'auto' : 'none',
    transition: 'all 250ms cubic-bezier(0.16, 1, 0.3, 1)',
    position: expanded ? 'relative' : 'absolute',
  };

  return (
    <div
      style={stackStyle}
      className={`relative w-full max-w-[450px] min-w-[300px] flex items-center gap-3 px-4 py-3 rounded-xl border shadow-lg backdrop-blur-md ${styles[type]}`}
      dir="rtl"
    >
      {icons[type]}
      <p className="flex-1 text-sm font-bold break-words leading-relaxed max-h-[200px] overflow-y-auto no-scrollbar">{message}</p>
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
  const [toasts, setToasts] = useState<{ id: number; message: string; type: ToastType; batchId: number }[]>([]);
  const [isHovered, setIsHovered] = useState(false);
  const [autoExpand, setAutoExpand] = useState(false);

  useEffect(() => {
    window.showToast = (message: any, type: ToastType = 'success') => {
      let finalMessage = '';
      if (typeof message === 'string') {
        try {
          const parsed = JSON.parse(message);
          if (parsed && parsed.details && Array.isArray(parsed.details) && parsed.details.length > 0 && parsed.details[0].message) {
            finalMessage = parsed.details[0].message;
          } else if (parsed && (parsed.message || parsed.error)) {
            finalMessage = parsed.message || parsed.error;
          } else {
            finalMessage = message;
          }
        } catch (e) {
          finalMessage = message;
        }
      } else if (message && typeof message === 'object') {
        if (message.details && Array.isArray(message.details) && message.details.length > 0 && message.details[0].message) {
          finalMessage = message.details[0].message;
        } else {
          finalMessage = message.message || message.error || String(message);
        }
      } else {
        finalMessage = String(message);
      }

      setToasts(prev => {
        const now = Date.now();
        const id = now + Math.random();
        
        let batchId = now;
        if (prev.length > 0) {
          const lastToast = prev[prev.length - 1];
          // If fired within 100ms of the last toast, group them in the same batch
          if (now - lastToast.id < 100) {
            batchId = lastToast.batchId;
          }
        }
        
        return [...prev, { id, message: finalMessage, type, batchId }];
      });
    };
  }, []);

  // Check if multiple toasts in the same batch exist to trigger autoExpand
  useEffect(() => {
    if (toasts.length > 1) {
      const last = toasts[toasts.length - 1];
      const prev = toasts[toasts.length - 2];
      if (last.batchId === prev.batchId) {
        setAutoExpand(true);
        const timer = setTimeout(() => setAutoExpand(false), 3000);
        return () => clearTimeout(timer);
      }
    }
  }, [toasts]);

  const displayToasts = toasts.slice(-5);
  
  const expanded = isHovered || autoExpand || displayToasts.length === 1;

  return (
    <div 
      className={`fixed top-6 left-1/2 -translate-x-1/2 z-[999999] pointer-events-none w-full max-w-[470px] flex flex-col justify-start items-center ${expanded ? 'gap-2' : ''} max-h-[90vh] overflow-visible`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {displayToasts.map((toast, index) => {
        const stackIndex = displayToasts.length - 1 - index;
        return (
          <Toast
            key={toast.id}
            message={toast.message}
            type={toast.type}
            stackIndex={stackIndex}
            expanded={expanded}
            onClose={() => setToasts(prev => prev.filter(t => t.id !== toast.id))}
          />
        );
      })}
    </div>
  );
};

declare global {
  interface Window {
    showToast: (message: any, type?: ToastType) => void;
  }
}

