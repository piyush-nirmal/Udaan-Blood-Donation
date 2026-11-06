import React from 'react';
import { Check, AlertCircle, Info, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info';

export interface ToastProps {
  message: string | null;
  type?: ToastType;
  onClose: () => void;
}

export const Toast: React.FC<ToastProps> = ({ message, type = 'success', onClose }) => {
  if (!message) return null;

  const icons = {
    success: <Check className="w-4 h-4 text-[#1F8A5B] shrink-0 stroke-[2]" />,
    error: <AlertCircle className="w-4 h-4 text-[#D62839] shrink-0 stroke-[2]" />,
    info: <Info className="w-4 h-4 text-[#3B5B7A] shrink-0 stroke-[2]" />,
  };

  const borders = {
    success: 'border-[#1F8A5B]/30',
    error: 'border-[#D62839]/30',
    info: 'border-[#3B5B7A]/30',
  };

  return (
    <div
      role="status"
      aria-live="polite"
      className={`fixed bottom-20 md:bottom-6 right-4 sm:right-6 z-50 max-w-sm w-full sm:w-auto bg-[#1C1917] text-white px-4 py-3 rounded-[12px] shadow-[0_8px_24px_rgba(28,25,23,0.18)] flex items-center gap-3 border ${borders[type]} animate-in fade-in slide-in-from-bottom-3 duration-200`}
    >
      <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center shrink-0">
        {icons[type]}
      </div>
      <p className="text-xs font-medium text-white flex-1 leading-snug">{message}</p>
      <button
        type="button"
        onClick={onClose}
        aria-label="Dismiss message"
        className="text-[#E8E0DA]/70 hover:text-white p-1 rounded-lg transition-colors shrink-0 min-h-[32px] min-w-[32px] flex items-center justify-center"
      >
        <X className="w-4 h-4 stroke-[1.75]" />
      </button>
    </div>
  );
};
