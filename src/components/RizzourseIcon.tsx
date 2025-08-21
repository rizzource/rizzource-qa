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
      {/* Shield outline - matching the provided logo design */}
      <path
        d="M50 8 L22 18 L22 42 C22 65 35 85 50 92 C65 85 78 65 78 42 L78 18 Z"
        fill="currentColor"
        stroke="none"
      />
      
      {/* Inner shield area (white background effect) */}
      <path
        d="M50 12 L26 20 L26 40 C26 60 37 78 50 84 C63 78 74 60 74 40 L74 20 Z"
        fill="white"
        stroke="none"
      />
      
      {/* Scales of Justice - centered and prominent */}
      <g transform="translate(50, 35)" fill="currentColor">
        {/* Scale top knob */}
        <circle cx="0" cy="-12" r="2"/>
        
        {/* Scale pole */}
        <rect x="-1" y="-10" width="2" height="25" rx="1"/>
        
        {/* Scale crossbar */}
        <rect x="-18" y="-8" width="36" height="2" rx="1"/>
        
        {/* Left scale chain */}
        <rect x="-18" y="-8" width="1" height="8"/>
        
        {/* Right scale chain */}
        <rect x="17" y="-8" width="1" height="8"/>
        
        {/* Left scale pan */}
        <ellipse cx="-18" cy="2" rx="8" ry="2"/>
        <path d="M-26 2 L-18 -2 L-10 2 Z"/>
        
        {/* Right scale pan */}
        <ellipse cx="18" cy="2" rx="8" ry="2"/>
        <path d="M26 2 L18 -2 L10 2 Z"/>
        
        {/* Scale base */}
        <ellipse cx="0" cy="15" rx="5" ry="3"/>
        <rect x="-3" y="12" width="6" height="6" rx="3"/>
      </g>
      
      {/* Book - positioned on the right side */}
      <g transform="translate(62, 58)" fill="currentColor">
        {/* Book spine and covers */}
        <rect x="0" y="0" width="14" height="18" rx="1"/>
        
        {/* Book pages effect */}
        <rect x="1" y="1" width="12" height="16" fill="white" rx="0.5"/>
        
        {/* Page lines */}
        <rect x="3" y="4" width="8" height="1" fill="currentColor"/>
        <rect x="3" y="7" width="8" height="1" fill="currentColor"/>
        <rect x="3" y="10" width="6" height="1" fill="currentColor"/>
        
        {/* Book binding */}
        <rect x="0" y="2" width="14" height="1" fill="white"/>
        <rect x="0" y="15" width="14" height="1" fill="white"/>
      </g>
    </svg>
  );
};

export default RizzourseIcon;