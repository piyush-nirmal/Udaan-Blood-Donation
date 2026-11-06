import React, { useEffect, useRef } from 'react';
import { X } from 'lucide-react';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  children: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  showCloseButton?: boolean;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  maxWidth = 'md',
  showCloseButton = true,
}) => {
  const modalRef = useRef<HTMLDivElement | null>(null);

  // Close on Escape & trap basic focus
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const maxWidthClass = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
  }[maxWidth];

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex flex-col justify-end sm:justify-center items-center p-0 sm:p-4 bg-[#1C1917]/50 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        ref={modalRef}
        className={`w-full ${maxWidthClass} bg-white rounded-t-[20px] sm:rounded-[16px] shadow-[0_8px_32px_rgba(28,25,23,0.18)] border border-[#E8E0DA] flex flex-col max-h-[92vh] sm:max-h-[88vh] overflow-hidden animate-in slide-in-from-bottom-6 sm:slide-in-from-bottom-2 duration-200`}
      >
        {/* Mobile handle pull */}
        <div className="sm:hidden flex justify-center pt-2 pb-1" aria-hidden="true">
          <div className="w-10 h-1 bg-[#E8E0DA] rounded-full" />
        </div>

        {(title || showCloseButton) && (
          <div className="px-5 py-4 border-b border-[#E8E0DA] flex items-center justify-between gap-3 bg-white shrink-0">
            <div>
              {title && (
                <h3 className="text-base sm:text-lg font-bold text-[#1C1917] tracking-tight leading-snug">
                  {title}
                </h3>
              )}
              {subtitle && (
                <p className="text-xs text-[#6B625C] mt-0.5 leading-relaxed">{subtitle}</p>
              )}
            </div>
            {showCloseButton && (
              <button
                type="button"
                onClick={onClose}
                aria-label="Close dialog"
                className="w-11 h-11 -mr-2 rounded-xl flex items-center justify-center text-[#6B625C] hover:text-[#1C1917] hover:bg-[#F3EEEA] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D62839]"
              >
                <X className="w-5 h-5 stroke-[1.75]" />
              </button>
            )}
          </div>
        )}

        <div className="p-5 overflow-y-auto flex-1">{children}</div>
      </div>
    </div>
  );
};
