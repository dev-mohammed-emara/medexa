import React, { type InputHTMLAttributes } from 'react'
import { cn } from '../../utils/cn'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  icon?: React.ReactNode
  containerClassName?: string
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, icon, containerClassName, onChange, ...props }, ref) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      let value = e.target.value;
      
      // Always convert Arabic numerals to English numbers
      value = value.replace(/[٠-٩]/g, (d) => "٠١٢٣٤٥٦٧٨٩".indexOf(d).toString());

      if (type === 'tel') {
        // Only allow numbers
        value = value.replace(/\D/g, '');
      } else if (
        props.name?.toLowerCase().includes('name') || 
        props.name?.toLowerCase().includes('role') ||
        props.name?.toLowerCase().includes('country') ||
        props.name?.toLowerCase().includes('city')
      ) {
        // Only allow letters (including Arabic) and spaces
        value = value.replace(/[^a-zA-Z\u0600-\u06FF\s]/g, '');
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
      <div className={cn("relative w-full", containerClassName)}>
        {icon && (
          <div className={cn(
            "absolute top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none group-focus-within:text-primary transition-colors",
            props.dir === 'ltr' ? "left-4" : "right-4"
          )}>
            {icon}
          </div>
        )}
        <input
          type={type === 'tel' ? 'text' : type} // Change tel to text to avoid mobile keyboard issues with regex stripping
          inputMode={type === 'tel' ? 'numeric' : undefined}
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
          {...props}
        />
      </div>
    )
  }
)
Input.displayName = "Input"

export default Input
