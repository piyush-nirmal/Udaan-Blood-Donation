import React from 'react';

export interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  action,
  className = '',
}) => {
  return (
    <div
      className={`flex flex-col items-center justify-center text-center p-8 sm:p-12 rounded-[12px] border border-dashed border-[#E8E0DA] bg-white ${className}`}
    >
      <div className="w-12 h-12 rounded-2xl bg-[#FDECEE] text-[#D62839] flex items-center justify-center mb-4">
        {icon}
      </div>
      <h3 className="text-base font-bold text-[#1C1917] tracking-tight mb-1">{title}</h3>
      {description && (
        <p className="text-xs text-[#6B625C] max-w-sm mx-auto leading-relaxed mb-5">
          {description}
        </p>
      )}
      {action && <div className="mt-1">{action}</div>}
    </div>
  );
};
