import * as React from 'react';
import { cn } from '../../utils/cn';

interface EmptyShellProps {
  title: string;
  description: string;
  buttonText?: React.ReactNode;
  onButtonClick?: () => void;
  icon?: React.ComponentType<{ className?: string }>;
  className?: string;
}

export const EmptyShell: React.FC<EmptyShellProps> = ({
  title,
  description,
  buttonText,
  onButtonClick,
  icon: Icon,
  className
}) => {
  return (
    <div className={cn("flex flex-col items-center justify-center py-20 text-center bg-white rounded-xl border border-border shadow-md w-full", className)}>
      <div className="size-20 rounded-full bg-primary/10 flex items-center justify-center mb-6">
        {Icon ? (
          <Icon className="size-10 text-primary" />
        ) : (
          <svg stroke="currentColor" fill="none" strokeWidth="1.5" viewBox="0 0 24 24" aria-hidden="true" className="size-10 text-primary" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12"></path>
          </svg>
        )}
      </div>
      <h3 className="text-2xl font-bold text-foreground mb-2">{title}</h3>
      <p className="text-muted-foreground max-w-md mb-6">{description}</p>
      {buttonText && onButtonClick && (
        <button
          onClick={onButtonClick}
          className="inline-flex items-center justify-center gap-2 rounded-xl text-white bg-primary hover:bg-primary/90 h-11 px-6 shadow-md transition-all font-bold"
        >
          {buttonText}
        </button>
      )}
    </div>
  );
};

export default EmptyShell;
