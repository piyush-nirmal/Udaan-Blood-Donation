import React from 'react';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  interactive?: boolean;
  subtle?: boolean;
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ children, interactive = false, subtle = false, className = '', ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={`rounded-[12px] border transition-all duration-150 p-4 sm:p-5 ${
          subtle
            ? 'bg-[#F3EEEA] border-[#E8E0DA]/80'
            : 'bg-white border-[#E8E0DA] shadow-[0_1px_2px_rgba(28,25,23,0.06)]'
        } ${
          interactive
            ? 'hover:shadow-[0_8px_24px_rgba(28,25,23,0.08)] hover:-translate-y-0.5 cursor-pointer'
            : ''
        } ${className}`}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';
