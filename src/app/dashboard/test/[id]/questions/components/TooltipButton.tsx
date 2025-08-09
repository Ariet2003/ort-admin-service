'use client';

import React from 'react';

export interface TooltipButtonProps {
  onClick: () => void;
  tooltip: string;
  children: React.ReactNode;
  className?: string;
  isActive?: boolean;
  disabled?: boolean;
}

const TooltipButton: React.FC<TooltipButtonProps> = ({ onClick, tooltip, children, className = '', isActive = false, disabled = false }) => {
  const [tooltipPosition, setTooltipPosition] = React.useState({ x: 0, y: 0 });
  const buttonRef = React.useRef<HTMLButtonElement>(null);

  const updateTooltipPosition = () => {
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setTooltipPosition({
        x: rect.left + rect.width / 2,
        y: rect.top
      });
    }
  };

  React.useEffect(() => {
    window.addEventListener('scroll', updateTooltipPosition);
    window.addEventListener('resize', updateTooltipPosition);
    return () => {
      window.removeEventListener('scroll', updateTooltipPosition);
      window.removeEventListener('resize', updateTooltipPosition);
    };
  }, []);

  return (
    <div className="relative group/tooltip inline-flex" onMouseEnter={updateTooltipPosition}>
      <button
        ref={buttonRef}
        onClick={onClick}
        disabled={disabled}
        className={`relative ${className} ${isActive ? 'text-[#00ff41]' : ''} ${disabled ? 'cursor-not-allowed opacity-50' : ''}`}
      >
        {children}
      </button>
      <div 
        className="fixed px-2 py-1 text-xs pointer-events-none opacity-0 group-hover/tooltip:opacity-100
          bg-[#161b1e] text-[#667177] rounded-md shadow-lg border border-[#667177]/20 z-[9999] 
          transition-all duration-200 whitespace-nowrap before:content-[''] before:absolute before:top-full 
          before:left-1/2 before:-translate-x-1/2 before:border-4 before:border-transparent
          before:border-t-[#161b1e]"
        style={{
          left: tooltipPosition.x,
          top: tooltipPosition.y - 8,
          transform: 'translate(-50%, -100%)'
        }}
      >
        {tooltip}
      </div>
    </div>
  );
};

export default TooltipButton;