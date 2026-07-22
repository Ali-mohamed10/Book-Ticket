import { forwardRef } from 'react';
import { Loader2 } from 'lucide-react';

export const FormButton = forwardRef(
  ({ children, isLoading, variant = 'primary', className = '', ...props }, ref) => {
    const baseStyles = 'flex items-center justify-center gap-2 px-4 py-2 rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-background disabled:opacity-50 disabled:cursor-not-allowed';
    
    const variants = {
      primary: 'bg-primary text-primary-foreground hover:bg-primary/90 focus:ring-ring',
      secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/90 focus:ring-ring',
      outline: 'border border-border text-foreground hover:bg-secondary/20 focus:ring-ring',
    };

    return (
      <button
        ref={ref}
        className={`${baseStyles} ${variants[variant]} ${className}`}
        disabled={isLoading || props.disabled}
        {...props}
      >
        {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
        {children}
      </button>
    );
  }
);

FormButton.displayName = 'FormButton';
