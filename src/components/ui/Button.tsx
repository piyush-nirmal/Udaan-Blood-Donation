import React from 'react';
import { Loader2 } from 'lucide-react';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'outline' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      variant = 'primary',
      size = 'md',
      isLoading = false,
      leftIcon,
      rightIcon,
      disabled,
      className = '',
      ...props
    },
    ref
  ) => {
    const baseStyles =
      'inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-150 select-none min-h-[44px] cursor-pointer disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D62839] focus-visible:ring-offset-2 active:scale-[0.98]';

    const sizeStyles = {
      sm: 'px-3 py-1.5 text-xs gap-1.5 min-w-[36px]',
      md: 'px-4 py-2.5 text-sm gap-2 min-w-[44px]',
      lg: 'px-6 py-3.5 text-base gap-2.5 min-w-[48px]',
    }[size];

    const variantStyles = {
      primary:
        'bg-[#D62839] text-white hover:bg-[#B81F2E] shadow-sm shadow-[#D62839]/20 border border-transparent',
      secondary:
        'bg-[#F3EEEA] text-[#1C1917] hover:bg-[#E8E0DA] border border-[#E8E0DA]/80',
      outline:
        'bg-white text-[#1C1917] hover:bg-[#FAF7F5] border border-[#E8E0DA]',
      ghost:
        'bg-transparent text-[#1C1917] hover:bg-[#F3EEEA] border border-transparent',
      danger:
        'bg-rose-50 text-[#D62839] hover:bg-[#FDECEE] border border-rose-200',
    }[variant];

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        aria-busy={isLoading}
        className={`${baseStyles} ${sizeStyles} ${variantStyles} ${className}`}
        {...props}
      >
        {isLoading ? (
          <Loader2 className="w-4 h-4 animate-spin shrink-0" />
        ) : (
          leftIcon && <span className="shrink-0">{leftIcon}</span>
        )}
        <span>{children}</span>
        {!isLoading && rightIcon && <span className="shrink-0">{rightIcon}</span>}
      </button>
    );
  }
);

Button.displayName = 'Button';
