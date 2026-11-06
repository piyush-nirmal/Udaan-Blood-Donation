import React from 'react';
import { Droplet } from 'lucide-react';

export interface ProgressDropsProps {
  needed: number;
  donated: number;
  label?: string;
  className?: string;
}

export const ProgressDrops: React.FC<ProgressDropsProps> = ({
  needed,
  donated,
  label,
  className = '',
}) => {
  const total = Math.max(1, Math.min(needed, 10));
  const filled = Math.min(donated, total);

  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <div className="flex items-center gap-1 shrink-0" aria-hidden="true">
        {Array.from({ length: total }).map((_, index) => {
          const isDonated = index < filled;
          return (
            <div
              key={index}
              className={`transition-colors duration-200 ${
                isDonated ? 'text-[#D62839]' : 'text-[#E8E0DA]'
              }`}
              title={isDonated ? 'Unit Donated' : 'Unit Needed'}
            >
              <Droplet
                className={`w-3.5 h-3.5 stroke-[1.75] ${
                  isDonated ? 'fill-[#D62839]' : 'fill-none'
                }`}
              />
            </div>
          );
        })}
      </div>

      <span className="text-xs text-[#6B625C] font-medium tabular-nums">
        {label || `${filled} of ${needed} units`}
      </span>
    </div>
  );
};
