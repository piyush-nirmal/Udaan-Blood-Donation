import React from 'react';

export interface BloodTileProps {
  bloodGroup: string;
  componentType?: string;
  showComponentLabel?: boolean;
  className?: string;
  onClick?: () => void;
}

export const BloodTile: React.FC<BloodTileProps> = ({
  bloodGroup,
  componentType,
  showComponentLabel = true,
  className = '',
  onClick,
}) => {
  const isUniversal = bloodGroup.trim().toUpperCase() === 'O-';
  const formattedComponent = componentType
    ? componentType.replace(/_/g, ' ').toLowerCase()
    : undefined;

  return (
    <div className={`flex flex-col items-center shrink-0 ${className}`}>
      <div
        onClick={onClick}
        className={`w-14 h-14 min-w-[56px] min-h-[56px] rounded-2xl bg-[#FDECEE] text-[#D62839] flex items-center justify-center select-none transition-all duration-150 ${
          isUniversal ? 'ring-2 ring-[#D62839]/40 ring-offset-2' : ''
        } ${onClick ? 'cursor-pointer hover:bg-[#FCD8DC] active:scale-95' : ''}`}
        title={isUniversal ? `${bloodGroup} (Universal Donor)` : bloodGroup}
      >
        <span className="text-[22px] font-bold tracking-tight leading-none">
          {bloodGroup}
        </span>
      </div>

      {showComponentLabel && formattedComponent && (
        <span className="text-[10px] uppercase font-semibold text-[#6B625C] tracking-wide mt-1 text-center truncate max-w-[64px]">
          {formattedComponent}
        </span>
      )}
    </div>
  );
};
