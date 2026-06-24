import React, { useState, useEffect, useRef } from 'react';
import { DatePicker as MuiDatePicker } from '@mui/x-date-pickers/DatePicker';
import { cn } from '../../utils/cn';
import { useLanguage } from '../../contexts/LanguageContext';
import { useFieldError } from '../../hooks/useFieldError';
import { format, parseISO, isValid } from 'date-fns';

export interface DatePickerProps {
  value?: Date | string | null;
  onChange?: (dates: (Date | null)[], dateStr: string) => void;
  name?: string;
  error?: string | boolean;
  className?: string;
  containerClassName?: string;
  icon?: React.ReactNode;
  required?: boolean;
  hasBg?: boolean;
  backendField?: string | string[];
  useYearSelect?: boolean;
  placeholder?: string;
  id?: string;
  minDate?: Date | null;
  maxDate?: Date | null;
  orientation?: 'portrait' | 'landscape';
  disabled?: boolean;
}

export const DatePicker = React.forwardRef<any, DatePickerProps>(
  (
    {
      value,
      onChange,
      className,
      containerClassName,
      name,
      error,
      icon,
      required,
      hasBg = true,
      backendField,
      useYearSelect,
      placeholder,
      id,
      minDate,
      maxDate,
      orientation,
      disabled,
    },
    ref
  ) => {
    const fieldsToCheck = [];
    if (name) fieldsToCheck.push(name);
    if (backendField) {
      if (Array.isArray(backendField)) fieldsToCheck.push(...backendField);
      else fieldsToCheck.push(backendField);
    }

    const { backendError, setBackendError } = useFieldError(
      fieldsToCheck.length > 0 ? fieldsToCheck : undefined
    );
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const { isAr } = useLanguage();
    const containerRef = useRef<HTMLDivElement>(null);
    const [open, setOpen] = useState(false);

    useEffect(() => {
      if (backendError) setErrorMsg(backendError);
    }, [backendError]);

    const handleChange = (date: Date | null) => {
      if (errorMsg) setErrorMsg(null);
      if (backendError) setBackendError(null);
      
      const dateStr = date && isValid(date) ? format(date, 'yyyy-MM-dd') : '';
      if (onChange) {
        onChange([date], dateStr);
      }
    };

    const currentError = errorMsg || error;

    let parsedValue: Date | null = null;
    if (value instanceof Date && isValid(value)) {
      parsedValue = value;
    } else if (typeof value === 'string' && value.trim() !== '') {
      const parsed = parseISO(value);
      if (isValid(parsed)) parsedValue = parsed;
    }

    return (
      <div
        ref={containerRef}
        className={cn('w-full flex flex-col relative', containerClassName)}
        data-has-error={!!currentError}
      >
        <input
          type="text"
          tabIndex={-1}
          name={name}
          required={required}
          value={parsedValue ? format(parsedValue, 'yyyy-MM-dd') : ''}
          onChange={() => {}}
          className="absolute bottom-0 left-1/2 w-px h-px opacity-0 pointer-events-none -z-10"
          onInvalid={(e) => {
            e.preventDefault();
            const inputEl = e.target as HTMLInputElement;
            if (inputEl.validity.valueMissing) {
              setErrorMsg(
                isAr ? 'يرجى ملء هذا الحقل' : 'Please fill out this field.'
              );
            } else {
              setErrorMsg(inputEl.validationMessage);
            }
          }}
        />
        <div
          className={cn(
            `relative group flex items-center justify-between w-full h-12 ${
              hasBg ? 'bg-input-background border' : ''
            } border-border rounded-xl px-4 transition-all data-[error=true]:border-destructive data-[error=true]:focus-within:border-destructive data-[error=true]:focus-within:ring-destructive/10 data-[error=true]:bg-destructive/5`,
            className
          )}
          data-error={!!currentError}
        >
          <MuiDatePicker
            inputRef={ref}
            value={parsedValue}
            onChange={handleChange}
            minDate={minDate || (useYearSelect ? new Date('1960-01-01') : undefined)}
            maxDate={maxDate || (useYearSelect ? new Date(new Date().getFullYear(), 11, 31) : undefined)}
            views={useYearSelect ? ['year', 'month', 'day'] : ['day']}
            orientation={orientation}
            disabled={disabled}
            open={open}
            onClose={() => setOpen(false)}
            onOpen={() => setOpen(true)}
            slotProps={{
              textField: ({
                id,
                placeholder,
                variant: 'standard',
                InputProps: { disableUnderline: true },
                className: cn(
                  'flex-1 border-none outline-none text-right font-bold h-full text-base md:text-sm placeholder:font-normal placeholder:text-muted-foreground w-full',
                  currentError && 'text-destructive'
                ),
                sx: {
                  '& .MuiInputBase-root': {
                    height: '100%',
                    padding: 0,
                    fontFamily: 'inherit',
                    fontSize: 'inherit',
                    fontWeight: 'inherit',
                    color: 'inherit',
                    '& fieldset': { display: 'none' },
                    '&::before': { display: 'none' },
                    '&::after': { display: 'none' },
                  },
                  '& .MuiInputBase-input': {
                    padding: 0,
                    height: '100%',
                    textAlign: isAr ? 'right' : 'left',
                    '&::placeholder': {
                      opacity: 1,
                      color: 'var(--muted-foreground)',
                      fontWeight: 'normal',
                    },
                  },
                },
              } as any),
              openPickerButton: {
                sx: { display: 'none' }, // We hide the default button because we show a custom icon outside
              },
              popper: {
                sx: {
                  zIndex: 9999,
                },
                ...({'data-lenis-prevent': 'true'} as any)
              },
            }}
          />
          {/* Custom invisible overlay to trigger the date picker using the container click */}
          <div 
            className="absolute inset-0 cursor-pointer z-10"
            onClick={() => setOpen(true)}
          />
          {icon && (
            <div
              className={cn(
                'pointer-events-none group-focus-within:text-primary transition-colors relative z-20',
                currentError ? 'text-destructive' : 'text-muted-foreground'
              )}
            >
              {icon}
            </div>
          )}
        </div>
        {typeof currentError === 'string' && currentError && (
          <p className="text-[11px] text-destructive mt-1.5 font-bold animate-in fade-in slide-in-from-top-1 text-start">
            {currentError}
          </p>
        )}
      </div>
    );
  }
);

DatePicker.displayName = 'DatePicker';
