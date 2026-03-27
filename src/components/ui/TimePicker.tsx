import React, { useState, useRef } from 'react';
import { cn } from '../../utils/cn';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from './select';

interface TimePickerProps {
  value: string; // "HH:MM AM/PM" or "HH:MM" in 24h
  onChange: (value: string) => void;
  className?: string;
}

const TimePicker: React.FC<TimePickerProps> = ({ value, onChange, className }) => {
  // Parse initial value once
  const parseTime = (val: string) => {
    const match = val.match(/(\d{1,2}):(\d{2})\s?(AM|PM)?/i);
    if (match) {
      return {
        h: match[1].padStart(2, '0'),
        m: match[2],
        p: (match[3] || 'AM').toUpperCase() as 'AM' | 'PM'
      };
    }
    return { h: '12', m: '00', p: 'AM' as const };
  };

  const initial = parseTime(value);
  const [hours, setHours] = useState(initial.h);
  const [minutes, setMinutes] = useState(initial.m);
  const [period, setPeriod] = useState<'AM' | 'PM'>(initial.p);
  const [isSelectOpen, setIsSelectOpen] = useState(false);

  const hourRef = useRef<HTMLInputElement>(null);
  const minRef = useRef<HTMLInputElement>(null);

  const [prevValue, setPrevValue] = useState(value);
  if (value !== prevValue) {
    const next = parseTime(value);
    setHours(next.h);
    setMinutes(next.m);
    setPeriod(next.p);
    setPrevValue(value);
  }

  const updateTime = (h: string, m: string, p: 'AM' | 'PM') => {
    // Ensure we don't send empty strings back
    const finalH = h.padStart(2, '0');
    const finalM = m.padStart(2, '0');
    onChange(`${finalH}:${finalM} ${p}`);
  };

  const handleHourChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/\D/g, '').slice(-2);

    if (val.length === 1 && parseInt(val) > 1 && parseInt(val) <= 9) {
      val = '0' + val;
      setHours(val);
      minRef.current?.focus();
      minRef.current?.select();
    } else if (val.length === 2) {
      const hInt = parseInt(val);
      if (hInt > 12) val = '12';
      if (hInt === 0) val = '12';
      setHours(val);
      minRef.current?.focus();
      minRef.current?.select();
    } else {
      setHours(val || '00');
    }
    updateTime(val || '12', minutes || '00', period);
  };

  const handleMinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/\D/g, '').slice(-2);
    if (val.length === 2) {
      if (parseInt(val) > 59) val = '59';
      setMinutes(val);
      // Auto open select when minutes are done
      setTimeout(() => setIsSelectOpen(true), 100);
    } else {
      setMinutes(val || '00');
    }
    updateTime(hours || '12', val || '00', period);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, type: 'h' | 'm') => {
    if (e.key === 'Backspace') {
      if (type === 'h' && (hours === '' || hours === '00')) {
          e.preventDefault();
          setHours('12'); // default back to 12 if backspacing empty
          minRef.current?.focus();
          minRef.current?.select();
      } else if (type === 'm' && (minutes === '' || minutes === '00')) {
          e.preventDefault();
          setMinutes('00'); // default back to 00 if backspacing empty
          hourRef.current?.focus();
          hourRef.current?.select();
      }
    }

    if (e.key.toLowerCase() === 'a') {
      setPeriod('AM');
      updateTime(hours, minutes, 'AM');
    }
    if (e.key.toLowerCase() === 'p') {
      setPeriod('PM');
      updateTime(hours, minutes, 'PM');
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
    if (type === 'h' && hours === '') setHours('12');
    if (type === 'm' && minutes === '') setMinutes('00');
  }

  return (
    <div
      className={cn("flex justify-end whitespace-nowrap items-center gap-2 p-1 rounded-md border border-input bg-input-background focus-within:ring-4 focus-within:ring-primary/10 transition-all cursor-text", className)}
      onClick={(e) => {
        const target = e.target as HTMLElement;
        if (!target.closest('.timePicker') && !target.closest('[data-slot="select-trigger"]')) {
          hourRef.current?.focus();
        }
      }}
    >
       {/* AM/PM Select next to the time (trailing) */}
      <Select open={isSelectOpen} onOpenChange={setIsSelectOpen} value={period} onValueChange={(val: 'AM' | 'PM') => {
        setPeriod(val);
        updateTime(hours || '12', minutes || '00', val);
      }}>
        <SelectTrigger className="w-fit min-w-[70px] border-border bg-muted/30 h-10 rounded-lg text-sm font-bold focus:ring-0 px-3 shrink-0">
          <SelectValue placeholder="AM/PM" />
        </SelectTrigger>
        <SelectContent className="rounded-xl">
          <SelectItem value="AM">AM</SelectItem>
          <SelectItem value="PM">PM</SelectItem>
        </SelectContent>
      </Select>
      <div className="flex items-center gap-1  px-1" dir="ltr">

        <input
          ref={hourRef}
          type="text"
          inputMode="numeric"
          placeholder="12"
          value={hours}
          onFocus={handleFocus}
          onBlur={() => handleBlur('h')}
          onChange={handleHourChange}
          onKeyDown={(e) => handleKeyDown(e, 'h')}
          className="timePicker w-8 bg-transparent text-center outline-none text-base font-bold placeholder:text-muted-foreground/50"
        />
        <span className="text-muted-foreground font-bold mb-0.5">:</span>
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
          className="timePicker w-8 bg-transparent text-center outline-none text-base font-bold placeholder:text-muted-foreground/50"
        />
      </div>


    </div>
  );
};

export default TimePicker;
