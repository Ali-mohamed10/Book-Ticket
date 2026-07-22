import { forwardRef, useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

export const FormInput = forwardRef(
  ({ label, error, type = 'text', icon: Icon, ...props }, ref) => {
    const [showPassword, setShowPassword] = useState(false);
    const isPasswordType = type === 'password';
    const currentType = isPasswordType && showPassword ? 'text' : type;

    return (
      <div className="flex flex-col gap-1.5 w-full">
        {label && (
          <div className="text-sm font-medium text-foreground">
            {label}
          </div>
        )}
        <div className="relative">
          {Icon && (
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-foreground">
              <Icon className="w-5 h-5" />
            </div>
          )}
          <input
            ref={ref}
            type={currentType}
            className={`w-full bg-background border rounded-md px-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-colors ${
              Icon ? 'pl-10' : ''
            } ${isPasswordType ? 'pr-10' : ''} ${error ? 'border-destructive focus:ring-destructive' : 'border-border'}`}
            {...props}
          />
          {isPasswordType && (
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-muted-foreground hover:text-foreground focus:outline-none"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          )}
        </div>
        {error && (
          <span className="text-xs text-destructive font-medium">{error}</span>
        )}
      </div>
    );
  }
);

FormInput.displayName = 'FormInput';
