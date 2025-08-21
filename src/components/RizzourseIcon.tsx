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
        d="M50 5 L15 20 L15 45 C15 70 30 90 50 95 C70 90 85 70 85 45 L85 20 Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
      />
      
      {/* Scales of Justice - Made larger */}
      <g transform="translate(50, 40)">
        {/* Scale pole */}
        <line x1="0" y1="-15" x2="0" y2="25" stroke="currentColor" strokeWidth="3"/>
        
        {/* Scale crossbar */}
        <line x1="-20" y1="-8" x2="20" y2="-8" stroke="currentColor" strokeWidth="2.5"/>
        
        {/* Left scale pan */}
        <path
          d="M-20 -8 L-25 -3 L-15 -3 Z"
          fill="currentColor"
        />
        
        {/* Right scale pan */}
        <path
          d="M20 -8 L25 -3 L15 -3 Z"
          fill="currentColor"
        />
        
        {/* Scale chains */}
        <line x1="-20" y1="-8" x2="-20" y2="-3" stroke="currentColor" strokeWidth="1.5"/>
        <line x1="20" y1="-8" x2="20" y2="-3" stroke="currentColor" strokeWidth="1.5"/>
        
        {/* Scale base */}
        <ellipse cx="0" cy="25" rx="4" ry="3" fill="currentColor"/>
      </g>
      
      {/* Book - Made larger */}
      <g transform="translate(58, 65)">
        {/* Book cover */}
        <rect x="0" y="0" width="16" height="20" fill="currentColor" rx="1"/>
        
        {/* Book pages */}
        <rect x="1" y="1" width="14" height="18" fill="none" stroke="currentColor" strokeWidth="0.8"/>
        <line x1="3" y1="5" x2="13" y2="5" stroke="currentColor" strokeWidth="0.8"/>
        <line x1="3" y1="8" x2="13" y2="8" stroke="currentColor" strokeWidth="0.8"/>
        <line x1="3" y1="11" x2="10" y2="11" stroke="currentColor" strokeWidth="0.8"/>
      </g>
    </svg>
  );
};

export default RizzourseIcon;