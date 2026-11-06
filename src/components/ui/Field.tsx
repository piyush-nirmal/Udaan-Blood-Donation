import React, { useId } from 'react';
import { AlertCircle } from 'lucide-react';

export interface FieldProps {
  label: string;
  hint?: string;
  error?: string;
  required?: boolean;
  children: (props: { id: string; 'aria-describedby'?: string; 'aria-invalid'?: boolean }) => React.ReactNode;
  className?: string;
}

export const Field: React.FC<FieldProps> = ({
  label,
  hint,
  error,
  required,
  children,
  className = '',
}) => {
  const generatedId = useId();
  const inputId = `field-${generatedId}`;
  const hintId = hint ? `hint-${generatedId}` : undefined;
  const errorId = error ? `error-${generatedId}` : undefined;

  const describedBy = [hintId, errorId].filter(Boolean).join(' ') || undefined;

  return (
    <div className={`space-y-1.5 ${className}`}>
      <div className="flex items-center justify-between gap-2">
        <label
          htmlFor={inputId}
          className="block text-xs font-semibold text-[#1C1917] tracking-tight"
        >
          {label}
          {required && <span className="text-[#D62839] ml-1" aria-hidden="true">*</span>}
        </label>
      </div>

      {children({
        id: inputId,
        'aria-describedby': describedBy,
        'aria-invalid': Boolean(error),
      })}

      {error ? (
        <p
          id={errorId}
          className="flex items-center gap-1.5 text-xs text-[#D62839] font-medium mt-1 animate-in fade-in"
        >
          <AlertCircle className="w-3.5 h-3.5 shrink-0 stroke-[1.75]" />
          <span>{error}</span>
        </p>
      ) : hint ? (
        <p id={hintId} className="text-[11px] text-[#6B625C] mt-0.5">
          {hint}
        </p>
      ) : null}
    </div>
  );
};
