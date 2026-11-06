import React from 'react';
import { RequestStatus, ResponseStatus } from '../types/api';

interface StatusChipProps {
  status: RequestStatus | ResponseStatus;
  type?: 'request' | 'response';
}

export const StatusChip: React.FC<StatusChipProps> = ({ status, type = 'request' }) => {
  const getStyles = () => {
    switch (status) {
      case 'Fulfilled':
      case 'Donated':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'Confirmed':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'Matched':
      case 'PartiallyFulfilled':
      case 'Interested':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'Waitlisted':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'Pending':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      case 'NoShow':
      case 'Cancelled':
        return 'bg-slate-100 text-slate-500 border-slate-200';
      default:
        return 'bg-slate-50 text-slate-600 border-slate-200';
    }
  };

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold border ${getStyles()} tracking-tight whitespace-nowrap`}
    >
      {status}
    </span>
  );
};
