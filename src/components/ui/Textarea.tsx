import React, { type TextareaHTMLAttributes, useState, useEffect } from 'react'
import { cn } from '../../utils/cn'
import { useLanguage } from '../../contexts/LanguageContext'
import { useFieldError } from '../../hooks/useFieldError'

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  icon?: React.ReactNode
  containerClassName?: string
  error?: string | boolean
  backendField?: string | string[]
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, icon, containerClassName, onChange, backendField, ...props }, ref) => {
    const [errorMsgs, setErrorMsgs] = useState<string[]>([]);
    const { isAr } = useLanguage();

    const fieldsToCheck = [];
    if (props.name) fieldsToCheck.push(props.name);
    if (backendField) {
      if (Array.isArray(backendField)) fieldsToCheck.push(...backendField);
      else fieldsToCheck.push(backendField);
    }

    const { backendError, backendErrors, setBackendError } = useFieldError(fieldsToCheck.length > 0 ? fieldsToCheck : undefined);

    useEffect(() => {
      if (backendErrors && backendErrors.length > 0) {
        setErrorMsgs(backendErrors);
      } else if (backendError) {
        setErrorMsgs([backendError]);
      } else {
        setErrorMsgs([]);
      }
    }, [backendError, backendErrors]);

    const handleInvalid = (e: React.InvalidEvent<HTMLTextAreaElement>) => {
      e.preventDefault();
      const target = e.target as HTMLTextAreaElement;
      let msg = '';
      if (target.validity.valueMissing) {
        msg = isAr ? 'يرجى ملء هذا الحقل' : 'Please fill out this field.';
      } else {
        msg = target.validationMessage;
      }
      setErrorMsgs([msg]);

      if (props.onInvalid) props.onInvalid(e);
    };

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      if (errorMsgs.length > 0) setErrorMsgs([]);
      if (backendError) setBackendError(null);
      if (onChange) onChange(e);
    };

    return (
      <div className={cn("w-full flex flex-col relative", containerClassName)} data-has-error={!!(errorMsgs.length > 0 || props.error)}>
        <div className="relative w-full group">
          {icon && (
            <div className={cn(
              "absolute top-4 text-muted-foreground pointer-events-none group-focus-within:text-primary transition-colors z-10",
              props.dir === 'ltr' ? "left-4" : "right-4"
            )}>
              {icon}
            </div>
          )}
          <textarea
            className={cn(
              "flex w-full rounded-xl border border-border bg-input-background min-h-24 p-4 text-base transition-all outline-none resize-none",
              "placeholder:text-muted-foreground",
              "focus:border-primary focus:ring-4 focus:ring-primary/10",
              "disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
              icon && (props.dir === 'ltr' ? "pl-12" : "pr-12"),
              (errorMsgs.length > 0 || props.error) && "border-destructive focus:border-destructive focus:ring-destructive/10 bg-destructive/5 text-destructive",
              className
            )}
            ref={ref}
            onChange={handleChange}
            onInvalid={handleInvalid}
            {...props}
          />
        </div>
        {((errorMsgs.length > 0) || (typeof props.error === 'string' && props.error)) && (
          <div className="text-[11px] text-destructive mt-1.5 font-bold animate-in fade-in slide-in-from-top-1 text-start">
            {typeof props.error === 'string' && props.error ? (
              <p>{props.error}</p>
            ) : (
              <p>{errorMsgs.join(' || ')}</p>
            )}
          </div>
        )}
      </div>
    )
  }
)
Textarea.displayName = "Textarea"

export default Textarea
