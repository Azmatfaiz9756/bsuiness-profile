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

      {/* Real Verified Icon Clone */}
      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="relative z-10 w-[95%] h-[95%] drop-shadow-[0_1px_1px_rgba(0,0,0,0.1)]">
        <path d="M10.8251 1.09631C11.5303 0.650893 12.4697 0.650892 13.1749 1.09631L14.7339 2.08051C15.027 2.26555 15.3621 2.37895 15.7118 2.41162L17.5513 2.58334C18.3845 2.66113 19.0664 3.2384 19.2568 4.02525L19.6778 5.76451C19.7569 6.09117 19.9238 6.38883 20.1633 6.62828L21.423 7.88802C21.9934 8.45839 22.1465 9.32431 21.8055 10.0543L21.0519 11.6675C20.9103 11.9705 20.836 12.3023 20.836 12.639C20.836 12.9757 20.9103 13.3075 21.0519 13.6105L21.8055 15.2237C22.1465 15.9537 21.9934 16.8196 21.423 17.39L20.1633 18.6497C19.9238 18.8892 19.7569 19.1868 19.6778 19.5135L19.2568 21.2528C19.0664 22.0396 18.3845 22.6169 17.5513 22.6947L15.7118 22.8664C15.3621 22.899 15.027 23.0124 14.7339 23.1975L13.1749 24.1817C12.4697 24.6271 11.5303 24.6271 10.8251 24.1817L9.26607 23.1975C8.97305 23.0124 8.63787 22.899 8.2882 22.8664L6.44869 22.6947C5.61545 22.6169 4.93356 22.0396 4.74316 21.2528L4.32221 19.5135C4.24314 19.1868 4.07616 18.8892 3.8367 18.6497L2.57697 17.39C2.0066 16.8196 1.85347 15.9537 2.19448 15.2237L2.94808 13.6105C3.0897 13.3075 3.16398 12.9757 3.16398 12.639C3.16398 12.3023 3.0897 11.9705 2.94808 11.6675L2.19448 10.0543C1.85347 9.32431 2.0066 8.45839 2.57697 7.88802L3.8367 6.62828C4.07616 6.38883 4.24314 6.09117 4.32221 5.76451L4.74316 4.02525C4.93356 3.2384 5.61545 2.66113 6.44869 2.58334L8.2882 2.41162C8.63787 2.37895 8.97305 2.26555 9.26607 2.08051L10.8251 1.09631Z" fill="#3B82F6"/>
        <path d="M16 8L10.5 14L8 11.5" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    </div>
  );
};

export default VerifiedBadge;
