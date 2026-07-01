import React, { type InputHTMLAttributes, useState, useEffect } from 'react'
import { cn } from '../../utils/cn'
import { Eye, EyeOff } from 'lucide-react'
import { useLanguage } from '../../contexts/LanguageContext'
import { useFieldError } from '../../hooks/useFieldError'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  icon?: React.ReactNode
  containerClassName?: string
  error?: string | boolean
  backendField?: string | string[]
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, icon, containerClassName, onChange, backendField, ...props }, ref) => {
    const [showPassword, setShowPassword] = useState(false);
    const [errorMsgs, setErrorMsgs] = useState<string[]>([]);
    const isPassword = type === 'password';
    
    const { isAr } = useLanguage();
    
    const fieldsToCheck = [];
    if (props.name) fieldsToCheck.push(props.name);
    if (backendField) {
      if (Array.isArray(backendField)) fieldsToCheck.push(...backendField);
      else fieldsToCheck.push(backendField);
    }
    
    const { backendError, backendErrors, setBackendError, setBackendErrors } = useFieldError(fieldsToCheck.length > 0 ? fieldsToCheck : undefined);

    useEffect(() => {
      if (backendErrors && backendErrors.length > 0) {
        setErrorMsgs(backendErrors);
      } else if (backendError) {
        setErrorMsgs([backendError]);
      } else {
        setErrorMsgs([]);
      }
    }, [backendError, backendErrors]);

    const handleInvalid = (e: React.InvalidEvent<HTMLInputElement>) => {
      e.preventDefault();
      const target = e.target as HTMLInputElement;
      let msg = '';
      
      // Translate default HTML5 messages based on language
      if (target.validity.valueMissing) {
        msg = isAr ? 'يرجى ملء هذا الحقل' : 'Please fill out this field.';
      } else if (target.validity.typeMismatch && type === 'email') {
        msg = isAr ? 'يرجى إدخال عنوان بريد إلكتروني صحيح' : 'Please enter a valid email address.';
      } else {
        msg = target.validationMessage;
      }
      setErrorMsgs([msg]);
      
      if (props.onInvalid) props.onInvalid(e);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      // Prevent negative sign and exponent 'e' in number inputs as per user request
      if (type === 'number' && (e.key === '-' || e.key === 'e' || e.key === 'E')) {
        e.preventDefault();
      }
      if (props.onKeyDown) props.onKeyDown(e);
    };

    const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
      if (type === 'number') {
        const pasteData = e.clipboardData.getData('text');
        if (pasteData.includes('-')) {
          e.preventDefault();
          const cleanData = pasteData.replace(/-/g, '');
          const target = e.target as HTMLInputElement;
          const start = target.selectionStart || 0;
          const end = target.selectionEnd || 0;
          const newValue = target.value.substring(0, start) + cleanData + target.value.substring(end);

          // Trigger change manually
          const event = {
            target: { value: newValue, name: props.name || '' }
          } as unknown as React.ChangeEvent<HTMLInputElement>;
          if (onChange) onChange(event);
        }
      }
      if (props.onPaste) props.onPaste(e);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (errorMsgs.length > 0) setErrorMsgs([]);
      if (backendError) setBackendError(null);
      if (backendErrors.length > 0) setBackendErrors([]);
      let value = e.target.value;

      // Always convert Arabic numerals to English numbers
      value = value.replace(/[٠-٩]/g, (d) => "٠١٢٣٤٥٦٧٨٩".indexOf(d).toString());

      if (type === 'tel') {
        // Only allow numbers and plus sign
        value = value.replace(/[^\d+]/g, '');
        // Ensure plus sign is only at the beginning
        if (value.indexOf('+') > 0) {
          value = value.charAt(0) + value.substring(1).replace(/\+/g, '');
        }
      } else if (type === 'number') {
        // Ensure no negative value even if bypasses keydown (e.g. mobile or weird browsers)
        value = value.replace(/-/g, '');
        // Strip leading zeros if followed by another digit
        value = value.replace(/^0+(?=\d)/, '');
        if (value && parseFloat(value) < 0) value = '0';
      } else if (
        props.name?.toLowerCase().includes('role') ||
        props.name?.toLowerCase().includes('country') ||
        props.name?.toLowerCase().includes('city')
      ) {
        // Only allow letters (any language) and spaces
        value = value.replace(/[^\p{L}\s]/gu, '');
      }

      if (onChange) {
        // Create a fake event object with the cleaned value
        const event = {
          ...e,
          target: { ...e.target, value, name: props.name || '' }
        } as React.ChangeEvent<HTMLInputElement>;
        onChange(event);
      }
    };

    const hasError = errorMsgs.length > 0 || !!props.error;

    return (
      <div className={cn("w-full flex flex-col", containerClassName)} data-has-error={hasError}>
        <div className="relative w-full group">
          {icon && (
            <div className={cn(
              "absolute top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none group-focus-within:text-primary transition-colors z-10",
              props.dir === 'ltr' ? "left-4" : "right-4"
            )}>
              {icon}
            </div>
          )}
          <input
            type={type === 'tel' ? 'text' : (isPassword ? (showPassword ? 'text' : 'password') : type)}
            inputMode={type === 'tel' ? 'tel' : (type === 'number' ? 'numeric' : undefined)}
            min={type === 'number' ? "0" : props.min}
            className={cn(
              "flex w-full rounded-xl border border-border bg-input-background h-12 px-4 py-2 text-base transition-all outline-none",
              "placeholder:text-muted-foreground",
              "focus:border-primary focus:ring-4 focus:ring-primary/10",
              "disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
              icon && (props.dir === 'ltr' ? "pl-12" : "pr-12"),
              isPassword && (props.dir === 'ltr' ? "pr-12" : "pl-12"),
              hasError && "border-destructive focus:border-destructive focus:ring-destructive/10 bg-destructive/5 text-destructive",
              className
            )}
            ref={ref}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            onPaste={handlePaste}
            onInvalid={handleInvalid}
            {...props}
          />
          {isPassword && (
            <button
              type="button"
              onClick={() => setShowPassword(prev => !prev)}
              className={cn(
                "absolute top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors cursor-pointer z-10 p-1 rounded",
                props.dir === 'ltr' ? "right-3" : "left-3"
              )}
            >
              {showPassword ? <EyeOff className="size-5" /> : <Eye className="size-5" />}
            </button>
          )}
        </div>
        {(hasError || (typeof props.error === 'string' && props.error)) && (
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
Input.displayName = "Input"

export default Input
