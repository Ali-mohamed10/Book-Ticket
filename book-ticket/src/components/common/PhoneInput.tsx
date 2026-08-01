import React, { memo } from 'react';
import { PhoneInput as ReactInternationalPhone } from 'react-international-phone';
import 'react-international-phone/style.css';

interface PhoneInputProps {
  value?: string;
  onChange?: (phone: string) => void;
  error?: string;
  disabled?: boolean;
  placeholder?: string;
}

const PhoneInput = memo(({ value, onChange, error, disabled, placeholder }: PhoneInputProps) => {
  return (
    <div className="w-full flex flex-col gap-1.5">
      <div
        className={`flex w-full items-center bg-background border rounded-md transition-colors focus-within:ring-2 focus-within:ring-ring/20 focus-within:border-primary ${
          error ? 'border-destructive' : 'border-input'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        <ReactInternationalPhone
          defaultCountry="ca"
          disableCountryGuess
          value={value}
          onChange={onChange}
          disabled={disabled}
          className="w-full flex! [&>.react-international-phone-input]:w-full!"
          inputClassName="bg-transparent! border-none! text-sm! text-foreground! h-auto! py-2.5! px-3! placeholder:text-muted-foreground/50! focus:outline-none! focus:ring-0!"
          countrySelectorStyleProps={{
            buttonClassName: 'bg-transparent! border-none! border-r! border-input! h-auto! py-2.5! pl-3! pr-2! rounded-l-md! hover:bg-muted/50! transition-colors',
          }}
          placeholder={placeholder}
        />
      </div>
      {error && (
        <span className="text-xs text-destructive" aria-live="polite">
          {error}
        </span>
      )}
    </div>
  );
});

PhoneInput.displayName = 'PhoneInput';
export default PhoneInput;
