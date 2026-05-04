import React from 'react';

export default function AnimatedLogo({ size = 8, theme = 'dark' }: { size?: number, theme?: 'dark' | 'light' }) {
  const sizeMap: Record<number, string> = {
    6: 'w-6 h-6',
    8: 'w-8 h-8',
    10: 'w-10 h-10',
    12: 'w-12 h-12',
  };
  const sizeClass = sizeMap[size] || 'w-8 h-8';
  const roundedClass = 'rounded-full';
  const innerBgClass = theme === 'dark' ? 'bg-slate-900' : 'bg-white';
  const borderWrapClass = theme === 'dark' ? 'border-none' : 'border-slate-200/50';

  return (
    <div className={`relative ${sizeClass} ${roundedClass} overflow-hidden flex items-center justify-center shrink-0 border ${borderWrapClass} shadow-sm`}>
      {/* Animated spinning gradient border */}
      <div className="absolute w-[250%] h-[250%] animate-[spin_2s_linear_infinite] bg-[conic-gradient(from_90deg,transparent_0%,transparent_65%,#3b82f6_100%)] z-0"></div>
      
      {/* Inner background for the border mask */}
      <div className={`absolute inset-[2px] ${innerBgClass} ${roundedClass} z-10`}></div>
      
      {/* The actual logo image */}
      <img 
        src="/logo.png" 
        alt="VIBE Digital Connect logo" 
        className={`relative z-20 w-[80%] h-[80%] object-contain`} 
        onError={(e) => { 
          e.currentTarget.style.display = 'none'; 
          e.currentTarget.nextElementSibling!.style.display = 'flex'; 
        }} 
      />
      
      {/* Fallback text if logo.png fails to load */}
      <div 
        className={`relative z-20 w-fit h-fit ${theme === 'dark' ? 'text-white' : 'text-slate-900'} flex items-center justify-center font-bold text-[10px] m-[2px]`} 
        style={{ display: 'none' }}
      >
        VB
      </div>
    </div>
  );
}
