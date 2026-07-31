import { forwardRef } from 'react';

export const FormTextarea = forwardRef(({ label, error, className = '', ...props }, ref) => {
  return (
    <div className="flex flex-col gap-1.5 w-full">
      {label && (
        <label className="text-sm font-medium text-foreground">
          {label}
        </label>
      )}
      <textarea
        ref={ref}
        className={`
          w-full px-3 py-2 bg-background border rounded-md text-sm
          transition-colors focus:outline-none focus:ring-2 focus:ring-primary/20
          min-h-25 resize-y
          ${error ? 'border-destructive focus:border-destructive' : 'border-input focus:border-primary'}
          ${className}
        `}
        {...props}
      />
      {error && (
        <p className="text-xs text-destructive animate-fade-in">{error}</p>
      )}
    </div>
  );
});

FormTextarea.displayName = 'FormTextarea';
