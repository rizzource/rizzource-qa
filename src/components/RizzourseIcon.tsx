import React from 'react';

interface RizzourseIconProps {
  className?: string;
  size?: number;
}

const RizzourseIcon: React.FC<RizzourseIconProps> = ({ className = "", size = 24 }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      className={className}
      fill="currentColor"
    >
      {/* Shield outline */}
      <path
        d="M50 5 L20 20 L20 45 C20 65 35 85 50 95 C65 85 80 65 80 45 L80 20 Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="4"
      />
      
      {/* Scales of Justice */}
      <g transform="translate(50, 35)">
        {/* Scale pole */}
        <line x1="0" y1="-10" x2="0" y2="20" stroke="currentColor" strokeWidth="2"/>
        
        {/* Scale crossbar */}
        <line x1="-15" y1="-5" x2="15" y2="-5" stroke="currentColor" strokeWidth="2"/>
        
        {/* Left scale pan */}
        <path
          d="M-15 -5 L-20 0 L-10 0 Z"
          fill="currentColor"
        />
        
        {/* Right scale pan */}
        <path
          d="M15 -5 L20 0 L10 0 Z"
          fill="currentColor"
        />
        
        {/* Scale chains */}
        <line x1="-15" y1="-5" x2="-15" y2="0" stroke="currentColor" strokeWidth="1"/>
        <line x1="15" y1="-5" x2="15" y2="0" stroke="currentColor" strokeWidth="1"/>
        
        {/* Scale base */}
        <ellipse cx="0" cy="20" rx="3" ry="2" fill="currentColor"/>
      </g>
      
      {/* Book */}
      <g transform="translate(65, 55)">
        {/* Book cover */}
        <rect x="0" y="0" width="12" height="16" fill="currentColor" rx="1"/>
        
        {/* Book pages */}
        <rect x="1" y="1" width="10" height="14" fill="none" stroke="currentColor" strokeWidth="0.5"/>
        <line x1="3" y1="4" x2="9" y2="4" stroke="currentColor" strokeWidth="0.5"/>
        <line x1="3" y1="6" x2="9" y2="6" stroke="currentColor" strokeWidth="0.5"/>
        <line x1="3" y1="8" x2="7" y2="8" stroke="currentColor" strokeWidth="0.5"/>
      </g>
    </svg>
  );
};

export default RizzourseIcon;