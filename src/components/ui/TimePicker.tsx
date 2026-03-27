import React, { useState, useRef } from 'react';
import { Clock } from 'lucide-react';
import { cn } from '../../utils/cn';

interface TimePickerProps {
  value: string; // "HH:MM"
  onChange: (value: string) => void;
  className?: string;
  noClock?: boolean;
}

const TimePicker: React.FC<TimePickerProps> = ({ value, onChange, className, noClock = false }) => {
  // Parse initial value once
  const parseTime = (val: string) => {
    const match = val.match(/(\d{1,2}):(\d{2})/);
    if (match) {
      return {
        h: match[1].padStart(2, '0'),
        m: match[2]
      };
    }
    return { h: '08', m: '00' };
  };

  const initial = parseTime(value);
  const [hours, setHours] = useState(initial.h);
  const [minutes, setMinutes] = useState(initial.m);

  const containerRef = useRef<HTMLDivElement>(null);
  const hourRef = useRef<HTMLInputElement>(null);
  const minRef = useRef<HTMLInputElement>(null);

  const [prevValue, setPrevValue] = useState(value);
  if (value !== prevValue) {
    const next = parseTime(value);
    setHours(next.h);
    setMinutes(next.m);
    setPrevValue(value);
  }

  const updateTime = (h: string, m: string) => {
    const finalH = h.padStart(2, '0');
    const finalM = m.padStart(2, '0');
    onChange(`${finalH}:${finalM}`);
  };

  const handleHourChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/\D/g, '').slice(-2);

    if (val.length === 1 && parseInt(val) >= 3 && parseInt(val) <= 9) {
      val = '0' + val;
      setHours(val);
      minRef.current?.focus();
      minRef.current?.select();
    } else if (val.length === 2) {
      const hInt = parseInt(val);
      if (hInt > 23) val = '23';
      setHours(val);
      minRef.current?.focus();
      minRef.current?.select();
    } else {
      setHours(val || '00');
    }
    updateTime(val || '08', minutes || '00');
  };

  const handleMinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/\D/g, '').slice(-2);
    if (val.length === 2) {
      if (parseInt(val) > 59) val = '59';
      setMinutes(val);
      
      // Automatic focus shift logic
      setTimeout(() => {
        if (containerRef.current) {
          const parent = containerRef.current.parentElement;
          if (parent) {
            const pickers = Array.from(parent.querySelectorAll('.time-picker-container'));
            const currentIndex = pickers.indexOf(containerRef.current);
            if (currentIndex !== -1 && currentIndex < pickers.length - 1) {
              const nextPicker = pickers[currentIndex + 1];
              const nextHourInput = nextPicker.querySelector('input') as HTMLInputElement;
              if (nextHourInput) {
                nextHourInput.focus();
                nextHourInput.select();
              }
            }
          }
        }
      }, 50);
    } else {
      setMinutes(val || '00');
    }
    updateTime(hours || '08', val || '00');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, type: 'h' | 'm') => {
    if (e.key === 'Backspace') {
      if (type === 'h' && (hours === '' || hours === '00')) {
          e.preventDefault();
          setHours('08');
          minRef.current?.focus();
          minRef.current?.select();
      } else if (type === 'm' && (minutes === '' || minutes === '00')) {
          e.preventDefault();
          setMinutes('00');
          hourRef.current?.focus();
          hourRef.current?.select();
      }
    }

    if (e.key === 'ArrowRight' && type === 'h') {
      minRef.current?.focus();
      minRef.current?.select();
    }
    if (e.key === 'ArrowLeft' && type === 'm') {
      hourRef.current?.focus();
      hourRef.current?.select();
    }
  };

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    e.target.select();
  };

  const handleBlur = (type: 'h' | 'm') => {
    if (type === 'h' && hours === '') setHours('08');
    if (type === 'm' && minutes === '') setMinutes('00');
  }

  return (
    <div
      ref={containerRef}
      className={cn("time-picker-container flex justify-end whitespace-nowrap items-center gap-1.5 sm:gap-2 p-1 pr-2 sm:pr-3 rounded-xl border border-input bg-input-background focus-within:ring-4 focus-within:ring-primary/10 transition-all cursor-text relative min-w-0 overflow-hidden", className)}
      onClick={(e) => {
        const target = e.target as HTMLElement;
        if (!target.closest('.timePicker')) {
          hourRef.current?.focus();
        }
      }}
    >
      {!noClock &&
      <Clock className="hidden xs:block size-3.5 sm:size-4 text-muted-foreground pointer-events-none absolute right-2 sm:right-3" />
      }
      
      <div className="flex items-center gap-0.5 sm:gap-1 px-0.5 sm:px-1" dir="ltr">
        <input
          ref={hourRef}
          type="text"
          inputMode="numeric"
          placeholder="08"
          value={hours}
          onFocus={handleFocus}
          onBlur={() => handleBlur('h')}
          onChange={handleHourChange}
          onKeyDown={(e) => handleKeyDown(e, 'h')}
          className="timePicker w-5 sm:w-8 bg-transparent text-center outline-none text-sm sm:text-base font-bold placeholder:text-muted-foreground/50 shrink-0"
        />
        <span className="text-muted-foreground font-bold mb-0.5 text-xs sm:text-base">:</span>
        <input
          ref={minRef}
          type="text"
          inputMode="numeric"
          placeholder="00"
          value={minutes}
          onFocus={handleFocus}
          onBlur={() => handleBlur('m')}
          onChange={handleMinChange}
          onKeyDown={(e) => handleKeyDown(e, 'm')}
          className="timePicker w-5 sm:w-8 bg-transparent text-center outline-none text-sm sm:text-base font-bold placeholder:text-muted-foreground/50 shrink-0"
        />
      </div>
    </div>
  );
};

export default TimePicker;
