import React from 'react';

export type UrgencyType = 'critical' | 'urgent' | 'scheduled';
export type StatusType =
  | 'Pending'
  | 'Matched'
  | 'PartiallyFulfilled'
  | 'Fulfilled'
  | 'Interested'
  | 'Confirmed'
  | 'Waitlisted'
  | 'NoShow'
  | 'Donated'
  | 'Cancelled'
  | 'verified'
  | 'available'
  | 'filling_fast'
  | 'full';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  urgency?: UrgencyType;
  status?: StatusType | string;
  hasPulse?: boolean;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  urgency,
  status,
  hasPulse,
  className = '',
  ...props
}) => {
  let colorStyles = 'bg-[#F3EEEA] text-[#1C1917] border-[#E8E0DA]';
  let showPulse = hasPulse;

  if (urgency) {
    switch (urgency) {
      case 'critical':
        colorStyles = 'bg-[#FDECEE] text-[#D62839] border-[#D62839]/30 font-bold';
        if (hasPulse === undefined) showPulse = true;
        break;
      case 'urgent':
        colorStyles = 'bg-[#FFF3DC] text-[#C77700] border-[#C77700]/30 font-semibold';
        break;
      case 'scheduled':
        colorStyles = 'bg-[#EBF0F5] text-[#3B5B7A] border-[#3B5B7A]/30 font-medium';
        break;
    }
  } else if (status) {
    switch (status) {
      case 'Fulfilled':
      case 'Donated':
      case 'Confirmed':
      case 'verified':
      case 'available':
        colorStyles = 'bg-[#E6F4EC] text-[#1F8A5B] border-[#1F8A5B]/30 font-semibold';
        break;
      case 'Matched':
      case 'PartiallyFulfilled':
      case 'Waitlisted':
      case 'filling_fast':
        colorStyles = 'bg-[#FFF3DC] text-[#C77700] border-[#C77700]/30 font-semibold';
        break;
      case 'NoShow':
      case 'Cancelled':
      case 'full':
        colorStyles = 'bg-[#FDECEE] text-[#D62839] border-[#D62839]/30 font-medium';
        break;
      case 'Pending':
      case 'Interested':
      default:
        colorStyles = 'bg-[#F3EEEA] text-[#6B625C] border-[#E8E0DA] font-medium';
        break;
    }
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs border tracking-tight shrink-0 select-none ${colorStyles} ${className}`}
      {...props}
    >
      {showPulse && (
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#D62839] opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-[#D62839]"></span>
        </span>
      )}
      <span>{children}</span>
    </span>
  );
};
