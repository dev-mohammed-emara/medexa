import React, { useEffect, useRef, useState } from 'react';
import { Clock } from 'lucide-react';
import { cn } from '../../utils/cn';
import { useLanguage } from '../../contexts/LanguageContext';
import Portal from './Portal';

interface TimePickerProps {
  value: string; // "HH:MM" (24h format internally)
  onChange: (value: string) => void;
  className?: string;
  noClock?: boolean;
}

const parseTo12h = (val: string) => {
  const [h24Str, m] = val.split(':');
  const h24 = parseInt(h24Str || '8');
  const p = h24 >= 12 ? 'PM' : 'AM';
  let h12 = h24 % 12;
  if (h12 === 0) h12 = 12;
  return {
    h: h12.toString().padStart(2, '0'),
    m: m || '00',
    p: p as 'AM' | 'PM'
  };
};

const formatTo24h = (h: string, m: string, p: 'AM' | 'PM') => {
  let hInt = parseInt(h);
  if (isNaN(hInt)) hInt = 12;
  if (p === 'PM' && hInt < 12) hInt += 12;
  if (p === 'AM' && hInt === 12) hInt = 0;
  return `${hInt.toString().padStart(2, '0')}:${(m || '00').padStart(2, '0')}`;
};

const TimePicker: React.FC<TimePickerProps> = ({ value, onChange, className, noClock = false }) => {
  const { isAr } = useLanguage();
  const initial = parseTo12h(value || '08:00');

  const [isOpen, setIsOpen] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [mode, setMode] = useState<'h' | 'm'>('h');

  // Temporary state for the modal
  const [tempH, setTempH] = useState(initial.h);
  const [tempM, setTempM] = useState(initial.m);
  const [tempP, setTempP] = useState<'AM' | 'PM'>(initial.p);

  const containerRef = useRef<HTMLDivElement>(null);
  const clockRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      const current = parseTo12h(value || '08:00');
      setTempH(current.h);
      setTempM(current.m);
      setTempP(current.p);
      setMode('h');
    }
  }, [isOpen, value]);

  useEffect(() => {
    if (!value && onChange) {
      onChange('08:00');
    }
  }, [value, onChange]);

  useEffect(() => {
    const handlePopState = () => {
      if (isOpen) {
        handleClose();
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [isOpen]);

  const handleOpen = () => setIsOpen(true);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      setIsOpen(false);
      setIsClosing(false);
    }, 200);
  };

  const handleConfirm = () => {
    onChange(formatTo24h(tempH, tempM, tempP));
    handleClose();
  };

  // Clock Interaction
  const handleClockInteract = (e: React.MouseEvent | React.TouchEvent) => {
    if (!clockRef.current) return;
    const rect = clockRef.current.getBoundingClientRect();

    // Get coordinates
    let clientX, clientY;
    if ('touches' in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    const x = clientX - rect.left - rect.width / 2;
    const y = clientY - rect.top - rect.height / 2;

    let angle = Math.atan2(y, x) * (180 / Math.PI) + 90;
    if (angle < 0) angle += 360;

    if (mode === 'h') {
      let hour = Math.round(angle / 30);
      if (hour === 0) hour = 12;
      setTempH(hour.toString().padStart(2, '0'));
    } else {
      let minute = Math.round(angle / 6);
      if (minute === 60) minute = 0;
      setTempM(minute.toString().padStart(2, '0'));
    }
  };

  const handleClockMouseUp = () => {
    if (mode === 'h') {
      // Auto switch to minutes after selecting hour
      setMode('m');
    }
  };

  const renderClockFace = () => {
    const numbers = mode === 'h'
      ? [12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]
      : [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55];

    const currentValue = mode === 'h' ? parseInt(tempH) : parseInt(tempM);
    const pointerAngle = mode === 'h'
      ? (currentValue === 12 ? 0 : currentValue * 30)
      : currentValue * 6;

    return (
      <div
        ref={clockRef}
        className="relative w-56 h-56 rounded-full bg-white border border-secondary/40 mx-auto select-none touch-none"
        onMouseDown={(e) => {
          handleClockInteract(e);
          const handleMouseMove = (e: MouseEvent) => handleClockInteract(e as any);
          const handleMouseUp = () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
            handleClockMouseUp();
          };
          window.addEventListener('mousemove', handleMouseMove);
          window.addEventListener('mouseup', handleMouseUp);
        }}
        onTouchStart={(e) => handleClockInteract(e)}
        onTouchMove={(e) => handleClockInteract(e)}
        onTouchEnd={handleClockMouseUp}
      >
        {/* Center dot */}
        <div className="absolute top-1/2 left-1/2 w-2 h-2 -ml-1 -mt-1 bg-secondary rounded-full z-10" />

        {/* Pointer Line */}
        <div
          className="absolute top-1/2 left-1/2 w-[2px] cursor-grab active:cursor-grabbing h-[95px] bg-secondary origin-bottom -ml-[1px] -mt-[95px] z-0"
          style={{ transform: `rotate(${pointerAngle}deg)` }}
        >
          {/* Pointer Circle */}
          <div className="absolute -top-4 -left-[15px] w-8 h-8 rounded-full bg-secondary flex items-center justify-center shadow-md">
            {mode === 'm' && currentValue % 5 !== 0 && (
              <div className="w-1.5 h-1.5 bg-white rounded-full" />
            )}
          </div>
        </div>

        {/* Minute Ticks (Outer Ring) */}
        {Array.from({ length: 60 }).map((_, i) => {
          const isFiveMin = i % 5 === 0;
          const angle = i * 6;
          return (
            <div
              key={`tick-${i}`}
              className={cn(
                "absolute w-[2px] rounded-full pointer-events-none transition-colors",
                isFiveMin ? "h-[8px] bg-secondary/50" : "h-[4px] bg-secondary/20"
              )}
              style={{
                left: 111,
                top: 6,
                transformOrigin: '1px 106px',
                transform: `rotate(${angle}deg)`
              }}
            />
          );
        })}

        {/* Numbers */}
        {numbers.map((num, i) => {
          const angle = i * 30;
          const rad = (angle - 90) * (Math.PI / 180);
          const radius = 95; // distance from center
          const x = 112 + radius * Math.cos(rad);
          const y = 112 + radius * Math.sin(rad);
          const isSelected = mode === 'h'
            ? (num === 12 ? currentValue === 12 : currentValue === num)
            : currentValue === num;

          return (
            <div
              key={num}
              className={cn(
                "absolute w-8 h-8 -ml-4 -mt-4 pointer-events-none flex items-center justify-center text-sm font-medium rounded-full z-10 transition-colors",
                isSelected ? "text-white" : "text-black"
              )}
              style={{ left: x, top: y }}
            >
              {num === 0 && mode === 'm' ? '00' : num}
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <>
      <div
        ref={containerRef}
        onClick={handleOpen}
        className={cn(
          "time-picker-container whitespace-nowrap flex items-center max-w-full text-center  bg-white border border-border rounded-xl px-3 py-1.5 transition-all hover:border-primary/50 cursor-pointer h-12 w-full",
          className
        )}
      >
        {!noClock && <Clock className="size-4 text-muted-foreground mr-2 ml-2" />}
        <div className="flex-1 font-bold text-foreground w-full" dir="ltr">
          {initial.h}:{initial.m} {initial.p === 'AM' ? (isAr ? 'ص' : 'AM') : (isAr ? 'م' : 'PM')}
        </div>
      </div>

      {isOpen && (
        <Portal>
          <div
            className={cn(
              "fixed inset-0 z-[600] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm",
              isClosing ? "animate-fadeOut" : "animate-fade"
            )}
            onClick={(e) => e.target === e.currentTarget && handleClose()}
          >
            <div
              className={cn(
                "bg-[#E2E2E2] rounded-[28px] w-full max-w-[340px] sm:max-w-[480px] shadow-2xl overflow-hidden flex flex-col",
                isClosing ? "animate-scaleDownOut" : "animate-scaleUp"
              )}
              dir={isAr ? 'rtl' : 'ltr'}
            >
              {/* Header */}
              <div className="px-6 pt-6 pb-2">
                <h3 className="text-[#424242] text-sm font-medium">
                  {isAr ? 'اختيار الوقت' : 'Select Time'}
                </h3>
              </div>

              {/* Body */}
              <div className="flex flex-col sm:flex-row items-center gap-6 p-6 pb-2">

                {/* Right Side in AR (Digital + AM/PM) */}
                <div className="flex flex-col gap-4 order-1 sm:order-2 w-full sm:w-auto items-center">
                  <div className="flex items-center gap-2" dir="ltr">
                    <button
                      onClick={() => setMode('h')}
                      className={cn(
                        "w-20 h-20 rounded-2xl flex items-center justify-center text-5xl font-medium transition-colors",
                        mode === 'h' ? "bg-secondary text-white" : "bg-white text-black hover:bg-gray-100"
                      )}
                    >
                      {tempH}
                    </button>
                    <span className="text-3xl mb-1 text-black">:</span>
                    <button
                      onClick={() => setMode('m')}
                      className={cn(
                        "w-20 h-20 rounded-2xl flex items-center justify-center text-5xl font-medium transition-colors",
                        mode === 'm' ? "bg-secondary text-white" : "bg-white text-black hover:bg-gray-100"
                      )}
                    >
                      {tempM}
                    </button>
                  </div>

                  <div className="flex w-full rounded-xl overflow-hidden border border-[#d0d0d0] h-10 mt-2" dir="ltr">
                    <button
                      onClick={() => setTempP('AM')}
                      className={cn(
                        "flex-1 font-medium text-sm transition-colors",
                        tempP === 'AM' ? "bg-secondary text-white" : "bg-white text-black hover:bg-black/5"
                      )}
                    >
                      {isAr ? 'ص' : 'AM'}
                    </button>
                    <div className="w-[1px] bg-[#d0d0d0]" />
                    <button
                      onClick={() => setTempP('PM')}
                      className={cn(
                        "flex-1 font-medium text-sm transition-colors",
                        tempP === 'PM' ? "bg-secondary text-white" : "bg-white text-black hover:bg-black/5"
                      )}
                    >
                      {isAr ? 'م' : 'PM'}
                    </button>
                  </div>
                </div>

                {/* Left Side in AR (Analog Clock) */}
                <div className="order-2 sm:order-1 flex-1 flex justify-center w-full">
                  {renderClockFace()}
                </div>
              </div>

              {/* Footer */}
              <div className="flex justify-start px-6 py-4 mt-2 gap-3 border-t border-border">
                <button
                  onClick={handleClose}
                  className="inline-flex flex-1 items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-bold transition-all duration-300 border bg-background text-foreground hover:bg-accent hover:text-white hover:border-accent h-11 px-6"
                >
                  {isAr ? 'إلغاء' : 'Cancel'}
                </button>
                <button
                  onClick={handleConfirm}
                  className="inline-flex flex-1 items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-bold transition-all duration-300 text-white bg-secondary hover:bg-secondary/90 shadow-lg shadow-secondary/20 h-11 px-6"
                >
                  {isAr ? 'تأكيد' : 'Confirm'}
                </button>
              </div>
            </div>
          </div>
        </Portal>
      )}
    </>
  );
};

export default TimePicker;
