import React, { useState, useEffect, useRef } from 'react';
import Flatpickr from 'react-flatpickr';
import { cn } from '../../utils/cn';
import { useLanguage } from '../../contexts/LanguageContext';
import { useFieldError } from '../../hooks/useFieldError';
import "flatpickr/dist/flatpickr.css";
// Important: Ensure Arabic locale is imported properly where used, or we can just forward props.
// Flatpickr types are usually available via react-flatpickr props.

export interface DatePickerProps extends React.ComponentProps<typeof Flatpickr> {
  name?: string;
  error?: string | boolean;
  containerClassName?: string;
  icon?: React.ReactNode;
  required?: boolean;
  hasBg?: boolean;
}

export const DatePicker = React.forwardRef<any, DatePickerProps>(
  ({ className, containerClassName, name, error, icon, required, hasBg = true, onChange, ...props }, ref) => {
    const { backendError, setBackendError } = useFieldError(name);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const { isAr } = useLanguage();
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
      if (backendError) setErrorMsg(backendError);
    }, [backendError]);

    const handleInvalid = (e: React.SyntheticEvent<HTMLInputElement>) => {
      e.preventDefault();
      const inputEl = e.target as HTMLInputElement;
      if (inputEl.validity.valueMissing) {
        setErrorMsg(isAr ? 'يرجى ملء هذا الحقل' : 'Please fill out this field.');
      } else {
        setErrorMsg(inputEl.validationMessage);
      }
    };

    const handleChange = (dates: Date[], dateStr: string, instance: any) => {
      if (errorMsg) setErrorMsg(null);
      if (backendError) setBackendError(null);
      if (onChange) {
        if (typeof onChange === 'function') {
          onChange(dates, dateStr, instance);
        } else if (Array.isArray(onChange)) {
          onChange.forEach(fn => fn(dates, dateStr, instance));
        }
      }
    };

    const currentError = errorMsg || error;

    return (
      <div 
        ref={containerRef}
        className={cn("w-full flex flex-col", containerClassName)} 
        data-has-error={!!currentError}
        onInvalidCapture={handleInvalid}
      >
        <div className={cn(`relative group flex items-center justify-between w-full h-12 ${hasBg ? 'bg-input-background border' : ''} border-border rounded-xl px-4 transition-all focus-within:ring-4 focus-within:ring-primary/10 data-[error=true]:border-destructive data-[error=true]:focus-within:border-destructive data-[error=true]:focus-within:ring-destructive/10 data-[error=true]:bg-destructive/5`, className)} data-error={!!currentError}>
          <Flatpickr
            ref={ref}
            name={name}
            required={required}
            onChange={handleChange}
            className={cn(
              "flex-1 bg-transparent border-none outline-none text-right font-bold h-full text-base md:text-sm placeholder:font-normal placeholder:text-muted-foreground",
              currentError && "text-destructive",
              className
            )}
            {...props}
          />
          {icon && (
            <div className={cn("pointer-events-none group-focus-within:text-primary transition-colors", currentError ? "text-destructive" : "text-muted-foreground")}>
              {icon}
            </div>
          )}
        </div>
        {(typeof currentError === 'string' && currentError) && (
          <p className="text-[11px] text-destructive mt-1.5 font-bold animate-in fade-in slide-in-from-top-1 text-start">
            {currentError}
          </p>
        )}
      </div>
    );
  }
);

DatePicker.displayName = "DatePicker";
