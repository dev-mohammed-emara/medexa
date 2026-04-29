import React, { type InputHTMLAttributes } from 'react'
import { cn } from '../../utils/cn'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  icon?: React.ReactNode
  containerClassName?: string
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, icon, containerClassName, onChange, ...props }, ref) => {
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
      let value = e.target.value;

      // Always convert Arabic numerals to English numbers
      value = value.replace(/[٠-٩]/g, (d) => "٠١٢٣٤٥٦٧٨٩".indexOf(d).toString());

      if (type === 'tel') {
        // Only allow numbers
        value = value.replace(/\D/g, '');
      } else if (type === 'number') {
        // Ensure no negative value even if bypasses keydown (e.g. mobile or weird browsers)
        value = value.replace(/-/g, '');
        if (value && parseFloat(value) < 0) value = '0';
      } else if (
        props.name?.toLowerCase().includes('name') ||
        props.name?.toLowerCase().includes('role') ||
        props.name?.toLowerCase().includes('country') ||
        props.name?.toLowerCase().includes('city') ||
        props.name?.toLowerCase().includes('surname')
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

    return (
      <div className={cn("relative w-full group", containerClassName)}>
        {icon && (
          <div className={cn(
            "absolute top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none group-focus-within:text-primary transition-colors z-10",
            props.dir === 'ltr' ? "left-4" : "right-4"
          )}>
            {icon}
          </div>
        )}
        <input
          type={type === 'tel' ? 'text' : type} // Change tel to text to avoid mobile keyboard issues with regex stripping
          inputMode={type === 'tel' || type === 'number' ? 'numeric' : undefined}
          min={type === 'number' ? "0" : props.min}
          className={cn(
            "flex w-full rounded-xl border border-border bg-input-background h-12 px-4 py-2 text-base transition-all outline-none",
            "placeholder:text-muted-foreground",
            "focus:border-primary focus:ring-4 focus:ring-primary/10",
            "disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
            icon && (props.dir === 'ltr' ? "pl-12" : "pr-12"),
            className
          )}
          ref={ref}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onPaste={handlePaste}
          {...props}
        />
      </div>
    )
  }
)
Input.displayName = "Input"

export default Input
