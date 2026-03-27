
import { Clock } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';
import { cn } from '../../utils/cn';

interface TimePickerProps {
  value: string; // "HH:MM" (24h format internally)
  onChange: (value: string) => void;
  className?: string;
  noClock?: boolean;
}

const TimePicker: React.FC<TimePickerProps> = ({ value, onChange, className, noClock = false }) => {
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

  const [hours, setHours] = useState('');
  const [minutes, setMinutes] = useState('');
  const [period, setPeriod] = useState<'AM' | 'PM'>('AM');

  useEffect(() => {
    const initial = parseTo12h(value || '08:00');
    setHours(initial.h);
    setMinutes(initial.m);
    setPeriod(initial.p);
  }, []);

  useEffect(() => {
    const next = parseTo12h(value);
    const currentH24 = (parseInt(hours) % 12 + (period === 'PM' ? 12 : 0)).toString().padStart(2, '0');
    if (value !== `${currentH24}:${minutes}`) {
      setHours(next.h);
      setMinutes(next.m);
      setPeriod(next.p);
    }
  }, [value]);

  const containerRef = useRef<HTMLDivElement>(null);
  const hourRef = useRef<HTMLInputElement>(null);
  const minRef = useRef<HTMLInputElement>(null);

  const updateTime = (h: string, m: string, p: 'AM' | 'PM') => {
    let hInt = parseInt(h);
    if (isNaN(hInt)) hInt = 12;
    if (p === 'PM' && hInt < 12) hInt += 12;
    if (p === 'AM' && hInt === 12) hInt = 0;

    const finalH24 = hInt.toString().padStart(2, '0');
    const finalM = (m || '00').padStart(2, '0');
    onChange(`${finalH24}:${finalM}`);
  };

  const handleHourChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/\D/g, '').slice(-2);
    const hInt = parseInt(val);

    if (val.length === 1 && hInt >= 2 && hInt <= 9) {
      val = '0' + val;
      setHours(val);
      minRef.current?.focus();
      minRef.current?.select();
    } else if (val.length === 2) {
      if (hInt > 12) val = '12';
      if (hInt === 0) val = '12';
      setHours(val);
      minRef.current?.focus();
      minRef.current?.select();
    } else {
      setHours(val);
    }
    updateTime(val, minutes, period);
  };

  const handleMinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/\D/g, '').slice(-2);
    if (val.length === 2) {
      if (parseInt(val) > 59) val = '59';
      setMinutes(val);
    } else {
      setMinutes(val);
    }
    updateTime(hours, val, period);
  };

  const togglePeriod = () => {
    const nextP = period === 'AM' ? 'PM' : 'AM';
    setPeriod(nextP);
    updateTime(hours, minutes, nextP);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, type: 'h' | 'm') => {
    if (e.key === 'Backspace' && (e.currentTarget.value === '' || e.currentTarget.value === '00')) {
      if (type === 'm') {
        hourRef.current?.focus();
        hourRef.current?.select();
      }
    }
    if (e.key === 'ArrowRight' && type === 'h') {
      minRef.current?.focus();
    }
    if (e.key === 'ArrowLeft' && type === 'm') {
      hourRef.current?.focus();
    }
  };

  return (
    <div
      ref={containerRef}
      className={cn(
        "time-picker-container flex items-center bg-white border border-border rounded-xl transition-all focus-within:ring-2 focus-within:ring-primary/20",
        className
      )}
    >
      <div className="flex items-center gap-1 px-3 py-1.5" dir="ltr">
        {!noClock && <Clock className="size-3.5 text-muted-foreground mr-1" />}
        <input
          ref={hourRef}
          type="text"
          inputMode="numeric"
          value={hours}
          onChange={handleHourChange}
          onKeyDown={(e) => handleKeyDown(e, 'h')}
          onFocus={(e) => e.target.select()}
          className="w-6 bg-transparent text-center outline-none text-sm font-bold"
          placeholder="12"
        />
        <span className="text-muted-foreground font-bold mb-0.5">:</span>
        <input
          ref={minRef}
          type="text"
          inputMode="numeric"
          value={minutes}
          onChange={handleMinChange}
          onKeyDown={(e) => handleKeyDown(e, 'm')}
          onFocus={(e) => e.target.select()}
          className="w-6 bg-transparent text-center outline-none text-sm font-bold"
          placeholder="00"
        />
        <button
          type="button"
          onClick={togglePeriod}
          className="ml-2 px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
        >
          {period}
        </button>
      </div>
    </div>
  );
};

export default TimePicker;
