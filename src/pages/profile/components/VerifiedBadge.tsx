import React from 'react';
import { motion } from 'motion/react';

interface VerifiedBadgeProps {
  size?: number;
}

const VerifiedBadge: React.FC<VerifiedBadgeProps> = ({ size = 24 }) => {
  return (
    <div className="relative inline-flex items-center justify-center shrink-0" style={{ width: size, height: size }}>
      {/* Spinning Outline */}
      <motion.div
        className="absolute inset-[-4px] rounded-full border border-dashed border-blue-500/60"
        animate={{ rotate: 360 }}
        transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
      />
      
      {/* Live Pulsing Ring */}
      <motion.div
        className="absolute inset-[-1px] rounded-full border border-blue-400"
        animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.6, 0.3] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* SVG Clone of the 3D Blue Tick */}
      <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="relative z-10 w-full h-full drop-shadow-sm">
        <path d="M50 2 C 55 2 57 4 62 4 C 67 4 70 2 75 4 C 79 6 81 10 84 13 C 87 16 93 18 94 23 C 95 28 92 31 92 36 C 92 41 97 45 96 50 C 95 55 92 59 92 64 C 92 69 95 72 94 77 C 93 82 87 84 84 87 C 81 90 79 94 75 96 C 70 98 67 96 62 96 C 57 96 55 98 50 98 C 45 98 43 96 38 96 C 33 96 30 98 25 96 C 21 94 19 90 16 87 C 13 84 7 82 6 77 C 5 72 8 69 8 64 C 8 59 3 55 4 50 C 5 45 8 41 8 36 C 8 31 5 28 6 23 C 7 18 13 16 16 13 C 19 10 21 6 25 4 C 30 2 33 4 38 4 C 43 4 45 2 50 2 Z" fill="#3B82F6"/>
        <path d="M50 2 C 55 2 57 4 62 4 C 67 4 70 2 75 4 C 79 6 81 10 84 13 C 87 16 93 18 94 23 C 95 28 92 31 92 36 C 92 41 97 45 96 50 C 95 55 92 59 92 64 C 92 69 95 72 94 77 C 93 82 87 84 84 87 C 81 90 79 94 75 96 C 70 98 67 96 62 96 C 57 96 55 98 50 98 C 45 98 43 96 38 96 C 33 96 30 98 25 96 C 21 94 19 90 16 87 C 13 84 7 82 6 77 C 5 72 8 69 8 64 C 8 59 3 55 4 50 C 5 45 8 41 8 36 C 8 31 5 28 6 23 C 7 18 13 16 16 13 C 19 10 21 6 25 4 C 30 2 33 4 38 4 C 43 4 45 2 50 2 Z" fill="url(#badgeGrad)" fillOpacity="0.4"/>
        
        <circle cx="50" cy="50" r="32" fill="none" stroke="white" strokeWidth="4" />
        
        <path d="M34 52 L44 62 L66 38" fill="none" stroke="white" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" filter="drop-shadow(0px 3px 2px rgba(0,0,0,0.2))"/>
        
        <defs>
          <linearGradient id="badgeGrad" x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse">
            <stop stopColor="white" stopOpacity="0.6"/>
            <stop offset="1" stopColor="black" stopOpacity="0.2"/>
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
};

export default VerifiedBadge;
