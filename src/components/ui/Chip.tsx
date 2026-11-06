import React from 'react';

export interface ChipProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  selected?: boolean;
  count?: number | string;
  icon?: React.ReactNode;
  dotColor?: string;
}

export const Chip: React.FC<ChipProps> = ({
  children,
  selected = false,
  count,
  icon,
  dotColor,
  className = '',
  ...props
}) => {
  return (
    <button
      type="button"
      aria-pressed={selected}
      className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold tracking-tight transition-all duration-150 select-none min-h-[36px] cursor-pointer border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D62839] focus-visible:ring-offset-1 shrink-0 ${
        selected
          ? 'bg-[#1C1917] text-white border-[#1C1917] shadow-sm'
          : 'bg-white text-[#1C1917] border-[#E8E0DA] hover:bg-[#F3EEEA] hover:border-[#D5CCC4]'
      } ${className}`}
      {...props}
    >
      {dotColor && (
        <span
          className="w-2 h-2 rounded-full shrink-0"
          style={{ backgroundColor: dotColor }}
          aria-hidden="true"
        />
      )}
      {icon && <span className="shrink-0">{icon}</span>}
      <span className="truncate">{children}</span>
      {count !== undefined && (
        <span
          className={`ml-0.5 px-1.5 py-0.5 text-[10px] font-bold rounded-full tabular-nums ${
            selected ? 'bg-white/20 text-white' : 'bg-[#F3EEEA] text-[#6B625C]'
          }`}
        >
          {count}
        </span>
      )}
    </button>
  );
};
